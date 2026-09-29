"use client";

// Seção de dimensão (accordion): pergunta da dimensão + linhas comparativas
// dos indicadores que pertencem a ela.

import type { MetricRow } from "@/lib/data";
import type { DimensionSlug } from "@/types";
import { DIMENSIONS } from "@/types";
import { ComparisonRow } from "@/components/comparison-row";
import { cn } from "@/lib/utils";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function ComparisonSection({
  slug,
  rows,
  candidates,
  highlightDifferences,
  onlyDifferences,
}: {
  slug: DimensionSlug;
  rows: MetricRow[];
  candidates: { name: string; slug: string }[];
  highlightDifferences: boolean;
  onlyDifferences: boolean;
}) {
  const dim = DIMENSIONS.find((d) => d.slug === slug);
  if (!dim || rows.length === 0) return null;

  const visibleRows = onlyDifferences
    ? rows.filter(
        (r) =>
          !r.equal ||
          r.values.some(
            (v) =>
              v && v.availability !== "available" && v.availability !== "zero",
          ),
      )
    : rows;

  if (visibleRows.length === 0) return null;

  return (
    <AccordionItem value={slug} className="border-b border-border">
      <AccordionTrigger
        className={cn(
          "group gap-4 rounded-none border-y border-border py-5 hover:no-underline",
          "items-start",
        )}
      >
        <div className="flex flex-1 flex-col gap-0.5 pr-2">
          <h3 className="text-left text-base font-semibold leading-snug">
            {dim.name}
          </h3>
          <span className="text-left text-xs leading-snug text-muted-foreground">
            {dim.question}
          </span>
        </div>
        <span className="tabular mt-1 shrink-0 text-xs text-muted-foreground">
          {visibleRows.length}{" "}
          {visibleRows.length === 1 ? "indicador" : "indicadores"}
        </span>
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        <div className="divide-y divide-border/70">
          {visibleRows.map((r) => (
            <ComparisonRow
              key={r.metricId}
              label={r.name}
              methodology={r.methodology}
              values={r.values}
              candidates={candidates}
              deltaDisplay={r.delta?.display}
              equal={r.equal}
              highlightDifferences={highlightDifferences}
              onlyDifferences={onlyDifferences}
            />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
