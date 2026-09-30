import { Badge } from "@/components/ui/badge";
import { MethodologyTooltip } from "@/components/methodology-tooltip";
import {
  EVIDENCE_LABEL,
  CONFIDENCE_LABEL,
  AVAILABILITY_LABEL,
  LEGAL_STATUS_LABEL,
} from "@/lib/comparison";
import { glossaryFor } from "@/lib/glossary";
import type { EvidenceStatus, ConfidenceLevel, DataAvailability } from "@/types";
import { AlertTriangle, CircleCheck, CircleHelp, CircleMinus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estados de evidência: cor = estado documental do DADO, nunca qualidade
 * da pessoa. Confirmado/parcial usam o cinza-verde institucional;
 * contestado e indeterminado destacam com ocre/cinza.
 * Todo badge tem tooltip no hover explicando exatamente o que o selo significa.
 */
const EVIDENCE_STYLE: Record<
  EvidenceStatus,
  { className: string; icon: typeof CircleCheck }
> = {
  confirmado: { className: "bg-[#0e7177]/10 text-[#0e7177]", icon: CircleCheck },
  parcial: { className: "bg-[#a65b14]/10 text-[#8a4e15]", icon: CircleMinus },
  indeterminado: { className: "bg-muted text-muted-foreground", icon: CircleHelp },
  contestado: { className: "bg-[#a65b14]/15 text-[#8a4e15]", icon: AlertTriangle },
};

export function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  const s = EVIDENCE_STYLE[status];
  const Icon = s.icon;
  const def = glossaryFor(status);
  return (
    <MethodologyTooltip methodology={def?.short ?? ""}>
      <Badge
        variant="outline"
        className={cn("gap-1 border-transparent font-medium", s.className)}
      >
        <Icon aria-hidden className="size-3" strokeWidth={2.2} />
        {EVIDENCE_LABEL[status]}
      </Badge>
    </MethodologyTooltip>
  );
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const label = CONFIDENCE_LABEL[level];
  // confiança é da FONTE, expressa em pontos, sem cor de alarme
  const dots = level === "high" ? 3 : level === "medium" ? 2 : 1;
  const def = glossaryFor(label.toLowerCase());
  return (
    <MethodologyTooltip methodology={def?.short ?? ""}>
      <Badge
        variant="outline"
        className="gap-1.5 border-transparent bg-muted text-muted-foreground font-medium"
      >
        <span aria-hidden className="flex items-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full",
                i < dots ? "bg-current" : "bg-current/25",
              )}
            />
          ))}
        </span>
        <span className="sr-only">Confiança: </span>
        {label}
      </Badge>
    </MethodologyTooltip>
  );
}

export function AvailabilityBadge({
  availability,
}: {
  availability: DataAvailability;
}) {
  if (availability === "available" || availability === "zero") return null;
  const label = AVAILABILITY_LABEL[availability];
  const def = glossaryFor(label);
  return (
    <MethodologyTooltip methodology={def?.short ?? ""}>
      <Badge
        variant="outline"
        className="border-dashed border-muted-foreground/40 text-muted-foreground font-medium"
      >
        {label}
      </Badge>
    </MethodologyTooltip>
  );
}

export function LegalStatusBadge({ status }: { status: string }) {
  const isAdverse = [
    "denuncia",
    "acusacao",
    "investigacao",
    "inquérito",
    "processo",
    "condenacao",
    "condenacao_definitiva",
    "reprovacao",
  ].includes(status);
  const isFavorable = [
    "absolvicao",
    "arquivamento",
    "decisao_anulada",
    "aprovacao",
    "regular",
  ].includes(status);
  return (
    <MethodologyTooltip methodology="Categoria jurídica exata do caso. Acusação não é condenação — e absolvição e arquivamento têm o mesmo destaque.">
      <Badge
        variant="outline"
        className={cn(
          "font-medium",
          isAdverse && "border-transparent bg-[#a65b14]/12 text-[#8a4e15]",
          isFavorable && "border-transparent bg-[#0e7177]/10 text-[#0e7177]",
          !isAdverse && !isFavorable && "bg-muted text-muted-foreground",
        )}
      >
        {LEGAL_STATUS_LABEL[status] ?? status}
      </Badge>
    </MethodologyTooltip>
  );
}
