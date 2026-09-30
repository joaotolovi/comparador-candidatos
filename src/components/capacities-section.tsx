"use client";

// Seção 05 — experiência demonstrada. Primeiro aparece um mapa compacto de
// evidências por capacidade; o texto e os casos só abrem sob demanda. A barra
// representa volume documental (máx. visual de 6 casos), nunca nota de mérito.

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
          <SheetTitle className="display-2 !text-xl leading-tight">{capacity.name}</SheetTitle>
          <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            {candidate.name} — {capacity.question} Cada evidência registra papel exercido,
            complexidade, resultado observado e fonte original.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-6 pt-4">
          <div className="flex flex-col gap-1">
            <h3 className="label-field">Síntese</h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {capacity.synthesis || "Síntese em consolidação."}
            </p>
          </div>

          {capacity.coverageNote ? (
            <p className="rounded-md border border-dashed border-border p-3 text-xs leading-relaxed text-muted-foreground">
              {capacity.coverageNote}
            </p>
          ) : null}

          {capacity.reality ? <RealityBlock reality={capacity.reality} /> : <RealityMissing />}

          <h3 className="label-field">Casos documentados ({capacity.evidences.length})</h3>

          {capacity.evidences.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma evidência consolidada nesta coleta para esta capacidade. A lacuna fica
              explícita em vez de ser preenchida por proxy de cargo.
            </p>
          ) : (
            capacity.evidences.map((ev) => (
              <article key={ev.id} className="flex flex-col gap-3 rounded-md border border-border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ClaimKindBadge kind={ev.kind} />
                  <EvidenceBadge status={ev.evidenceStatus} />
                  <ConfidenceBadge level={ev.confidenceLevel} />
                  {ev.period ? <span className="tabular text-xs text-muted-foreground">{ev.period}</span> : null}
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

                {ev.context ? <p className="text-xs leading-relaxed text-muted-foreground">{ev.context}</p> : null}
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
  const support = capacity?.reality?.support;

  return (
    <div className="flex h-full flex-col gap-2 rounded-md border border-border bg-card p-4">
      {hideTag ? null : <CandidateTag name={candidate.name} slot={slot} />}

      {capacity ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <CoverageBadge coverage={capacity.coverage} note={capacity.coverageNote} />
            <span className="tabular text-xs text-muted-foreground">
              {count} {count === 1 ? "caso documentado" : "casos documentados"}
            </span>
          </div>

          <ExpandableText text={capacity.synthesis || "Síntese em consolidação."} limit={120} label="Ver síntese completa" />

          {support ? (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {[support.partySeats, support.coalitionSeats, support.federations].filter(Boolean).join(" · ")}
              {support.documentedAgreements ? ` · ${support.documentedAgreements} acordos documentados` : ""}
            </p>
          ) : null}

          <div className="mt-auto pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              disabled={count === 0 && !capacity.reality}
              aria-label={`Ver casos e teste de realidade de ${name} — ${candidate.name}`}
            >
              {count > 0 ? `Ver evidências (${count})` : capacity.reality ? "Ver teste de realidade" : "Sem evidências"}
            </Button>
          </div>

          <EvidenceSheet open={open} onOpenChange={setOpen} candidate={candidate} capacity={capacity} />
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

function EvidenceCell({
  candidate,
  capacity,
  slot,
}: {
  candidate: Candidate;
  capacity: Capacity | undefined;
  slot: "a" | "b" | "c";
}) {
  const count = capacity?.evidences.length ?? 0;
  const width = Math.min((count / 6) * 100, 100);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <CandidateTag name={candidate.name} slot={slot} />
      <div className="flex items-baseline justify-between gap-2">
        <span className="tabular text-base font-semibold leading-none text-foreground">{count}</span>
        <span className="text-[10px] text-muted-foreground">casos</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${count} casos documentados`}>
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${width}%` }} />
      </div>
      {capacity ? <CoverageBadge coverage={capacity.coverage} note={capacity.coverageNote} /> : null}
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
    <div className="flex flex-col gap-3">
      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
        A barra mostra somente o volume de casos documentados nesta coleta. Ela não transforma quantidade de casos em nota de capacidade.
        Abra uma linha para ver síntese, teste de realidade, papel exercido, complexidade, resultado e fontes.
      </p>

      {CAPACITY_CATALOG.map((cat) => {
        const capacities = candidates.map((c) => c.capacities?.find((x) => x.slug === cat.slug));
        const anyData = capacities.some((x) => Boolean(x && (x.evidences.length > 0 || x.reality)));

        return (
          <details key={cat.slug} className="group rounded-md border border-border bg-card">
            <summary className="cursor-pointer list-none py-4 [&::-webkit-details-marker]:hidden">
              <div
                className="grid gap-4 sm:cmp-grid"
                style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <h3 className="text-sm font-semibold leading-snug">{cat.name}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{cat.question}</p>
                  </div>
                  <ChevronDown aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </div>

                {candidates.map((c, i) => (
                  <EvidenceCell key={c.slug} candidate={c} capacity={capacities[i]} slot={SLOTS[i] ?? "a"} />
                ))}
                <div className="hidden sm:block" aria-hidden />
              </div>
            </summary>

            <div className="border-t border-border/70 p-4">
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
          </details>
        );
      })}
    </div>
  );
}
