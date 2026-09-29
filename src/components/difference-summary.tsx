"use client";

// "Principais diferenças": o componente-assinatura. Revela onde os perfis
// divergem, sem eleger vencedor. Delta sempre nomeia o portador, nunca
// julga ("para A", "para B" — fato, não mérito).

import type { KeyDifference } from "@/lib/data";
import { DIMENSIONS } from "@/types";
import { SLOT } from "@/components/slot";
import { dimensionOf } from "@/lib/data";
import { cn } from "@/lib/utils";

export function DifferenceSummary({
  differences,
  candidateNames,
}: {
  differences: KeyDifference[];
  candidateNames: string[];
}) {
  if (differences.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Não há métricas comparáveis suficientes para destacar diferenças
        entre estes perfis com os dados disponíveis.
      </p>
    );
  }
  return (
    <div className="flex flex-col">
      {differences.map((d, idx) => {
        const dim = dimensionOf(d.category);
        const slot = SLOT[(["a", "b", "c"] as const)[idx % 3] ?? "a"];
        const leaderSlotIdx = (() => {
          // descobre quem carrega o maior valor
          const nums = d.values.map((v) => v?.value ?? null);
          const max = Math.max(...nums.filter((n): n is number => n !== null));
          return nums.findIndex((n) => n === max);
        })();
        const leaderName = candidateNames[leaderSlotIdx] ?? "";
        return (
          <div
            key={d.metricId}
            className={cn(
              "grid items-start gap-x-6 gap-y-2 py-3.5",
              idx !== differences.length - 1 && "border-b border-border",
              "sm:grid-cols-[minmax(0,1fr)_auto]",
            )}
          >
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-medium text-muted-foreground">
                {dim?.name}
              </p>
              <h4 className="text-sm font-semibold leading-snug">
                {d.name}
              </h4>
              <div className="mt-1 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-5 sm:gap-y-1">
                {d.values.map((m, i) => {
                  const s = SLOT[(["a", "b", "c"] as const)[i] ?? "a"];
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <CandidateInitial
                        name={candidateNames[i] ?? ""}
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-background",
                          s.bg,
                        )}
                      />
                      <span className="num-cell break-words">
                        {m ? m.displayValue : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="min-w-0 sm:justify-self-end">
              <span className="inline-flex max-w-full flex-wrap rounded bg-foreground px-2 py-1 text-xs font-medium leading-tight text-background">
                {d.delta.display}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CandidateInitial({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initial = name.trim()[0] ?? "?";
  return (
    <span aria-hidden className={className}>
      {initial}
    </span>
  );
}
