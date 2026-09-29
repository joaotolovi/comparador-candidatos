"use client";

// Seção 04 — Viabilidade e instrumentos: para cada proposta-chave, o que ela
// exige para sair do papel (ato do Executivo, lei, PEC, estados, privados) e
// quanto do plano informa custo, prazo e dependência institucional.

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

function ProposalRow({ proposal }: { proposal: PlanProposal }) {
  const req = proposal.reality?.requirement;
  return (
    <li className="flex flex-col gap-1 border-t border-border/70 py-2 first:border-t-0 first:pt-0">
      <p className="text-sm leading-snug text-foreground/90">{proposal.title}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            req ? "border-border text-muted-foreground" : "border-dashed text-muted-foreground/70",
          )}
        >
          {req ? PATH_LABELS[req.path] : "Instrumento não declarado"}
        </span>
        {req?.quorum ? (
          <span className="tabular text-[11px] text-muted-foreground">{req.quorum}</span>
        ) : null}
      </div>
      {req?.note ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{req.note}</p>
      ) : null}
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
        const withReq = proposals.filter((p) => p.reality?.requirement).length;
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}

            {proposals.length > 0 ? (
              <>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="tabular font-semibold text-foreground">{withReq}</span> de{" "}
                  <span className="tabular font-semibold text-foreground">{proposals.length}</span>{" "}
                  propostas analisadas têm o caminho institucional identificado.
                </p>
                <ul className="flex flex-col">
                  {proposals.map((p) => (
                    <ProposalRow key={p.id} proposal={p} />
                  ))}
                </ul>
              </>
            ) : (
              <ContentEmpty
                what="Propostas em consolidação"
                why="O documento registrado não traz propostas analisáveis com meta, prazo ou instrumento; nada é estimado pelo comparador."
              />
            )}
          </div>
        );
      })}
    </CandidateColumns>
  );
}
