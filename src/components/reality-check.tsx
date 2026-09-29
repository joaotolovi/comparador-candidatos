"use client";

// Camada analítica (V4) — TESTE DE REALIDADE.
// Confronta a promessa com fatos observáveis: instrumento legal necessário,
// quórum, histórico relacionado, base institucional, tensões e o que os
// documentos não esclarecem. Ela NUNCA conclui qualidade, viabilidade ou
// intenção — quem conclui é o leitor.

import type { HistoryEntry, RealityCheck, Tension } from "@/types";
import { PATH_LABELS, TENSION_LABELS } from "@/types";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import { SourcesInline } from "@/components/section-shell";
import { cn } from "@/lib/utils";

const FIELD = "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

function RequirementLine({ reality }: { reality: RealityCheck }) {
  const req = reality.requirement;
  if (!req) return null;
  return (
    <div className="flex flex-col gap-1">
      <h4 className={FIELD}>Caminho institucional</h4>
      <p className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-semibold">
          {PATH_LABELS[req.path]}
        </span>
        {req.quorum ? (
          <span className="tabular text-xs text-muted-foreground">{req.quorum}</span>
        ) : null}
      </p>
      {req.note ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{req.note}</p>
      ) : null}
    </div>
  );
}

function HistoryItem({
  entry,
  label,
}: {
  entry: HistoryEntry;
  label: string;
}) {
  if (typeof entry === "string") {
    return (
      <li className="text-foreground/85">
        <span className="mr-1 font-semibold text-foreground">{label}</span>
        {entry}
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-0.5 text-foreground/85">
      <span>
        <span className="mr-1">{label}</span>
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
      <h4 className={FIELD}>Histórico relacionado</h4>
      <ul className="flex flex-col gap-1 text-xs leading-relaxed">
        {aligned.map((t, i) => (
          <HistoryItem key={`a-${i}-${typeof t === "string" ? t : t.fact}`} entry={t} label="Mesmo sentido:" />
        ))}
        {divergent.map((t, i) => (
          <HistoryItem key={`d-${i}-${typeof t === "string" ? t : t.fact}`} entry={t} label="Sentido diferente:" />
        ))}
        {h.noComparablePrecedent ? (
          <li className="text-muted-foreground">{h.noComparablePrecedent}</li>
        ) : null}
      </ul>
    </div>
  );
}

function SupportLine({ reality }: { reality: RealityCheck }) {
  const s = reality.support;
  if (!s) return null;
  return (
    <div className="flex flex-col gap-1">
      <h4 className={FIELD}>Sustentação observável hoje</h4>
      <dl className="grid gap-1 text-xs sm:grid-cols-2">
        {s.partySeats ? (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Partido:</dt>
            <dd className="text-muted-foreground">{s.partySeats}</dd>
          </div>
        ) : null}
        {s.coalitionSeats ? (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Coligação:</dt>
            <dd className="text-muted-foreground">{s.coalitionSeats}</dd>
          </div>
        ) : null}
        {s.federations ? (
          <div className="flex gap-1">
            <dt className="font-medium text-foreground">Federação:</dt>
            <dd className="text-muted-foreground">{s.federations}</dd>
          </div>
        ) : null}
        <div className="flex gap-1">
          <dt className="font-medium text-foreground">Acordos documentados:</dt>
          <dd className="tabular text-muted-foreground">{s.documentedAgreements}</dd>
        </div>
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">{s.note}</p>
    </div>
  );
}

function TensionCard({ tension }: { tension: Tension }) {
  return (
    <article className="flex flex-col gap-1.5 rounded-md border border-border bg-background/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {TENSION_LABELS[tension.kind]}
        </span>
        <EvidenceBadge status={tension.evidenceStatus} />
        <ConfidenceBadge level={tension.confidenceLevel} />
      </div>
      <p className="text-sm font-semibold leading-snug">{tension.title}</p>
      <p className="text-xs leading-relaxed text-foreground/80">{tension.detail}</p>
      <SourcesInline sources={tension.sources} />
    </article>
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
  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col gap-3 rounded-md border border-border bg-card/60 p-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold leading-snug">{title}</h3>
        <EvidenceBadge status={reality.evidenceStatus} />
        <ConfidenceBadge level={reality.confidenceLevel} />
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">{reality.proposal}</p>

      <RequirementLine reality={reality} />
      <HistoryLine reality={reality} />
      <SupportLine reality={reality} />

      {tensions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className={FIELD}>
            Pontos de tensão ({tensions.length})
          </h4>
          {tensions.map((t) => (
            <TensionCard key={`${t.kind}-${t.title}`} tension={t} />
          ))}
        </div>
      ) : null}

      {open.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <h4 className={FIELD}>O que falta explicar</h4>
          <ul className="flex flex-col gap-1.5 text-xs leading-relaxed">
            {open.map((q) => (
              <li key={q.question} className="text-foreground/85">
                <span className="font-medium text-foreground">{q.question}</span>
                {q.why ? <span className="text-muted-foreground"> {q.why}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {reality.publicExplanation ? (
        <div className="flex flex-col gap-1">
          <h4 className={FIELD}>Explicação apresentada pelo candidato</h4>
          <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-foreground/85">
            {reality.publicExplanation}
          </p>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-muted-foreground">{reality.methodology}</p>
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
