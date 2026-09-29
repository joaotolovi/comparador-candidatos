"use client";

// Seção 06 — Brasil no mundo: visão, estratégia, atuação e projeção, sempre
// separadas. O externo que existe como ato não recebe o peso de quem conduziu
// negociação em nome do Estado.

import type { Candidate } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import { ExpandableText } from "@/components/expandable-text";
import { RealityBlock, RealityMissing } from "@/components/reality-check";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

export function ForeignPolicySection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const f = c.foreignPolicy;
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {f ? (
              <>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>O que propõe — visão de mundo</h3>
                  <ExpandableText text={f.worldView} limit={150} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Estratégia</h3>
                  <ExpandableText text={f.strategy} limit={150} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Atuação internacional — o que já fez</h3>
                  <ExpandableText text={f.internationalExperience} limit={150} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Projeção internacional</h3>
                  <ExpandableText text={f.projection} limit={150} />
                  <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">
                    {f.projectionNote}
                  </p>
                </div>

                {f.reality ? (
                  <RealityBlock reality={f.reality} title="Discurso × ações" />
                ) : (
                  <RealityMissing />
                )}

                <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EvidenceBadge status={f.evidenceStatus} />
                    <ConfidenceBadge level={f.confidenceLevel} />
                  </div>
                  {f.methodology ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">{f.methodology}</p>
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
