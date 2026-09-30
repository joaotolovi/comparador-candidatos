"use client";

// Projeto de país: a superfície usa prioridades e conceitos explicitamente
// presentes nos documentos. A visão e o modelo completos ficam recolhidos, sem
// cortes mecânicos que removam o contexto da frase.
//
// Tudo clicável: cada pill de prioridade abre o texto integral com fontes; cada
// conceito do modelo abre a definição + onde aparece no plano; o "+N" lista
// todas as prioridades restantes.

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
import { Explainable, GlossaryTerm, TermChip, type ExplainerContent } from "@/components/explainer";
import { glossaryFor } from "@/lib/glossary";
import { ChevronDown } from "lucide-react";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function cleanLabel(text: string, limit = 68) {
  const normalized = (text ?? "")
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.;:,]+$/, "");
  if (normalized.length <= limit) return normalized;
  const clause = normalized.split(/[,;:]/).map((p) => p.trim()).find((p) => p.length >= 18 && p.length <= limit);
  return clause ?? normalized.split(" ").slice(0, 8).join(" ");
}

function destinationSummary(c: Candidate) {
  const priorities = (c.countryProject?.nationalPriorities ?? []).slice(0, 3).map((p) => cleanLabel(p, 58));
  if (!priorities.length) return "Síntese do projeto em consolidação.";
  return `Foco declarado: ${priorities.join(" · ")}`;
}

const MODEL_TERMS: Array<[RegExp, string]> = [
  [/Estado (?:como )?planejador/i, "Estado planejador"],
  [/Estado (?:como )?indutor/i, "Estado indutor"],
  [/setor privado|iniciativa privada/i, "setor privado"],
  [/responsabilidade fiscal/i, "responsabilidade fiscal"],
  [/ajuste fiscal|conten[cç][aã]o de gastos/i, "ajuste fiscal"],
  [/industrializa[cç][aã]o|pol[ií]tica industrial/i, "industrialização"],
  [/inova[cç][aã]o/i, "inovação"],
  [/tecnologia|digital/i, "tecnologia"],
  [/infraestrutura/i, "infraestrutura"],
  [/sustent[aá]vel|sustentabilidade/i, "sustentabilidade"],
  [/concess[oõ]es/i, "concessões"],
  [/privatiza[cç][aã]o|privatiza[cç][oõ]es/i, "privatização"],
  [/liberal/i, "liberal"],
  [/mercado/i, "mercado"],
];

function modelTags(text: string) {
  return MODEL_TERMS.filter(([re]) => re.test(text)).map(([, label]) => label).slice(0, 5);
}

/** Frase do modelo em que o termo aparece — evidência textual, não paráfrase. */
function sentenceWith(text: string, label: string) {
  const entry = MODEL_TERMS.find(([, l]) => l === label);
  if (!entry) return undefined;
  const sentence = text
    .split(/(?<=[.!?])\s+/)
    .find((s) => entry[0].test(s));
  return sentence;
}

/** Painel de uma prioridade: texto integral + fontes do projeto + link do plano. */
function priorityContent(text: string, sources: Source[], planUrl?: string, planLabel?: string): ExplainerContent {
  return {
    title: "Prioridade declarada",
    blocks: [
      { heading: "Texto no plano", body: text },
      {
        heading: "Como lemos",
        body:
          "Prioridades foram extraídas do texto do plano de governo — o rótulo curto é derivado do texto, não escolhido pela comparação. A frase completa está acima.",
      },
    ],
    sources,
    link: planUrl ? { href: planUrl, label: `Plano registrado${planLabel ? ` — ${planLabel}` : ""}` } : undefined,
  };
}

export function CountryProjectSection({
  candidates,
  hideTag,
}: {
  candidates: Candidate[];
  hideTag?: boolean;
}) {
  return (
    <CandidateColumns count={candidates.length}>
      {candidates.map((c, i) => {
        const p = c.countryProject;
        const tags = p ? modelTags(p.developmentModel ?? "") : [];
        const planUrl = c.governmentPlan?.planUrl;
        return (
          <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {p ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h3 className={FIELD}>
                    <GlossaryTerm term="destino declarado">Destino declarado</GlossaryTerm>
                  </h3>
                  {/* A frase-síntese é clicável: abre as prioridades na íntegra */}
                  <Explainable
                    hint="Para onde o candidato diz que quer levar o país — clique para as prioridades na íntegra"
                    content={{
                      title: "Foco declarado",
                      blocks: [
                        { body: glossaryFor("destino declarado")?.body ?? "" },
                        {
                          heading: "Prioridades declaradas no plano",
                          items: p.nationalPriorities.map((t) => ({ text: t })),
                        },
                      ],
                      sources: p.sources,
                      link: planUrl ? { href: planUrl, label: "Plano registrado" } : undefined,
                    }}
                    className="-my-0.5 self-start rounded text-sm font-medium leading-relaxed text-foreground hover:underline hover:decoration-dotted hover:underline-offset-4"
                  >
                    {destinationSummary(c)}
                  </Explainable>
                </div>

                {p.nationalPriorities.length > 0 ? (
                  <div className="flex flex-col gap-1.5 border-t border-border/70 pt-3">
                    <h3 className={FIELD}>
                      <GlossaryTerm term="prioridades declaradas">Prioridades</GlossaryTerm>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {p.nationalPriorities.slice(0, 4).map((t) => (
                        <Explainable
                          key={t}
                          hint={`Texto no plano: ${cleanLabel(t, 90)}… — clique para o texto integral e fontes`}
                          content={priorityContent(t, p.sources, planUrl)}
                          className="rounded-full border border-border bg-background px-2 py-1 text-left text-[11px] leading-snug text-foreground/80 hover:border-foreground/30 hover:text-foreground"
                        >
                          {cleanLabel(t, 48)}
                        </Explainable>
                      ))}
                      {p.nationalPriorities.length > 4 ? (
                        <Explainable
                          hint="Prioridades restantes do plano — clique para ver todas"
                          content={{
                            title: `+${p.nationalPriorities.length - 4} prioridades`,
                            blocks: [
                              { body: "Todas as prioridades declaradas no plano, na ordem em que aparecem no documento." },
                              {
                                heading: "Prioridades",
                                items: p.nationalPriorities.slice(4).map((t) => ({ text: t })),
                              },
                            ],
                            sources: p.sources,
                            link: planUrl ? { href: planUrl, label: "Plano registrado" } : undefined,
                          }}
                          className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          +{p.nationalPriorities.length - 4}
                        </Explainable>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {tags.length > 0 ? (
                  <div className="flex flex-col gap-1.5 border-t border-border/70 pt-3">
                    <h3 className={FIELD}>
                      <GlossaryTerm term="conceitos citados no modelo">Conceitos citados no modelo</GlossaryTerm>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => {
                        const where = sentenceWith(p.developmentModel ?? "", tag);
                        return (
                          <TermChip
                            key={tag}
                            term={tag}
                            className="bg-muted px-2 py-1 text-[11px] text-foreground/80 hover:text-foreground"
                            content={{
                              title: tag,
                              blocks: [
                                { body: glossaryFor(tag)?.body ?? "" },
                                ...(where
                                  ? [{ heading: "Onde aparece no plano", body: where }]
                                  : []),
                              ],
                              sources: p.sources.slice(0, 6),
                              link: planUrl ? { href: planUrl, label: "Plano registrado" } : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {p.reality ? <RealityBlock reality={p.reality} title="Projeto × realidade" /> : <RealityMissing />}

                <details className="group mt-auto rounded-md border border-border/70 bg-background/40">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden">
                    <span>Ler visão, modelo e fontes</span>
                    <ChevronDown aria-hidden className="size-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-4 border-t border-border/70 p-3">
                    <div className="flex flex-col gap-1">
                      <h3 className={FIELD}>
                        <GlossaryTerm term="visão completa">Visão completa</GlossaryTerm>
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/90">{p.vision}</p>
                    </div>
                    {p.developmentModel ? (
                      <div className="flex flex-col gap-1">
                        <h3 className={FIELD}>
                          <GlossaryTerm term="modelo de desenvolvimento">Modelo de desenvolvimento</GlossaryTerm>
                        </h3>
                        <p className="text-sm leading-relaxed text-foreground/90">{p.developmentModel}</p>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <EvidenceBadge status={p.evidenceStatus} />
                      <ConfidenceBadge level={p.confidenceLevel} />
                    </div>
                    {p.methodology ? <p className="text-xs leading-relaxed text-muted-foreground">{p.methodology}</p> : null}
                    <SourcesInline sources={p.sources} />
                  </div>
                </details>
              </>
            ) : (
              <ContentEmpty
                what="Projeto de país em consolidação"
                why="A síntese entra quando as fontes primárias estiverem consolidadas. Nada é preenchido por inferência."
              />
            )}
          </article>
        );
      })}
    </CandidateColumns>
  );
}
