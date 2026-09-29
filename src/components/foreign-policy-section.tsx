"use client";

// Brasil no mundo: quatro dimensões separadas e curtas. A primeira leitura é
// escaneável; discurso × ações, metodologia e fontes abrem sob demanda.

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

function FieldCard({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/40 p-3">
      <h3 className={FIELD}>{label}</h3>
      <div className="mt-1">
        <ExpandableText text={text} limit={105} />
      </div>
    </div>
  );
}

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
          <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {f ? (
              <>
                <div className="grid gap-2">
                  <FieldCard label="Visão de mundo" text={f.worldView} />
                  <FieldCard label="Estratégia externa" text={f.strategy} />
                  <FieldCard label="Atuação internacional" text={f.internationalExperience} />
                  <FieldCard label="Projeção internacional" text={f.projection} />
                </div>

                {f.reality ? <RealityBlock reality={f.reality} title="Discurso × ações" /> : <RealityMissing />}

                <details className="mt-auto rounded-md border border-border/70 bg-background/40">
                  <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
                    Ver contexto, metodologia e fontes
                  </summary>
                  <div className="flex flex-col gap-2 border-t border-border/70 p-3">
                    <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">
                      {f.projectionNote}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <EvidenceBadge status={f.evidenceStatus} />
                      <ConfidenceBadge level={f.confidenceLevel} />
                    </div>
                    {f.methodology ? <p className="text-xs leading-relaxed text-muted-foreground">{f.methodology}</p> : null}
                    <SourcesInline sources={f.sources} />
                  </div>
                </details>
              </>
            ) : (
              <ContentEmpty
                what="Brasil no mundo em consolidação"
                why="Aqui entram posições documentadas sobre política externa, estratégia, experiência internacional e projeção."
              />
            )}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
