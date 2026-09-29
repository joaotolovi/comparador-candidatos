#!/usr/bin/env node
/**
 * Auditoria da camada analítica (V4 — Teste de realidade) nos JSONs já mergeados.
 *
 * Falha (exit 1) quando:
 *  - algum RealityCheck não tem methodology/evidenceStatus/confidenceLevel;
 *  - proposal passa de 150 chars ou tension.title passa de 150 / detail de 400;
 *  - aparece vocabulário de juízo (inviável, não conseguirá, nunca fez, "portanto … vai");
 *  - adjetivo de valor em minúscula (melhor, pior, superior, inferior…);
 *  - tensão com kind fora da taxonomia ou sem fonte;
 *  - requirement.path fora da taxonomia, ou PEC/LC sem quórum factual;
 *  - openQuestion que não está em forma de pergunta;
 *  - tema fora dos 10 fixos, ou tema ausente no candidato.
 *
 * Relatório de cobertura no fim: o que ainda está "em consolidação".
 *
 * Uso: node scripts/audit-analise.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const RESEARCH = join(ROOT, "research");

const PATHS = new Set([
  "ato-executivo", "lei-ordinaria", "lei-complementar", "pec",
  "depende-estados", "depende-municipios", "depende-privado",
  "negociacao-internacional", "indefinido",
]);
const QUORUM_REQUIRED = new Set(["pec", "lei-complementar"]);
const TENSION_KINDS = new Set([
  "mudanca-de-posicao", "acao-em-sentido-diferente", "proposta-sem-precedente",
  "proposta-x-restricao-institucional", "proposta-x-outra-proposta",
]);
const THEME_SLUGS = [
  "economia", "seguranca", "saude", "educacao", "clima",
  "trabalho", "tributacao", "previdencia", "habitacao", "instituicoes",
];
const STATUSES = new Set(["confirmado", "parcial", "indeterminado", "contestado"]);
const CONFIDENCES = new Set(["high", "medium", "low"]);

const VALUE_ADJ =
  /(?<![A-ZÀ-Ý])\b(melhor|pior|superior|inferior|excelente|fraco|ineficiente|brilhante|medíocre)\b/;
// Termos factuais e relato de fala do candidato não são juízo nosso.
const FACTUAL_COLLOCATIONS = [
  "ensino superior", "educação superior", "nível superior", "nivel superior",
  "curso superior", "melhores práticas", "superior tribunal", "conselho superior",
  "tribunal superior",
];
const REPORT_MARKERS = [
  "afirmou que", "disse que", "declarou que", "prometeu que", "sustentou que",
  "defendeu que", "escreveu que", "respondeu que",
];
const cleanFactual = (t) =>
  FACTUAL_COLLOCATIONS.reduce((acc, p) => acc.split(p).join(p.replace(/ /g, "_")), t);
const opinionMatch = (text) => {
  const low = text.toLowerCase();
  for (const m of low.matchAll(new RegExp(OPINION, "g"))) {
    const before = low.slice(Math.max(0, m.index - 45), m.index);
    if (REPORT_MARKERS.some((k) => before.includes(k))) continue;
    return m[0];
  }
  return null;
};
const OPINION =
  /invi[áa]vel|n[ãa]o conseguir[áa]|n[ãa]o tem for[çc]a|nunca fez|promessa vazia|na pr[áa]tica n[ãa]o|claramente|obviamente|n[ãa]o vai cumprir|n[ãa]o cumprir[áa]|portanto[^.]{0,40}\b(vai|n[ãa]o vai|é|cumprir|consegue)\b/;

const problems = [];
const coverage = [];

function checkText(where, field, text, limit) {
  if (typeof text !== "string") return;
  if (text.length > limit) problems.push(`${where}: ${field} com ${text.length} chars (limite ${limit})`);
  if (VALUE_ADJ.test(cleanFactual(text))) problems.push(`${where}: ${field} usa adjetivo de valor`);
  const m = opinionMatch(text);
  if (m) problems.push(`${where}: ${field} usa juízo (${m})`);
}

function checkReality(where, rc) {
  if (!rc) return false;
  for (const f of ["methodology", "evidenceStatus", "confidenceLevel"]) {
    if (!rc[f]) problems.push(`${where}: reality sem ${f}`);
  }
  if (!STATUSES.has(rc.evidenceStatus)) problems.push(`${where}: evidenceStatus inválido`);
  if (!CONFIDENCES.has(rc.confidenceLevel)) problems.push(`${where}: confidenceLevel inválido`);
  checkText(where, "proposal", rc.proposal, 150);
  if (!(rc.proposal ?? "").trim()) problems.push(`${where}: reality sem proposal`);
  const req = rc.requirement;
  if (req) {
    if (!PATHS.has(req.path)) problems.push(`${where}: requirement.path fora da taxonomia (${req.path})`);
    else if (QUORUM_REQUIRED.has(req.path) && !(req.quorum ?? "").trim()) {
      problems.push(`${where}: requirement ${req.path} sem quorum factual`);
    }
  }
  for (const key of ["aligned", "divergent"]) {
    for (const item of rc.history?.[key] ?? []) {
      if (item && typeof item === "object") {
        if (!(item.fact ?? "").trim()) problems.push(`${where}: history.${key} sem fato`);
        checkText(where, `history.${key}.fact`, item.fact, 250);
        checkText(where, `history.${key}.date`, item.date, 40);
      } else {
        checkText(where, `history.${key}`, item, 250);
      }
    }
  }
  if (rc.history?.noComparablePrecedent) {
    checkText(where, "history.noComparablePrecedent", rc.history.noComparablePrecedent, 400);
  }
  if (rc.support?.note) checkText(where, "support.note", rc.support.note, 400);
  if (rc.support && typeof rc.support.documentedAgreements !== "number") {
    problems.push(`${where}: support sem documentedAgreements numérico`);
  }
  for (const t of rc.tensions ?? []) {
    if (!TENSION_KINDS.has(t.kind)) problems.push(`${where}: tensão kind fora da taxonomia (${t.kind})`);
    checkText(where, "tension.title", t.title, 150);
    checkText(where, "tension.detail", t.detail, 400);
    if (!(t.sources ?? []).length) problems.push(`${where}: tensão sem fonte`);
    if (!STATUSES.has(t.evidenceStatus)) problems.push(`${where}: tensão com evidenceStatus inválido`);
  }
  for (const oq of rc.openQuestions ?? []) {
    const q = (oq.question ?? "").trim();
    if (!q.endsWith("?")) problems.push(`${where}: openQuestion não é pergunta (${q.slice(0, 40)})`);
    checkText(where, "openQuestions.question", q, 150);
    if (oq.why) checkText(where, "openQuestions.why", oq.why, 400);
  }
  if (rc.publicExplanation) checkText(where, "publicExplanation", rc.publicExplanation, 400);
  checkText(where, "methodology", rc.methodology, 400);
  return true;
}

const files = readdirSync(RESEARCH).filter(
  (f) => f.endsWith(".json") && !f.startsWith("_") && !f.startsWith("SPEC") && f !== "TEMPLATE.json",
);

for (const file of files) {
  const slug = basename(file, ".json");
  const data = JSON.parse(readFileSync(join(RESEARCH, file), "utf8"));
  const pend = [];

  const pais = checkReality(`${slug}/projeto`, data.countryProject?.reality);
  if (!pais) pend.push("projeto de país");

  const proposals = data.governmentPlan?.keyProposals ?? data.governmentPlan?.proposals ?? [];
  const propWith = proposals.filter((p, i) =>
    checkReality(`${slug}/proposta:${p.id ?? i + 1}`, p.reality),
  ).length;
  if (proposals.length === 0) pend.push("propostas (plano sem propostas analisadas)");
  else if (propWith < proposals.length) pend.push(`${proposals.length - propWith} propostas sem teste`);

  const caps = data.capacities ?? [];
  const capsWith = caps.filter((c) => checkReality(`${slug}/capacidade:${c.slug}`, c.reality)).length;
  if (caps.length < 8) pend.push(`capacidades ${caps.length}/8`);
  else if (capsWith < 8) pend.push(`${8 - capsWith} capacidades sem teste`);

  const mundo = checkReality(`${slug}/mundo`, data.foreignPolicy?.reality);
  if (!mundo) pend.push("Brasil no mundo");

  const themes = data.themes ?? [];
  for (const t of themes) {
    if (!THEME_SLUGS.includes(t.slug)) problems.push(`${slug}: tema fora do conjunto (${t.slug})`);
    checkText(`${slug}/tema:${t.slug}`, "position", t.position, 150);
    if (!["candidato", "partido", "ausente"].includes(t.sourceKind)) {
      problems.push(`${slug}/tema:${t.slug}: sourceKind inválido`);
    }
    if (t.reality) checkReality(`${slug}/tema:${t.slug}`, t.reality);
  }
  const missingThemes = THEME_SLUGS.filter((s) => !themes.some((t) => t.slug === s));
  if (themes.length === 0) pend.push("temas (seção 07)");
  else if (missingThemes.length) pend.push(`temas faltando: ${missingThemes.join(", ")}`);

  const partido = themes.filter((t) => t.sourceKind === "partido").length;
  const ausente = themes.filter((t) => t.sourceKind === "ausente").length;
  coverage.push(
    `${slug.padEnd(22)} projeto ${pais ? "✓" : "—"} | propostas ${propWith}/${proposals.length} | capacidades ${capsWith}/${caps.length} | mundo ${mundo ? "✓" : "—"} | temas ${themes.length}/10 (candidato ${themes.length - partido - ausente}, partido ${partido}, ausente ${ausente})` +
      (pend.length ? `  → em consolidação: ${pend.join("; ")}` : "  → completo"),
  );
}

console.log("cobertura da camada analítica:");
for (const line of coverage) console.log("  " + line);

const pendentes = coverage.filter((l) => l.includes("em consolidação")).length;
console.log(
  `\n${coverage.length - pendentes}/${coverage.length} candidatos com camada analítica completa` +
    (pendentes ? `; ${pendentes} marcados como "em consolidação" na interface` : ""),
);

if (problems.length) {
  console.log(`\n✗ ${problems.length} problema(s) nos gates anti-opinião:`);
  for (const p of problems.slice(0, 50)) console.log("  - " + p);
  process.exit(1);
}
console.log("\n✓ gates anti-opinião OK: sem juízo, sem adjetivo de valor, limites de texto respeitados");
