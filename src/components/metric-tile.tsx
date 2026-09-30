"use client";

// Tile de métrica do perfil: valor + metodologia na superfície; clique abre o
// painel com metodologia completa e as fontes da métrica.

import type { Metric } from "@/types";
import { Explainable, type ExplainerContent } from "@/components/explainer";
import { cn } from "@/lib/utils";

export function MetricTile({
  metric,
  showMethodology = false,
  className,
}: {
  metric: Metric;
  showMethodology?: boolean;
  className?: string;
}) {
  const content: ExplainerContent = {
    title: metric.name,
    blocks: [
      { heading: "Valor apurado", body: metric.displayValue },
      ...(metric.methodology
        ? [{ heading: "Como medimos", body: metric.methodology }]
        : []),
    ],
    sources: metric.sources,
    link: { href: "/metodologia", label: "Metodologia completa" },
  };
  return (
    <Explainable
      hint={metric.methodology}
      content={content}
      className={cn(
        "-my-0.5 flex flex-col items-start gap-1 rounded text-left hover:underline hover:decoration-dotted hover:underline-offset-4",
        className,
      )}
    >
      <span className="text-sm font-semibold leading-snug">{metric.displayValue}</span>
      {showMethodology && metric.methodology ? (
        <span className="text-xs font-normal leading-relaxed text-muted-foreground no-underline">
          {metric.methodology}
        </span>
      ) : null}
    </Explainable>
  );
}
