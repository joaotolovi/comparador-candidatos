// ─── Camada de dados ─────────────────────────────────────────────────────────
// Fronteira única entre "de onde vêm os dados" e a apresentação.
// Hoje: módulo gerado a partir de pesquisa estruturada (research/*.json).
// Amanhã: basta trocar a implementação por fetch() de uma API — os loaders
// são async e a assinatura não muda (arquitetura preparada p/ API, §26).

import { DIMENSIONS, SECTIONS, sectionOfMetric, type Candidate, type Metric, type DimensionSlug, type SectionSlug } from "@/types";
import { isComparable, type ComparisonDelta, formatDelta } from "@/lib/comparison";
import { candidates as rawCandidates } from "@/data/candidates";

export async function getCandidates(): Promise<Candidate[]> {
  return rawCandidates;
}

export async function getCandidateBySlug(slug: string): Promise<Candidate | undefined> {
  return rawCandidates.find((c) => c.slug === slug);
}

/** Slugs do comparador padrão (home). */
export const DEFAULT_SLUGS = ["lula", "flavio-bolsonaro", "renan-santos"];

export interface ComparisonCandidate {
  candidate: Candidate;
  slot: "a" | "b" | "c";
}

export interface MetricRow {
  metricId: string;
  name: string;
  category: DimensionSlug;
  /** seção V3 onde a linha aparece (currículo, plano, opinião, capacidades) */
  section: SectionSlug;
  methodology: string;
  values: (Metric | null)[];
  delta?: ComparisonDelta;
  comparable: boolean;
  /** verdade quando todos os valores disponíveis são iguais */
  equal: boolean;
}

export async function getComparison(slugs: string[]): Promise<ComparisonCandidate[]> {
  const picked: ComparisonCandidate[] = [];
  const slots: ("a" | "b" | "c")[] = ["a", "b", "c"];
  for (let i = 0; i < Math.min(slugs.length, 3); i++) {
    const c = await getCandidateBySlug(slugs[i]);
    if (c) picked.push({ candidate: c, slot: slots[i] });
  }
  return picked;
}

/** Linhas de comparação por dimensão, para os candidatos selecionados. */
export function buildRows(candidates: Candidate[]): MetricRow[] {
  if (candidates.length === 0) return [];
  // União das métricas de todos candidatos, preservando a ordem de aparição
  const seen = new Map<string, Metric>();
  const order: string[] = [];
  for (const c of candidates) {
    for (const m of c.metrics) {
      if (!seen.has(m.id)) {
        seen.set(m.id, m);
        order.push(m.id);
      }
    }
  }
  const names = [candidates[0]?.name ?? "", candidates[1]?.name ?? "", candidates[2]?.name ?? ""];

  return order.map((id) => {
    const metric = seen.get(id)!;
    const values = candidates.map((c) => c.metrics.find((m) => m.id === id) ?? null);
    // Delta entre os candidatos COM valor comparável (2 ou 3); quem não tem
    // dado não entra na conta — ausência nunca vira zero.
    const withValue = values
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => v !== null && isComparable(v));
    const comparable = withValue.length >= 2;
    let delta: ComparisonDelta | undefined;
    let equal = false;
    if (comparable) {
      const nums = withValue.map(({ v }) => v!.value as number);
      const max = Math.max(...nums);
      const min = Math.min(...nums);
      equal = nums.every((n) => n === nums[0]);
      const leaderName = names[withValue[nums.indexOf(max)].i] ?? "";
      const followerName = names[withValue[nums.lastIndexOf(min)].i] ?? "";
      delta = formatDelta(metric, { a: max, b: min }, { a: leaderName, b: followerName });
    }
    return {
      metricId: id,
      name: metric.name,
      category: metric.category as DimensionSlug,
      section: sectionOfMetric(id),
      methodology: metric.methodology,
      values,
      delta,
      comparable: Boolean(comparable && delta),
      equal,
    };
  });
}

/** Agrupa as linhas de métrica nas seções da V3, na ordem canônica de SECTIONS. */
export function groupRowsBySection(
  rows: MetricRow[],
): { section: (typeof SECTIONS)[number]; rows: MetricRow[] }[] {
  return SECTIONS.filter((s) => s.kind === "metrics" || s.slug === "capacidades")
    .map((s) => ({ section: s, rows: rows.filter((r) => r.section === s.slug) }))
    .filter((g) => g.rows.length > 0);
}

export interface KeyDifference {
  metricId: string;
  name: string;
  category: DimensionSlug;
  values: (Metric | null)[];
  delta: ComparisonDelta;
  /** normalizado 0..1 — escala da diferença relativa ao maior valor */
  weight: number;
}

/** "Principais diferenças" — seleção algorítmica, nunca um "vencedor geral". */
export function keyDifferences(rows: MetricRow[], candidates: Candidate[]): KeyDifference[] {
  const diffs: KeyDifference[] = [];
  for (const row of rows) {
    if (!row.comparable || !row.delta || row.equal) continue;
    const nums = row.values
      .map((v) => v?.value)
      .filter((n): n is number => typeof n === "number");
    if (nums.length < 2) continue;
    const max = Math.max(...nums);
    const min = Math.min(...nums);
    const weight = max > 0 ? (max - min) / max : 0;
    if (weight <= 0) continue;
    diffs.push({
      metricId: row.metricId,
      name: row.name,
      category: row.category,
      values: row.values,
      delta: row.delta,
      weight,
    });
  }
  diffs.sort((a, b) => b.weight - a.weight);
  // no máximo 2 por dimensão (equilíbrio entre revelar e não dominar)
  const perDim = new Map<string, number>();
  const picked: KeyDifference[] = [];
  for (const d of diffs) {
    const n = perDim.get(d.category) ?? 0;
    if (n >= 2) continue;
    perDim.set(d.category, n + 1);
    picked.push(d);
    if (picked.length >= 6) break;
  }
  return picked;
}

export function dimensionOf(slug: string) {
  return DIMENSIONS.find((d) => d.slug === slug);
}
