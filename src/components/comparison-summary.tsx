"use client";

// Seção 01 — RESUMO. Cinco blocos de síntese (projeto, prioridades, estratégia
// econômica, como pretende governar, Brasil no mundo) e a cobertura documental.
// Currículo, plano detalhado, opinião pública e processos NUNCA entram aqui —
// vivem nas áreas próprias. Volume de documentos não é mérito: o que aparece é
// cobertura ("o que está documentado"), nunca nota de capacidade.

import type { Candidate } from "@/types";
import type { KeyDifference } from "@/lib/data";
import { SECTION_OF_METRIC } from "@/types";
import { DifferenceSummary } from "@/components/difference-summary";
import { SLOTS } from "@/components/section-shell";
import { SLOT } from "@/components/slot";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";

/** Corta texto longo na última frase completa antes do limite. */
function clip(text: string, limit = 150): string {
  const t = (text ?? "").trim();
  if (t.length <= limit) return t;
  const cut = t.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  if (lastStop > limit * 0.55) return cut.slice(0, lastStop + 1);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
}

/** Quantas unidades comparadas já têm teste de realidade publicado. */
function realityUnits(c: Candidate): { done: number; total: number } {
  const caps = c.capacities ?? [];
  const proposals = c.governmentPlan?.proposals ?? [];
  const themes = c.themes ?? [];
  const units = [
    Boolean(c.countryProject?.reality),
    Boolean(c.foreignPolicy?.reality),
    c.countryProject ? true : false,
    c.foreignPolicy ? true : false,
    ...caps.map((x) => Boolean(x.reality)),
    ...proposals.map((p) => Boolean(p.reality)),
    ...themes.map((t) => Boolean(t.reality)),
  ];
  const total = 2 + caps.length + proposals.length + themes.length;
  const done = units.filter(Boolean).length;
  return { done: Math.min(done, total), total };
}

type Row = { label: string; note?: string; cell: (c: Candidate) => string };

export function ComparisonSummary({
  candidates,
  differences,
}: {
  candidates: Candidate[];
  differences: KeyDifference[];
}) {
  const rows: Row[] = [
    {
      label: "Projeto de país",
      note: "onde cada candidato diz que quer chegar — a explicação completa abre no clique",
      cell: (c) => (c.countryProject?.vision ? clip(c.countryProject.vision) : "—"),
    },
    {
      label: "Prioridades declaradas",
      note: "as primeiras do documento registrado no TSE",
      cell: (c) => {
        const p = c.countryProject?.nationalPriorities ?? [];
        return p.length ? clip(p.slice(0, 3).join(" · "), 160) : "—";
      },
    },
    {
      label: "Estratégia econômica",
      note: "como pretende produzir e distribuir, nas palavras do próprio documento",
      cell: (c) =>
        c.countryProject?.developmentModel ? clip(c.countryProject.developmentModel) : "—",
    },
    {
      label: "Como pretende governar",
      note: "propostas analisadas no plano e quantas exigem decisão do Congresso",
      cell: (c) => {
        const proposals = c.governmentPlan?.proposals ?? [];
        if (proposals.length === 0) return "—";
        const congress = proposals.filter((p) =>
          ["pec", "lei-complementar", "lei-ordinaria"].includes(p.reality?.requirement?.path ?? ""),
        ).length;
        return `${proposals.length} propostas analisadas · ${congress} dependem do Congresso`;
      },
    },
    {
      label: "Brasil no mundo",
      note: "posição declarada — não mede experiência internacional",
      cell: (c) => (c.foreignPolicy?.worldView ? clip(c.foreignPolicy.worldView) : "—"),
    },
    {
      label: "Cobertura documental",
      note: "o que está documentado nesta comparação — quantidade de documentos não é mérito",
      cell: (c) => {
        const caps = c.capacities ?? [];
        const withEv = caps.filter((x) => (x.evidences ?? []).length > 0).length;
        const themes = (c.themes ?? []).length;
        const { done, total } = realityUnits(c);
        const partes = [
          `${withEv} de 8 capacidades com evidências disponíveis`,
          themes ? `${themes} de 10 temas com posição apurada` : "temas em consolidação",
          `${done} de ${total} testes de realidade publicados`,
        ];
        return partes.join(" · ");
      },
    },
  ];

  // Diferenças só de nível 1: currículo e opinião ficam fora do resumo.
  const level1Diffs = differences.filter((d) => {
    const section = SECTION_OF_METRIC[d.metricId];
    return section === "capacidades" || section === "caminho" || section === "viabilidade";
  });

  return (
    <section aria-labelledby="h-summary" className="flex flex-col gap-10">
      <div className="flex flex-col gap-1.5">
        <h2 id="h-summary" className="display-2">
          Resumo da comparação
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          O essencial de cada perfil, com os mesmos critérios para todos — e, em
          cada assunto ao longo da página, o que os fatos, a trajetória e as
          instituições dizem sobre o que está prometido. O que é percurso —
          currículo, opinião pública e processos — fica nas áreas próprias mais
          abaixo. Quem compara e quem julga é quem vota.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border/70 border-y border-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-3 py-5 sm:cmp-grid"
            style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold leading-snug">{row.label}</span>
              {row.note ? (
                <span className="text-xs leading-snug text-muted-foreground">{row.note}</span>
              ) : null}
            </div>
            {candidates.map((c, i) => {
              const text = row.cell(c);
              return (
                <div key={c.slug} className="flex flex-col gap-1">
                  <span className="flex items-center gap-1.5 sm:hidden">
                    <span
                      aria-hidden
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase text-background",
                        SLOT[SLOTS[i] ?? "a"].bg,
                      )}
                    >
                      {SLOTS[i] ?? "a"}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">{c.name}</span>
                  </span>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      text === "—" ? "text-muted-foreground" : "text-foreground/85",
                    )}
                  >
                    {text}
                  </p>
                </div>
              );
            })}
            <div className="hidden sm:block" aria-hidden />
          </div>
        ))}
      </div>

      {/* PRINCIPAIS DIFERENÇAS — só critérios de nível 1 */}
      <div className="flex flex-col gap-5 border-t border-border pt-8">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-semibold">Principais diferenças</h3>
          <p className="text-xs leading-snug text-muted-foreground">
            Onde os perfis divergem em critérios de comparação direta, com a
            diferença medida. Diferença não é recomendação.
          </p>
        </div>
        {level1Diffs.length > 0 ? (
          <DifferenceSummary
            differences={level1Diffs}
            candidateNames={candidates.map((c) => c.name)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum critério de nível 1 tem valor comparável entre estes
            candidatos — sem dado, o comparador não estima.
          </p>
        )}
        <div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("s-pais");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center gap-1.5 rounded border border-foreground px-3.5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Começar pelas seções
            <ArrowDown aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
