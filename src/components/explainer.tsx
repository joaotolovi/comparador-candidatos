"use client";

/**
 * Explainable — todo número, índice, pill ou rótulo do resumo é um gatilho:
 * - hover: tooltip de uma linha (o que é / como medimos);
 * - clique: painel lateral com explicação, detalhe por candidato, fontes e link.
 *
 * O painel é o mesmo Sheet usado nas demais seções. Fontes só aparecem quando
 * existem de verdade — ausência nunca é preenchida.
 */

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SourcesInline } from "@/components/section-shell";
import { glossaryFor } from "@/lib/glossary";
import type { Source } from "@/types";

export interface ExplainerBlock {
  heading?: string;
  body?: string;
  items?: { label?: string; text: string; note?: string }[];
}

export interface ExplainerContent {
  title: string;
  subtitle?: string;
  blocks: ExplainerBlock[];
  sources?: Source[];
  sourcesNote?: string;
  link?: { href: string; label: string };
}

/** Painel lateral com explicação + fontes. Reuso direto fora do gatilho. */
export function ExplainerSheet({
  open,
  onOpenChange,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ExplainerContent;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="gap-1 border-b pb-3 pr-14">
          <SheetTitle className="text-base leading-snug">{content.title}</SheetTitle>
          {content.subtitle ? (
            <SheetDescription>{content.subtitle}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
          {content.blocks.map((block, i) => (
            <section key={i} className="flex flex-col gap-1.5">
              {block.heading ? <h4 className="label-field">{block.heading}</h4> : null}
              {block.body ? (
                <p className="text-sm leading-relaxed text-foreground/90">{block.body}</p>
              ) : null}
              {block.items?.length ? (
                <ul className="flex flex-col gap-1.5">
                  {block.items.map((item, j) => (
                    <li key={j} className="text-sm leading-snug text-foreground/90">
                      {item.label ? <span className="font-medium">{item.label}: </span> : null}
                      {item.text}
                      {item.note ? (
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                          {item.note}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          {content.sources?.length ? (
            <section className="flex flex-col gap-1.5">
              <h4 className="label-field">Fontes</h4>
              {content.sourcesNote ? (
                <p className="text-xs leading-snug text-muted-foreground">{content.sourcesNote}</p>
              ) : null}
              <SourcesInline sources={content.sources} />
            </section>
          ) : null}
          {content.link ? (
            <a
              href={content.link.href}
              className="text-sm font-medium underline decoration-dotted underline-offset-4 hover:decoration-solid"
            >
              {content.link.label} →
            </a>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Gatilho clicável com affordance discreta:
 * - hover/focus: fundo sutil + ponto "i" no canto + tooltip;
 * - clique: abre o painel lateral.
 * `content` pode ser função para montar a explicação sob demanda.
 */
export function Explainable({
  content,
  hint,
  className,
  children,
}: {
  content: ExplainerContent | (() => ExplainerContent);
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider delayDuration={160}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            className={cn(
              "group/xl relative cursor-help rounded-sm text-left transition-colors",
              "hover:bg-muted/45 focus-visible:bg-muted/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              className,
            )}
          >
            {children}
          </button>
        </TooltipTrigger>
        {hint ? (
          <TooltipContent
            side="top"
            align="center"
            className="max-w-[280px] text-xs leading-snug"
          >
            {hint}
          </TooltipContent>
        ) : null}
      </Tooltip>
      <ExplainerSheet
        open={open}
        onOpenChange={setOpen}
        content={typeof content === "function" ? content() : content}
      />
    </TooltipProvider>
  );
}

/**
 * Termo abstrato com tooltip curto + painel com definição longa.
 * Ex.: <GlossaryTerm term="Caminho institucional" /> ou com children próprio.
 */
export function GlossaryTerm({
  term,
  className,
  children,
}: {
  term: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const entry = glossaryFor(term);
  if (!entry) {
    return <span className={className}>{children ?? term}</span>;
  }
  return (
    <Explainable
      hint={entry.short}
      content={{
        title: term.charAt(0).toUpperCase() + term.slice(1),
        blocks: [{ body: entry.body ?? entry.short }],
      }}
      className={cn(
        "-my-0.5 rounded-sm border-b border-dashed border-border pb-0.5 decoration-border hover:border-foreground/40",
        className,
      )}
    >
      {children ?? term}
    </Explainable>
  );
}

/** Definição direta do glossário por chave literal. */
export function glossaryEntry(term: string) {
  return glossaryFor(term);
}
