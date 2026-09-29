"use client";

// Seção 07 — posições por grandes temas. A lista vira uma matriz compacta: uma
// linha por tema e uma síntese curta por candidatura. O teste de realidade e as
// fontes aparecem ao abrir a linha e, depois, o drawer de detalhe.

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
import { ChevronDown } from "lucide-react";

function clip(text: string, limit = 92) {
  const t = (text ?? "").trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : limit)}…`;
}

export function ThemeSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Leia uma frase por tema. Abra apenas o que quiser aprofundar para ver o teste de realidade, a posição completa e as fontes.
      </p>

      {THEMES.map((theme) => {
        const positions = candidates.map((c) => c.themes?.find((t) => t.slug === theme.slug));
        const any = positions.some(Boolean);

        if (!any) {
          return (
            <ContentEmpty
              key={theme.slug}
              what={`${theme.name}: tema em consolidação`}
              why="Nenhuma das candidaturas comparadas tem posição apurada neste tema por enquanto."
            />
          );
        }

        return (
          <details key={theme.slug} className="group rounded-md border border-border bg-card">
            <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
              <div
                className="grid gap-4 sm:cmp-grid"
                style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="text-sm font-semibold leading-snug">{theme.name}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{theme.question}</p>
                  </div>
                  <ChevronDown aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </div>

                {candidates.map((c, i) => {
                  const t = positions[i];
                  return (
                    <div key={c.slug} className="flex min-w-0 flex-col gap-1.5">
                      <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />
                      {t ? (
                        <>
                          <span className="w-fit rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {THEME_SOURCE_LABELS[t.sourceKind]}
                          </span>
                          <p className="text-xs leading-relaxed text-foreground/85">{clip(t.position)}</p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sem posição localizada nesta apuração.</p>
                      )}
                    </div>
                  );
                })}
                <div className="hidden sm:block" aria-hidden />
              </div>
            </summary>

            <div className="border-t border-border/70 p-4">
              <CandidateColumns count={candidates.length}>
                {candidates.map((c, i) => {
                  const t = positions[i];
                  const key = `${c.slug}-${theme.slug}`;
                  return (
                    <article key={c.slug} className="flex h-full flex-col gap-2 rounded-md border border-border bg-background/40 p-4">
                      {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
                      {t ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {THEME_SOURCE_LABELS[t.sourceKind]}
                            </span>
                            <ClaimKindBadge kind={t.kind} />
                          </div>
                          <ExpandableText text={t.position} limit={130} label="Ver posição completa" />
                          <div className="mt-auto pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenKey(key)}
                              aria-label={`Ver teste de realidade de ${theme.name} — ${c.name}`}
                            >
                              {t.reality ? "Abrir análise e fontes" : "Em consolidação"}
                            </Button>
                          </div>

                          <Sheet open={openKey === key} onOpenChange={(v) => setOpenKey(v ? key : null)}>
                            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                              <SheetHeader className="border-b border-border pb-4">
                                <SheetTitle className="display-2 !text-xl leading-tight">{theme.name}</SheetTitle>
                                <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
                                  {c.name} — {THEME_SOURCE_LABELS[t.sourceKind]}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="flex flex-col gap-4 p-6 pt-4">
                                <div className="flex flex-col gap-1">
                                  <h3 className="label-field">Posição</h3>
                                  <p className="text-sm leading-relaxed text-foreground/90">{t.position}</p>
                                </div>
                                {t.reality ? (
                                  <RealityBlock reality={t.reality} />
                                ) : (
                                  <RealityMissing why="O confronto com histórico, instrumento legal e base institucional deste tema ainda está em apuração." />
                                )}
                                <SourcesInline sources={t.sources} />
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
                    </article>
                  );
                })}
              </CandidateColumns>
            </div>
          </details>
        );
      })}
    </div>
  );
}
