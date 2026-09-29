"use client";

// Integridade e responsabilidade institucional — seção de escrutínio, separada
// das capacidades. A categoria jurídica de cada caso é sempre explícita.

import type { Candidate } from "@/types";
import { LegalStatusBadge, EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { formatDate } from "@/lib/format";

export function IntegritySection({
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
        const records = c.institutionalHistory ?? [];
        return (
          <div
            key={c.slug}
            className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {records.length === 0 ? (
              <ContentEmpty
                what="Sem registros institucionais localizados"
                why="Transparência, prestação de contas, auditorias e processos são pesquisados em fontes primárias (tribunais, órgãos de controle, diários oficiais). Nada é inferido a partir de menção na imprensa."
              />
            ) : (
              records.map((r) => (
                <article key={r.id} className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <LegalStatusBadge status={r.legalStatus} />
                    <EvidenceBadge status={r.evidenceStatus} />
                    <ConfidenceBadge level={r.confidenceLevel} />
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">{r.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{r.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.instance}
                    {r.lastUpdate ? ` · atualizado em ${formatDate(r.lastUpdate)}` : ""}
                  </p>
                  <SourcesInline sources={r.sources} />
                </article>
              ))
            )}
          </div>
        );
      })}
    </CandidateColumns>
  );
}
