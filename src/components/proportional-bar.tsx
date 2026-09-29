"use client";

// Barra proporcional para métricas percentuais do plano (detalhamento).
// Mostra o valor, a barra na cor do slot e a contagem n/total.
import { SLOT } from "@/components/slot";
import { cn } from "@/lib/utils";

export function ProportionalBar({
  percentage,
  slot,
  label,
  count,
  total,
  onOpenEvidence,
}: {
  percentage: number;
  slot: 0 | 1 | 2;
  label: string;
  count?: number;
  total?: number;
  onOpenEvidence?: () => void;
}) {
  const s = SLOT[(["a", "b", "c"] as const)[slot]];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium">{label}</span>
        <button
          type="button"
          onClick={onOpenEvidence}
          className="tabular shrink-0 text-sm font-semibold"
        >
          {percentage.toLocaleString("pt-BR")}%
          {typeof count === "number" && typeof total === "number" ? (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              {count}/{total}
            </span>
          ) : null}
        </button>
      </div>
      {/* Trilha acessível: role=meter com aria-label completo */}
      <div
        role="meter"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${percentage}%`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full", s.bar)}
          style={{ width: `${Math.max(percentage, 1.5)}%` }}
        />
      </div>
    </div>
  );
}
