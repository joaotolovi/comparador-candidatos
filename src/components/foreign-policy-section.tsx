"use client";

// Brasil no mundo: duas sínteses completas na superfície e eixos citados como
// chips. Os quatro textos integrais, contexto, metodologia e fontes ficam no detalhe.

import type { Candidate } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import { RealityBlock, RealityMissing } from "@/components/reality-check";
import { ChevronDown } from "lucide-react";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function completeThought(text: string) {
  const normalized = (text ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences[0] && sentences[0].length <= 220) return sentences[0];
  const semicolon = normalized.split(";")[0]?.trim();
  if (semicolon && semicolon.length <= 220) return `${semicolon.replace(/[,.]+$/, "")}.`;
  const clauses = normalized.split(",").map((p) => p.trim()).filter(Boolean);
  const compact = clauses.slice(0, 2).join(", ");
  return compact ? `${compact.replace(/[,.]+$/, "")}.` : normalized;
}

const TERMS: Array<[RegExp, string]> = [
  [/\bBRICS\b/i, "BRICS"],
  [/Mercosul/i, "Mercosul"],
  [/Estados Unidos|\bEUA\b/i, "Estados Unidos"],
  [/China/i, "China"],
  [/Uni[aã]o Europeia/i, "União Europeia"],
  [/\bONU\b|Na[cç][oõ]es Unidas/i, "ONU"],
  [/multilateral/i, "multilateralismo"],
  [/n[aã]o[- ]alinh/i, "não alinhamento"],
  [/soberan/i, "soberania"],
  [/integra[cç][aã]o (regional|sul-americana|latino-americana)/i, "integração regional"],
  [/clima|clim[aá]tic/i, "clima"],
];

function tagsFor(text: string) {
  return TERMS.filter(([re]) => re.test(text)).map(([, label]) => label).slice(0, 6);
}

export function ForeignPolicySection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const f = c.foreignPolicy;
        const tags = f ? tagsFor(`${f.worldView} ${f.strategy}`) : [];
        return (
          <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {f ? (
              <>
                {tags.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    <h3 className={FIELD}>Eixos citados</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-border px-2 py-1 text-[11px] text-foreground/80">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2 border-t border-border/70 pt-3">
                  <div className="rounded-md bg-muted/35 p-3">
                    <h3 className={FIELD}>Visão e estratégia</h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/85">{completeThought(f.strategy || f.worldView)}</p>
                  </div>
                  <div className="rounded-md bg-muted/35 p-3">
                    <h3 className={FIELD}>Atuação internacional</h3>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/85">{completeThought(f.internationalExperience)}</p>
                  </div>
                </div>

                {f.reality ? <RealityBlock reality={f.reality} title="Discurso × ações" /> : <RealityMissing />}

                <details className="group mt-auto rounded-md border border-border/70 bg-background/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    <span>Ler política externa completa e fontes</span>
                    <ChevronDown aria-hidden className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-4 border-t border-border/70 p-3">
                    <div><h3 className={FIELD}>Visão de mundo</h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.worldView}</p></div>
                    <div><h3 className={FIELD}>Estratégia externa</h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.strategy}</p></div>
                    <div><h3 className={FIELD}>Atuação internacional</h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.internationalExperience}</p></div>
                    <div><h3 className={FIELD}>Projeção internacional</h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.projection}</p></div>
                    <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">{f.projectionNote}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <EvidenceBadge status={f.evidenceStatus} />
                      <ConfidenceBadge level={f.confidenceLevel} />
                    </div>
                    {f.methodology ? <p className="text-xs leading-relaxed text-muted-foreground">{f.methodology}</p> : null}
                    <SourcesInline sources={f.sources} />
                  </div>
                </details>
              </>
            ) : (
              <ContentEmpty
                what="Brasil no mundo em consolidação"
                why="Posições documentadas sobre política externa, estratégia, experiência e projeção ainda estão em apuração."
              />
            )}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
