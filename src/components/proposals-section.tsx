"use client";

// Seção 03 — propostas-chave com o teste de realidade.
// Mesma gramática da seção de temas: linha comprimida (~150 caracteres) na
// superfície e, a um clique, o confronto com histórico, instrumento legal,
// sustentação e o que falta explicar. Nunca veredito: quem conclui é o leitor.

import { useState } from "react";
import type { Candidate } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { ExpandableText } from "@/components/expandable-text";
import { RealityBlock, RealityMissing } from "@/components/reality-check";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function ProposalsSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
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
        const comTeste = proposals.filter((p) => p.reality).length;
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {comTeste} de {proposals.length}{" "}
              {proposals.length === 1 ? "proposta analisada" : "propostas analisadas"} com
              teste de realidade
            </p>

            <ul className="flex flex-col divide-y divide-border/70">
              {proposals.map((p) => {
                const key = `${c.slug}-${p.id}`;
                return (
                  <li key={p.id} className="flex flex-col gap-1.5 py-3 first:pt-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {p.theme}
                    </span>
                    <span className="text-sm font-semibold leading-snug">{p.title}</span>
                    <ExpandableText
                      text={p.reality?.proposal || p.description}
                      limit={150}
                      label="Ver proposta e fontes"
                    />
                    <div className="mt-auto pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenKey(key)}
                        aria-label={`Ver teste de realidade de ${p.title} — ${c.name}`}
                      >
                        {p.reality ? "Ver teste de realidade" : "Em consolidação"}
                      </Button>
                    </div>
                    <Sheet
                      open={openKey === key}
                      onOpenChange={(v) => setOpenKey(v ? key : null)}
                    >
                      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                        <SheetHeader className="border-b border-border pb-4">
                          <SheetTitle className="display-2 !text-xl leading-tight">
                            {p.title}
                          </SheetTitle>
                          <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
                            {c.name} — {p.theme}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col gap-4 p-6 pt-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="label-field">Proposta</h3>
                            <p className="text-sm leading-relaxed text-foreground/90">
                              {p.description}
                            </p>
                          </div>
                          {p.reality ? (
                            <RealityBlock reality={p.reality} />
                          ) : (
                            <RealityMissing why="O confronto desta proposta com histórico, instrumento legal e base institucional ainda está em apuração." />
                          )}
                          <div className="flex flex-col gap-2">
                            <h3 className="label-field">Fontes</h3>
                            <SourcesInline sources={p.sources} />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </CandidateColumns>
  );
}
