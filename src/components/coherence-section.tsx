"use client";

// Eixo transversal da V3 — coerência e trajetória.
// Mostra a relação entre posição, proposta e histórico, sem concluir nada pelo
// usuário: nunca "portanto vai cumprir" nem "portanto é incoerente".

import type { Candidate } from "@/types";
import { ClaimKindBadge } from "@/components/claim-kind-badge";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export function CoherenceSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  /** perfil individual: não repetir a etiqueta de slot A/B/C */
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const items = c.coherence ?? [];
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {items.length === 0 ? (
              <ContentEmpty
                what="Trajetória em consolidação"
                why="Esta área mostra como a posição de cada candidato evoluiu por tema (ex.: 2018 → 2022 → 2026) e o que já foi votado ou decidido em situações semelhantes. Sem conclusão automática sobre coerência."
              />
            ) : (
              items.map((item) => (
                <article key={item.id} className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <h3 className="text-sm font-semibold leading-snug">{item.theme}</h3>

                  {item.timeline.length > 0 ? (
                    <ol className="flex flex-col gap-1.5">
                      {item.timeline.map((t) => (
                        <li key={`${item.id}-${t.year}`} className="flex gap-2 text-xs">
                          <span className="tabular w-10 shrink-0 font-medium text-muted-foreground">
                            {t.year}
                          </span>
                          <span className="leading-relaxed text-foreground/90">{t.position}</span>
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  {item.statedPosition ? (
                    <div className="flex flex-col gap-1">
                      <ClaimKindBadge kind="posicao" />
                      <p className="text-xs leading-relaxed text-foreground/90">{item.statedPosition}</p>
                    </div>
                  ) : null}
                  {item.proposedAction ? (
                    <div className="flex flex-col gap-1">
                      <ClaimKindBadge kind="proposta" />
                      <p className="text-xs leading-relaxed text-foreground/90">{item.proposedAction}</p>
                    </div>
                  ) : null}
                  {item.historicalAction ? (
                    <div className="flex flex-col gap-1">
                      <ClaimKindBadge kind="historico" />
                      <p className="text-xs leading-relaxed text-foreground/90">{item.historicalAction}</p>
                    </div>
                  ) : null}

                  {item.publicExplanation ? (
                    <div className="flex flex-col gap-1">
                      <h4 className={FIELD}>Explicação pública da mudança</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {item.publicExplanation}
                      </p>
                    </div>
                  ) : null}

                  {item.tensionNote ? (
                    <div className="flex flex-col gap-1">
                      <h4 className={FIELD}>Conexão documentada</h4>
                      <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">
                        {item.tensionNote}
                      </p>
                    </div>
                  ) : null}

                  <SourcesInline
                    sources={item.timeline.flatMap((t) => t.sources ?? []).filter(
                      (s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx,
                    )}
                  />
                </article>
              ))
            )}
          </div>
        );
      })}
    </CandidateColumns>
  );
}
