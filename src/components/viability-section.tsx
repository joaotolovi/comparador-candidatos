"use client";

// Seção 04 — viabilidade em formato compacto. Métricas zeradas por todas as
// candidaturas são agrupadas numa única observação; a seção não repete a lista
// de propostas, que já vive na seção anterior.

import type { Candidate } from "@/types";
import { CandidateTag, CandidateColumns, ContentEmpty, SLOTS } from "@/components/section-shell";

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function MetricBar({ label, value, total }: { label: string; value: number; total: number }) {
  const valuePct = pct(value, total);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular font-semibold text-foreground">{total > 0 ? `${value}/${total}` : "—"}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${valuePct}%` }} />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2.5">
      <div className="tabular text-lg font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function stats(c: Candidate) {
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

const METRICS = [
  { key: "objective", label: "Objetivo explícito" },
  { key: "target", label: "Meta quantitativa" },
  { key: "deadline", label: "Prazo" },
  { key: "cost", label: "Custo estimado" },
  { key: "funding", label: "Fonte de financiamento" },
  { key: "path", label: "Caminho institucional" },
] as const;

const DEPENDENCIES = [
  { key: "congress", label: "Congresso" },
  { key: "states", label: "Estados" },
  { key: "municipalities", label: "Municípios" },
] as const;

export function ViabilitySection({ candidates, hideTag }: { candidates: Candidate[]; hideTag?: boolean }) {
  const allStats = candidates.map(stats);
  const visibleMetrics = METRICS.filter((m) => allStats.some((s) => s[m.key] > 0));
  const absentMetrics = METRICS.filter((m) => allStats.every((s) => s[m.key] === 0));
  const visibleDependencies = DEPENDENCIES.filter((d) => allStats.some((s) => s[d.key] > 0));
  const absentDependencies = DEPENDENCIES.filter((d) => allStats.every((s) => s[d.key] === 0));
  const anyData = allStats.some((s) => s.total > 0);

  if (!anyData) {
    return (
      <ContentEmpty
        what="Propostas em consolidação"
        why="Ainda não há propostas analisáveis suficientes para resumir instrumentos e dependências."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {(absentMetrics.length > 0 || absentDependencies.length > 0) ? (
        <div className="flex flex-wrap gap-2 rounded-md border border-border/70 bg-muted/25 px-3 py-2.5 text-xs text-muted-foreground">
          {absentMetrics.length > 0 ? (
            <span>
              <span className="font-medium text-foreground">Sem detalhamento em nenhuma candidatura:</span>{" "}
              {absentMetrics.map((m) => m.label.toLowerCase()).join(" · ")}
            </span>
          ) : null}
          {absentDependencies.length > 0 ? (
            <span>
              <span className="font-medium text-foreground">Sem dependência declarada:</span>{" "}
              {absentDependencies.map((d) => d.label.toLowerCase()).join(" · ")}
            </span>
          ) : null}
        </div>
      ) : null}

      <CandidateColumns count={candidates.length}>
        {candidates.map((c, i) => {
          const s = allStats[i];
          return (
            <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
              {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}

              <div className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-3">
                <span className="text-xs text-muted-foreground">Propostas analisadas</span>
                <span className="tabular text-lg font-semibold">{s.total}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {visibleMetrics.map((m) => (
                  <MetricBar key={m.key} label={m.label} value={s[m.key]} total={s.total} />
                ))}
              </div>

              {visibleDependencies.length > 0 ? (
                <div className="border-t border-border/70 pt-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Dependências identificadas
                  </div>
                  <div className={`grid gap-2 ${visibleDependencies.length === 1 ? "grid-cols-1" : visibleDependencies.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {visibleDependencies.map((d) => (
                      <Stat key={d.key} value={s[d.key]} label={d.label} />
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </CandidateColumns>
    </div>
  );
}
