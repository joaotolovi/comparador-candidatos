"use client";

// Seção 01 — comparação rápida, alinhada por assunto.
//
// Regras desta superfície:
// 1. TODAS as linhas usam a mesma grade (cmp-grid): rótulo + colunas + delta.
//    Nada usa content-cols aqui — Dependências e Base factual antes começavam
//    mais à esquerda que as barras e descarrilavam contra a coluna do candidato.
// 2. Prioridades do "Projeto de país" aparecem uma única vez (pills). O rótulo
//    curto é derivado de forma determinística do texto original — nunca um
//    recorte diferente do mesmo texto em dois lugares.
// 3. Todo número, índice, pill e rótulo é clicável: abre painel lateral com
//    explicação, lista por proposta e fontes reais. Hover mostra uma linha.
// 4. Fontes só entram no painel quando existem; ausência é declarada como tal.

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import type { Candidate, RealityCheck, Source, TensionKind } from "@/types";
import { PATH_LABELS, TENSION_LABELS, THEME_SOURCE_LABELS } from "@/types";
import { CandidateTag, SLOTS } from "@/components/section-shell";
import {
  Explainable,
  GlossaryTerm,
  type ExplainerContent,
} from "@/components/explainer";
import { glossaryEntry } from "@/lib/glossary";

// ---------------------------------------------------------------- helpers

function firstName(c: Candidate) {
  return (c.ballotName ?? c.name).split(" ")[0];
}

function squashed(text: string) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

/** Rótulo curto determinístico de uma prioridade; o texto integral fica no painel. */
function priorityLabel(priority: string): string {
  const s = squashed(priority);
  const mPrefix = s.match(/^([^:(]{2,42}?)\s*(?:\([^)]*\))?\s*:\s*(.{12,})$/);
  if (mPrefix) return mPrefix[1].replace(/[,;.]+$/, "").trim();
  const mClause = s.match(/^([^,;()]{4,56}?)(?:[,;]| \()/);
  if (mClause) return mClause[1].trim();
  if (s.length <= 64) return s.replace(/[.;:,]+$/, "");
  return `${s.slice(0, 61).replace(/\s+\S*$/, "").replace(/[,;:.]+$/, "")}…`;
}

function shortTitle(text: string, limit = 96) {
  const s = squashed(text);
  if (s.length <= limit) return s;
  return `${s.slice(0, limit - 1).replace(/\s+\S*$/, "")}…`;
}

function dedupeSources(pools: Array<Source[] | undefined>, cap = 8): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const pool of pools) {
    for (const source of pool ?? []) {
      const key = source.url || source.title || JSON.stringify(source).slice(0, 64);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(source);
      if (out.length >= cap) return out;
    }
  }
  return out;
}

/** Fontes do plano (queda para as fontes do projeto de país quando o plano não lista). */
function planSourcesFor(c: Candidate): Source[] {
  const plan = c.governmentPlan?.sources ?? [];
  return plan.length ? plan : c.countryProject?.sources ?? [];
}

function planLink(c: Candidate) {
  const url = c.governmentPlan?.planUrl ?? c.governmentPlan?.registeredUrl;
  return url ? { href: url, label: "Programa de governo registrado (TSE)" } : undefined;
}

function planBlock(c: Candidate): ExplainerContent["blocks"][number] {
  const gp = c.governmentPlan;
  return {
    heading: "Plano analisado",
    body: `${gp?.title ? `${gp.title}. ` : ""}Registrado em: ${gp?.registeredWith ?? "TSE"}.`,
  };
}

function requirementNote(r?: RealityCheck): string | undefined {
  const path = r?.requirement?.path;
  return path ? PATH_LABELS[path] : undefined;
}

function allRealities(c: Candidate): RealityCheck[] {
  return [
    c.countryProject?.reality,
    c.foreignPolicy?.reality,
    ...(c.capacities ?? []).map((x) => x.reality),
    ...(c.governmentPlan?.proposals ?? []).map((x) => x.reality),
    ...(c.themes ?? []).map((x) => x.reality),
  ].filter((r): r is RealityCheck => Boolean(r));
}

function collectTensions(c: Candidate): Array<{ kind: TensionKind; title: string; sources: Source[] }> {
  const out: Array<{ kind: TensionKind; title: string; sources: Source[] }> = [];
  for (const r of allRealities(c)) {
    for (const t of r.tensions ?? []) {
      out.push({ kind: t.kind, title: t.title, sources: t.sources ?? [] });
    }
  }
  return out;
}

function collectOpenQuestions(c: Candidate): Array<{ question: string; why: string }> {
  const out: Array<{ question: string; why: string }> = [];
  for (const r of allRealities(c)) {
    for (const q of r.openQuestions ?? []) out.push({ question: q.question, why: q.why });
  }
  return out;
}

function firstSentenceWith(text: string, pattern: RegExp): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const hit = sentences.find((s) => pattern.test(s));
  return shortTitle(hit ?? sentences[0] ?? text, 220);
}

// ---------------------------------------------------------------- dados

function planStats(c: Candidate) {
  const proposals = c.governmentPlan?.proposals ?? [];
  const total = proposals.length;
  return {
    total,
    proposals,
    objective: proposals.filter((p) => p.hasClearObjective).length,
    target: proposals.filter((p) => p.hasQuantitativeTarget).length,
    deadline: proposals.filter((p) => p.hasDeadline).length,
    cost: proposals.filter((p) => p.hasCostEstimate).length,
    funding: proposals.filter((p) => p.hasFundingSource).length,
    path: proposals.filter((p) => Boolean(p.reality?.requirement)).length,
    congress: proposals.filter((p) => p.dependsOnCongress).length,
    states: proposals.filter((p) => p.dependsOnStates).length,
    municipalities: proposals.filter((p) => p.dependsOnMunicipalities).length,
  };
}

type PlanStat = ReturnType<typeof planStats>;

const METRIC_DEFS = [
  { key: "objective", label: "Objetivo explícito", field: "hasClearObjective" },
  { key: "target", label: "Meta quantitativa", field: "hasQuantitativeTarget" },
  { key: "deadline", label: "Prazo", field: "hasDeadline" },
  { key: "cost", label: "Custo estimado", field: "hasCostEstimate" },
  { key: "funding", label: "Fonte de financiamento", field: "hasFundingSource" },
  { key: "path", label: "Caminho institucional", field: null },
] as const;

const DEPENDENCY_DEFS = [
  { key: "congress", label: "Congresso", term: "congresso", field: "dependsOnCongress" },
  { key: "states", label: "Estados", term: "estados", field: "dependsOnStates" },
  { key: "municipalities", label: "Municípios", term: "municípios", field: "dependsOnMunicipalities" },
] as const;

const WORLD_TERMS: Array<[RegExp, string]> = [
  [/\bBRICS\b/i, "BRICS"],
  [/Mercosul/i, "Mercosul"],
  [/Estados Unidos|\bEUA\b/i, "Estados Unidos"],
  [/China/i, "China"],
  [/Uni[aã]o Europeia/i, "União Europeia"],
];

function worldTags(c: Candidate) {
  const text = `${c.foreignPolicy?.worldView ?? ""} ${c.foreignPolicy?.strategy ?? ""}`;
  return WORLD_TERMS.filter(([re]) => re.test(text)).map(([, label]) => label).slice(0, 5);
}

// ---------------------------------------------------------------- primitivos

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function MicroBar({ value, total }: { value: number; total: number }) {
  const pct = percentage(value, total);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular w-10 shrink-0 text-right text-xs font-semibold text-foreground underline-offset-2 group-hover/xl:underline group-hover/xl:decoration-dotted">
        {total > 0 ? `${value}/${total}` : "—"}
      </span>
    </div>
  );
}

function MetricBarCell({
  value,
  total,
  candidate,
  def,
}: {
  value: number;
  total: number;
  candidate: Candidate;
  def: (typeof METRIC_DEFS)[number];
}) {
  const zero = value === 0;
  const hint = zero
    ? `Nenhuma das ${total} propostas declara ${def.label.toLowerCase()}. Clique para ver como medimos.`
    : `${value} de ${total} propostas declaram ${def.label.toLowerCase()}. Clique para a lista e fontes.`;
  return (
    <Explainable
      hint={hint}
      className="w-full rounded-md"
      content={() => {
        const stats = planStats(candidate);
        const isPath = def.label === "Caminho institucional";
        const withField = def.field
          ? stats.proposals.filter((p) => Boolean(p[def.field]))
          : stats.proposals.filter((p) => Boolean(p.reality?.requirement));
        const entry = glossaryEntry(def.label.toLowerCase());
        return {
          title: `${def.label} — ${firstName(candidate)}`,
          subtitle: `${withField.length} de ${total} propostas do plano registrado`,
          blocks: [
            entry ? { body: entry.body ?? entry.short } : {},
            {
              heading: isPath ? "Instrumento por proposta" : "Propostas com o campo preenchido",
              items: withField.length
                ? withField.map((p) => ({
                    label: shortTitle(p.title),
                    text: isPath ? "" : p.theme,
                    note: isPath ? requirementNote(p.reality) : undefined,
                  }))
                : [{ text: `Nenhuma das ${total} propostas declara ${def.label.toLowerCase()}. Ausência declarada — o produto não preenche com estimativa própria.` }],
            },
            isPath
              ? { body: "Quando o instrumento aparece como \u201cnão especificado no documento\u201d, o produto avaliou e o plano não diz — ausência declarada, não esquecimento." }
              : {},
            planBlock(candidate),
          ],
          sources: dedupeSources([planSourcesFor(candidate)], 6),
          sourcesNote: "Fontes do plano de governo. Cada proposta cita as próprias fontes no painel dela.",
          link: planLink(candidate),
        };
      }}
    >
      <MicroBar value={value} total={total} />
    </Explainable>
  );
}

function CountCell({
  value,
  label,
  hint,
  content,
  className,
}: {
  value: string | number;
  label: string;
  hint: string;
  content: () => ExplainerContent;
  className?: string;
}) {
  return (
    <Explainable hint={hint} content={content} className={className ?? "w-full"}>
      <div className="rounded-md border border-border/70 bg-background/50 px-3 py-2 transition-colors group-hover/xl:border-foreground/40">
        <span className="tabular text-sm font-semibold leading-none">{value}</span>{" "}
        <span className="text-[11px] leading-tight text-muted-foreground">{label}</span>
      </div>
    </Explainable>
  );
}

function MatrixRow({
  label,
  term,
  candidates,
  children,
}: {
  label: string;
  term?: string;
  candidates: Candidate[];
  children: (candidate: Candidate, index: number) => React.ReactNode;
}) {
  return (
    <div
      className="grid gap-3 border-t border-border/70 py-2.5 sm:cmp-grid"
      style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
    >
      <div className="min-w-0 self-center text-xs text-muted-foreground">
        {term ? <GlossaryTerm term={term}>{label}</GlossaryTerm> : label}
      </div>
      {candidates.map((c, i) => (
        <div key={c.slug} className="min-w-0">
          {children(c, i)}
        </div>
      ))}
      <div className="hidden sm:block" aria-hidden />
    </div>
  );
}

function SectionHead({ title, term, note }: { title: string; term?: string; note?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {term ? <GlossaryTerm term={term}>{title}</GlossaryTerm> : title}
      </h3>
      {note ? <div className="text-[11px] text-muted-foreground">{note}</div> : null}
    </div>
  );
}

// ---------------------------------------------------------------- seção

export function ComparisonSummary({ candidates }: { candidates: Candidate[] }) {
  const plans = candidates.map(planStats);

  const visibleMetrics = METRIC_DEFS.filter((m) => plans.some((p) => p[m.key] > 0));
  const absentMetrics = METRIC_DEFS.filter((m) => plans.every((p) => p[m.key] === 0));
  const visibleDependencies = DEPENDENCY_DEFS.filter((d) => plans.some((p) => p[d.key] > 0));

  return (
    <section aria-labelledby="h-summary" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seção 1</span>
        <h2 id="h-summary" className="display-2">Comparação rápida</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          O essencial, alinhado por assunto. Tudo aqui é clicável: número, índice e rótulo
          abrem explicação, método e fontes ao lado. Passar o mouse mostra uma linha.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {/* Cabeçalho — chips abrem o perfil completo */}
        <div
          className="grid gap-3 border-b border-border bg-muted/25 py-3 sm:cmp-grid"
          style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Candidatos</div>
          {candidates.map((c, i) => (
            <Link
              key={c.slug}
              href={`/candidato/${c.slug}`}
              title="Abrir perfil completo, com todas as evidências e fontes"
              className="min-w-0 transition-opacity hover:opacity-80"
            >
              <CandidateTag name={c.name} slot={SLOTS[i] ?? "a"} />
            </Link>
          ))}
          <div className="hidden sm:block" aria-hidden />
        </div>

        <div>
          {/* Projeto de país — pills únicos, texto integral no painel */}
          <MatrixRow label="Projeto de país" term="projeto de país" candidates={candidates}>
            {(c) => {
              const priorities = c.countryProject?.nationalPriorities ?? [];
              const sources = (c.countryProject?.sources ?? []).slice(0, 6);
              return priorities.length ? (
                <div className="flex flex-wrap gap-1 py-0.5">
                  {priorities.map((priority) => (
                    <Explainable
                      key={priority}
                      hint={`${shortTitle(squashed(priority), 130)}${squashed(priority).length > 130 ? "…" : ""}`}
                      className="my-px rounded-full border border-border px-2 py-0.5 text-[10px] leading-tight text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      content={() => ({
                        title: "Prioridade declarada",
                        subtitle: firstName(c),
                        blocks: [
                          { heading: "Texto no plano", body: squashed(priority) },
                          {
                            heading: "Como selecionamos",
                            body: "Prioridades transcritas do programa de governo registrado no TSE, na ordem do documento. O rótulo curto é só o cabeçalho do trecho — o texto acima é o integral.",
                          },
                        ],
                        sources,
                        link: planLink(c),
                      })}
                    >
                      {priorityLabel(priority)}
                    </Explainable>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Prioridades em consolidação.</span>
              );
            }}
          </MatrixRow>

          {/* Plano em números */}
          <div className="border-t border-border/70 pb-2">
            <SectionHead
              title="Plano em números"
              note={
                absentMetrics.length ? (
                  <span>
                    Não declarado por nenhum:{" "}
                    {absentMetrics.map((m, i) => (
                      <span key={m.key}>
                        {i > 0 ? " · " : null}
                        <GlossaryTerm term={m.label.toLowerCase()}>{m.label.toLowerCase()}</GlossaryTerm>
                      </span>
                    ))}
                  </span>
                ) : null
              }
            />
            {visibleMetrics.map((m) => (
              <MatrixRow key={m.key} label={m.label} term={m.label.toLowerCase()} candidates={candidates}>
                {(c, i) => (
                  <MetricBarCell
                    value={plans[i][m.key]}
                    total={plans[i].total}
                    candidate={c}
                    def={m}
                  />
                )}
              </MatrixRow>
            ))}
          </div>

          {/* Dependências declaradas — mesma grade das barras */}
          {visibleDependencies.length ? (
            <div className="border-t border-border/70 pb-2">
              <SectionHead title="Dependências declaradas" />
              {visibleDependencies.map((d) => (
                <MatrixRow key={d.key} label={d.label} term={d.term} candidates={candidates}>
                  {(c, i) => {
                    const list = plans[i].proposals.filter((p) => p[d.field]);
                    return (
                      <CountCell
                        value={list.length}
                        label={d.label}
                        hint={`${list.length} ${list.length === 1 ? "proposta declara" : "propostas declaram"} dependência de ${d.label.toLowerCase()}. Clique para a lista.`}
                        content={() => {
                          const entry = glossaryEntry(d.term);
                          return {
                            title: `Dependência de ${d.label.toLowerCase()} — ${firstName(c)}`,
                            subtitle: `${list.length} de ${plans[i].total} propostas do plano registrado`,
                            blocks: [
                              entry ? { body: entry.body ?? entry.short } : {},
                              {
                                heading: "Propostas que declaram",
                                items: list.length
                                  ? list.map((p) => ({
                                      label: shortTitle(p.title),
                                      text: "",
                                      note: requirementNote(p.reality),
                                    }))
                                  : [{ text: "Nenhuma proposta do plano declara esta dependência." }],
                              },
                              planBlock(c),
                            ],
                            sources: dedupeSources([planSourcesFor(c)], 6),
                            sourcesNote: "Fontes do plano de governo. Cada proposta cita as próprias fontes no painel dela.",
                            link: planLink(c),
                          };
                        }}
                      />
                    );
                  }}
                </MatrixRow>
              ))}
            </div>
          ) : null}

          {/* Base factual — linhas alinhadas com todo o resto */}
          <div className="border-t border-border/70 pb-2">
            <SectionHead title="Base factual publicada" />
            <MatrixRow label="Capacidades" term="capacidades" candidates={candidates}>
              {(c) => {
                const caps = c.capacities ?? [];
                const withEvidence = caps.filter((x) => x.evidences.length > 0).length;
                return (
                  <CountCell
                    value={`${withEvidence}/8`}
                    label="com evidências"
                    hint="Clique para ver as 8 capacidades, quantas evidências cada uma traz e as fontes."
                    content={() => ({
                      title: `Capacidades — ${firstName(c)}`,
                      subtitle: `${withEvidence} de 8 categorias com evidências documentadas`,
                      blocks: [
                        {
                          body: glossaryEntry("capacidades")?.body ?? "",
                        },
                        {
                          heading: "Evidências por capacidade",
                          items: caps.map((cap) => ({
                            label: cap.name,
                            text: `${cap.evidences.length} evidência(s) documentada(s)`,
                            note: cap.coverageNote ? shortTitle(cap.coverageNote, 110) : undefined,
                          })),
                        },
                      ],
                      sources: dedupeSources(caps.map((x) => x.evidences.flatMap((e) => e.sources ?? [])), 8),
                      sourcesNote: "Amostra das fontes das evidências; a lista completa está na seção Experiência demonstrada.",
                      link: { href: `/candidato/${c.slug}`, label: `Experiência demonstrada no perfil de ${firstName(c)}` },
                    })}
                  />
                );
              }}
            </MatrixRow>
            <MatrixRow label="Temas" term="temas" candidates={candidates}>
              {(c) => {
                const themes = c.themes ?? [];
                return (
                  <CountCell
                    value={`${themes.length}/10`}
                    label="temas fixos"
                    hint="Clique para ver os 10 temas e de onde vem cada posição: candidato, partido (rotulado) ou ausente."
                    content={() => ({
                      title: `Temas — ${firstName(c)}`,
                      subtitle: "Dez temas fixos, iguais para todos os candidatos",
                      blocks: [
                        { body: glossaryEntry("temas")?.body ?? "" },
                        {
                          heading: "Origem da posição, tema a tema",
                          items: themes.map((t) => ({
                            label: t.name,
                            text: THEME_SOURCE_LABELS[t.sourceKind],
                          })),
                        },
                      ],
                      sources: dedupeSources(themes.map((t) => t.sources), 8),
                      sourcesNote: "Amostra das fontes das posições; cada tema cita as próprias fontes no painel dele.",
                      link: { href: `/candidato/${c.slug}`, label: `Posições por tema no perfil de ${firstName(c)}` },
                    })}
                  />
                );
              }}
            </MatrixRow>
            <MatrixRow label="Testes de realidade" term="testes de realidade" candidates={candidates}>
              {(c) => {
                const caps = c.capacities ?? [];
                const proposals = c.governmentPlan?.proposals ?? [];
                const themes = c.themes ?? [];
                const units = [
                  { label: "Projeto de país", done: c.countryProject?.reality ? 1 : 0, total: 1 },
                  { label: "Brasil no mundo", done: c.foreignPolicy?.reality ? 1 : 0, total: 1 },
                  { label: "Capacidades", done: caps.filter((x) => x.reality).length, total: caps.length },
                  { label: "Propostas-chave", done: proposals.filter((p) => p.reality).length, total: proposals.length },
                  { label: "Temas", done: themes.filter((t) => t.reality).length, total: themes.length },
                ];
                const done = units.reduce((acc, u) => acc + u.done, 0);
                const total = units.reduce((acc, u) => acc + u.total, 0);
                return (
                  <CountCell
                    value={`${done}/${total}`}
                    label="unidades testadas"
                    hint="Clique para ver o que o teste confronta e a contagem por categoria."
                    content={() => ({
                      title: `Testes de realidade — ${firstName(c)}`,
                      subtitle: `${done} de ${total} unidades analisadas com teste`,
                      blocks: [
                        { body: glossaryEntry("testes de realidade")?.body ?? "" },
                        {
                          heading: "Contagem por categoria",
                          items: units.map((u) => ({ label: u.label, text: `${u.done}/${u.total} unidades` })),
                        },
                      ],
                      sources: dedupeSources(collectTensions(c).map((t) => t.sources), 8),
                      sourcesNote: "Amostra das fontes usadas nos testes; cada unidade cita as próprias no painel dela.",
                      link: { href: "/metodologia", label: "Como o teste de realidade é feito" },
                    })}
                  />
                );
              }}
            </MatrixRow>
            <MatrixRow label="Tensões documentadas" term="tensões documentadas" candidates={candidates}>
              {(c) => {
                const tensions = collectTensions(c);
                if (!tensions.length) {
                  return <span className="text-xs text-muted-foreground">Nenhuma tensão mapeada nas unidades analisadas.</span>;
                }
                const shown = tensions.slice(0, 20);
                return (
                  <CountCell
                    value={tensions.length}
                    label="tensões com fonte"
                    hint="Confrontos factuais entre a proposta e registros públicos, com fonte. Clique para a lista."
                    content={() => ({
                      title: `Tensões documentadas — ${firstName(c)}`,
                      subtitle: `${tensions.length} confrontos factuais com fonte`,
                      blocks: [
                        { body: glossaryEntry("tensões documentadas")?.body ?? "" },
                        {
                          heading: shown.length < tensions.length ? `Primeiras ${shown.length} de ${tensions.length}` : "Lista",
                          items: shown.map((t) => ({ label: TENSION_LABELS[t.kind], text: shortTitle(t.title) })),
                        },
                      ],
                      sources: dedupeSources(tensions.map((t) => t.sources), 8),
                      sourcesNote: "Amostra das fontes das tensões; cada tensão cita as próprias no painel da unidade.",
                      link: { href: `/candidato/${c.slug}`, label: `Ver unidades completas no perfil de ${firstName(c)}` },
                    })}
                  />
                );
              }}
            </MatrixRow>
            <MatrixRow label="Questões em aberto" term="questões em aberto" candidates={candidates}>
              {(c) => {
                const questions = collectOpenQuestions(c);
                if (!questions.length) {
                  return <span className="text-xs text-muted-foreground">Nenhuma questão em aberto mapeada.</span>;
                }
                const shown = questions.slice(0, 20);
                return (
                  <CountCell
                    value={questions.length}
                    label="perguntas sem resposta"
                    hint="O que os documentos não esclarecem, sempre como pergunta. Clique para a lista."
                    content={() => ({
                      title: `Questões em aberto — ${firstName(c)}`,
                      subtitle: `${questions.length} perguntas que os documentos não esclarecem`,
                      blocks: [
                        { body: glossaryEntry("questões em aberto")?.body ?? "" },
                        {
                          heading: shown.length < questions.length ? `Primeiras ${shown.length} de ${questions.length}` : "Lista",
                          items: shown.map((q) => ({ text: q.question, note: q.why })),
                        },
                      ],
                      link: { href: `/candidato/${c.slug}`, label: `Ver unidades completas no perfil de ${firstName(c)}` },
                    })}
                  />
                );
              }}
            </MatrixRow>
          </div>

          {/* Brasil no mundo — tags abrem o trecho do discurso + fontes */}
          <MatrixRow label="Brasil no mundo" term="brasil no mundo" candidates={candidates}>
            {(c) => {
              const tags = worldTags(c);
              const text = `${c.foreignPolicy?.worldView ?? ""} ${c.foreignPolicy?.strategy ?? ""}`;
              return tags.length ? (
                <div className="flex flex-wrap gap-1 py-0.5">
                  {tags.map((tag) => {
                    const [pattern] = WORLD_TERMS.find(([, label]) => label === tag) ?? [/[a-z]+/i];
                    return (
                      <Explainable
                        key={tag}
                        hint={`${tag}: trecho do discurso declarado. Clique para o texto e fontes.`}
                        className="my-px rounded-full border border-border px-2 py-0.5 text-[11px] leading-tight text-foreground/80 hover:border-foreground/30"
                        content={() => ({
                          title: `${tag} — ${firstName(c)}`,
                          subtitle: "Discurso declarado sobre relações exteriores",
                          blocks: [
                            { heading: "Trecho do plano", body: firstSentenceWith(text, pattern) },
                            {
                              body: "O discurso é confrontado com ações documentadas e a posição do governo atual na seção Brasil no mundo.",
                            },
                          ],
                          sources: (c.foreignPolicy?.sources ?? []).slice(0, 6),
                          link: { href: `/candidato/${c.slug}`, label: `Brasil no mundo no perfil de ${firstName(c)}` },
                        })}
                      >
                        {tag}
                      </Explainable>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Política externa em consolidação.</span>
              );
            }}
          </MatrixRow>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => document.getElementById("s-pais")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="inline-flex items-center gap-1.5 rounded border border-foreground px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
        >
          Explorar os detalhes
          <ArrowDown aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}
