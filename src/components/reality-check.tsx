"use client";

// Camada analítica — TESTE DE REALIDADE. Na primeira leitura aparecem apenas
// sinais objetivos (caminho institucional, histórico relacionado, tensões e
// lacunas). O texto completo, justificativas e fontes abrem sob demanda.

import type { HistoryEntry, RealityCheck, Tension } from "@/types";
import { PATH_LABELS, TENSION_LABELS } from "@/types";
import { EvidenceBadge, ConfidenceBadge } from "@/components/badges";
import { SourcesInline } from "@/components/section-shell";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

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
      {req.note ? <p className="text-xs leading-relaxed text-muted-foreground">{req.note}</p> : null}
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
      <h4 className={FIELD}>Histórico relacionado</h4>
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
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className={FIELD}>Sustentação observável hoje</h4>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        {s.partySeats ? (
          <div className="rounded border border-border/70 p-2">
            <dt className="font-medium text-foreground">Partido</dt>
            <dd className="mt-0.5 text-muted-foreground">{s.partySeats}</dd>
          </div>
        ) : null}
        {s.coalitionSeats ? (
          <div className="rounded border border-border/70 p-2">
            <dt className="font-medium text-foreground">Coligação</dt>
            <dd className="mt-0.5 text-muted-foreground">{s.coalitionSeats}</dd>
          </div>
        ) : null}
        {s.federations ? (
          <div className="rounded border border-border/70 p-2">
            <dt className="font-medium text-foreground">Federação</dt>
            <dd className="mt-0.5 text-muted-foreground">{s.federations}</dd>
          </div>
        ) : null}
        <div className="rounded border border-border/70 p-2">
          <dt className="font-medium text-foreground">Acordos documentados</dt>
          <dd className="tabular mt-0.5 text-lg font-semibold leading-none text-foreground">
            {s.documentedAgreements}
          </dd>
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

function SignalPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
      <span className="tabular font-semibold text-foreground">{value}</span>
      {label}
    </span>
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
  const aligned = reality.history?.aligned?.length ?? 0;
  const divergent = reality.history?.divergent?.length ?? 0;
  const req = reality.requirement;

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
            {req ? <SignalPill label="caminho" value={PATH_LABELS[req.path]} /> : null}
            {aligned > 0 ? <SignalPill label="mesmo sentido" value={aligned} /> : null}
            {divergent > 0 ? <SignalPill label="sentido diferente" value={divergent} /> : null}
            {tensions.length > 0 ? <SignalPill label="tensões" value={tensions.length} /> : null}
            {open.length > 0 ? <SignalPill label="questões em aberto" value={open.length} /> : null}
            {reality.support?.documentedAgreements ? (
              <SignalPill label="acordos documentados" value={reality.support.documentedAgreements} />
            ) : null}
          </div>
        </summary>

        <div className="flex flex-col gap-4 border-t border-border/70 p-3">
          <div className="flex flex-col gap-1">
            <h4 className={FIELD}>O que está sendo confrontado</h4>
            <p className="text-sm leading-relaxed text-foreground/90">{reality.proposal}</p>
          </div>

          <RequirementLine reality={reality} />
          <HistoryLine reality={reality} />
          <SupportLine reality={reality} />

          {tensions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h4 className={FIELD}>Pontos de tensão ({tensions.length})</h4>
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
              <h4 className={FIELD}>Explicação apresentada pelo candidato</h4>
              <p className="border-l-2 border-border pl-2 text-xs leading-relaxed text-foreground/85">
                {reality.publicExplanation}
              </p>
            </div>
          ) : null}

          <details className="rounded border border-border/70 bg-background/40">
            <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
              Metodologia desta análise
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
