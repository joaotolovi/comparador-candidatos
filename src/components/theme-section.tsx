"use client";

// Posições por temas: mostra apenas temas com conteúdo, cinco de início. A frase
// curta já armazenada no dado é exibida inteira; análise e fontes abrem sob demanda.

import { useState } from "react";
import type { Candidate } from "@/types";
import { THEMES, THEME_SOURCE_LABELS } from "@/types";
import { ClaimKindBadge } from "@/components/claim-kind-badge";
import {
  CandidateTag,
  CandidateColumns,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
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

export function ThemeSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const availableThemes = THEMES.filter((theme) =>
    candidates.some((c) => c.themes?.some((t) => t.slug === theme.slug)),
  );
  const visibleThemes = showAll ? availableThemes : availableThemes.slice(0, 5);

  if (availableThemes.length === 0) {
    return <p className="text-sm text-muted-foreground">Posições temáticas em consolidação.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {visibleThemes.map((theme) => {
        const positions = candidates.map((c) => c.themes?.find((t) => t.slug === theme.slug));

        return (
          <details key={theme.slug} className="group rounded-md border border-border bg-card">
            <summary className="cursor-pointer list-none p-3.5 [&::-webkit-details-marker]:hidden">
              <div
                className="grid gap-3 sm:cmp-grid"
                style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="text-sm font-semibold leading-snug">{theme.name}</h3>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{theme.question}</p>
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
                          <p className="text-xs leading-relaxed text-foreground/85">{t.position}</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}
                <div className="hidden sm:block" aria-hidden />
              </div>
            </summary>

            <div className="border-t border-border/70 p-3.5">
              <CandidateColumns count={candidates.length}>
                {candidates.map((c, i) => {
                  const t = positions[i];
                  const key = `${c.slug}-${theme.slug}`;
                  return (
                    <article key={c.slug} className="flex h-full flex-col gap-2 rounded-md border border-border bg-background/40 p-3">
                      {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
                      {t ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {THEME_SOURCE_LABELS[t.sourceKind]}
                            </span>
                            <ClaimKindBadge kind={t.kind} />
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">{t.position}</p>
                          <div className="mt-auto pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOpenKey(key)}
                              aria-label={`Abrir análise de ${theme.name} — ${c.name}`}
                            >
                              {t.reality ? "Abrir análise e fontes" : "Em consolidação"}
                            </Button>
                          </div>

                          <Sheet open={openKey === key} onOpenChange={(v) => setOpenKey(v ? key : null)}>
                            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                              <SheetHeader className="border-b border-border pb-4">
                                <SheetTitle className="display-2 !text-xl leading-tight">{theme.name}</SheetTitle>
                                <SheetDescription className="text-left text-sm text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground">Sem posição localizada nesta apuração.</p>
                      )}
                    </article>
                  );
                })}
              </CandidateColumns>
            </div>
          </details>
        );
      })}

      {availableThemes.length > 5 ? (
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "Mostrar menos temas" : `Ver mais ${availableThemes.length - 5} temas`}
        </Button>
      ) : null}
    </div>
  );
}
