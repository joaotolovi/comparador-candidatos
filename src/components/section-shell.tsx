"use client";

// Casca das seções da V3 + utilidades compartilhadas: cabeçalho de seção,
// etiqueta de candidato (com o mesmo indicador A/B/C de todos) e lista de
// fontes. Nenhuma seção usa nota, score ou ranking.

import type { ReactNode } from "react";
import type { Source } from "@/types";
import { SLOT } from "@/components/slot";
import { SourceItem } from "@/components/evidence-drawer";
import { cn } from "@/lib/utils";

/** Ordem canônica dos slots A/B/C — o MESMO indicador visual em toda a tela. */
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
      className={cn("flex flex-col gap-4", secondary && "border-t border-border pt-8")}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {index}
        </span>
        <h2 id={`${id}-h`} className="display-2">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {question}
        </p>
        {note ? (
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">{note}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Etiqueta de candidato com o indicador de posição (A/B/C) usado em toda a tela. */
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

/** Ausência explícita: nunca "Não encontrado" solto, sempre com o porquê. */
export function ContentEmpty({ what, why }: { what: string; why: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card/40 p-4">
      <p className="text-sm font-medium text-foreground">{what}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{why}</p>
    </div>
  );
}

/** Camada 3 — fontes, sempre clicáveis. */
export function SourcesInline({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {sources.map((s, i) => (
        <SourceItem key={s.id ?? `src-${i}`} source={s} />
      ))}
    </div>
  );
}

/** Grade de colunas por candidato (mesma ordem do cabeçalho fixo). */
export function CandidateColumns({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  return (
    <div
      className="grid gap-3 sm:content-cols"
      style={{ "--cmp-cols": Math.max(count, 1) } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
