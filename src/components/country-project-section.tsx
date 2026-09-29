"use client";

// Bloco 1 da V3 — para onde cada candidato quer levar o país.
// Síntese neutra + prioridades DECLARADAS + modelo de desenvolvimento.

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

export function CountryProjectSection({ candidates }: { candidates: Candidate[] }) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const p = c.countryProject;
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />
            {p ? (
              <>
                <div className="flex flex-col gap-1">
                  <h3 className={FIELD}>Visão de país</h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{p.vision}</p>
                </div>

                {p.nationalPriorities.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <h3 className={FIELD}>Prioridades declaradas</h3>
                    <ul className="flex flex-wrap gap-1.5">
                      {p.nationalPriorities.map((t) => (
                        <li
                          key={t}
                          className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {p.developmentModel ? (
                  <div className="flex flex-col gap-1">
                    <h3 className={FIELD}>Modelo de desenvolvimento</h3>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {p.developmentModel}
                    </p>
                  </div>
                ) : null}

                <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EvidenceBadge status={p.evidenceStatus} />
                    <ConfidenceBadge level={p.confidenceLevel} />
                  </div>
                  {p.methodology ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {p.methodology}
                    </p>
                  ) : null}
                  <SourcesInline sources={p.sources} />
                </div>
              </>
            ) : (
              <ContentEmpty
                what="Projeto de país em consolidação"
                why="A síntese entra quando as fontes primárias estiverem consolidadas (plano registrado no TSE, programa partidário e declarações públicas). Nada é preenchido por inferência e nenhum campo fica como 'Não encontrado'."
              />
            )}
          </div>
        );
      })}
    </CandidateColumns>
  );
}
