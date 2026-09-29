"use client";

// §9 — RESUMO DA COMPARAÇÃO: os 3 indicadores mais importantes de cada
// dimensão, exibidos na MESMA linha/gride da comparação completa
// (rótulo | A | B | C | diferença) — mesma linguagem visual em toda a página.
// Depois: PRINCIPAIS DIFERENÇAS e o link "Ver detalhes". Valores são
// descritivos — nada aqui elege vencedor.

import type { Candidate } from "@/types";
import type { KeyDifference, MetricRow } from "@/lib/data";
import { DIMENSIONS } from "@/types";
import { ComparisonRow } from "@/components/comparison-row";
import { DifferenceSummary } from "@/components/difference-summary";
import { ChevronDown } from "lucide-react";

export function ComparisonSummary({
  candidates,
  rows,
  differences,
}: {
  candidates: Candidate[];
  rows: MetricRow[];
  differences: KeyDifference[];
}) {
  const candLite = candidates.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <section aria-labelledby="h-summary" className="flex flex-col gap-10">
      <div className="flex flex-col gap-1.5">
        <h2 id="h-summary" className="display-2">
          Resumo da comparação
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Os três indicadores mais importantes de cada dimensão, com os mesmos
          critérios para todos. Os números descrevem os perfis — quem compara e
          quem julga é quem vota.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {DIMENSIONS.map((dim) => {
          const dimRows = rows
            .filter(
              (r) =>
                r.category === dim.slug &&
                r.values.filter((v) => v !== null).length >= 2,
            )
            .slice(0, 3);

          if (dimRows.length === 0) return null;

          return (
            <div key={dim.slug} className="flex flex-col gap-2">
              <div className="flex flex-col gap-0.5 border-b border-border pb-2">
                <h3 className="text-sm font-semibold">{dim.name}</h3>
                <p className="text-xs leading-snug text-muted-foreground">
                  {dim.question}
                </p>
              </div>

              <div className="flex flex-col">
                {dimRows.map((row) => (
                  <ComparisonRow
                    key={row.metricId}
                    label={row.name}
                    methodology={row.methodology}
                    values={row.values}
                    candidates={candLite}
                    deltaDisplay={row.delta?.display}
                    equal={row.equal}
                    highlightDifferences={false}
                    onlyDifferences={false}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* PRINCIPAIS DIFERENÇAS + Ver detalhes (§9) */}
      <div className="flex flex-col gap-5 border-t border-border pt-8">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold">Principais diferenças</h3>
          <p className="text-xs leading-snug text-muted-foreground">
            Onde os perfis divergem, com a diferença medida. Diferença não é
            recomendação.
          </p>
        </div>
        <DifferenceSummary
          differences={differences}
          candidateNames={candidates.map((c) => c.name)}
        />
        <div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("h-complete");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center gap-1.5 rounded border border-foreground px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Ver comparação completa
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
