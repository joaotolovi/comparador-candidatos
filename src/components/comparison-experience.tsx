"use client";

// Orquestrador da comparação. A página segue uma pirâmide de informação:
// 01 síntese visual -> projeto/plano/capacidades -> posições e coerência -> áreas
// de consulta. O conteúdo mais importante vem antes; currículo e opinião ficam no fim.

import { useEffect, useMemo, useState } from "react";
import type { Candidate, SectionSlug } from "@/types";
import { SECTIONS } from "@/types";
import { buildRows, type MetricRow } from "@/lib/data";
import { ComparisonHeader } from "@/components/comparison-header";
import { ComparisonRow } from "@/components/comparison-row";
import { ComparisonSummary } from "@/components/comparison-summary";
import { Switch } from "@/components/ui/switch";
import { SectionShell } from "@/components/section-shell";
import { CountryProjectSection } from "@/components/country-project-section";
import { CapacitiesSection } from "@/components/capacities-section";
import { ViabilitySection } from "@/components/viability-section";
import { ThemeSection } from "@/components/theme-section";
import { ForeignPolicySection } from "@/components/foreign-policy-section";
import { CoherenceSection } from "@/components/coherence-section";
import { IntegritySection } from "@/components/integrity-section";
import { MetricsBlock } from "@/components/metrics-block";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SECTION_RANK: Record<SectionSlug, number> = {
  pais: 1,
  caminho: 2,
  viabilidade: 3,
  capacidades: 4,
  mundo: 5,
  temas: 6,
  coerencia: 7,
  integridade: 8,
  opiniao: 9,
  historico: 10,
};

export function ComparisonExperience({
  candidates,
  allCandidates,
}: {
  candidates: Candidate[];
  allCandidates: Candidate[];
}) {
  const [highlight, setHighlight] = useState(true);
  const [only, setOnly] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const rows = useMemo(() => buildRows(candidates), [candidates]);
  const orderedSections = useMemo(
    () => [...SECTIONS].sort((a, b) => SECTION_RANK[a.slug] - SECTION_RANK[b.slug]),
    [],
  );

  const rowsBySection = useMemo(() => {
    const map = new Map<SectionSlug, MetricRow[]>();
    for (const r of rows) {
      const arr = map.get(r.section);
      if (arr) arr.push(r);
      else map.set(r.section, [r]);
    }
    return map;
  }, [rows]);

  const candLite = candidates.map((c) => ({ name: c.name, slug: c.slug }));

  let mainCount = 1;
  const sectionLabels = orderedSections.map((s) => {
    if (!s.secondary) mainCount += 1;
    return s.secondary ? "Área de consulta" : `Seção ${mainCount}`;
  });

  function sectionBody(slug: SectionSlug, secRows: MetricRow[]) {
    switch (slug) {
      case "pais":
        return <CountryProjectSection candidates={candidates} />;
      case "caminho":
        return (
          <MetricsBlock
            id="s-caminho-plano"
            index=""
            title="Estrutura das propostas"
            question=""
            rows={secRows}
            candidates={candLite}
            highlightDifferences={highlight}
            onlyDifferences={only}
            bare
            subtitle="O que o plano informa por proposta"
          />
        );
      case "viabilidade":
        return (
          <div className="flex flex-col gap-8">
            <ViabilitySection candidates={candidates} />
            {secRows.length > 0 ? (
              <details className="rounded-md border border-border/70">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  Ver métricas brutas do plano
                </summary>
                <div className="flex flex-col divide-y divide-border/70 border-t border-border px-4">
                  {secRows.map((r) => (
                    <ComparisonRow
                      key={r.metricId}
                      label={r.name}
                      methodology={r.methodology}
                      values={r.values}
                      candidates={candLite}
                      deltaDisplay={r.delta?.display}
                      equal={r.equal}
                      highlightDifferences={highlight}
                      onlyDifferences={only}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        );
      case "capacidades":
        return (
          <div className="flex flex-col gap-8">
            <CapacitiesSection candidates={candidates} />
            {secRows.length > 0 ? (
              <details className="rounded-md border border-border/70">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  Ver contexto institucional e métricas brutas
                </summary>
                <div className="flex flex-col divide-y divide-border/70 border-t border-border px-4">
                  {secRows.map((r) => (
                    <ComparisonRow
                      key={r.metricId}
                      label={r.name}
                      methodology={r.methodology}
                      values={r.values}
                      candidates={candLite}
                      deltaDisplay={r.delta?.display}
                      equal={r.equal}
                      highlightDifferences={highlight}
                      onlyDifferences={only}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        );
      case "mundo":
        return <ForeignPolicySection candidates={candidates} />;
      case "temas":
        return <ThemeSection candidates={candidates} />;
      case "coerencia":
        return <CoherenceSection candidates={candidates} />;
      case "opiniao":
        return (
          <MetricsBlock
            id="s-opiniao-rows"
            index=""
            title="Pesquisas registradas"
            question=""
            rows={secRows}
            candidates={candLite}
            highlightDifferences={highlight}
            onlyDifferences={only}
            bare
            subtitle="Instituto e data em cada linha — pesquisa de opinião não mede competência"
          />
        );
      case "historico":
        return (
          <MetricsBlock
            id="s-historico-rows"
            index=""
            title="Currículo e percurso"
            question=""
            rows={secRows}
            candidates={candLite}
            highlightDifferences={highlight}
            onlyDifferences={only}
            bare
            subtitle="Cargos, tempo, orçamento, equipe e patrimônio — contexto de trajetória"
          />
        );
      case "integridade":
        return <IntegritySection candidates={candidates} />;
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {stuck ? (
        <div
          className="sticky top-0 z-40 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:-mx-6 sm:px-6"
          aria-label="Cabeçalho fixo da comparação"
        >
          <ComparisonHeader
            candidates={candidates}
            allCandidates={allCandidates}
            compact
            onSwap={(i, slug) => swapCandidate(i, slug)}
            onRemove={(i) => removeCandidate(i)}
          />
        </div>
      ) : null}

      <section aria-label="Cabeçalho da comparação" className="flex flex-col gap-3">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Todos os candidatos
        </Link>
        <ComparisonHeader
          candidates={candidates}
          allCandidates={allCandidates}
          onSwap={(i, slug) => swapCandidate(i, slug)}
          onRemove={(i) => removeCandidate(i)}
        />
      </section>

      <ComparisonSummary candidates={candidates} />

      <section
        aria-label="Modos de exibição de diferenças"
        className="flex flex-col gap-3 border-y border-border py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6"
      >
        <div className="flex items-center gap-3">
          <Switch id="highlight" checked={highlight} onCheckedChange={setHighlight} />
          <label htmlFor="highlight" className="cursor-pointer text-sm font-medium">
            Destacar valores diferentes
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="only" checked={only} onCheckedChange={setOnly} />
          <label htmlFor="only" className="cursor-pointer text-sm font-medium">
            Mostrar somente valores diferentes
          </label>
        </div>
      </section>

      <div className="flex flex-col gap-12">
        {orderedSections.map((s, i) => {
          const secRows = rowsBySection.get(s.slug) ?? [];
          if (s.kind === "metrics" && secRows.length === 0) return null;
          return (
            <SectionShell
              key={s.slug}
              id={`s-${s.slug}`}
              index={sectionLabels[i]}
              title={s.name}
              question={s.question}
              secondary={s.secondary}
            >
              {sectionBody(s.slug, secRows)}
            </SectionShell>
          );
        })}
      </div>
    </div>
  );

  function swapCandidate(slotIndex: number, slug: string) {
    const params = new URLSearchParams(window.location.search);
    const current = (params.get("c") ?? "").split(",").filter(Boolean);
    if (current.length === 0) {
      window.location.href = `/comparar?c=${slug}`;
      return;
    }
    current[slotIndex] = slug;
    params.set("c", current.join(","));
    window.location.search = params.toString();
  }

  function removeCandidate(slotIndex: number) {
    const params = new URLSearchParams(window.location.search);
    const current = (params.get("c") ?? "").split(",").filter(Boolean);
    current.splice(slotIndex, 1);
    if (current.length === 0) {
      window.location.href = "/";
      return;
    }
    params.set("c", current.join(","));
    window.location.search = params.toString();
  }
}
