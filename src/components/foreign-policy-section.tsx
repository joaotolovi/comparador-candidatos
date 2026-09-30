"use client";

// Brasil no mundo: duas sínteses completas na superfície e eixos citados como
// chips. Os quatro textos integrais, contexto, metodologia e fontes ficam no detalhe.
//
// Tudo clicável: eixos abrem definição + onde aparece + fontes; os trechos de
// abertura expandem o texto completo no clique.

import { useRef } from "react";
import type { Candidate, Source } from "@/types";
import {
  CandidateTag,
  CandidateColumns,
  ContentEmpty,
  SourcesInline,
  SLOTS,
} from "@/components/section-shell";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import { RealityBlock, RealityMissing } from "@/components/reality-check";
import { GlossaryTerm, TermChip, type ExplainerContent } from "@/components/explainer";
import { glossaryFor } from "@/lib/glossary";
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

/** Frase da visão/estratégia em que o eixo aparece — evidência textual. */
function sentenceWith(text: string, label: string) {
  const entry = TERMS.find(([, l]) => l === label);
  if (!entry) return undefined;
  return text
    .split(/(?<=[.!?])\s+/)
    .find((s) => entry[0].test(s));
}

function axisContent(tag: string, where: string | undefined, sources: Source[]): ExplainerContent {
  return {
    title: tag,
    blocks: [
      { body: glossaryFor(tag)?.body ?? "" },
      ...(where ? [{ heading: "Onde aparece na declaração", body: where }] : []),
    ],
    sources: sources.slice(0, 6),
  };
}

function ForeignCard({
  c,
  slot,
  hideTag,
}: {
  c: Candidate;
  slot: "a" | "b" | "c";
  hideTag?: boolean;
}) {
  const f = c.foreignPolicy;
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const expand = () => detailsRef.current?.setAttribute("open", "");

  if (!f) {
    return (
      <article className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
        {hideTag ? null : <CandidateTag name={c.name} slot={slot} />}
        <ContentEmpty
          what="Brasil no mundo em consolidação"
          why="Posições documentadas sobre política externa, estratégia, experiência e projeção ainda estão em apuração."
        />
      </article>
    );
  }

  const full = `${f.worldView} ${f.strategy}`;
  const tags = tagsFor(full);

  return (
    <article className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
      {hideTag ? null : <CandidateTag name={c.name} slot={slot} />}

      {tags.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h3 className={FIELD}>
            <GlossaryTerm term="eixos citados">Eixos citados</GlossaryTerm>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <TermChip
                key={tag}
                term={tag}
                className="border px-2 py-1 text-[11px] text-foreground/80 hover:text-foreground"
                content={axisContent(tag, sentenceWith(full, tag), f.sources)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-2 border-t border-border/70 pt-3">
        {/* Trechos de abertura: o clique expande o texto completo abaixo */}
        <div className="rounded-md bg-muted/35 p-3">
          <h3 className={FIELD}>
            <GlossaryTerm term="visão e estratégia">Visão e estratégia</GlossaryTerm>
          </h3>
          <button
            type="button"
            onClick={expand}
            title="Clique para ler o texto completo com contexto e fontes"
            className="mt-1 text-left text-xs leading-relaxed text-foreground/85 hover:underline hover:decoration-dotted hover:underline-offset-4"
          >
            {completeThought(f.strategy || f.worldView)}
          </button>
        </div>
        <div className="rounded-md bg-muted/35 p-3">
          <h3 className={FIELD}>
            <GlossaryTerm term="atuação internacional">Atuação internacional</GlossaryTerm>
          </h3>
          <button
            type="button"
            onClick={expand}
            title="Clique para ler o texto completo com contexto e fontes"
            className="mt-1 text-left text-xs leading-relaxed text-foreground/85 hover:underline hover:decoration-dotted hover:underline-offset-4"
          >
            {completeThought(f.internationalExperience)}
          </button>
        </div>
      </div>

      {f.reality ? <RealityBlock reality={f.reality} title="Discurso × ações" /> : <RealityMissing />}

      <details ref={detailsRef} className="group mt-auto rounded-md border border-border/70 bg-background/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden">
          <span>Ler política externa completa e fontes</span>
          <ChevronDown aria-hidden className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="flex flex-col gap-4 border-t border-border/70 p-3">
          <div><h3 className={FIELD}><GlossaryTerm term="visão de mundo">Visão de mundo</GlossaryTerm></h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.worldView}</p></div>
          <div><h3 className={FIELD}><GlossaryTerm term="estratégia externa">Estratégia externa</GlossaryTerm></h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.strategy}</p></div>
          <div><h3 className={FIELD}><GlossaryTerm term="atuação internacional">Atuação internacional</GlossaryTerm></h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.internationalExperience}</p></div>
          <div><h3 className={FIELD}><GlossaryTerm term="projeção internacional">Projeção internacional</GlossaryTerm></h3><p className="mt-1 text-sm leading-relaxed text-foreground/90">{f.projection}</p></div>
          <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-muted-foreground">{f.projectionNote}</p>
          <div className="flex flex-wrap items-center gap-2">
            <EvidenceBadge status={f.evidenceStatus} />
            <ConfidenceBadge level={f.confidenceLevel} />
          </div>
          {f.methodology ? <p className="text-xs leading-relaxed text-muted-foreground">{f.methodology}</p> : null}
          <SourcesInline sources={f.sources} />
        </div>
      </details>
    </article>
  );
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
      {candidates.map((c, i) => (
        <ForeignCard key={c.slug} c={c} slot={SLOTS[i] ?? "a"} hideTag={hideTag} />
      ))}
    </CandidateColumns>
  );
}
