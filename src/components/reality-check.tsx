"use client";

// Camada analítica — TESTE DE REALIDADE. Na primeira leitura aparecem apenas
// sinais objetivos (caminho institucional, histórico relacionado, tensões e
// lacunas). O texto completo, justificativas e fontes abrem sob demanda.
//
// Tudo aqui é explicável: cada pill de sinal abre painel lateral com a lista
// por item (com fonte quando existe); cada rótulo de campo tem tooltip curto
// no hover e definição no clique.

import type { HistoryEntry, RealityCheck, Source, Tension } from "@/types";
import { PATH_LABELS, TENSION_LABELS } from "@/types";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import { SourcesInline } from "@/components/section-shell";
import { Explainable, GlossaryTerm, TermChip, type ExplainerContent } from "@/components/explainer";
import { glossaryFor } from "@/lib/glossary";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

/** Instrumento (taxonomia) → termo do glossário com a definição. */
const PATH_TERM: Record<string, string> = {
  "ato-executivo": "ato do executivo",
  "lei-ordinaria": "lei ordinária",
  "lei-complementar": "lei complementar",
  pec: "pec",
  "depende-estados": "estados",
  "depende-municipios": "municípios",
  "depende-privado": "agentes privados",
  "negociacao-internacional": "negociação internacional",
  indefinido: "instrumento não declarado",
};

function entryText(entry: HistoryEntry) {
  if (typeof entry === "string") return entry;
  return `${entry.date ? `${entry.date} — ` : ""}${entry.fact}`;
}

function entrySources(entry: HistoryEntry): Source[] {
  return typeof entry === "string" ? [] : (entry.sources ?? []);
}

function collectSources(pools: Array<Source[] | undefined>, cap = 8): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const pool of pools) {
    for (const s of pool ?? []) {
      const key = s.url || s.title || JSON.stringify(s).slice(0, 64);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
      if (out.length >= cap) return out;
    }
  }
  return out;
}

function RequirementLine({ reality }: { reality: RealityCheck }) {
  const req = reality.requirement;
  if (!req) return null;
  const noteText = Array.isArray(req.note) ? req.note.join(" ") : req.note;
  return (
    <div className="flex flex-col gap-1">
      <h4 className={FIELD}>
        <GlossaryTerm term="caminho institucional">Caminho institucional</GlossaryTerm>
      </h4>
      <p className="flex flex-wrap items-center gap-2">
        <TermChip
          term={PATH_TERM[req.path] ?? "instrumento não declarado"}
          className="border-border bg-muted px-2 py-0.5 text-xs font-semibold"
          content={{
            title: PATH_LABELS[req.path],
            blocks: [
              { body: glossaryFor(PATH_TERM[req.path] ?? "")?.body ?? "" },
              ...(req.quorum ? [{ heading: "Quórum", body: req.quorum }] : []),
              ...(noteText ? [{ heading: "Observação do instrumento", body: noteText }] : []),
            ],
            link: { href: "/metodologia", label: "Como identificamos o instrumento" },
          }}
        >
          {PATH_LABELS[req.path]}
        </TermChip>
        {req.quorum ? (
          <span className="tabular text-xs text-muted-foreground">{req.quorum}</span>
        ) : null}
      </p>
      {noteText ? <p className="text-xs leading-relaxed text-muted-foreground">{noteText}</p> : null}
    </div>
  );
}

function HistoryItem({ entry, label }: { entry: HistoryEntry; label: string }) {
  if (typeof entry === "string") {
    return (
      <li className="text-foreground/85">
        <span className="mr-1 font-semibold text-foreground">{label}</span>
        {entry}
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-1 text-foreground/85">
      <span>
        <span className="mr-1 font-semibold text-foreground">{label}</span>
        {entry.date ? <span className="tabular mr-1 text-muted-foreground">{entry.date}</span> : null}
        {entry.fact}
      </span>
      {entry.sources?.length ? <SourcesInline sources={entry.sources} /> : null}
    </li>
  );
}

function HistoryLine({ reality }: { reality: RealityCheck }) {
  const h = reality.history;
  if (!h) return null;
  const aligned = h.aligned ?? [];
  const divergent = h.divergent ?? [];
  if (aligned.length === 0 && divergent.length === 0 && !h.noComparablePrecedent) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className={FIELD}>
        <GlossaryTerm term="histórico relacionado">Histórico relacionado</GlossaryTerm>
      </h4>
      <ul className="flex flex-col gap-2 text-xs leading-relaxed">
        {aligned.map((t, i) => (
          <HistoryItem key={`a-${i}-${typeof t === "string" ? t : t.fact}`} entry={t} label="Mesmo sentido:" />
        ))}
        {divergent.map((t, i) => (
          <HistoryItem key={`d-${i}-${typeof t === "string" ? t : t.fact}`} entry={t} label="Sentido diferente:" />
        ))}
        {h.noComparablePrecedent ? <li className="text-muted-foreground">{h.noComparablePrecedent}</li> : null}
      </ul>
    </div>
  );
}

function SupportLine({ reality }: { reality: RealityCheck }) {
  const s = reality.support;
  if (!s) return null;
  /** Bancadas podem ser texto único ou lista — lista vira "a, b, c". */
  const norm = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v.join(", ") : v;
  const rows: Array<[string, string | undefined, string]> = [
    ["Partido", norm(s.partySeats), "sustentação observável hoje"],
    ["Coligação", norm(s.coalitionSeats), "sustentação observável hoje"],
    ["Federação", norm(s.federations), "sustentação observável hoje"],
    ["Acordos documentados", String(s.documentedAgreements), "acordos documentados"],
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className={FIELD}>
        <GlossaryTerm term="sustentação observável hoje">Sustentação observável hoje</GlossaryTerm>
      </h4>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        {rows
          .filter(([, value]) => value !== undefined && value !== "undefined")
          .map(([label, value, term]) => (
            <div key={label} className="rounded border border-border/70 p-2">
              <dt className="font-medium text-foreground">{label}</dt>
              <dd className="mt-0.5 text-muted-foreground">
                <Explainable
                  hint={glossaryFor(term)?.short}
                  content={{
                    title: label,
                    blocks: [
                      { body: glossaryFor(term)?.body ?? "" },
                      ...(s.note ? [{ heading: "Observação", body: s.note }] : []),
                    ],
                    link: { href: "/metodologia", label: "Como medimos sustentação" },
                  }}
                >
                  {value}
                </Explainable>
              </dd>
            </div>
          ))}
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">{s.note}</p>
    </div>
  );
}

function TensionCard({ tension }: { tension: Tension }) {
  return (
    <article className="flex flex-col gap-1.5 rounded-md border border-border bg-background/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <TermChip
          term={TENSION_LABELS[tension.kind]}
          className="border px-1.5 py-0.5 text-[10px] font-semibold uppercase"
          content={{
            title: TENSION_LABELS[tension.kind],
            blocks: [
              {
                body:
                  tension.kind === "mudanca-de-posicao"
                    ? "A posição declarada hoje difere de posição sustentada no passado — as duas com fonte."
                    : tension.kind === "acao-em-sentido-diferente"
                      ? "Há ato praticado no passado em direção contrária à proposta atual — com fonte."
                      : tension.kind === "proposta-sem-precedente"
                        ? "A proposta não tem precedente comparable na trajetória nem na área."
                        : tension.kind === "proposta-x-restricao-institucional"
                          ? "A proposta esbarra em regra institucional que exige mudança prévia — identificada com fonte."
                          : "A proposta contradiz outra proposta do próprio candidato no mesmo plano — as duas com fonte.",
              },
            ],
          }}
        >
          {TENSION_LABELS[tension.kind]}
        </TermChip>
        <EvidenceBadge status={tension.evidenceStatus} />
        <ConfidenceBadge level={tension.confidenceLevel} />
      </div>
      <p className="text-sm font-semibold leading-snug">{tension.title}</p>
      <p className="text-xs leading-relaxed text-foreground/80">{tension.detail}</p>
      <SourcesInline sources={tension.sources} />
    </article>
  );
}

/** Pill de sinal — clicável: abre a lista por item com fontes. */
function SignalPill({
  label,
  value,
  hint,
  content,
}: {
  label: string;
  value: string | number;
  hint: string;
  content: ExplainerContent;
}) {
  return (
    <Explainable
      hint={hint}
      content={content}
      className="my-px inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground hover:border-foreground/30"
    >
      <span className="tabular font-semibold text-foreground">{value}</span>
      {label}
    </Explainable>
  );
}

export function RealityBlock({
  reality,
  title = "Teste de realidade",
  className,
}: {
  reality?: RealityCheck;
  title?: string;
  className?: string;
}) {
  if (!reality) return null;

  const tensions = reality.tensions ?? [];
  const open = reality.openQuestions ?? [];
  const aligned = reality.history?.aligned ?? [];
  const divergent = reality.history?.divergent ?? [];
  const req = reality.requirement;
  const reqNote = req ? (Array.isArray(req.note) ? req.note.join(" ") : req.note) : undefined;

  const pathContent: ExplainerContent | null = req
    ? {
        title: PATH_LABELS[req.path],
        blocks: [
          { body: glossaryFor(PATH_TERM[req.path] ?? "")?.body ?? "" },
          ...(req.quorum ? [{ heading: "Quórum", body: req.quorum }] : []),
          ...(reqNote ? [{ heading: "Observação do instrumento", body: reqNote }] : []),
        ],
        link: { href: "/metodologia", label: "Como identificamos o instrumento" },
      }
    : null;

  const historyContent = (entries: HistoryEntry[], sense: "mesmo sentido" | "sentido diferente"): ExplainerContent => ({
    title: `${entries.length} registro(s) de ${sense}`,
    blocks: [
      { body: glossaryFor(sense)?.body ?? "" },
      { heading: "Registros", items: entries.map((e) => ({ text: entryText(e) })) },
    ],
    sources: collectSources(entries.map(entrySources)),
    sourcesNote: "Fontes dos registros listados; a cronologia completa está no bloco Histórico relacionado.",
  });

  const tensionContent: ExplainerContent = {
    title: `${tensions.length} tensões documentadas`,
    blocks: [
      { body: glossaryFor("tensões documentadas")?.body ?? "" },
      {
        heading: "Tensões desta unidade",
        items: tensions.map((t) => ({ label: TENSION_LABELS[t.kind], text: t.title })),
      },
    ],
    sources: collectSources(tensions.map((t) => t.sources)),
    sourcesNote: "Fontes das tensões; o detalhe de cada uma está no bloco Pontos de tensão.",
  };

  const openContent: ExplainerContent = {
    title: `${open.length} questões em aberto`,
    blocks: [
      { body: glossaryFor("questões em aberto")?.body ?? "" },
      {
        heading: "Perguntas",
        items: open.map((q) => ({ text: q.question, note: q.why })),
      },
    ],
  };

  const agreementsContent: ExplainerContent | null = reality.support?.documentedAgreements
    ? {
        title: `${reality.support.documentedAgreements} acordos documentados`,
        blocks: [
          { body: glossaryFor("acordos documentados")?.body ?? "" },
          ...(reality.support.note
            ? [{ heading: "Observação", body: reality.support.note }]
            : []),
        ],
        link: { href: "/metodologia", label: "Como medimos sustentação" },
      }
    : null;

  return (
    <section aria-label={title} className={cn("rounded-md border border-border bg-card/60", className)}>
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-col gap-3 p-3 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold leading-snug">{title}</h3>
              <EvidenceBadge status={reality.evidenceStatus} />
              <ConfidenceBadge level={reality.confidenceLevel} />
            </div>
            <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {pathContent ? (
              <SignalPill
                label="caminho"
                value={PATH_LABELS[req!.path]}
                hint="Instrumento legal necessário. Clique para definição e quórum."
                content={pathContent}
              />
            ) : null}
            {aligned.length > 0 ? (
              <SignalPill
                label="mesmo sentido"
                value={aligned.length}
                hint="Registros passados na mesma direção. Clique para a lista com datas e fontes."
                content={historyContent(aligned, "mesmo sentido")}
              />
            ) : null}
            {divergent.length > 0 ? (
              <SignalPill
                label="sentido diferente"
                value={divergent.length}
                hint="Registros passados em direção contrária. Clique para a lista com datas e fontes."
                content={historyContent(divergent, "sentido diferente")}
              />
            ) : null}
            {tensions.length > 0 ? (
              <SignalPill
                label="tensões"
                value={tensions.length}
                hint="Confrontos factuais com fonte. Clique para a lista."
                content={tensionContent}
              />
            ) : null}
            {open.length > 0 ? (
              <SignalPill
                label="questões em aberto"
                value={open.length}
                hint="Perguntas que os documentos não respondem. Clique para a lista."
                content={openContent}
              />
            ) : null}
            {agreementsContent ? (
              <SignalPill
                label="acordos documentados"
                value={reality.support!.documentedAgreements}
                hint="Acordos efetivados na trajetória — retrato atual, não previsão. Clique para detalhe."
                content={agreementsContent}
              />
            ) : null}
          </div>
        </summary>

        <div className="flex flex-col gap-4 border-t border-border/70 p-3">
          <div className="flex flex-col gap-1">
            <h4 className={FIELD}>
              <GlossaryTerm term="o que está sendo confrontado">O que está sendo confrontado</GlossaryTerm>
            </h4>
            <p className="text-sm leading-relaxed text-foreground/90">{reality.proposal}</p>
          </div>

          <RequirementLine reality={reality} />
          <HistoryLine reality={reality} />
          <SupportLine reality={reality} />

          {tensions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h4 className={FIELD}>
                <GlossaryTerm term="pontos de tensão">Pontos de tensão ({tensions.length})</GlossaryTerm>
              </h4>
              {tensions.map((t) => (
                <TensionCard key={`${t.kind}-${t.title}`} tension={t} />
              ))}
            </div>
          ) : null}

          {open.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <h4 className={FIELD}>
                <GlossaryTerm term="o que falta explicar">O que falta explicar</GlossaryTerm>
              </h4>
              <ul className="flex flex-col gap-1.5 text-xs leading-relaxed">
                {open.map((q) => (
                  <li key={q.question} className="rounded border border-border/70 bg-background/40 p-2 text-foreground/85">
                    <span className="font-medium text-foreground">{q.question}</span>
                    {q.why ? <span className="text-muted-foreground"> {q.why}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {reality.publicExplanation ? (
            <div className="flex flex-col gap-1">
              <h4 className={FIELD}>
                <GlossaryTerm term="explicação apresentada pelo candidato">
                  Explicação apresentada pelo candidato
                </GlossaryTerm>
              </h4>
              <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-foreground/85">
                {reality.publicExplanation}
              </p>
            </div>
          ) : null}

          <details className="rounded border border-border/70 bg-background/40">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
              <span title={glossaryFor("metodologia desta análise")?.short}>Metodologia desta análise</span>
            </summary>
            <p className="border-t border-border/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {reality.methodology}
            </p>
          </details>
        </div>
      </details>
    </section>
  );
}

/** Sem dados ainda: diz o que falta, sem preencher por inferência. */
export function RealityMissing({
  what = "Teste de realidade em consolidação",
  why,
}: {
  what?: string;
  why?: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card/40 p-3">
      <p className="text-xs font-medium text-foreground">{what}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
        {why ??
          "O confronto entre proposta, histórico, instrumento legal e base institucional entra quando a apuração de fontes estiver concluída — nada é preenchido por inferência."}
      </p>
    </div>
  );
}
