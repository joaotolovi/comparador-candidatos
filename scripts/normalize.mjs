#!/usr/bin/env node
/**
 * Converte research/*.json (pesquisa dos agentes, template em
 * research/TEMPLATE.md) em src/data/research.ts — lista de overrides
 * mesclados ao seed em src/data/candidates.ts.
 *
 * - JSON inválido ou sem slug: aviso e pula (nunca quebra o build).
 * - Enums validados; desconhecidos caem no valor honesto padrão.
 * - keyProposals do template viram governmentPlan.proposals (shape do domínio).
 *
 * Uso: node scripts/normalize.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const researchDir = join(root, "research");
const outFile = join(root, "src", "data", "research.ts");

const EV = new Set(["confirmado", "parcial", "indeterminado", "contestado"]);
const CF = new Set(["high", "medium", "low"]);
const ST_OK = new Set([
  "oficial_eleitoral", "legislativo", "executivo_federal", "diario_oficial",
  "transparencia", "tribunal", "tribunal_de_contas", "estatistico", "economico",
  "estadual", "municipal", "plano_de_governo", "partidaria", "pesquisa_eleitoral",
  "imprensa", "editorial",
]);
const ST_ALIAS = { estadistico: "estatistico", wikipedia: "editorial", enciclopedico: "editorial" };
const AV_MAP = {
  available: "available",
  available_partial: "available",
  zero: "zero",
  not_informed: "not_informed",
  not_found: "not_found",
  not_applicable: "not_applicable",
  under_analysis: "under_analysis",
  pending: "under_analysis",
  missing: "not_found",
};
const DP = new Set(["structured", "original", "editorial", "notes_only"]);
const mapAv = (v) => AV_MAP[v] ?? "under_analysis";

const pick = (set, v, fallback) => (set.has(v) ? v : fallback);

// ─── Mapeadores template→domínio (nunca inventam: só reorganizam) ──────────
const EDU_LEVELS = new Set(["graduacao", "especializacao", "mestrado", "doutorado", "curso"]);
const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

const mapEducation = (e, i, slug) => ({
  id: e.id ?? `${slug}-edu-${i + 1}`,
  level: EDU_LEVELS.has(e.level) ? e.level : "curso",
  field: e.field ?? e.course ?? e.title ?? "",
  institution: e.institution ?? e.organization ?? "",
  conclusionYear: e.conclusionYear ?? (e.year ? Number(String(e.year).match(/\d{4}/)?.[0]) || null : null),
  notes: e.notes ?? (e.qualityOfEducation ? `informação ${e.qualityOfEducation}` : undefined),
  sources: e.sources ?? [],
});

// "2025–2026", "2009 – atual", "2026" → startDate/endDate (null = atual)
const mapPeriod = (p) => {
  const s = String(p ?? "");
  const [a, b] = s.split(/[–—-]/).map((x) => x.trim());
  const y1 = a?.match(/\d{4}/)?.[0] ?? "";
  const endDate = /atual|presente|exerc/i.test(s) || !b ? null : (b.match(/\d{4}/)?.[0] ?? null);
  return { startDate: y1, endDate: endDate === y1 && /\d{4}/.test(b ?? "") ? y1 : endDate };
};

const mapExperience = (e, i, slug, kind) => {
  const { startDate, endDate } = mapPeriod(e.period ?? e.startDate ?? e.endDate ?? "");
  return {
    id: e.id ?? `${slug}-${kind}-${i + 1}`,
    role: e.role ?? e.title ?? "",
    organization: e.organization ?? e.institution ?? e.party ?? "",
    startDate: startDate || e.startDate || "",
    endDate: e.endDate !== undefined ? e.endDate : endDate,
    description: [e.description, e.result ? `resultado: ${e.result}` : ""]
      .filter(Boolean)
      .join(" · "),
    achievements: e.achievements ?? [],
    sources: e.sources ?? [],
  };
};

const mapAchievement = (a, i, slug) => ({
  id: a.id ?? `${slug}-ach-${i + 1}`,
  title: a.title ?? "",
  context: a.context ?? a.period ?? "",
  description: a.description ?? "",
  sources: a.sources ?? [],
  evidenceStatus: pick(EV, a.evidenceStatus, a.sources?.length ? "confirmado" : "parcial"),
  confidenceLevel: pick(CF, a.confidenceLevel, a.sources?.length ? "medium" : "low"),
  updatedAt: a.updatedAt ?? "2026-09-29",
});

const INST_CATS = new Set(["transparencia", "prestacao_de_contas", "auditoria", "contas_publicas", "tribunal", "patrimonial", "eleitoral"]);
const INST_STATUS = new Set(["denuncia", "acusacao", "investigacao", "inquerito", "processo", "decisao", "condenacao", "condenacao_definitiva", "absolvicao", "arquivamento", "decisao_anulada", "aprovacao", "reprovacao", "regular", "investigacao_com_medidas_cautelares", "registro_indeferido", "decisao_judicial_eleitoral", "candidatura_nao_apta"]);
const INST_CUR = new Set(["em_andamento", "encerrado", "suspenso"]);

const mapInstitutional = (r, i, slug) => {
  const cat = [...INST_CATS].find((c) => norm(c) === norm(r.category));
  const ls = [...INST_STATUS].find((c) => norm(c) === norm(r.legalStatus));
  const cs = [...INST_CUR].find((c) => norm(c) === norm(r.currentStatus));
  if (!cat || !ls || !cs) {
    console.warn(
      `  ⚠ ${slug}: registro institucional "${r.title ?? i}" fora do domínio ` +
        `(category=${r.category} legalStatus=${r.legalStatus} status=${r.currentStatus}) — IGNORADO`
    );
    return null;
  }
  return {
    id: r.id ?? `${slug}-inst-${i + 1}`,
    category: cat,
    title: r.title ?? "",
    legalStatus: ls,
    currentStatus: cs,
    instance: r.instance ?? "",
    lastUpdate: r.lastUpdate ?? "",
    description: r.description ?? "",
    sources: r.sources ?? [],
    evidenceStatus: pick(EV, r.evidenceStatus, "parcial"),
    confidenceLevel: pick(CF, r.confidenceLevel, "low"),
  };
};

// ─── V3: capacidades, projeto de país, Brasil no mundo, coerência ────────────
const CAP_SLUGS = new Set([
  "execucao", "dialogo-negociacao", "lideranca-equipes", "tomada-decisao",
  "gestao-crises", "coordenacao-institucional", "comunicacao-publica", "visao-estrategica",
]);
const CAP_NAMES = {
  execucao: ["Capacidade de execução", "Consegue transformar prioridades em entregas concretas?"],
  "dialogo-negociacao": ["Diálogo, negociação e articulação", "Consegue construir entendimento e coordenar atores com interesses diferentes?"],
  "lideranca-equipes": ["Liderança e formação de equipes", "Consegue montar, coordenar, delegar e manter equipes funcionando?"],
  "tomada-decisao": ["Tomada de decisão", "Como enfrentou decisões difíceis, trade-offs e pressão?"],
  "gestao-crises": ["Gestão de crises e mudança", "Como atuou quando o cenário mudou ou surgiu uma situação crítica?"],
  "coordenacao-institucional": ["Coordenação institucional", "Consegue trabalhar entre instituições, níveis de governo e organizações?"],
  "comunicacao-publica": ["Comunicação pública", "Consegue explicar prioridades, decisões e posições de forma compreensível e consistente?"],
  "visao-estrategica": ["Visão estratégica", "Consegue definir prioridades e conectar decisões de curto prazo a objetivos maiores?"],
};
const COV = new Set(["documentada", "parcial", "insuficiente"]);
const CLAIM = new Set(["posicao", "proposta", "historico"]);
const textField = (v) => (typeof v === "string" ? v : "");

const mapEvidence = (e, i, slug, capSlug) => ({
  id: e.id ?? `ev-cap-${capSlug}-${slug}-${i + 1}`,
  kind: pick(CLAIM, e.kind, "historico"),
  title: e.title ?? "",
  role: e.role ?? "",
  complexity: e.complexity ?? "",
  outcome: e.outcome ?? undefined,
  period: e.period ?? "",
  context: e.context ?? undefined,
  sources: e.sources ?? [],
  evidenceStatus: pick(EV, e.evidenceStatus, (e.sources ?? []).length ? "confirmado" : "parcial"),
  confidenceLevel: pick(CF, e.confidenceLevel, (e.sources ?? []).length ? "medium" : "low"),
});

const mapCapacities = (list, slug, fallbackDate) =>
  (list ?? [])
    .filter((c) => c && CAP_SLUGS.has(c.slug))
    .map((c) => {
      const [name, question] = CAP_NAMES[c.slug];
      const evidences = (c.evidences ?? [])
        .filter((e) => e && e.title && (e.sources ?? []).length > 0)
        .slice(0, 6)
        .map((e, i) => mapEvidence(e, i, slug, c.slug));
      const coverage = COV.has(c.coverage)
        ? c.coverage
        : evidences.length >= 3
        ? "documentada"
        : evidences.length
        ? "parcial"
        : "insuficiente";
      return {
        slug: c.slug,
        name,
        question,
        synthesis: textField(c.synthesis),
        coverage,
        coverageNote: c.coverageNote ?? undefined,
        evidences,
        reality: mapReality(c.reality),
        updatedAt: c.updatedAt ?? fallbackDate,
      };
    });

const mapCountryProject = (p, fallbackDate) =>
  !p || (!p.vision && !p.developmentModel)
    ? undefined
    : {
        vision: textField(p.vision),
        nationalPriorities: Array.isArray(p.nationalPriorities)
          ? p.nationalPriorities.filter((x) => typeof x === "string").slice(0, 8)
          : [],
        developmentModel: textField(p.developmentModel),
        reality: mapReality(p.reality),
        sources: p.sources ?? [],
        evidenceStatus: pick(EV, p.evidenceStatus, (p.sources ?? []).length ? "parcial" : "indeterminado"),
        confidenceLevel: pick(CF, p.confidenceLevel, (p.sources ?? []).length ? "medium" : "low"),
        methodology: p.methodology ?? undefined,
        updatedAt: p.updatedAt ?? fallbackDate,
      };

const mapForeignPolicy = (p, fallbackDate) =>
  !p || (!p.worldView && !p.strategy && !p.internationalExperience)
    ? undefined
    : {
        worldView: textField(p.worldView),
        strategy: textField(p.strategy),
        internationalExperience: textField(p.internationalExperience),
        projection: textField(p.projection),
        projectionNote:
          textField(p.projectionNote) ||
          "Projeção internacional mede notoriedade, não capacidade diplomática.",
        reality: mapReality(p.reality),
        sources: p.sources ?? [],
        evidenceStatus: pick(EV, p.evidenceStatus, (p.sources ?? []).length ? "parcial" : "indeterminado"),
        confidenceLevel: pick(CF, p.confidenceLevel, (p.sources ?? []).length ? "medium" : "low"),
        methodology: p.methodology ?? undefined,
        updatedAt: p.updatedAt ?? fallbackDate,
      };

const mapCoherence = (list) =>
  (list ?? [])
    .filter((c) => c && c.theme)
    .map((c, i) => ({
      id: c.id ?? `coh-${i + 1}`,
      theme: c.theme,
      timeline: (c.timeline ?? [])
        .filter((t) => t && t.year)
        .map((t) => ({ year: String(t.year), position: textField(t.position), sources: t.sources ?? [] })),
      publicExplanation: c.publicExplanation ?? undefined,
      statedPosition: c.statedPosition ?? undefined,
      proposedAction: c.proposedAction ?? undefined,
      historicalAction: c.historicalAction ?? undefined,
      tensionNote: c.tensionNote ?? undefined,
      evidenceStatus: pick(EV, c.evidenceStatus, "parcial"),
      confidenceLevel: pick(CF, c.confidenceLevel, "low"),
    }));

// ─── V4: camada analítica — teste de realidade ──────────────────────────────
const PATHS = new Set([
  "ato-executivo", "lei-ordinaria", "lei-complementar", "pec", "depende-estados",
  "depende-municipios", "depende-privado", "negociacao-internacional", "indefinido",
]);
const TENSION_KINDS = new Set([
  "mudanca-de-posicao", "acao-em-sentido-diferente", "proposta-sem-precedente",
  "proposta-x-restricao-institucional", "proposta-x-outra-proposta",
]);
const THEME_CATALOG = [
  ["economia", "Economia"],
  ["seguranca", "Segurança pública"],
  ["saude", "Saúde"],
  ["educacao", "Educação"],
  ["clima", "Clima e meio ambiente"],
  ["trabalho", "Trabalho e renda"],
  ["tributacao", "Tributação"],
  ["previdencia", "Previdência"],
  ["habitacao", "Habitação"],
  ["instituicoes", "Instituições"],
];
const THEME_SOURCE = new Set(["candidato", "partido", "ausente"]);
const strList = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
/** Histórico aceita linha simples ou fato datado com fontes próprias. */
const mapHistory = (v) =>
  (Array.isArray(v) ? v : [])
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && typeof item.fact === "string") {
        return { date: item.date ?? undefined, fact: item.fact, sources: item.sources ?? [] };
      }
      return null;
    })
    .filter(Boolean);

/** Teste de realidade: nunca inventa campo, descarta o que estiver fora do domínio. */
const mapReality = (rc) => {
  if (!rc || typeof rc !== "object") return undefined;
  const proposal = textField(rc.proposal);
  if (!proposal) return undefined;
  const req = rc.requirement && typeof rc.requirement === "object" ? rc.requirement : null;
  const requirement = req && PATHS.has(req.path)
    ? {
        path: req.path,
        quorum: req.quorum ?? undefined,
        note: req.note ?? undefined,
      }
    : undefined;
  const hist = rc.history && typeof rc.history === "object" ? rc.history : null;
  const history = hist
    ? {
        aligned: mapHistory(hist.aligned),
        divergent: mapHistory(hist.divergent),
        noComparablePrecedent: hist.noComparablePrecedent ?? undefined,
      }
    : undefined;
  const sup = rc.support && typeof rc.support === "object" ? rc.support : null;
  const support = sup
    ? {
        partySeats: sup.partySeats ?? undefined,
        coalitionSeats: sup.coalitionSeats ?? undefined,
        federations: sup.federations ?? undefined,
        documentedAgreements: Number(sup.documentedAgreements ?? 0),
        note: sup.note ?? "Retrato atual, não previsão do próximo Congresso.",
      }
    : undefined;
  const tensions = (rc.tensions ?? [])
    .filter((t) => t && TENSION_KINDS.has(t.kind) && (t.title ?? "").trim())
    .map((t) => ({
      kind: t.kind,
      title: t.title,
      detail: textField(t.detail),
      sources: t.sources ?? [],
      evidenceStatus: pick(EV, t.evidenceStatus, "parcial"),
      confidenceLevel: pick(CF, t.confidenceLevel, "low"),
    }));
  const openQuestions = (rc.openQuestions ?? [])
    .filter((q) => q && typeof q.question === "string" && q.question.trim().endsWith("?"))
    .map((q) => ({ question: q.question.trim(), why: textField(q.why) }));
  return {
    proposal,
    requirement,
    history,
    support,
    tensions,
    openQuestions,
    publicExplanation: rc.publicExplanation ?? undefined,
    methodology: textField(rc.methodology),
    evidenceStatus: pick(EV, rc.evidenceStatus, "parcial"),
    confidenceLevel: pick(CF, rc.confidenceLevel, "low"),
  };
};

/** Seção 07: 10 temas fixos, na ordem canônica; tema sem nada é descartado. */
const mapThemes = (list) => {
  const byslug = new Map((list ?? []).map((t) => [t?.slug, t]));
  return THEME_CATALOG.flatMap(([slug, name]) => {
    const t = byslug.get(slug);
    if (!t) return [];
    const position = textField(t.position);
    if (!position) return [];
    return [
      {
        slug,
        name,
        kind: pick(CLAIM, t.kind, "proposta"),
        position,
        sourceKind: THEME_SOURCE.has(t.sourceKind) ? t.sourceKind : "ausente",
        sources: t.sources ?? [],
        reality: mapReality(t.reality),
      },
    ];
  });
};

const files = existsSync(researchDir)
  ? readdirSync(researchDir).filter(
      (f) => f.endsWith(".json") && !f.startsWith("_") && f !== "TEMPLATE.md"
    )
  : [];

const overrides = [];
const seen = new Set();
const today = new Date().toISOString().slice(0, 10);
let invalid = 0;

for (const f of files) {
  let d;
  try {
    d = JSON.parse(readFileSync(join(researchDir, f), "utf8"));
  } catch (e) {
    console.warn(`⚠ ${f}: JSON inválido (${e.message}) — ignorado`);
    invalid++;
    continue;
  }
  const slug = d.slug ?? f.replace(/\.json$/, "");
  if (!d.name || !d.ballotNumber) {
    console.warn(`⚠ ${f}: sem name/ballotNumber — ignorado`);
    invalid++;
    continue;
  }
  if (seen.has(slug)) {
    console.warn(`⚠ slug duplicado ${slug} em ${f} — mantendo o primeiro`);
    continue;
  }
  seen.add(slug);

  const gp = d.governmentPlan ?? null;
  const plan = gp
    ? {
        title: gp.title ?? "",
        planUrl: gp.planUrl ?? "",
        totalProposals: Number(
          gp.totalProposals ?? gp.proposals?.length ?? 0
        ),
        registeredWith: gp.registeredWith ?? "TSE — registro de candidatura",
        summary: gp.summary ?? "",
        notes: gp.notes ?? (typeof gp.statsIfCounted === "string" ? gp.statsIfCounted : ""),
        statsIfCounted:
          gp.statsIfCounted && typeof gp.statsIfCounted === "object"
            ? gp.statsIfCounted
            : null,
        statsEvidence: pick(EV, gp.statsEvidence, "indeterminado"),
        // Template usa keyProposals; domínio usa proposals (mesmo shape).
        proposals: (gp.proposals ?? gp.keyProposals ?? []).map((p, i) => ({
          id: p.id ?? `${slug}-prop-${i + 1}`,
          title: p.title ?? "",
          description: p.description ?? "",
          theme: p.theme ?? "Outros",
          hasClearObjective: p.hasClearObjective ?? true,
          hasQuantitativeTarget: p.hasQuantitativeTarget ?? false,
          hasDeadline: p.hasDeadline ?? false,
          hasCostEstimate: p.hasCost ?? p.hasCostEstimate ?? false,
          hasFundingSource: p.hasFundingSource ?? false,
          hasFiscalImpact: p.hasFiscalImpact ?? false,
          legalInstrument: p.legalInstrument ?? undefined,
          requiresNewLaw: p.requiresNewLaw ?? false,
          requiresConstitutionalAmendment:
            p.requiresConstitutionalAmendment ?? false,
          dependsOnCongress: p.dependsOnCongress ?? false,
          dependsOnStates: p.dependsOnStates ?? false,
          dependsOnMunicipalities: p.dependsOnMunicipalities ?? false,
          responsibleAgency: p.responsibleAgency ?? undefined,
          resultIndicator: p.resultIndicator ?? undefined,
          identifiedRisks: Array.isArray(p.identifiedRisks)
            ? p.identifiedRisks
            : p.identifiedRisks
            ? [String(p.identifiedRisks)]
            : undefined,
          methodologyStatus: pick(EV, p.methodologyStatus, "indeterminado"),
          reality: mapReality(p.reality),
          sources: p.sources ?? [],
        })),
        sources: gp.sources ?? [],
        updatedAt: gp.updatedAt ?? d.updatedAt ?? "2026-09-29",
      }
    : undefined;

  const metrics = (d.metrics ?? [])
    .filter((m) => m && m.id && m.name)
    .map((m) => ({
      ...m,
      unit: m.unit ?? undefined,
      context: m.context ?? undefined,
      evidenceStatus: pick(EV, m.evidenceStatus, "parcial"),
      confidenceLevel: pick(CF, m.confidenceLevel, "low"),
      availability: mapAv(m.availability),
      dataPresentation: pick(DP, m.dataPresentation, "notes_only"),
    }));

  const o = {
    slug,
    name: d.name,
    ballotName: d.ballotName ?? d.name,
    ballotNumber: Number(d.ballotNumber),
    party: d.party,
    coalition: d.coalition ?? d.party,
    photo: d.photoUrl ?? "",
    birthDate: d.birthDate ?? "",
    birthplace: d.birthplace ?? "",
    age: Number(d.age ?? 0),
    profession: d.profession ?? "",
    currentRole: d.currentRole ?? "",
    tagline: d.tagline ?? "",
    education: (d.education ?? []).map((e, i) => mapEducation(e, i, slug)),
    professionalExperience: (d.professionalExperience ?? []).map((e, i) =>
      mapExperience(e, i, slug, "prof")
    ),
    politicalExperience: (d.politicalExperience ?? []).map((e, i) =>
      mapExperience(e, i, slug, "pol")
    ),
    executiveExperience: (d.executiveExperience ?? []).map((e, i) =>
      mapExperience(e, i, slug, "exec")
    ),
    achievements: (d.achievements ?? []).map((a, i) => mapAchievement(a, i, slug)),
    governmentPlan: plan,
    currentSupport: mapCoalition(d.currentSupport, `sup-${slug}`),
    negotiationHistory: mapCoalition(d.negotiationHistory, `neg-${slug}`),
    institutionalHistory: (d.institutionalHistory ?? [])
      .map((r, i) => mapInstitutional(r, i, slug))
      .filter(Boolean),
    countryProject: mapCountryProject(d.countryProject, d.updatedAt ?? today),
    capacities: mapCapacities(d.capacities, slug, d.updatedAt ?? today),
    foreignPolicy: mapForeignPolicy(d.foreignPolicy, d.updatedAt ?? today),
    coherence: mapCoherence(d.coherence),
    themes: mapThemes(d.themes),
    metrics,
    sources: (d.sources ?? []).map(coerceSource),
    updatedAt: d.updatedAt ?? new Date().toISOString().slice(0, 10),
  };

  resolveSourcesDeep(o, o.sources);
  overrides.push(o);
  const noSrc = metrics.filter((m) => (m.sources ?? []).length === 0).length;
  console.log(
    `✓ ${slug.padEnd(20)} métricas:${String(metrics.length).padStart(3)} ` +
      `sem-fonte:${String(noSrc).padStart(3)} fontes:${String(
        (d.sources ?? []).length
      ).padStart(3)} escopo:${d.researchScope ?? "?"}`
  );
}

function coerceSource(s) {
  const out = { ...s };
  if (out.publishedAt == null) delete out.publishedAt;
  if (out.accessedAt == null) out.accessedAt = "";
  out.sourceType = ST_ALIAS[out.sourceType] || (ST_OK.has(out.sourceType) ? out.sourceType : "imprensa");
  if (typeof out.id !== "string" || !out.id) out.id = `src-${Math.random().toString(36).slice(2, 10)}`;
  return out;
}

/** Resolve sources que vieram como ["id-x"] para objetos completos do pool; coerceia todos. */
function resolveSourcesDeep(node, pool) {
  if (Array.isArray(node)) {
    for (const x of node) resolveSourcesDeep(x, pool);
    return;
  }
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node.sources)) {
    node.sources = node.sources
      .map((s) => (typeof s === "string" ? pool.find((p) => p && p.id === s) : s))
      .filter(Boolean)
      .map(coerceSource);
  }
  for (const k of Object.keys(node)) {
    if (k === "sources") continue;
    resolveSourcesDeep(node[k], pool);
  }
}

/** currentSupport / negotiationHistory -> CoalitionSupport com chaves completas. */
function mapCoalition(list, prefix) {
  return (list ?? []).map((c, i) => {
    const parts = [];
    if (c.scope) parts.push(`Escopo: ${c.scope}.`);
    if (c.event) parts.push(`${c.event}.`);
    if (c.description) parts.push(c.description);
    return {
      id: c.id ?? `${prefix}-${i + 1}`,
      description: parts.join(" ").trim() || "",
      value: c.value ?? c.outcome ?? "",
      date: c.date ?? "",
      sources: c.sources ?? [],
    };
  });
}

const HEADER =
  "// ⚠️ GERADO por scripts/normalize.mjs a partir de research/*.json — não editar à mão.\n" +
  `// ${overrides.length} candidato(s) com pesquisa profunda; os demais ficam só no seed.\n` +
  `// Gerado em: ${new Date().toISOString()}\n` +
  'import type { Candidate } from "@/types";\n\n' +
  "export const researched: Partial<Candidate>[] = ";

writeFileSync(outFile, `${HEADER}${JSON.stringify(overrides, null, 2)};\n`);
console.log(
  `\n→ ${outFile} com ${overrides.length} override(s)` +
    (invalid ? ` — ${invalid} ignorado(s)` : "")
);
if (overrides.length === 0) {
  console.warn("⚠ Nenhum research/*.json válido — só seed (dados básicos).");
  process.exitCode = 1;
}
