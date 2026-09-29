"use client";

// Bloco 3 da V3 — capacidades demonstradas.
// Cada capacidade: pergunta (camada 1), síntese, cobertura e "ver evidências"
// (camada 2), com a fonte na camada 3. Nunca nota, nunca ranking.

import { useState } from "react";
import type { Candidate, Capacity } from "@/types";
import { CAPACITY_CATALOG } from "@/types";
import { ClaimKindBadge, CoverageBadge } from "@/components/claim-kind-badge";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function EvidenceSheet({
  open,
  onOpenChange,
  candidate,
  capacity,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  candidate: Candidate;
  capacity: Capacity;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="display-2 !text-xl leading-tight">
            {capacity.name}
          </SheetTitle>
          <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            {candidate.name} — {capacity.question} Cada evidência traz o papel
            efetivamente exercido, a complexidade e o resultado observado, com a
            fonte original.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-6 pt-4">
          {capacity.coverageNote ? (
            <p className="rounded-md border border-dashed border-border p-3 text-xs leading-relaxed text-muted-foreground">
              {capacity.coverageNote}
            </p>
          ) : null}

          {capacity.evidences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma evidência consolidada nesta coleta para esta capacidade. A
              lacuna fica explícita em vez de ser preenchida por proxy de cargo.
            </p>
          ) : (
            capacity.evidences.map((ev) => (
              <article
                key={ev.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ClaimKindBadge kind={ev.kind} />
                  <EvidenceBadge status={ev.evidenceStatus} />
                  <ConfidenceBadge level={ev.confidenceLevel} />
                  {ev.period ? (
                    <span className="tabular text-xs text-muted-foreground">{ev.period}</span>
                  ) : null}
                </div>

                <h4 className="text-sm font-semibold leading-snug">{ev.title}</h4>

                <dl className="grid gap-2 text-xs sm:grid-cols-2">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-medium text-foreground">Papel exercido</dt>
                    <dd className="leading-relaxed text-muted-foreground">{ev.role}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-medium text-foreground">Complexidade</dt>
                    <dd className="leading-relaxed text-muted-foreground">{ev.complexity}</dd>
                  </div>
                  {ev.outcome ? (
                    <div className="flex flex-col gap-0.5 sm:col-span-2">
                      <dt className="font-medium text-foreground">Resultado observado</dt>
                      <dd className="leading-relaxed text-muted-foreground">{ev.outcome}</dd>
                    </div>
                  ) : null}
                </dl>

                {ev.context ? (
                  <p className="text-xs leading-relaxed text-muted-foreground">{ev.context}</p>
                ) : null}

                <SourcesInline sources={ev.sources} />
              </article>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CapacityCard({
  candidate,
  slug,
  name,
  question,
  excludes,
  slot,
  hideTag,
}: {
  candidate: Candidate;
  slug: string;
  name: string;
  question: string;
  excludes: string;
  slot: "a" | "b" | "c";
  hideTag?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const capacity = candidate.capacities?.find((c) => c.slug === slug);
  const count = capacity?.evidences.length ?? 0;

  return (
    <div className="flex h-full flex-col gap-2 rounded-md border border-border bg-card p-4">
      {hideTag ? null : <CandidateTag name={candidate.name} slot={slot} />}

      {capacity ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <CoverageBadge coverage={capacity.coverage} note={capacity.coverageNote} />
            <span className="tabular text-xs text-muted-foreground">
              {count} {count === 1 ? "evidência" : "evidências"}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">
            {capacity.synthesis || "Síntese em consolidação."}
          </p>

          {capacity.coverageNote ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {capacity.coverageNote}
            </p>
          ) : null}

          <div className="mt-auto pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              disabled={count === 0}
              aria-label={`Ver evidências de ${name} — ${candidate.name}`}
            >
              {count > 0 ? `Ver evidências (${count})` : "Sem evidências"}
            </Button>
          </div>

          <EvidenceSheet
            open={open}
            onOpenChange={setOpen}
            candidate={candidate}
            capacity={capacity}
          />
        </>
      ) : (
        <ContentEmpty
          what="Sem evidências consolidadas"
          why={`Nada localizado nesta coleta. O que conta como evidência aqui: ${question} Não conta: ${excludes.toLowerCase()}`}
        />
      )}
    </div>
  );
}

export function CapacitiesSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  /** perfil individual: não repetir a etiqueta de slot A/B/C */
  hideTag?: boolean;
}) {
  return (
    <div className="flex flex-col gap-8">
      {CAPACITY_CATALOG.map((cat) => {
        // Enquanto nenhum candidato tem evidências desta capacidade, mostra uma
        // linha honesta em vez de N cartões vazios.
        const anyData = candidates.some((c) =>
          c.capacities?.some((x) => x.slug === cat.slug && x.evidences.length > 0),
        );
        return (
          <div key={cat.slug} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-base font-semibold leading-snug">{cat.name}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{cat.question}</p>
              <p className="text-xs leading-relaxed text-muted-foreground/80">
                Não conta como evidência: {cat.excludes}
              </p>
            </div>
            {anyData ? (
              <CandidateColumns count={candidates.length}>
                {candidates.map((c, i) => (
                  <CapacityCard
                    key={c.slug}
                    candidate={c}
                    slug={cat.slug}
                    name={cat.name}
                    question={cat.question}
                    excludes={cat.excludes}
                    slot={SLOTS[i] ?? "a"}
                    hideTag={hideTag}
                    />
                    ))}
              </CandidateColumns>
            ) : (
              <ContentEmpty
                what="Evidências em consolidação para as candidaturas comparadas"
                why={`A pesquisa de fontes primárias está em andamento. O que conta aqui: ${cat.question} Não conta: ${cat.excludes.toLowerCase()}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
