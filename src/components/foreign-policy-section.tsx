"use client";

// Bloco 4 da V3 — como cada candidato enxerga o Brasil no mundo.
// Visibilidade internacional é separada de capacidade diplomática.

import type { Candidate } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export function ForeignPolicySection({ candidates }: { candidates: Candidate[] }) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const f = c.foreignPolicy;
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />
            {f ? (
              <>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Visão de mundo</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{f.worldView}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Estratégia de política externa</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{f.strategy}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Experiência e articulação internacional</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {f.internationalExperience}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Projeção internacional</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{f.projection}</p>
                  <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">
                    {f.projectionNote}
                  </p>
                </div>

                <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EvidenceBadge status={f.evidenceStatus} />
                    <ConfidenceBadge level={f.confidenceLevel} />
                  </div>
                  {f.methodology ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {f.methodology}
                    </p>
                  ) : null}
                  <SourcesInline sources={f.sources} />
                </div>
              </>
            ) : (
              <ContentEmpty
                what="Brasil no mundo em consolidação"
                why="Aqui entram posições documentadas sobre política externa, estratégia, experiência internacional e projeção. Reunião protocolar não tem o mesmo peso de uma negociação conduzida — e projeção não é confundida com capacidade diplomática."
              />
            )}
          </div>
        );
      })}
    </CandidateColumns>
  );
}
