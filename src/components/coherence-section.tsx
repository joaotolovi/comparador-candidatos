"use client";

// Histórico × proposta atual: a superfície mostra tema, posição atual e sinais de
// contexto. Cronologia, proposta, ação histórica, explicações e fontes ficam no
// detalhe. Apenas dois temas aparecem de início por candidatura.

import type { Candidate, CoherenceItem } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { ChevronDown } from "lucide-react";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function CurrentPosition({ item }: { item: CoherenceItem }) {
  const latest = item.timeline[item.timeline.length - 1]?.position;
  const text = item.statedPosition ?? latest;
  if (!text) return null;
  return <p className="text-xs leading-relaxed text-foreground/85">{text}</p>;
}

function Signal({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground/75">{children}</span>;
}

function CoherenceCard({ item }: { item: CoherenceItem }) {
  const years = item.timeline.map((t) => t.year).filter(Boolean);
  const range = years.length > 1 ? `${years[0]} → ${years[years.length - 1]}` : years[0];
  const sources = item.timeline
    .flatMap((t) => t.sources ?? [])
    .filter((s, idx, arr) => arr.findIndex((x) => x.id === s.id) === idx);

  return (
    <details className="group rounded-md border border-border/70 bg-background/40">
      <summary className="cursor-pointer list-none p-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold leading-snug">{item.theme}</h3>
              {range ? <span className="tabular text-[10px] text-muted-foreground">{range}</span> : null}
            </div>
            <div className="mt-1.5"><CurrentPosition item={item} /></div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.proposedAction ? <Signal>proposta atual</Signal> : null}
              {item.historicalAction ? <Signal>ação histórica</Signal> : null}
              {item.publicExplanation ? <Signal>mudança explicada</Signal> : null}
              {item.tensionNote ? <Signal>conexão documentada</Signal> : null}
            </div>
          </div>
          <ChevronDown aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="flex flex-col gap-4 border-t border-border/70 p-3">
        {item.timeline.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <h4 className={FIELD}>Evolução documentada</h4>
            <ol className="flex flex-col gap-1.5">
              {item.timeline.map((t) => (
                <li key={`${item.id}-${t.year}`} className="grid grid-cols-[3rem_1fr] gap-2 text-xs">
                  <span className="tabular font-medium text-muted-foreground">{t.year}</span>
                  <span className="leading-relaxed text-foreground/90">{t.position}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {item.proposedAction ? (
          <div className="flex flex-col gap-1">
            <h4 className={FIELD}>Proposta atual</h4>
            <p className="text-xs leading-relaxed text-foreground/90">{item.proposedAction}</p>
          </div>
        ) : null}

        {item.historicalAction ? (
          <div className="flex flex-col gap-1">
            <h4 className={FIELD}>Ação histórica</h4>
            <p className="text-xs leading-relaxed text-foreground/90">{item.historicalAction}</p>
          </div>
        ) : null}

        {item.publicExplanation ? (
          <div className="flex flex-col gap-1">
            <h4 className={FIELD}>Explicação pública da mudança</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{item.publicExplanation}</p>
          </div>
        ) : null}

        {item.tensionNote ? (
          <div className="flex flex-col gap-1">
            <h4 className={FIELD}>Conexão documentada</h4>
            <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">{item.tensionNote}</p>
          </div>
        ) : null}

        <SourcesInline sources={sources} />
      </div>
    </details>
  );
}

export function CoherenceSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const items = c.coherence ?? [];
        const visible = items.slice(0, 2);
        const remaining = items.slice(2);

        return (
          <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {items.length === 0 ? (
              <ContentEmpty
                what="Trajetória em consolidação"
                why="Ainda não há relações consolidadas entre posição atual, proposta e histórico para esta candidatura."
              />
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {visible.map((item) => <CoherenceCard key={item.id} item={item} />)}
                </div>

                {remaining.length > 0 ? (
                  <details className="group rounded-md border border-border/70 bg-background/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-medium [&::-webkit-details-marker]:hidden">
                      <span>Ver mais {remaining.length} temas</span>
                      <ChevronDown aria-hidden className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="flex flex-col gap-2 border-t border-border/70 p-3">
                      {remaining.map((item) => <CoherenceCard key={item.id} item={item} />)}
                    </div>
                  </details>
                ) : null}
              </>
            )}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
