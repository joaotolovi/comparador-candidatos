// Dataset do comparador: seed de identificação (TSE) mesclado com a pesquisa
// profunda (src/data/research.ts — GERADO por scripts/normalize.mjs a partir
// de research/*.json). Não editar research.ts à mão.
import type { Candidate } from "@/types";
import { seeds, seedShell } from "./seed";
import { researched } from "./research";

const bySlug = new Map<string, Partial<Candidate>>();
for (const r of researched) {
  if (r && typeof r.slug === "string") bySlug.set(r.slug, r);
}

const merge = (slug: string): Candidate => {
  const seed = seeds.find((s) => s.slug === slug);
  if (!seed) throw new Error(`seed ausente para slug: ${slug}`);
  const shell = seedShell(seed);
  const r = bySlug.get(slug);
  if (!r) return shell;
  // O research tem prioridade; campos estruturais do shell são preservados
  // quando o research não os define.
  return { ...shell, ...r, id: shell.id, slug: shell.slug };
};

export const candidates: Candidate[] = seeds.map((s) => merge(s.slug));

// Ordem operacional (pesquisas de intenção de voto) — não é ranking editorial.
export const operationalOrder = [
  "lula",
  "flavio-bolsonaro",
  "renan-santos",
  "caiado",
  "zema",
  "leonardo-avalanche",
  "augusto-cury",
  "clariana-barao",
  "samara-martins",
  "edmilson-costa",
  "hertz-dias",
  "rui-costa-pimenta",
  "wilson-grassi",
];
