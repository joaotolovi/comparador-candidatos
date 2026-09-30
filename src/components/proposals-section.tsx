"use client";

// Propostas-chave: a superfície mostra tema, título e sinais objetivos. Descrição,
// teste de realidade e fontes ficam no drawer. Apenas três propostas aparecem de
// início para evitar que a seção domine a página.

import { useState } from "react";
import type { Candidate, PlanProposal } from "@/types";
import { PATH_LABELS } from "@/types";
import { CandidateTag, CandidateColumns, ContentEmpty, SourcesInline, SLOTS } from "@/components/section-shell";
import { RealityBlock, RealityMissing } from "@/components/reality-check";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

function ProposalLine({
  proposal,
  candidate,
  onOpen,
}: {
  proposal: PlanProposal;
  candidate: Candidate;
  onOpen: () => void;
}) {
  const req = proposal.reality?.requirement;
  const signals = [
    proposal.hasQuantitativeTarget ? "meta" : null,
    proposal.hasDeadline ? "prazo" : null,
    proposal.hasCostEstimate ? "custo" : null,
    proposal.hasFundingSource ? "financiamento" : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-2 border-t border-border/70 py-3 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{proposal.theme}</div>
          <div className="mt-0.5 text-sm font-semibold leading-snug">{proposal.title}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-xs"
          onClick={onOpen}
          aria-label={`Abrir detalhes de ${proposal.title} — ${candidate.name}`}
        >
          Abrir
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {req ? (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            {PATH_LABELS[req.path]}
          </span>
        ) : (
          <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            instrumento não declarado
          </span>
        )}
        {signals.map((signal) => (
          <span key={signal} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground/80">
            {signal}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProposalsSection({ candidates, hideTag }: { candidates: Candidate[]; hideTag?: boolean }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const any = candidates.some((c) => (c.governmentPlan?.proposals?.length ?? 0) > 0);

  if (!any) {
    return (
      <ContentEmpty
        what="Propostas em consolidação"
        why="As propostas-chave destas candidaturas ainda não foram analisadas proposta a proposta nesta apuração."
      />
    );
  }

  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const proposals = c.governmentPlan?.proposals ?? [];
        const withReality = proposals.filter((p) => p.reality).length;
        const visible = proposals.slice(0, 3);
        const remaining = proposals.slice(3);

        return (
          <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="tabular font-semibold text-foreground">{proposals.length}</span>
              <span>propostas analisadas</span>
              <span aria-hidden>·</span>
              <span className="tabular font-semibold text-foreground">{withReality}</span>
              <span>com teste de realidade</span>
            </div>

            <div className="flex flex-col">
              {visible.map((p) => (
                <ProposalLine
                  key={p.id}
                  proposal={p}
                  candidate={c}
                  onOpen={() => setOpenKey(`${c.slug}-${p.id}`)}
                />
              ))}
            </div>

            {remaining.length > 0 ? (
              <details className="group rounded-md border border-border/70 bg-background/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium [&::-webkit-details-marker]:hidden">
                  <span>Ver mais {remaining.length} propostas</span>
                  <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="border-t border-border/70 px-3 pt-3">
                  {remaining.map((p) => (
                    <ProposalLine
                      key={p.id}
                      proposal={p}
                      candidate={c}
                      onOpen={() => setOpenKey(`${c.slug}-${p.id}`)}
                    />
                  ))}
                </div>
              </details>
            ) : null}

            {proposals.map((p) => {
              const key = `${c.slug}-${p.id}`;
              return (
                <Sheet key={key} open={openKey === key} onOpenChange={(v) => setOpenKey(v ? key : null)}>
                  <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader className="border-b border-border pb-4">
                      <SheetTitle className="display-2 !text-xl leading-tight">{p.title}</SheetTitle>
                      <SheetDescription className="text-left text-sm text-muted-foreground">
                        {c.name} — {p.theme}
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 p-6 pt-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="label-field">Proposta</h3>
                        <p className="text-sm leading-relaxed text-foreground/90">{p.description}</p>
                      </div>
                      {p.reality ? (
                        <RealityBlock reality={p.reality} />
                      ) : (
                        <RealityMissing why="O confronto desta proposta com histórico, instrumento legal e base institucional ainda está em apuração." />
                      )}
                      <SourcesInline sources={p.sources} />
                    </div>
                  </SheetContent>
                </Sheet>
              );
            })}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
