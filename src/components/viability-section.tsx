"use client";

// Seção 04 — viabilidade e instrumentos em formato visual. A primeira leitura
// mostra proporções e dependências; a lista de propostas e fontes abre apenas
// quando o usuário quiser aprofundar.

import type { Candidate, PlanProposal } from "@/types";
import { PATH_LABELS } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

function pct(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function MetricBar({ label, value, total }: { label: string; value: number; total: number }) {
  const valuePct = pct(value, total);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular font-semibold text-foreground">
          {total > 0 ? `${value}/${total}` : "—"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${valuePct}%` }} />
      </div>
    </div>
  );
}

function DependencyTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/40 p-2.5">
      <div className="tabular text-xl font-semibold leading-none text-foreground">{value}</div>
      <div className="mt-1 text-[11px] font-medium leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function ProposalRow({ proposal }: { proposal: PlanProposal }) {
  const req = proposal.reality?.requirement;
  return (
    <li className="flex flex-col gap-1.5 border-t border-border/70 py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-foreground/90">{proposal.title}</p>
        <span
          className={cn(
            "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            req ? "border-border text-muted-foreground" : "border-dashed text-muted-foreground/70",
          )}
        >
          {req ? PATH_LABELS[req.path] : "Instrumento não declarado"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {proposal.hasQuantitativeTarget ? <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">meta</span> : null}
        {proposal.hasDeadline ? <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">prazo</span> : null}
        {proposal.hasCostEstimate ? <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">custo</span> : null}
        {proposal.hasFundingSource ? <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">financiamento</span> : null}
      </div>

      {req?.quorum ? <p className="tabular text-[11px] text-muted-foreground">{req.quorum}</p> : null}
      {proposal.sources?.length ? <SourcesInline sources={proposal.sources} /> : null}
    </li>
  );
}

export function ViabilitySection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const proposals = c.governmentPlan?.proposals ?? [];
        const total = proposals.length;
        const withObjective = proposals.filter((p) => p.hasClearObjective).length;
        const withTarget = proposals.filter((p) => p.hasQuantitativeTarget).length;
        const withDeadline = proposals.filter((p) => p.hasDeadline).length;
        const withCost = proposals.filter((p) => p.hasCostEstimate).length;
        const withFunding = proposals.filter((p) => p.hasFundingSource).length;
        const withReq = proposals.filter((p) => p.reality?.requirement).length;
        const congress = proposals.filter((p) => p.dependsOnCongress).length;
        const states = proposals.filter((p) => p.dependsOnStates).length;
        const municipalities = proposals.filter((p) => p.dependsOnMunicipalities).length;

        return (
          <article key={c.slug} className="flex h-full flex-col gap-4 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}

            {total > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <DependencyTile value={total} label="propostas analisadas" />
                  <DependencyTile value={withReq} label="com caminho identificado" />
                </div>

                <div className="flex flex-col gap-2.5 border-t border-border/70 pt-4">
                  <MetricBar label="Objetivo explícito" value={withObjective} total={total} />
                  <MetricBar label="Meta quantitativa" value={withTarget} total={total} />
                  <MetricBar label="Prazo" value={withDeadline} total={total} />
                  <MetricBar label="Custo estimado" value={withCost} total={total} />
                  <MetricBar label="Fonte de financiamento" value={withFunding} total={total} />
                </div>

                <div className="flex flex-col gap-2 border-t border-border/70 pt-4">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Dependências identificadas
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <DependencyTile value={congress} label="Congresso" />
                    <DependencyTile value={states} label="Estados" />
                    <DependencyTile value={municipalities} label="Municípios" />
                  </div>
                </div>

                <details className="group mt-auto rounded-md border border-border/70 bg-background/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    <span>Ver propostas analisadas ({total})</span>
                    <ChevronDown aria-hidden className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="flex flex-col border-t border-border/70 px-3 py-3">
                    {proposals.map((p) => (
                      <ProposalRow key={p.id} proposal={p} />
                    ))}
                  </ul>
                </details>
              </>
            ) : (
              <ContentEmpty
                what="Propostas em consolidação"
                why="O documento registrado não traz propostas analisáveis com meta, prazo ou instrumento; nada é estimado pelo comparador."
              />
            )}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
