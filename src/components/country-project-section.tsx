"use client";

// Projeto de país: a superfície usa prioridades e conceitos explicitamente
// presentes nos documentos. A visão e o modelo completos ficam recolhidos, sem
// cortes mecânicos que removam o contexto da frase.

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
        return (
          <article key={c.slug} className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4">
            {hideTag ? null : <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />}
            {p ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <h3 className={FIELD}>Destino declarado</h3>
                  <p className="text-sm font-medium leading-relaxed text-foreground">{destinationSummary(c)}</p>
                </div>

                {p.nationalPriorities.length > 0 ? (
                  <div className="flex flex-col gap-1.5 border-t border-border/70 pt-3">
                    <h3 className={FIELD}>Prioridades</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {p.nationalPriorities.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full border border-border bg-background px-2 py-1 text-[11px] leading-snug text-foreground/80">
                          {cleanLabel(t, 48)}
                        </span>
                      ))}
                      {p.nationalPriorities.length > 4 ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                          +{p.nationalPriorities.length - 4}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {tags.length > 0 ? (
                  <div className="flex flex-col gap-1.5 border-t border-border/70 pt-3">
                    <h3 className={FIELD}>Conceitos citados no modelo</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-1 text-[11px] text-foreground/80">{tag}</span>
                      ))}
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
                      <h3 className={FIELD}>Visão completa</h3>
                      <p className="text-sm leading-relaxed text-foreground/90">{p.vision}</p>
                    </div>
                    {p.developmentModel ? (
                      <div className="flex flex-col gap-1">
                        <h3 className={FIELD}>Modelo de desenvolvimento</h3>
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
