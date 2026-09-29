"use client";

// Orquestrador da comparação: estado de seleção vive na URL (?c=slug,slug[,slug])
// — deep-linkável. Sticky header colapsa ao rolar. Dois modos de diferença:
// "destacar" (diminui iguais) e "somente" (oculta linhas equivalentes).
//
// V4 — analítico. A ordem da tela segue as 12 seções do blueprint:
// 01 resumo · 02 projeto de país · 03 prioridades e propostas · 04 viabilidade e
// instrumentos · 05 experiência demonstrada · 06 Brasil no mundo · 07 posições por
// grandes temas · 08 histórico × proposta · 09 situação institucional e jurídica ·
// 10 opinião pública · 11 trajetória · 12 fontes. Cada assunto carrega o seu
// teste de realidade — não existe "seção da nossa análise".

import { useEffect, useMemo, useState } from "react";
import type { Candidate, SectionSlug } from "@/types";
import { SECTIONS } from "@/types";
import { buildRows, keyDifferences, type MetricRow } from "@/lib/data";
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

  // Cabeçalho compacto sticky ao rolar (§16)
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const rows = useMemo(() => buildRows(candidates), [candidates]);
  const diffs = useMemo(
    () => keyDifferences(rows, candidates),
    [rows, candidates],
  );

  /** Linhas de dados agrupadas pela seção a que pertencem. */
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

  // Numeração: o resumo é a seção 01, então as seções do corpo começam em 02.
  // Currículo, opinião e integridade aparecem como áreas separadas.
  let mainCount = 1;
  const sectionLabels = SECTIONS.map((s) => {
    if (!s.secondary) mainCount += 1;
    return s.secondary ? "Área separada" : `Seção ${mainCount}`;
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
              <div className="flex flex-col gap-3 border-t border-border pt-6">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold leading-snug">
                    O que o documento informa por proposta
                  </h3>
                  <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                    Custo, prazo e dependência do Congresso contam o que o plano
                    declara — não são nota de viabilidade. O caminho institucional
                    de cada proposta aparece no painel acima.
                  </p>
                </div>
                <div className="flex flex-col divide-y divide-border/70 border-t border-border">
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
              </div>
            ) : null}
          </div>
        );
      case "capacidades":
        return (
          <div className="flex flex-col gap-8">
            <CapacitiesSection candidates={candidates} />
            {secRows.length > 0 ? (
              <div className="flex flex-col gap-3 border-t border-border pt-6">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-semibold leading-snug">
                    Governabilidade institucional
                  </h3>
                  <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                    Dados verificáveis que sustentam a leitura acima — coligação
                    registrada, votos válidos e base no Legislativo. São contexto
                    comparável, não nota de capacidade. A base formal mede o
                    retrato de hoje, não o resultado de uma eleição futura.
                  </p>
                </div>
                <div className="flex flex-col divide-y divide-border/70 border-t border-border">
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
              </div>
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
            subtitle="Cargos, tempo, orçamento, equipe e patrimônio — percurso, não capacidade"
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
      {/* Sticky compacto: aparece quando o cabeçalho sai da tela */}
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

      {/* Cabeçalho de comparação */}
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

      {/* Seção 01 — resumo curto: o que salta aos olhos, em linhas */}
      <ComparisonSummary candidates={candidates} differences={diffs} />

      {/* Controles de diferença */}
      <section
        aria-label="Modos de exibição de diferenças"
        className="flex flex-col gap-3 border-y border-border py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-6"
      >
        <div className="flex items-center gap-3">
          <Switch
            id="highlight"
            checked={highlight}
            onCheckedChange={setHighlight}
          />
          <label
            htmlFor="highlight"
            className="cursor-pointer text-sm font-medium"
          >
            Destacar diferenças
          </label>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="only" checked={only} onCheckedChange={setOnly} />
          <label htmlFor="only" className="cursor-pointer text-sm font-medium">
            Mostrar somente diferenças
          </label>
        </div>
      </section>

      {/* Seções 02 a 11, na ordem do blueprint */}
      <div className="flex flex-col gap-12">
        {SECTIONS.map((s, i) => {
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
