"use client";

// Seção 01 — comparação rápida, alinhada por assunto. A primeira leitura evita
// parágrafos e cortes mecânicos: usa prioridades, barras, contadores e termos
// explicitamente presentes no material analisado. Detalhes ficam nas seções abaixo.

import type { Candidate, RealityCheck } from "@/types";
import { CandidateColumns, CandidateTag, SLOTS } from "@/components/section-shell";
import { ArrowDown } from "lucide-react";

function cleanLabel(text: string, limit = 72) {
  const normalized = (text ?? "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;:,]+$/, "");
  if (normalized.length <= limit) return normalized;
  const parts = normalized.split(/[,;:]/).map((p) => p.trim()).filter(Boolean);
  const short = parts.find((p) => p.length >= 18 && p.length <= limit);
  return short ?? normalized.split(" ").slice(0, 8).join(" ");
}

function projectSummary(c: Candidate) {
  const priorities = (c.countryProject?.nationalPriorities ?? []).slice(0, 3).map((p) => cleanLabel(p, 58));
  if (!priorities.length) return "Projeto de país em consolidação.";
  return `Foco declarado: ${priorities.join(" · ")}`;
}

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function planStats(c: Candidate) {
  const proposals = c.governmentPlan?.proposals ?? [];
  const total = proposals.length;
  return {
    total,
    objective: proposals.filter((p) => p.hasClearObjective).length,
    target: proposals.filter((p) => p.hasQuantitativeTarget).length,
    deadline: proposals.filter((p) => p.hasDeadline).length,
    cost: proposals.filter((p) => p.hasCostEstimate).length,
    funding: proposals.filter((p) => p.hasFundingSource).length,
    path: proposals.filter((p) => Boolean(p.reality?.requirement)).length,
    congress: proposals.filter((p) => p.dependsOnCongress).length,
    states: proposals.filter((p) => p.dependsOnStates).length,
    municipalities: proposals.filter((p) => p.dependsOnMunicipalities).length,
  };
}

function realityUnits(c: Candidate): { done: number; total: number } {
  const caps = c.capacities ?? [];
  const proposals = c.governmentPlan?.proposals ?? [];
  const themes = c.themes ?? [];
  const units = [
    Boolean(c.countryProject?.reality),
    Boolean(c.foreignPolicy?.reality),
    ...caps.map((x) => Boolean(x.reality)),
    ...proposals.map((p) => Boolean(p.reality)),
    ...themes.map((t) => Boolean(t.reality)),
  ];
  return { done: units.filter(Boolean).length, total: units.length };
}

function realitySignals(c: Candidate) {
  const realities: Array<RealityCheck | undefined> = [
    c.countryProject?.reality,
    c.foreignPolicy?.reality,
    ...(c.capacities ?? []).map((x) => x.reality),
    ...(c.governmentPlan?.proposals ?? []).map((x) => x.reality),
    ...(c.themes ?? []).map((x) => x.reality),
  ];
  return realities.reduce(
    (acc, r) => {
      if (!r) return acc;
      acc.tensions += r.tensions?.length ?? 0;
      acc.open += r.openQuestions?.length ?? 0;
      return acc;
    },
    { tensions: 0, open: 0 },
  );
}

const WORLD_TERMS: Array<[RegExp, string]> = [
  [/\bBRICS\b/i, "BRICS"],
  [/Mercosul/i, "Mercosul"],
  [/Estados Unidos|\bEUA\b/i, "Estados Unidos"],
  [/China/i, "China"],
  [/Uni[aã]o Europeia/i, "União Europeia"],
  [/\bONU\b|Na[cç][oõ]es Unidas/i, "ONU"],
  [/multilateral/i, "multilateralismo"],
  [/n[aã]o[- ]alinh/i, "não alinhamento"],
  [/soberan/i, "soberania"],
  [/integra[cç][aã]o (regional|sul-americana|latino-americana)/i, "integração regional"],
  [/clima|clim[aá]tic/i, "clima"],
];

function worldTags(c: Candidate) {
  const text = `${c.foreignPolicy?.worldView ?? ""} ${c.foreignPolicy?.strategy ?? ""}`;
  return WORLD_TERMS.filter(([re]) => re.test(text)).map(([, label]) => label).slice(0, 5);
}

function MicroBar({ value, total }: { value: number; total: number }) {
  const pct = percentage(value, total);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular w-10 shrink-0 text-right text-xs font-semibold text-foreground">
        {total > 0 ? `${value}/${total}` : "—"}
      </span>
    </div>
  );
}

function NumberTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2.5">
      <div className="tabular text-lg font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function MatrixRow({
  label,
  candidates,
  children,
}: {
  label: string;
  candidates: Candidate[];
  children: (candidate: Candidate, index: number) => React.ReactNode;
}) {
  return (
    <div
      className="grid gap-3 border-t border-border/70 py-3 sm:cmp-grid"
      style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
    >
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {candidates.map((c, i) => (
        <div key={c.slug} className="min-w-0">{children(c, i)}</div>
      ))}
      <div className="hidden sm:block" aria-hidden />
    </div>
  );
}

export function ComparisonSummary({ candidates }: { candidates: Candidate[] }) {
  const planByCandidate = candidates.map(planStats);
  const metricDefs = [
    { key: "objective", label: "Objetivo explícito" },
    { key: "target", label: "Meta quantitativa" },
    { key: "deadline", label: "Prazo" },
    { key: "cost", label: "Custo estimado" },
    { key: "funding", label: "Fonte de financiamento" },
    { key: "path", label: "Caminho institucional" },
  ] as const;
  const visibleMetrics = metricDefs.filter((m) => planByCandidate.some((p) => p[m.key] > 0));
  const absentMetrics = metricDefs.filter((m) => planByCandidate.every((p) => p[m.key] === 0));

  const dependencyDefs = [
    { key: "congress", label: "Congresso" },
    { key: "states", label: "Estados" },
    { key: "municipalities", label: "Municípios" },
  ] as const;
  const visibleDependencies = dependencyDefs.filter((d) => planByCandidate.some((p) => p[d.key] > 0));

  return (
    <section aria-labelledby="h-summary" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seção 1</span>
        <h2 id="h-summary" className="display-2">Comparação rápida</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          O essencial, alinhado por assunto. Detalhes, evidências e fontes ficam abaixo.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div
          className="grid gap-3 border-b border-border bg-muted/25 p-3 sm:cmp-grid"
          style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Candidatos</div>
          {candidates.map((c, i) => (
            <CandidateTag key={c.slug} name={c.name} slot={SLOTS[i] ?? "a"} />
          ))}
          <div className="hidden sm:block" aria-hidden />
        </div>

        <div className="px-3">
          <MatrixRow label="Projeto de país" candidates={candidates}>
            {(c) => (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium leading-snug text-foreground">{projectSummary(c)}</p>
                <div className="flex flex-wrap gap-1">
                  {(c.countryProject?.nationalPriorities ?? []).slice(0, 3).map((p) => (
                    <span key={p} className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {cleanLabel(p, 44)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </MatrixRow>

          {visibleMetrics.length ? (
            <div className="border-t border-border/70 py-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plano em números</span>
                {absentMetrics.length ? (
                  <span className="text-[11px] text-muted-foreground">
                    Sem detalhamento em comum: {absentMetrics.map((m) => m.label.toLowerCase()).join(" · ")}
                  </span>
                ) : null}
              </div>
              {visibleMetrics.map((m) => (
                <div
                  key={m.key}
                  className="grid gap-3 py-1.5 sm:cmp-grid"
                  style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
                >
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  {planByCandidate.map((p, i) => (
                    <MicroBar key={`${m.key}-${candidates[i].slug}`} value={p[m.key]} total={p.total} />
                  ))}
                  <div className="hidden sm:block" aria-hidden />
                </div>
              ))}
            </div>
          ) : null}

          {visibleDependencies.length ? (
            <div className="border-t border-border/70 py-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dependências declaradas</div>
              <CandidateColumns count={candidates.length}>
                {planByCandidate.map((p, i) => (
                  <div key={candidates[i].slug} className="flex flex-wrap gap-2">
                    {visibleDependencies.map((d) => (
                      <NumberTile key={d.key} value={p[d.key]} label={d.label} />
                    ))}
                  </div>
                ))}
              </CandidateColumns>
            </div>
          ) : null}

          <div className="border-t border-border/70 py-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Base factual publicada</div>
            <CandidateColumns count={candidates.length}>
              {candidates.map((c) => {
                const withEvidence = (c.capacities ?? []).filter((x) => x.evidences.length > 0).length;
                const themes = c.themes?.length ?? 0;
                const reality = realityUnits(c);
                const signals = realitySignals(c);
                return (
                  <div key={c.slug} className="grid grid-cols-3 gap-2">
                    <NumberTile value={`${withEvidence}/8`} label="capacidades" />
                    <NumberTile value={`${themes}/10`} label="temas" />
                    <NumberTile value={`${reality.done}/${reality.total}`} label="testes" />
                    {(signals.tensions > 0 || signals.open > 0) ? (
                      <div className="col-span-3 flex flex-wrap gap-1.5 pt-1">
                        {signals.tensions > 0 ? <span className="rounded-full bg-muted px-2 py-1 text-[11px]">{signals.tensions} tensões documentadas</span> : null}
                        {signals.open > 0 ? <span className="rounded-full bg-muted px-2 py-1 text-[11px]">{signals.open} questões em aberto</span> : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </CandidateColumns>
          </div>

          <MatrixRow label="Brasil no mundo" candidates={candidates}>
            {(c) => {
              const tags = worldTags(c);
              return tags.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-2 py-1 text-[11px] text-foreground/80">{tag}</span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Política externa em consolidação.</span>
              );
            }}
          </MatrixRow>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => document.getElementById("s-pais")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="inline-flex items-center gap-1.5 rounded border border-foreground px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
        >
          Explorar os detalhes
          <ArrowDown aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}
