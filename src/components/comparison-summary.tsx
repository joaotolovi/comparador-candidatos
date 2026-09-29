"use client";

// §9 — RESUMO DA COMPARAÇÃO: os cinco blocos de dimensão com os indicadores
// mais importantes de cada candidato, depois "PRINCIPAIS DIFERENÇAS" e o
// botão "Ver detalhes". Valores são descritivos — nada aqui elege vencedor.

import type { Candidate } from "@/types";
import type { KeyDifference, MetricRow } from "@/lib/data";
import { DIMENSIONS } from "@/types";
import { SLOT } from "@/components/slot";
import { DifferenceSummary } from "@/components/difference-summary";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const SLOTS = ["a", "b", "c"] as const;

const UNAVAILABLE_LABEL: Record<string, string> = {
  not_informed: "não informado",
  not_found: "não localizado",
  not_applicable: "não se aplica",
  under_analysis: "em análise",
};

export function ComparisonSummary({
  candidates,
  rows,
  differences,
}: {
  candidates: Candidate[];
  rows: MetricRow[];
  differences: KeyDifference[];
}) {
  return (
    <section aria-labelledby="h-summary" className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="eyebrow">Resumo da comparação</p>
        <h2 id="h-summary" className="display-2">
          As cinco dimensões, lado a lado
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Os indicadores mais importantes de cada dimensão. Os números descrevem
          os perfis — quem compara e quem julga é quem vota.
        </p>
      </div>

      <div className="flex flex-col">
        {DIMENSIONS.map((dim) => {
          const dimRows = rows
            .filter(
              (r) =>
                r.category === dim.slug &&
                r.values.filter((v) => v !== null).length >= 2,
            )
            .slice(0, 3);

          return (
            <div
              key={dim.slug}
              className="flex flex-col gap-4 border-t border-border py-6 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-col gap-1">
                <p className="eyebrow">{dim.name}</p>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {dim.question}
                </p>
              </div>

              {dimRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda não há indicadores comparáveis disponíveis nesta
                  dimensão para estes candidatos.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {candidates.map((c, i) => {
                    const slot = SLOT[SLOTS[i] ?? "a"];
                    return (
                      <div
                        key={c.id}
                        className="flex flex-col gap-3"
                        aria-label={`${c.ballotName ?? c.name}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center rounded text-[11px] font-bold uppercase text-background",
                              slot.bg,
                            )}
                          >
                            {SLOTS[i]}
                          </span>
                          <span className="truncate text-sm font-semibold">
                            {c.ballotName ?? c.name}
                          </span>
                        </div>

                        <dl className="flex flex-col gap-3">
                          {dimRows.map((row) => {
                            const m = row.values[i];
                            const unavailable =
                              !m ||
                              m.availability === "not_informed" ||
                              m.availability === "not_found" ||
                              m.availability === "not_applicable" ||
                              m.availability === "under_analysis";
                            return (
                              <div
                                key={row.metricId}
                                className="flex flex-col gap-0.5"
                              >
                                <dd
                                  className={cn(
                                    "num-hero stretch-expanded leading-none",
                                    !unavailable &&
                                      m.displayValue.length > 18 &&
                                      "num-hero-sm",
                                    unavailable && "text-sm text-muted-foreground",
                                  )}
                                >
                                  {m && !unavailable ? (
                                    m.displayValue
                                  ) : (
                                    <span className="font-sans font-semibold">
                                      {m
                                        ? UNAVAILABLE_LABEL[m.availability] ??
                                          "—"
                                        : "—"}
                                    </span>
                                  )}
                                </dd>
                                <dt className="text-xs leading-snug text-muted-foreground">
                                  {row.name}
                                </dt>
                              </div>
                            );
                          })}
                        </dl>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PRINCIPAIS DIFERENÇAS + Ver detalhes (§9) */}
      <div className="flex flex-col gap-5 border-t border-border pt-8">
        <p className="eyebrow">Principais diferenças</p>
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
            className="inline-flex items-center gap-1.5 rounded border border-foreground px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-describedby="h-complete"
          >
            Ver detalhes
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Esta seleção destaca onde os perfis divergem, sem eleger melhor ou
          pior candidato. Diferença não é recomendação.
        </p>
      </div>
    </section>
  );
}
