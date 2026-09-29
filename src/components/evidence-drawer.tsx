"use client";

// Drawer de evidências: cada afirmação abre a metodologia, o valor, o
// status documental e TODAS as fontes com link original e datas.
// Acessível: Sheet (Radix) com foco preso, título ligado, ESC fecha.

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Metric, Source } from "@/types";
import { EvidenceBadge, ConfidenceBadge, AvailabilityBadge } from "@/components/badges";
import { SOURCE_TYPE_LABEL } from "@/lib/comparison";
import { formatDate } from "@/lib/format";
import { ExternalLink } from "lucide-react";

export function SourceItem({ source }: { source: Source }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-0.5 rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/30"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {source.title}
        <ExternalLink
          aria-hidden
          className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </span>
      <span className="text-xs text-muted-foreground">
        {source.publisher}
        {source.publishedAt ? ` · publicado ${formatDate(source.publishedAt)}` : ""}
        {` · acessado ${formatDate(source.accessedAt)}`}
      </span>
      <span className="text-xs font-medium text-foreground/70">
        {SOURCE_TYPE_LABEL[source.sourceType] ?? source.sourceType}
        {source.notes ? ` — ${source.notes}` : ""}
      </span>
    </a>
  );
}

export function EvidenceDrawer({
  open,
  onOpenChange,
  claim,
  metric,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  claim: string;
  metric: Metric | null;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="display-2 !text-xl leading-tight">
            Evidências
          </SheetTitle>
          <SheetDescription className="text-left text-sm leading-relaxed text-muted-foreground">
            {claim}
          </SheetDescription>
        </SheetHeader>

        {metric ? (
          <div className="flex flex-col gap-6 p-6 pt-4">
            {/* Valor */}
            <section className="flex flex-col gap-2">
              <h3 className="label-field">Valor registrado</h3>
              <p className="num-hero">
                {metric.displayValue}
              </p>
            </section>

            {/* Estado documental */}
            <section className="flex flex-col gap-2">
              <h3 className="label-field">Estado documental</h3>
              <div className="flex flex-wrap gap-2">
                <EvidenceBadge status={metric.evidenceStatus} />
                <ConfidenceBadge level={metric.confidenceLevel} />
                {metric.availability !== "available" && (
                  <AvailabilityBadge availability={metric.availability} />
                )}
              </div>
            </section>

            {/* Metodologia */}
            <section className="flex flex-col gap-2">
              <h3 className="label-field">Como esta métrica foi calculada</h3>
              <p className="text-sm leading-relaxed text-foreground/85">
                {metric.methodology}
              </p>
            </section>

            {/* Contexto, quando existir */}
            {metric.context ? (
              <section className="flex flex-col gap-2">
                <h3 className="label-field">Contexto</h3>
                <p className="text-sm leading-relaxed text-foreground/85">
                  {metric.context}
                </p>
              </section>
            ) : null}

            {/* Última atualização */}
            <section className="flex flex-col gap-1">
              <h3 className="label-field">Última atualização</h3>
              <p className="text-sm">{formatDate(metric.updatedAt)}</p>
            </section>

            {/* Fontes */}
            <section className="flex flex-col gap-3">
              <h3 className="label-field">
                Fontes ({metric.sources.length})
              </h3>
              {metric.sources.length === 0 ? (
                <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                  Nenhuma fonte registrada para este dado. Trate-o como
                  não verificado.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {metric.sources.map((s) => (
                    <SourceItem key={s.id} source={s} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              Não há evidências vinculadas a este campo.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
