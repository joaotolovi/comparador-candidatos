"use client";

// Bloco de linhas comparativas usado pelas seções de dados (estrutura do plano,
// opinião pública, currículo e indicadores das capacidades). Reaproveita a
// MESMA linha da grade .cmp-grid — nada de formato novo para o mesmo tipo de
// dado. Com `bare`, entra dentro de uma seção já aberta (sem casca própria).

import type { MetricRow } from "@/lib/data";
import { ComparisonRow } from "@/components/comparison-row";
import { SectionShell } from "@/components/section-shell";

export function MetricsBlock({
  id,
  index,
  title,
  question,
  note,
  secondary,
  rows,
  candidates,
  highlightDifferences,
  onlyDifferences,
  bare,
  subtitle,
}: {
  id: string;
  index: string;
  title: string;
  question: string;
  note?: string;
  secondary?: boolean;
  rows: MetricRow[];
  candidates: { name: string; slug: string }[];
  highlightDifferences: boolean;
  onlyDifferences: boolean;
  /** quando true, renderiza apenas as linhas (para dentro de uma seção existente) */
  bare?: boolean;
  subtitle?: string;
}) {
  const visibleRows = onlyDifferences
    ? rows.filter(
        (r) =>
          !r.equal ||
          r.values.some(
            (v) => v && v.availability !== "available" && v.availability !== "zero",
          ),
      )
    : rows;
  if (visibleRows.length === 0) return null;

  const body = (
    <div className="flex flex-col gap-3">
      {subtitle ? (
        <h3 className="text-base font-semibold leading-snug">{subtitle}</h3>
      ) : null}
      <div className="flex flex-col divide-y divide-border/70 border-t border-border">
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
    </div>
  );

  if (bare) return body;

  return (
    <SectionShell
      id={id}
      index={index}
      title={title}
      question={question}
      note={note}
      secondary={secondary}
    >
      {body}
    </SectionShell>
  );
}
