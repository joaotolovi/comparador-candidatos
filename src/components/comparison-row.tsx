"use client";

// Linha de comparação: RÓTULO | candidato 1 | candidato 2 | (3) | diferença
// Grade única (.cmp-grid) — mesma do cabeçalho — para as colunas alinharem.
// Célula padronizada:
//   • valor numérico → número + barra proporcional (indicador visual em TODOS)
//   • valor textual  → destaque + nota em corpo pequeno
//   • ausente        → "—" + motivo (texto, nunca pill que pareça barra)
// Deltas ficam na coluna própria; com "destacar" ligado, iguais desbotam.

import { AVAILABILITY_LABEL } from "@/lib/comparison";
import type { Metric, MetricType } from "@/types";
import { EvidenceBadge } from "@/components/badges";
import { Explainable, GlossaryTerm, type ExplainerContent } from "@/components/explainer";
import { glossaryFor } from "@/lib/glossary";
import { SLOT } from "@/components/slot";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EvidenceDrawer } from "@/components/evidence-drawer";

const SLOTS = ["a", "b", "c"] as const;

/** Tipos com magnitude representável em barra. */
const NUMERIC = new Set<MetricType>([
  "number",
  "currency",
  "duration",
  "percentage",
]);

/** Letra do slot (A/B/C) — só no mobile, onde não há cabeçalho de coluna. */
function SlotBadgeMobile({ index }: { index: number }) {
  const slot = SLOT[SLOTS[index] ?? "a"];
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-background sm:hidden",
        slot.bg,
      )}
    >
      {SLOTS[index] ?? "a"}
    </span>
  );
}

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

/** Separa "Destaque — nota (detalhe)" em valor principal + nota.
 *  Texto livre NUNCA é cortado no parêntese (senão vira frase mutilada);
 *  só o separador " — " divide destaque e nota. */
function splitValue(display: string, type: MetricType) {
  if (type === "text") {
    if (display.includes(" — ")) {
      const i = display.indexOf(" — ");
      return { head: display.slice(0, i), note: display.slice(i + 3) };
    }
    return { head: display, note: "" };
  }
  if (display.includes(" (")) {
    const i = display.indexOf(" (");
    return { head: display.slice(0, i), note: display.slice(i + 2).replace(/\)$/, "") };
  }
  return { head: display, note: "" };
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

  // Magnitude da barra: maior valor numérico da linha (nunca "melhor")
  const nums = values
    .filter((v): v is Metric => Boolean(v))
    .filter((v) => NUMERIC.has(v.metricType) && typeof v.value === "number");
  const max = nums.length > 0 ? Math.max(...nums.map((v) => v.value as number)) : 0;
  const showBar = max > 0 && nums.length >= 1;

  const openDrawer = (i: number) => {
    const m = values[i];
    setDrawerMetric(m);
    setDrawerClaim(`${label} — ${candidates[i]?.name ?? ""}`);
    setDrawer(i);
  };

  // Painel do rótulo: metodologia + valor de cada candidato nesta métrica.
  const labelContent: ExplainerContent = {
    title: label,
    blocks: [
      { heading: "Como medimos", body: methodology },
      {
        heading: "Nesta comparação",
        items: values.map((m, i) => ({
          label: candidates[i]?.name ?? `Coluna ${i + 1}`,
          text: !m
            ? "Sem registro"
            : m.availability !== "available" && m.availability !== "zero"
              ? (AVAILABILITY_LABEL[m.availability] ?? "não disponível")
              : m.displayValue,
        })),
      },
    ],
    link: { href: "/metodologia", label: "Metodologia completa" },
  };

  return (
    <div
      {...rest}
      className={cn(
        "flex flex-col gap-2 border-t border-border/60 py-3 first:border-t-0 sm:cmp-grid sm:items-start",
        dimmed && "opacity-45 transition-opacity",
      )}
      style={{ "--cmp-cols": values.length } as React.CSSProperties}
    >
      {/* Atributo — clicável: abre metodologia + valores de todos */}
      <div className="flex items-start gap-1.5">
        <Explainable
          hint={methodology}
          content={labelContent}
          className="-my-0.5 text-[13px] font-medium leading-snug text-foreground hover:underline hover:decoration-dotted hover:underline-offset-4"
        >
          {label}
        </Explainable>
      </div>

      {/* Valores por candidato */}
      {values.map((m, i) => {
        const slot = SLOT[SLOTS[i] ?? "a"];
        if (!m) {
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <SlotBadgeMobile index={i} />
                <span className="num-cell text-muted-foreground">—</span>
              </div>
              <p className="text-xs text-muted-foreground">
                <GlossaryTerm term="sem registro">Sem registro</GlossaryTerm>
              </p>
            </div>
          );
        }

        const isMissing =
          m.availability !== "available" && m.availability !== "zero";

        if (isMissing) {
          // Ausente: traço + motivo em texto — mesma linguagem em toda coluna
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <SlotBadgeMobile index={i} />
                <span className="num-cell text-muted-foreground">—</span>
              </div>
              <p className="text-xs leading-snug text-muted-foreground">
                <GlossaryTerm term={AVAILABILITY_LABEL[m.availability] ?? "não encontrado"}>
                  {AVAILABILITY_LABEL[m.availability] ?? "não disponível"}
                </GlossaryTerm>
              </p>
              <div className="flex items-center gap-1">
                <EvidenceIconButton
                  onClick={() => openDrawer(i)}
                  claim={`${label} — ${candidates[i]?.name ?? ""}`}
                />
                {m.evidenceStatus !== "confirmado" ? (
                  <EvidenceBadge status={m.evidenceStatus} />
                ) : null}
              </div>
            </div>
          );
        }

        // Valor presente
        const isNumeric = NUMERIC.has(m.metricType) && typeof m.value === "number";
        const { head, note } = splitValue(m.displayValue, m.metricType);
        const pct =
          isNumeric && showBar && max > 0
            ? Math.max(((m.value as number) / max) * 100, (m.value as number) > 0 ? 3 : 0)
            : 0;
        // Moeda curta e datas não quebram linha; texto longo usa corpo pequeno
        const nowrap = /^R\$[\s ]?[\d.]+,\d{2}$/.test(head) || head.length <= 16;

        return (
          <div key={i} className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-baseline gap-2">
              <SlotBadgeMobile index={i} />
              {/* O valor em si é clicável: abre o mesmo painel de fontes do ícone */}
              <button
                type="button"
                onClick={() => openDrawer(i)}
                title={`Ver metodologia e fontes de ${label} — ${candidates[i]?.name ?? ""}`}
                className={cn(
                  "cursor-pointer text-start hover:underline hover:decoration-dotted hover:underline-offset-4",
                  isNumeric || nowrap ? "num-cell whitespace-nowrap" : "num-cell-sm",
                  !isNumeric && !nowrap && "break-words",
                  m.evidenceStatus === "contestado" && "text-[#8a4e15]",
                )}
              >
                {head}
              </button>
            </div>
            {note ? (
              <p className="text-xs leading-snug text-muted-foreground">{note}</p>
            ) : null}
            {showBar && isNumeric ? (
              <div className="cmp-track" aria-hidden>
                <div
                  className={cn("cmp-fill", slot.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-1">
              <EvidenceIconButton
                onClick={() => openDrawer(i)}
                claim={`${label} — ${candidates[i]?.name ?? ""}`}
              />
              {m.evidenceStatus !== "confirmado" ? (
                <EvidenceBadge status={m.evidenceStatus} />
              ) : null}
            </div>
          </div>
        );
      })}

      {/* Diferença — a própria razão é clicável: explica como é calculada */}
      <div className="min-w-0">
        {deltaDisplay && !equal ? (
          <Explainable
            hint="Como calculamos a diferença entre as colunas"
            content={{
              title: "Diferença entre as colunas",
              blocks: [
                {
                  body:
                    "A razão descritiva entre o maior e o menor valor desta linha. Só aparece quando a diferença é de pelo menos 2×, o maior valor é ao menos 10 e o menor é maior que zero — nunca adjetivo de valor, nunca “melhor/pior”.",
                },
                {
                  heading: "Como ler",
                  body:
                    "A coluna delta descreve magnitude, não qualidade. Uma razão grande não significa posição melhor — quem conclui é quem lê.",
                },
              ],
              link: { href: "/metodologia", label: "Metodologia completa" },
            }}
            className="inline-flex max-w-full flex-wrap items-center rounded bg-foreground px-2 py-1 text-xs font-medium leading-tight text-background hover:opacity-90"
          >
            {deltaDisplay}
          </Explainable>
        ) : equal && values.length > 1 ? (
          <span className="text-xs text-muted-foreground">iguais</span>
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

/** Ícone único de evidência — sem texto repetido em cada célula. */
function EvidenceIconButton({
  onClick,
  claim,
}: {
  onClick: () => void;
  claim: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={`Ver fontes de ${claim}`}
      aria-label={`Ver fontes de ${claim}`}
      className="size-6 text-muted-foreground hover:text-foreground"
    >
      <Eye aria-hidden className="size-3.5" />
    </Button>
  );
}
