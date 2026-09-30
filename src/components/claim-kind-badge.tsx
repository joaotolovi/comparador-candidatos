"use client";

// Rótulo da natureza da afirmação (POSIÇÃO / PROPOSTA / HISTÓRICO) e da
// cobertura de evidências. Mesma aparência para todos os candidatos: nenhuma
// cor semântica de "bom/ruim". Tooltip no hover explica o critério de cada selo.

import type { ClaimKind, EvidenceCoverage } from "@/types";
import { MethodologyTooltip } from "@/components/methodology-tooltip";
import { glossaryFor } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export const CLAIM_LABEL: Record<ClaimKind, string> = {
  posicao: "Posição",
  proposta: "Proposta",
  historico: "Histórico",
};

export function ClaimKindBadge({
  kind,
  className,
}: {
  kind: ClaimKind;
  className?: string;
}) {
  const def = glossaryFor(kind);
  return (
    <MethodologyTooltip methodology={def?.short ?? ""}>
      <span
        className={cn(
          "shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
          className,
        )}
      >
        {CLAIM_LABEL[kind]}
      </span>
    </MethodologyTooltip>
  );
}

export const COVERAGE_LABEL: Record<EvidenceCoverage, string> = {
  documentada: "Evidências documentadas",
  parcial: "Cobertura parcial",
  insuficiente: "Cobertura insuficiente",
};

export function CoverageBadge({
  coverage,
  note,
}: {
  coverage: EvidenceCoverage;
  note?: string;
}) {
  const def = glossaryFor(COVERAGE_LABEL[coverage].toLowerCase());
  return (
    <MethodologyTooltip methodology={note || def?.short || ""}>
      <span
        className={cn(
          "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
          coverage === "documentada" ? "border-border" : "border-dashed border-border",
        )}
      >
        {COVERAGE_LABEL[coverage]}
      </span>
    </MethodologyTooltip>
  );
}
