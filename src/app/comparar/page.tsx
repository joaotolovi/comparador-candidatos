import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { ComparisonExperience } from "@/components/comparison-experience";
import { getCandidates, getComparison, DEFAULT_SLUGS } from "@/lib/data";

interface Props {
  searchParams: Promise<{ c?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { c } = await searchParams;
  const slugs = (c ?? "").split(",").filter(Boolean);
  const picked = await getComparison(slugs.length ? slugs : DEFAULT_SLUGS);
  const names = picked.map((p) => p.candidate.name);
  return {
    title: names.length
      ? `Comparação: ${names.join(" vs ")}`
      : "Comparação de candidatos",
    description:
      "Comparação lado a lado: execução, plano de governo, histórico, articulação e integridade.",
  };
}

export default async function CompararPage({ searchParams }: Props) {
  const { c } = await searchParams;
  const slugs = (c ?? "").split(",").filter(Boolean).slice(0, 3);
  const picked = await getComparison(slugs.length ? slugs : DEFAULT_SLUGS);
  const all = await getCandidates();

  return (
    <Shell>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {picked.length === 0 ? (
          <EmptyComparison />
        ) : (
          <ComparisonExperience
            candidates={picked.map((p) => p.candidate)}
            allCandidates={all}
          />
        )}
      </div>
    </Shell>
  );
}

function EmptyComparison() {
  return (
    <section className="flex flex-col items-start gap-4 rounded-md border border-dashed border-border p-10">
      <h1 className="display-2">Nenhum candidato selecionado</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Escolha de uma a três candidaturas para comparar currículo, plano de
        governo e histórico público lado a lado.
      </p>
      <a
        href="/"
        className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        Escolher candidatos
      </a>
    </section>
  );
}
