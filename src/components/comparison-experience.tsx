"use client";

// Orquestrador da comparação: estado de seleção vive na URL (?c=slug,slug[,slug])
// — deep-linkável. Sticky header colapsa ao rolar. Dois modos de diferença:
// "destacar" (diminui iguais) e "somente" (oculta linhas equivalentes).

import { useEffect, useMemo, useState } from "react";
import type { Candidate } from "@/types";
import { buildRows, keyDifferences } from "@/lib/data";
import { ComparisonHeader } from "@/components/comparison-header";
import { ComparisonSection } from "@/components/comparison-section";
import { ComparisonSummary } from "@/components/comparison-summary";
import { Accordion } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { DIMENSIONS, type DimensionSlug } from "@/types";
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

  const byDim = useMemo(() => {
    const map = new Map<DimensionSlug, typeof rows>();
    for (const slug of DIMENSIONS.map((d) => d.slug)) {
      const rs = rows.filter((r) => r.category === slug);
      if (rs.length > 0) map.set(slug, rs);
    }
    return map;
  }, [rows]);

  const candLite = candidates.map((c) => ({ name: c.name, slug: c.slug }));

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

      {/* §9 — Resumo principal: 5 blocos + diferenças + Ver detalhes */}
      <ComparisonSummary
        candidates={candidates}
        rows={rows}
        differences={diffs}
      />

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

      {/* Comparação completa por dimensão */}
      <section
        aria-labelledby="h-complete"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h2 id="h-complete" className="display-2">
            Comparação completa
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Cinco dimensões, mesmos critérios para todos, com metodologia e
            fonte em cada número.
          </p>
        </div>
        <Accordion type="multiple" defaultValue={["capacidade-execucao"]}>
          {[...byDim.entries()].map(([slug, rs]) => (
            <ComparisonSection
              key={slug}
              slug={slug}
              rows={rs}
              candidates={candLite}
              highlightDifferences={highlight}
              onlyDifferences={only}
            />
          ))}
        </Accordion>
      </section>
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
