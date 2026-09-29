"use client";

// Projeto de país em camada curta: destino declarado, prioridades e modelo de
// desenvolvimento. Teste de realidade, metodologia e fontes ficam sob demanda.

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

export function CountryProjectSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const p = c.countryProject;
        return (
          <article key={c.slug} className="flex h-full flex-col gap-4 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {p ? (
              <>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Onde quer chegar</h3>
                  <ExpandableText text={p.vision} limit={110} />
                </div>

                {p.nationalPriorities.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <h3 className={FIELD}>Prioridades declaradas</h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {p.nationalPriorities.slice(0, 7).map((t) => (
                        <li key={t} className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-foreground/80">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {p.developmentModel ? (
                  <div className="flex flex-col gap-1">
                    <h3 className={FIELD}>Modelo de desenvolvimento</h3>
                    <ExpandableText text={p.developmentModel} limit={110} />
                  </div>
                ) : null}

                {p.reality ? <RealityBlock reality={p.reality} title="Projeto × realidade" /> : <RealityMissing />}

                <details className="mt-auto rounded-md border border-border/70 bg-background/40">
                  <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
                    Ver metodologia e fontes
                  </summary>
                  <div className="flex flex-col gap-2 border-t border-border/70 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <EvidenceBadge status={p.evidenceStatus} />
                      <ConfidenceBadge level={p.confidenceLevel} />
                    </div>
                    {p.methodology ? <p className="text-xs leading-relaxed text-muted-foreground">{p.methodology}</p> : null}
                    <SourcesInline sources={p.sources} />
                  </div>
                </details>
              </>
            ) : (
              <ContentEmpty
                what="Projeto de país em consolidação"
                why="A síntese entra quando as fontes primárias estiverem consolidadas. Nada é preenchido por inferência."
              />
            )}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
