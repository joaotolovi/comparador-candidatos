"use client";

// Seção 04 — viabilidade em formato compacto. Métricas zeradas por todas as
// candidaturas são agrupadas numa única observação; a seção não repete a lista
// de propostas, que já vive na seção anterior.
//
// Cada número é clicável: abre a lista de propostas por trás da contagem.

import type { Candidate, PlanProposal, Source } from "@/types";
import { CandidateTag, CandidateColumns, ContentEmpty, SLOTS } from "@/components/section-shell";
import { Explainable, type ExplainerContent } from "@/components/explainer";
import { glossaryFor } from "@/lib/glossary";

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

/** Painel de uma contagem: definição + critério + as propostas que atendem. */
function countContent(
  label: string,
  value: number,
  total: number,
  matches: PlanProposal[],
  sources: Source[],
  planUrl?: string,
): ExplainerContent {
  const def = glossaryFor(label);
  return {
    title: `${label} — ${value}/${total}`,
    blocks: [
      { body: def?.body ?? "" },
      {
        heading: "Como contamos",
        body: `${value} de ${total} propostas analisadas (${pct(value, total)}%).`,
      },
      ...(matches.length > 0
        ? [
            {
              heading: "Propostas que atendem ao critério",
              items: matches.slice(0, 12).map((p) => ({ text: p.theme })),
            },
          ]
        : []),
      ...(matches.length === 0
        ? [
            {
              heading: "Zero documentado",
              body:
                "Nenhuma das propostas analisadas declara este detalhamento. Ausência declarada — o produto não preenche com estimativa própria.",
            },
          ]
        : []),
    ],
    sources: sources.slice(0, 8),
    link: planUrl ? { href: planUrl, label: "Plano registrado" } : undefined,
  };
}

function MetricBar({
  label,
  value,
  total,
  matches,
  sources,
  planUrl,
}: {
  label: string;
  value: number;
  total: number;
  matches: PlanProposal[];
  sources: Source[];
  planUrl?: string;
}) {
  const valuePct = pct(value, total);
  const def = glossaryFor(label);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground" title={def?.short}>{label}</span>
        <Explainable
          hint={def?.short ?? "Clique para ver as propostas por trás deste número"}
          content={countContent(label, value, total, matches, sources, planUrl)}
          className="tabular rounded font-semibold text-foreground hover:underline hover:decoration-dotted hover:underline-offset-4"
        >
          {total > 0 ? `${value}/${total}` : "—"}
        </Explainable>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${valuePct}%` }} />
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  total,
  matches,
  sources,
  planUrl,
}: {
  value: number;
  label: string;
  total: number;
  matches: PlanProposal[];
  sources: Source[];
  planUrl?: string;
}) {
  const def = glossaryFor(label);
  return (
    <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2.5">
      <Explainable
        hint={def?.short ?? "Clique para ver as propostas por trás deste número"}
        content={countContent(label, value, total, matches, sources, planUrl)}
        className="flex flex-col items-start gap-1 rounded text-start hover:underline hover:decoration-dotted hover:underline-offset-4"
      >
        <span className="tabular text-lg font-semibold leading-none">{value}</span>
        <span className="mt-1 text-[11px] text-muted-foreground">{label}</span>
      </Explainable>
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

  /** Predicado por métrica — espelha stats(). */
  const matchesMetric = (p: PlanProposal, key: (typeof METRICS)[number]["key"]): boolean => {
    switch (key) {
      case "objective":
        return p.hasClearObjective;
      case "target":
        return p.hasQuantitativeTarget;
      case "deadline":
        return p.hasDeadline;
      case "cost":
        return p.hasCostEstimate;
      case "funding":
        return p.hasFundingSource;
      case "path":
        return Boolean(p.reality?.requirement);
    }
  };

  const matchesDependency = (p: PlanProposal, key: (typeof DEPENDENCIES)[number]["key"]): boolean => {
    switch (key) {
      case "congress":
        return p.dependsOnCongress;
      case "states":
        return p.dependsOnStates;
      case "municipalities":
        return p.dependsOnMunicipalities;
    }
  };

  const unionSources = (proposals: PlanProposal[]): Source[] => {
    const seen = new Set<string>();
    const out: Source[] = [];
    for (const p of proposals) {
      for (const s of p.sources ?? []) {
        const k = s.url || s.title || JSON.stringify(s).slice(0, 64);
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(s);
      }
    }
    return out;
  };

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
          const proposals = c.governmentPlan?.proposals ?? [];
          const planUrl = c.governmentPlan?.planUrl;
          return (
            <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
              {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}

              <div className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-3">
                <Explainable
                  hint="Clique para ver o que são as propostas analisadas"
                  content={{
                    title: "Propostas analisadas",
                    blocks: [
                      { body: glossaryFor("propostas analisadas")?.body ?? "" },
                      {
                        heading: "As propostas deste plano",
                        items: proposals.slice(0, 14).map((p) => ({ text: p.theme })),
                      },
                    ],
                    link: planUrl ? { href: planUrl, label: "Plano registrado" } : undefined,
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Propostas analisadas
                </Explainable>
                <span className="tabular text-lg font-semibold">{s.total}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {visibleMetrics.map((m) => {
                  const matches = proposals.filter((p) => matchesMetric(p, m.key));
                  return (
                    <MetricBar
                      key={m.key}
                      label={m.label}
                      value={s[m.key]}
                      total={s.total}
                      matches={matches}
                      sources={unionSources(matches)}
                      planUrl={planUrl}
                    />
                  );
                })}
              </div>

              {visibleDependencies.length > 0 ? (
                <div className="border-t border-border/70 pt-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground" title={glossaryFor("dependências identificadas")?.short}>
                    Dependências identificadas
                  </div>
                  <div className={`grid gap-2 ${visibleDependencies.length === 1 ? "grid-cols-1" : visibleDependencies.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                    {visibleDependencies.map((d) => {
                      const matches = proposals.filter((p) => matchesDependency(p, d.key));
                      return (
                        <Stat
                          key={d.key}
                          value={s[d.key]}
                          label={d.label}
                          total={s.total}
                          matches={matches}
                          sources={unionSources(matches)}
                          planUrl={planUrl}
                        />
                      );
                    })}
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
