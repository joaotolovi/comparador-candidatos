import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { CandidateAvatar } from "@/components/candidate-avatar";
import { getCandidateBySlug } from "@/lib/data";
import { formatPeriod, formatDate, yearsBetween } from "@/lib/format";
import { DIMENSIONS } from "@/types";
import {
  EvidenceBadge,
  ConfidenceBadge,
  LegalStatusBadge,
} from "@/components/badges";
import { SourceItem } from "@/components/evidence-drawer";
import { planStats } from "@/lib/comparison";
import { ProportionalBar } from "@/components/proportional-bar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ExperienceEntry, EducationEntry } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) return { title: "Candidato não encontrado" };
  return {
    title: candidate.name,
    description: candidate.tagline,
  };
}

export default async function CandidatePage({ params }: Props) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  const execYears = candidate.executiveExperience.reduce(
    (acc, e) => acc + yearsBetween(e.startDate, e.endDate),
    0,
  );
  const plan = candidate.governmentPlan;
  const pstats = planStats(plan);

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Voltar à comparação
        </Link>

        {/* Cabeçalho do perfil */}
        <header className="flex flex-col gap-6 border-b border-border pb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <CandidateAvatar
              name={candidate.name}
              slot="a"
              size="lg"
              photo={candidate.photo || undefined}
            />
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="tabular rounded bg-muted px-2 py-1 text-sm font-bold">
                  {String(candidate.ballotNumber).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {candidate.party}
                </span>
              </div>
              <h1 className="display-1 !text-4xl sm:!text-5xl">
                {candidate.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {candidate.tagline}
              </p>
              <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div>
                  <dt className="label-field">Idade</dt>
                  <dd className="tabular font-semibold">{candidate.age} anos</dd>
                </div>
                <div>
                  <dt className="label-field">Profissão</dt>
                  <dd className="font-semibold">{candidate.profession}</dd>
                </div>
                <div>
                  <dt className="label-field">Cargo atual</dt>
                  <dd className="font-semibold">{candidate.currentRole}</dd>
                </div>
                <div>
                  <dt className="label-field">Coligação</dt>
                  <dd className="font-semibold">{candidate.coalition}</dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        {/* Resumo numérico */}
        <section aria-labelledby="h-resumo" className="flex flex-col gap-4">
          <h2 id="h-resumo" className="display-2">
            Resumo
          </h2>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4">
            {candidate.metrics.slice(0, 8).map((m) => (
              <div key={m.id} className="flex flex-col gap-1 bg-card p-5">
                <span className="num-hero">
                  {m.displayValue}
                </span>
                <span className="label-field leading-snug">{m.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline de trajetória */}
        <section aria-labelledby="h-timeline" className="flex flex-col gap-4">
          <h2 id="h-timeline" className="display-2">
            Trajetória
          </h2>
          <ol className="flex flex-col">
            {[
              ...candidate.education.map((e) => ({
                period: e.conclusionYear ? String(e.conclusionYear) : "",
                role: `${e.field}${e.institution ? ` — ${e.institution}` : ""}`,
                org: "Formação",
                kind: "education" as const,
                entry: e,
              })),
              ...candidate.professionalExperience.map((e) => entry(e, "profissional")),
              ...candidate.politicalExperience.map((e) => entry(e, "política")),
              ...candidate.executiveExperience.map((e) => entry(e, "executiva")),
            ]
              .sort((a, b) => (a.period > b.period ? 1 : -1))
              .map((t, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[5.5rem_1fr] gap-x-5 border-l border-border py-4 pl-5 sm:grid-cols-[8rem_1fr]"
                  style={{ marginLeft: 0 }}
                >
                  <span className="tabular text-xs font-semibold text-muted-foreground">
                    {t.period}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{t.role}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.org}
                    </span>
                    {"description" in t.entry && t.entry.description ? (
                      <span className="mt-1 max-w-xl text-xs leading-relaxed text-foreground/75">
                        {t.entry.description}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
          </ol>
          {candidate.executiveExperience.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Soma em cargos executivos:{" "}
              <span className="tabular font-semibold text-foreground">
                {execYears.toLocaleString("pt-BR")} anos
              </span>
            </p>
          ) : null}
        </section>

        {/* Plano de governo */}
        <section aria-labelledby="h-plano" className="flex flex-col gap-4">
          <h2 id="h-plano" className="display-2">
            Plano de governo
          </h2>
          {plan.title ? (
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-base font-semibold">{plan.title}</span>
              {plan.planUrl ? (
                <a
                  href={plan.planUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  ver plano oficial ↗
                </a>
              ) : null}
            </p>
          ) : null}
          {plan.summary ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {plan.summary}
            </p>
          ) : null}
          {plan.notes ? (
            <p className="max-w-2xl rounded-md border border-dashed border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
              {plan.notes}
            </p>
          ) : null}
          {plan.proposals.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              Plano registrado: {plan.registeredWith}. Análise proposta a
              proposta ainda em andamento — os indicadores de detalhamento
              aparecerão aqui.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {plan.totalProposals > 0
                  ? `${plan.totalProposals.toLocaleString("pt-BR")} propostas registradas. `
                  : ""}
                Indicadores de detalhamento calculados sobre as{" "}
                <span className="tabular font-medium text-foreground">
                  {plan.proposals.length}
                </span>{" "}
                propostas analisadas:
              </p>
              <div className="grid gap-6 rounded-md border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
                {pstats.map((s) => (
                  <ProportionalBar
                    key={s.key}
                    percentage={s.percentage}
                    slot={0}
                    label={s.label}
                    count={s.count}
                    total={s.total}
                  />
                ))}
              </div>
              <ul className="flex flex-col divide-y divide-border/70 rounded-md border border-border">
                {plan.proposals.slice(0, 12).map((p) => (
                  <li key={p.id} className="flex flex-col gap-1.5 p-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {p.theme}
                    </span>
                    <span className="text-sm font-semibold">{p.title}</span>
                    <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
                      {p.description}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Integridade: categorias sempre explícitas */}
        <section aria-labelledby="h-integridade" className="flex flex-col gap-4">
          <h2 id="h-integridade" className="display-2">
            Integridade e histórico institucional
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Cada registro mantém sua categoria jurídica exata e seu status
            atual. Acusação não é condenação; absolvição e arquivamento são
            registrados com o mesmo destaque.
          </p>
          {candidate.institutionalHistory.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              Nenhum registro relevante localizado nas fontes consultadas até
              agora. Em análise.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/70 rounded-md border border-border">
              {candidate.institutionalHistory.map((r) => (
                <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-6">
                  <div className="flex shrink-0 flex-col gap-2">
                    <LegalStatusBadge status={r.legalStatus} />
                    <EvidenceBadge status={r.evidenceStatus} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-sm font-semibold">{r.title}</span>
                    <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
                      {r.description}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Instância: {r.instance} · Status:{" "}
                      {r.currentStatus === "em_andamento"
                        ? "em andamento"
                        : r.currentStatus}{" "}
                      · Última atualização: {formatDate(r.lastUpdate)}
                    </span>
                    {r.sources.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {r.sources.slice(0, 3).map((s) => (
                          <SourceItem key={s.id} source={s} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Fontes */}
        <section aria-labelledby="h-fontes" className="flex flex-col gap-4">
          <h2 id="h-fontes" className="display-2">
            Fontes
          </h2>
          {candidate.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Fontes detalhadas por afirmação estão disponíveis em cada
              indicador da comparação.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {candidate.sources.map((s) => (
                <SourceItem key={s.id} source={s} />
              ))}
            </div>
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Última atualização do perfil: {formatDate(candidate.updatedAt)}
        </p>
      </div>
    </Shell>
  );
}

type TimelineItem = {
  period: string;
  role: string;
  org: string;
  entry: ExperienceEntry | EducationEntry;
};

function entry(e: ExperienceEntry, kind: string): TimelineItem {
  return {
    period: formatPeriod(e.startDate, e.endDate),
    role: e.role,
    org: `${e.organization} · experiência ${kind}`,
    entry: e,
  };
}
