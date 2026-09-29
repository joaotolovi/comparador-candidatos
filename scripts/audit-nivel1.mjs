#!/usr/bin/env node
/**
 * Auditoria do nível 1 da V3 (capacidades demonstradas).
 *
 * Falha (exit 1) quando:
 *  - alguma das 8 capacidades canônicas não existe para um candidato, tem menos
 *    de 3 evidências sem justificativa, ou tem cobertura parcial/insuficiente
 *    sem `coverageNote`;
 *  - alguma evidência não tem título, papel exercido, complexidade ou fonte;
 *  - alguma síntese usa adjetivo de valor (minúsculo — nomes próprios passam);
 *  - algum indicador do nível 1 (plano e sustentação das capacidades) está
 *    `not_found` / `not_informed` / `under_analysis`, ou seja: célula vazia onde
 *    deveria haver dado ou lacuna explicada.
 *
 * Uso: node scripts/audit-nivel1.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const RESEARCH = join(ROOT, "research");

const CAP_SLUGS = [
  "execucao",
  "dialogo-negociacao",
  "lideranca-equipes",
  "tomada-decisao",
  "gestao-crises",
  "coordenacao-institucional",
  "comunicacao-publica",
  "visao-estrategica",
];

/** Indicadores que pertencem ao nível 1 (espelha SECTION_OF_METRIC em src/types). */
const NIVEL1_METRICS = [
  "projetos_lei_aprovados",
  "bancada_partidaria_camara",
  "capacidade_dialogo",
  "negociacao_acordos",
  "articulacao_apoio",
  "propostas_total",
  "propostas_com_custo",
  "propostas_com_prazo",
  "propostas_dependentes_congresso",
];

const VALUE_ADJ =
  /(?<![A-ZÀ-Ý])\b(melhor|pior|maior articulador|excelente|fraco|ineficiente|brilhante|medíocre|superior|inferior)\b/;

const BAD_AVAILABILITY = new Set(["not_found", "not_informed", "under_analysis"]);

const problems = [];
const summary = [];

const files = readdirSync(RESEARCH).filter(
  (f) => f.endsWith(".json") && !f.startsWith("_"),
);

for (const file of files) {
  const slug = basename(file, ".json");
  const data = JSON.parse(readFileSync(join(RESEARCH, file), "utf8"));
  const caps = new Map((data.capacities ?? []).map((c) => [c.slug, c]));

  let documented = 0;
  for (const slugCap of CAP_SLUGS) {
    const cap = caps.get(slugCap);
    if (!cap) {
      problems.push(`${slug}: capacidade ausente ${slugCap}`);
      continue;
    }
    const evs = cap.evidences ?? [];
    if (evs.length >= 3 && cap.coverage === "documentada") documented += 1;
    if (evs.length < 3 && !["parcial", "insuficiente"].includes(cap.coverage)) {
      problems.push(`${slug}/${slugCap}: ${evs.length} evidências com coverage=${cap.coverage}`);
    }
    if (evs.length < 3 && !(cap.coverageNote ?? "").trim()) {
      problems.push(`${slug}/${slugCap}: cobertura não documentada sem coverageNote`);
    }
    if (VALUE_ADJ.test(cap.synthesis ?? "")) {
      problems.push(`${slug}/${slugCap}: adjetivo de valor na síntese`);
    }
    for (const ev of evs) {
      for (const field of ["title", "role", "complexity"]) {
        if (!(ev[field] ?? "").toString().trim()) {
          problems.push(`${slug}/${slugCap}/${ev.id}: campo vazio (${field})`);
        }
      }
      if (!(ev.sources ?? []).length) {
        problems.push(`${slug}/${slugCap}/${ev.id}: evidência sem fonte`);
      }
    }
  }

  for (const metric of data.metrics ?? []) {
    if (!NIVEL1_METRICS.includes(metric.id)) continue;
    if (BAD_AVAILABILITY.has(metric.availability)) {
      problems.push(
        `${slug}: indicador de nível 1 vazio (${metric.id} = ${metric.availability}) — deve ter dado ou lacuna explicada`,
      );
    }
  }

  const pais = (data.countryProject?.vision ?? "").trim();
  if (!pais) problems.push(`${slug}: país/projeto sem visão`);

  summary.push(
    `${slug.padEnd(22)} capacidades ${caps.size}/8 (documentadas ${documented}) | país ${
      pais ? "ok" : "--"
    } | mundo ${data.foreignPolicy ? "ok" : "--"} | coerência ${(data.coherence ?? []).length}`,
  );
}

console.log("cobertura por candidato:");
for (const line of summary) console.log("  " + line);

if (problems.length) {
  console.log(`\n✗ ${problems.length} problema(s):`);
  for (const p of problems.slice(0, 60)) console.log("  - " + p);
  process.exit(1);
}
console.log("\n✓ nível 1 auditado: sem célula vazia, sem evidência sem fonte, sem adjetivo de valor");
