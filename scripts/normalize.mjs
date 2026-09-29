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

const files = existsSync(researchDir)
  ? readdirSync(researchDir).filter(
      (f) => f.endsWith(".json") && !f.startsWith("_") && f !== "TEMPLATE.md"
    )
  : [];

const overrides = [];
const seen = new Set();
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
