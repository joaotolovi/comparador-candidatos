"use client";

// Casca das seções + utilidades compartilhadas. A regra de UX é progressive
// disclosure: síntese e métricas ficam visíveis; metodologia, fontes e detalhe
// ficam a um clique.

import type { ReactNode } from "react";
import type { Source } from "@/types";
import { SLOT } from "@/components/slot";
import { SourceItem } from "@/components/evidence-drawer";
import { Explainable } from "@/components/explainer";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const SLOTS = ["a", "b", "c"] as const;

export function SectionShell({
  id,
  index,
  title,
  question,
  note,
  secondary,
  children,
}: {
  id: string;
  index: string;
  title: string;
  question: string;
  note?: string;
  secondary?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-h`}
      className={cn(
        "scroll-mt-20 border-t border-border pt-8",
        secondary ? "flex flex-col gap-3" : "flex flex-col gap-4",
      )}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{index}</span>
        {/* Título da seção clicável: abre a pergunta que guia a seção + como foi construída */}
        <h2 id={`${id}-h`} className="display-2">
          <Explainable
            hint={question}
            content={{
              title: `Sobre a seção “${title}”`,
              blocks: [
                { heading: "A pergunta que esta seção responde", body: question },
                ...(note ? [{ heading: "Como esta seção foi construída", body: note }] : []),
              ],
              link: { href: "/metodologia", label: "Metodologia completa do produto" },
            }}
            className="display-2 hover:underline hover:decoration-dotted hover:underline-offset-8"
          >
            {title}
          </Explainable>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{question}</p>
        {note ? <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function CandidateTag({
  name,
  slot,
  className,
}: {
  name: string;
  slot: "a" | "b" | "c";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span
        aria-hidden
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-background",
          SLOT[slot].bg,
        )}
      >
        {slot}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{name}</span>
    </span>
  );
}

export function ContentEmpty({ what, why }: { what: string; why: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card/30 px-3 py-2.5">
      <p className="text-xs font-medium text-foreground">{what}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{why}</p>
    </div>
  );
}

export function SourcesInline({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <details className="group rounded-md border border-border/70 bg-background/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          Fontes
          <span className="tabular rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground/75">{sources.length}</span>
        </span>
        <ChevronDown aria-hidden className="size-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-col gap-2 border-t border-border/70 px-3 py-3">
        {sources.map((s, i) => <SourceItem key={s.id ?? `src-${i}`} source={s} />)}
      </div>
    </details>
  );
}

export function CandidateColumns({ count, children }: { count: number; children: ReactNode }) {
  return (
    <div
      className="grid gap-3 sm:mx-px sm:content-cols"
      style={{ "--cmp-cols": Math.max(count, 1) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
