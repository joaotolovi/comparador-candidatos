import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/shell";
import { CandidateAvatar } from "@/components/candidate-avatar";
import { getCandidateBySlug } from "@/lib/data";
import { formatPeriod, formatDate, yearsBetween } from "@/lib/format";
import { sectionOfMetric } from "@/types";
import { SourceItem } from "@/components/evidence-drawer";
import { planStats } from "@/lib/comparison";
import { ProportionalBar } from "@/components/proportional-bar";
import { CountryProjectSection } from "@/components/country-project-section";
import { CapacitiesSection } from "@/components/capacities-section";
import { ViabilitySection } from "@/components/viability-section";
import { ProposalsSection } from "@/components/proposals-section";
import { ThemeSection } from "@/components/theme-section";
import { ForeignPolicySection } from "@/components/foreign-policy-section";
import { CoherenceSection } from "@/components/coherence-section";
import { IntegritySection } from "@/components/integrity-section";
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

  // V3: currículo, plano e opinião vivem em áreas próprias — nunca como prova
  // de capacidade. O nível principal é capacidade demonstrada + evidências.
  const metrCaminho = candidate.metrics.filter((m) => {
    const s = sectionOfMetric(m.id);
    return s === "caminho" || s === "viabilidade";
  });
  const metrOpiniao = candidate.metrics.filter((m) => sectionOfMetric(m.id) === "opiniao");
  const metrHistorico = candidate.metrics.filter((m) => sectionOfMetric(m.id) === "historico");
  const metrObjetivos = candidate.metrics.filter(
    (m) => sectionOfMetric(m.id) === "capacidades",
  );

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
              <h1 className="display-1 !text-4xl sm:!text-5xl">{candidate.name}</h1>
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

        {/* 1 — Projeto de país */}
        <section aria-labelledby="h-pais" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 2
            </span>
            <h2 id="h-pais" className="display-2">
              Para onde quer levar o Brasil?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Visão de país, prioridades declaradas e modelo de desenvolvimento,
              com a fonte original de cada afirmação.
            </p>
          </div>
          <CountryProjectSection candidates={[candidate]} hideTag />
        </section>

        {/* 2 — Capacidades demonstradas */}
        <section aria-labelledby="h-capacidades" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 5
            </span>
            <h2 id="h-capacidades" className="display-2">
              Que capacidades sua trajetória demonstra?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Cada capacidade traz evidências concretas — papel exercido,
              complexidade e resultado observado — e a fonte para conferir.
            </p>
          </div>
          <CapacitiesSection candidates={[candidate]} hideTag />

          {metrObjetivos.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border pt-6">
              <h3 className="text-base font-semibold leading-snug">
                Indicadores objetivos
              </h3>
              <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                Dados verificáveis que sustentam as evidências acima. São
                contexto comparável, não nota de capacidade.
              </p>
              <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {metrObjetivos.map((m) => (
                  <div key={m.id} className="flex flex-col gap-1 bg-card p-4">
                    <dt className="label-field leading-snug">{m.name}</dt>
                    <dd className="text-sm font-semibold leading-snug">{m.displayValue}</dd>
                    <dd className="text-xs leading-relaxed text-muted-foreground">
                      {m.methodology}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>

        {/* 3 — Brasil no mundo */}
        <section aria-labelledby="h-mundo" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 6
            </span>
            <h2 id="h-mundo" className="display-2">
              Como enxerga o Brasil no mundo?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Posições documentadas, estratégia, experiência internacional com
              peso proporcional à responsabilidade efetiva, e projeção — que é
              visibilidade, não capacidade diplomática.
            </p>
          </div>
          <ForeignPolicySection candidates={[candidate]} hideTag />
        </section>

        {/* 7 — Posições por grandes temas */}
        <section
          aria-labelledby="h-temas"
          className="flex flex-col gap-4 border-t border-border pt-10"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 7
            </span>
            <h2 id="h-temas" className="display-2">
              Posições por grandes temas
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Dez temas, o mesmo roteiro para todos. Cada célula diz de quem é a
              posição — do candidato ou do partido — e confronta a proposta com o
              histórico, o instrumento legal necessário e as evidências
              disponíveis. As fontes de cada tema abrem no clique.
            </p>
          </div>
          <ThemeSection candidates={[candidate]} hideTag />
        </section>

        {/* 8 — Histórico x proposta atual */}
        <section aria-labelledby="h-coerencia" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 8
            </span>
            <h2 id="h-coerencia" className="display-2">
              Histórico × proposta atual
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Posição, proposta e ato praticado aparecem rotulados e lado a lado
              ao longo do tempo — sem conclusão automática sobre coerência.
            </p>
          </div>
          <CoherenceSection candidates={[candidate]} hideTag />
        </section>

        {/* Área separada — Opinião pública */}
        {metrOpiniao.length > 0 ? (
          <section
            aria-labelledby="h-opiniao"
            className="flex flex-col gap-4 border-t border-border pt-10"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Área separada
              </span>
              <h2 id="h-opiniao" className="display-2">
                Opinião pública
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Pesquisas registradas, com instituto e data. Medem percepção
                eleitoral — não competência.
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
              {metrOpiniao.map((m) => (
                <div key={m.id} className="flex flex-col gap-1 bg-card p-5">
                  <dt className="label-field leading-snug">{m.name}</dt>
                  <dd className="text-sm font-semibold leading-snug">{m.displayValue}</dd>
                  <dd className="text-xs leading-relaxed text-muted-foreground">
                    {m.methodology}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* Área separada — Histórico e trajetória */}
        <section
          aria-labelledby="h-historico"
          className="flex flex-col gap-4 border-t border-border pt-10"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Área separada
            </span>
            <h2 id="h-historico" className="display-2">
              Histórico e trajetória
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Currículo, tempo de exercício, estrutura administrada e patrimônio.
              Estes números medem oportunidade institucional — servem de contexto,
              não de prova de capacidade.
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {metrHistorico.map((m) => (
              <div key={m.id} className="flex flex-col gap-1 bg-card p-4">
                <dt className="label-field leading-snug">{m.name}</dt>
                <dd className="text-sm font-semibold leading-snug">{m.displayValue}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-2 text-base font-semibold leading-snug">Trajetória</h3>
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
                    <span className="text-xs text-muted-foreground">{t.org}</span>
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
        <section aria-labelledby="h-plano" className="flex flex-col gap-4 border-t border-border pt-10">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 3
            </span>
            <h2 id="h-plano" className="display-2">
              Prioridades e propostas
            </h2>
          </div>
          {metrCaminho.length > 0 ? (
            <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {metrCaminho.map((m) => (
                <div key={m.id} className="flex flex-col gap-1 bg-card p-4">
                  <dt className="label-field leading-snug">{m.name}</dt>
                  <dd className="text-sm font-semibold leading-snug">{m.displayValue}</dd>
                </div>
              ))}
            </dl>
          ) : null}
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold leading-snug">
                    Propostas-chave, com teste de realidade
                  </h3>
                  <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                    Cada proposta confrontada com histórico, instrumento legal
                    necessário, sustentação observável e o que os documentos não
                    esclarecem. Quem conclui é quem lê.
                  </p>
                </div>
                <ProposalsSection candidates={[candidate]} hideTag />
              </div>
            </>
          )}
        </section>

        {/* 4 — Viabilidade e instrumentos */}
        <section
          aria-labelledby="h-viabilidade"
          className="flex flex-col gap-4 border-t border-border pt-10"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seção 4
            </span>
            <h2 id="h-viabilidade" className="display-2">
              Viabilidade e instrumentos
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Para cada proposta analisada, o que ela exige para sair do papel:
              ato do próprio Executivo, lei ordinária, lei complementar, emenda
              constitucional, estados, municípios, agentes privados. A lista é
              descritiva — quem mede viabilidade política é quem vota.
            </p>
          </div>
          <ViabilitySection candidates={[candidate]} hideTag />
        </section>

        {/* Área separada — Integridade */}
        <section
          aria-labelledby="h-integridade"
          className="flex flex-col gap-4 border-t border-border pt-10"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Área separada
            </span>
            <h2 id="h-integridade" className="display-2">
              Integridade e responsabilidade institucional
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Cada registro mantém sua categoria jurídica exata e seu status
              atual. Acusação não é condenação; absolvição e arquivamento têm o
              mesmo destaque.
            </p>
          </div>
          <IntegritySection candidates={[candidate]} hideTag />
        </section>

        {/* Fontes */}
        <section aria-labelledby="h-fontes" className="flex flex-col gap-4 border-t border-border pt-10">
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
