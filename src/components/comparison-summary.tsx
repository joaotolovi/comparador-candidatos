"use client";

// Seção 01 — leitura em 15 segundos. Em vez de repetir parágrafos, o topo
// condensa projeto, prioridades, detalhamento do plano, dependências
// institucionais, cobertura factual e teste de realidade em sinais visuais.
// Barras mostram presença de informação/estrutura no material analisado; não são
// nota de mérito, ranking ou previsão de sucesso.

import type { Candidate, RealityCheck } from "@/types";
import {
  CandidateColumns,
  CandidateTag,
  SLOTS,
} from "@/components/section-shell";
import { ArrowDown } from "lucide-react";

function clip(text: string, limit = 115): string {
  const t = (text ?? "").trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  if (stop > limit * 0.55) return cut.slice(0, stop + 1);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : limit)}…`;
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
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

function MetricBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = percentage(value, total);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular font-semibold text-foreground">
          {total > 0 ? `${value}/${total}` : "—"}
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label}: ${total > 0 ? `${value} de ${total}, ${pct}%` : "sem dados"}`}
      >
        <div
          className="h-full rounded-full bg-foreground/70 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatTile({
  value,
  label,
  note,
}: {
  value: string | number;
  label: string;
  note?: string;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background/40 p-2.5">
      <div className="tabular text-lg font-semibold leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">{label}</div>
      {note ? <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground/80">{note}</div> : null}
    </div>
  );
}

function CandidateSnapshot({
  candidate,
  slot,
}: {
  candidate: Candidate;
  slot: "a" | "b" | "c";
}) {
  const plan = planStats(candidate);
  const withEvidence = (candidate.capacities ?? []).filter((x) => x.evidences.length > 0).length;
  const themes = candidate.themes?.length ?? 0;
  const reality = realityUnits(candidate);
  const signals = realitySignals(candidate);
  const priorities = candidate.countryProject?.nationalPriorities ?? [];

  return (
    <article className="flex h-full flex-col gap-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-2">
        <CandidateTag name={candidate.name} slot={slot} />
        <p className="text-base font-semibold leading-snug text-foreground">
          {candidate.countryProject?.vision ? clip(candidate.countryProject.vision, 130) : "Projeto de país em consolidação"}
        </p>
        {priorities.length ? (
          <div className="flex flex-wrap gap-1.5">
            {priorities.slice(0, 5).map((p) => (
              <span
                key={p}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] leading-snug text-foreground/80"
              >
                {clip(p, 42)}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border/70 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
            Plano em números
          </h3>
          <span className="tabular text-[11px] text-muted-foreground">
            {plan.total ? `${plan.total} propostas analisadas` : "sem propostas contáveis"}
          </span>
        </div>
        <MetricBar label="Objetivo explícito" value={plan.objective} total={plan.total} />
        <MetricBar label="Meta quantitativa" value={plan.target} total={plan.total} />
        <MetricBar label="Prazo" value={plan.deadline} total={plan.total} />
        <MetricBar label="Custo estimado" value={plan.cost} total={plan.total} />
        <MetricBar label="Fonte de financiamento" value={plan.funding} total={plan.total} />
        <MetricBar label="Caminho institucional identificado" value={plan.path} total={plan.total} />
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Dependências declaradas
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatTile value={plan.congress} label="Congresso" />
          <StatTile value={plan.states} label="Estados" />
          <StatTile value={plan.municipalities} label="Municípios" />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Base factual publicada
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatTile value={`${withEvidence}/8`} label="capacidades" note="com casos documentados" />
          <StatTile value={`${themes}/10`} label="temas" note="com posição apurada" />
          <StatTile value={`${reality.done}/${reality.total}`} label="testes" note="de realidade publicados" />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Pontos documentados para aprofundar
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <StatTile value={signals.tensions} label="pontos de tensão" />
          <StatTile value={signals.open} label="questões em aberto" />
        </div>
      </div>

      {candidate.foreignPolicy?.worldView ? (
        <div className="mt-auto border-t border-border/70 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
            Brasil no mundo
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {clip(candidate.foreignPolicy.worldView, 135)}
          </p>
        </div>
      ) : null}
    </article>
  );
}

export function ComparisonSummary({ candidates }: { candidates: Candidate[] }) {
  return (
    <section aria-labelledby="h-summary" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Seção 1
        </span>
        <h2 id="h-summary" className="display-2">
          Comparação em 15 segundos
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          O topo condensa o que está documentado: projeto, prioridades, detalhamento das propostas,
          dependências institucionais, cobertura de evidências e pontos que exigem leitura mais profunda.
          As barras medem presença de informação no material analisado, não mérito político.
        </p>
      </div>

      <CandidateColumns count={candidates.length}>
        {candidates.map((c, i) => (
          <CandidateSnapshot key={c.slug} candidate={c} slot={SLOTS[i] ?? "a"} />
        ))}
      </CandidateColumns>

      <div>
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("s-pais");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="inline-flex items-center gap-1.5 rounded border border-foreground px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Explorar os detalhes
          <ArrowDown aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}
