"use client";

// Seção 07 — posições por grandes temas (10 fixos, os mesmos para todos).
// Cada célula: de quem é a posição (candidato ou partido, rotulado), a posição
// em uma linha e, no detalhe, o teste de realidade com as fontes.

import { useState } from "react";
import type { Candidate } from "@/types";
import { THEMES, THEME_SOURCE_LABELS } from "@/types";
import { ClaimKindBadge } from "@/components/claim-kind-badge";
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

export function ThemeSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      {THEMES.map((theme) => {
        const any = candidates.some((c) => c.themes?.some((t) => t.slug === theme.slug));
        return (
          <div key={theme.slug} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-semibold leading-snug">{theme.name}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{theme.question}</p>
            </div>

            {any ? (
              <CandidateColumns count={candidates.length}>
                {candidates.map((c, i) => {
                  const t = c.themes?.find((x) => x.slug === theme.slug);
                  const key = `${c.slug}-${theme.slug}`;
                  return (
                    <div
                      key={c.slug}
                      className="flex h-full flex-col gap-2 rounded-md border border-border bg-card p-4"
                    >
                      {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
                      {t ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {THEME_SOURCE_LABELS[t.sourceKind]}
                            </span>
                            <ClaimKindBadge kind={t.kind} />
                          </div>
                          <ExpandableText text={t.position} limit={150} label="Ver posição e fontes" />
                          <div className="mt-auto pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenKey(key)}
                              aria-label={`Ver teste de realidade de ${theme.name} — ${c.name}`}
                            >
                              {t.reality ? "Ver teste de realidade" : "Em consolidação"}
                            </Button>
                          </div>
                          <Sheet open={openKey === key} onOpenChange={(v) => setOpenKey(v ? key : null)}>
                            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                              <SheetHeader className="border-b border-border pb-4">
                                <SheetTitle className="display-2 !text-xl leading-tight">
                                  {theme.name}
                                </SheetTitle>
                                <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
                                  {c.name} — {THEME_SOURCE_LABELS[t.sourceKind]}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="flex flex-col gap-4 p-6 pt-4">
                                <div className="flex flex-col gap-1">
                                  <h3 className="label-field">Posição</h3>
                                  <p className="text-sm leading-relaxed text-foreground/90">
                                    {t.position}
                                  </p>
                                </div>
                                {t.reality ? (
                                  <RealityBlock reality={t.reality} />
                                ) : (
                                  <RealityMissing why="O confronto com histórico, instrumento legal e base institucional deste tema ainda está em apuração." />
                                )}
                                <div className="flex flex-col gap-2">
                                  <h3 className="label-field">Fontes</h3>
                                  <SourcesInline sources={t.sources} />
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </>
                      ) : (
                        <ContentEmpty
                          what="Posição não localizada"
                          why="Nada localizado no plano, em declarações ou no programa partidário para este tema nesta apuração."
                        />
                      )}
                    </div>
                  );
                })}
              </CandidateColumns>
            ) : (
              <ContentEmpty
                what="Tema em consolidação"
                why="Nenhuma das candidaturas comparadas tem posição apurada neste tema por enquanto."
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
