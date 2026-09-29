"use client";

// Linha de comparação: ATRIBUTO | candidato 1 | candidato 2 | (candidato 3) | diferença
// Estados: valor disponível, zero, não informado/encontrado/análise, contestado.
// Deltas aparecem na coluna própria; com "destacar diferenças" ligado,
// valores iguais ficam visualmente secundários.

import { AVAILABILITY_LABEL } from "@/lib/comparison";
import type { Metric, MetricType } from "@/types";
import { EvidenceBadge, AvailabilityBadge } from "@/components/badges";
import { MethodologyIcon } from "@/components/methodology-tooltip";
import { SLOT } from "@/components/slot";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EvidenceDrawer } from "@/components/evidence-drawer";

export interface RowProps {
  label: string;
  methodology: string;
  values: (Metric | null)[];
  candidates: { name: string; slug: string }[];
  deltaDisplay?: string;
  equal?: boolean;
  highlightDifferences: boolean;
  onlyDifferences: boolean;
}

export function ComparisonRow({
  label,
  methodology,
  values,
  candidates,
  deltaDisplay,
  equal,
  highlightDifferences,
  onlyDifferences,
  ...rest
}: RowProps & React.ComponentProps<"div">) {
  const [drawer, setDrawer] = useState<number | null>(null);
  const [drawerMetric, setDrawerMetric] = useState<Metric | null>(null);
  const [drawerClaim, setDrawerClaim] = useState("");

  // Modo "somente diferenças": linha some quando todos os valores são iguais
  const hasMissing = values.some(
    (v) => v && v.availability !== "available" && v.availability !== "zero",
  );
  if (onlyDifferences && (equal || !deltaDisplay) && !hasMissing) {
    return null;
  }

  const dimmed = Boolean(highlightDifferences && equal);

  const openDrawer = (i: number) => {
    const m = values[i];
    setDrawerMetric(m);
    setDrawerClaim(`${label} — ${candidates[i]?.name ?? ""}`);
    setDrawer(i);
  };

  return (
    <div
      {...rest}
      className={cn(
        "grid items-start gap-x-4 gap-y-3 py-3.5",
        dimmed && "opacity-45",
      )}
      style={{
        gridTemplateColumns: `minmax(8.5rem, 1.4fr) repeat(${values.length}, minmax(0, 1fr)) minmax(7.5rem, 0.9fr)`,
      }}
    >
      {/* Atributo */}
      <div className="flex items-center gap-1.5 pr-2 pt-1">
        <h4 className="text-sm font-medium leading-snug text-foreground">
          {label}
        </h4>
        <MethodologyIcon methodology={methodology} />
      </div>

      {/* Valores por candidato */}
      {values.map((m, i) => {
        const slot = SLOT[(["a", "b", "c"] as const)[i] ?? "a"];
        if (!m) {
          return (
            <div key={i} className="flex flex-col gap-1 pt-1">
              <span className="text-sm text-muted-foreground">
                Sem registro
              </span>
            </div>
          );
        }
        const isMissing =
          m.availability !== "available" && m.availability !== "zero";
        return (
          <div key={i} className="flex flex-col gap-1.5 pt-1">
            {isMissing ? (
              <AvailabilityBadge availability={m.availability} />
            ) : (
              <>
                <span
                  className={cn(
                    "num-hero stretch-expanded text-2xl",
                    m.evidenceStatus === "contestado" && "text-[#8a4e15]",
                  )}
                >
                  {m.displayValue}
                </span>
                {m.evidenceStatus !== "confirmado" ? (
                  <EvidenceBadge status={m.evidenceStatus} />
                ) : null}
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDrawer(i)}
              className="h-6 w-fit gap-1.5 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Eye aria-hidden className="size-3" />
              Ver evidências
            </Button>
          </div>
        );
      })}

      {/* Diferença */}
      <div className="pt-1">
        {deltaDisplay && !equal ? (
          <span className="inline-flex max-w-full flex-wrap items-center rounded bg-foreground px-2 py-1 text-xs font-semibold leading-tight text-background">
            {deltaDisplay}
          </span>
        ) : equal ? (
          <span className="text-xs text-muted-foreground">
            {values.length > 1 ? "Valores iguais" : ""}
          </span>
        ) : null}
      </div>

      <EvidenceDrawer
        open={drawer !== null}
        onOpenChange={(v) => !v && setDrawer(null)}
        claim={drawerClaim}
        metric={drawerMetric}
      />
    </div>
  );
}
