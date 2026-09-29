import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { CandidateSelector } from "@/components/candidate-selector";
import { getCandidates, DEFAULT_SLUGS } from "@/lib/data";
import { DIMENSIONS } from "@/types";

export const metadata: Metadata = {
  title: "Compare candidatos à Presidência",
  description:
    "Currículo, experiência, plano de governo e histórico público dos candidatos à Presidência, lado a lado.",
};

export default async function HomePage() {
  const candidates = await getCandidates();

  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-14 sm:px-6 sm:py-20">
        {/* Hero: a oferta do produto em uma frase + os 5 blocos */}
        <section className="flex flex-col gap-6">
          <h1 className="display-1 max-w-3xl">
            Compare candidatos à Presidência
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Currículo, experiência, plano de governo e histórico público
            lado a lado — como você compara celulares, notebooks e carros.
          </p>
        </section>

        {/* As cinco dimensões, em ordem */}
        <section
          aria-label="As cinco dimensões da comparação"
          className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-5"
        >
          {DIMENSIONS.map((d, i) => (
            <div key={d.slug} className="flex flex-col gap-2 bg-card p-5">
              <span className="tabular text-xs font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <h3 className="text-sm font-semibold leading-snug">
                {d.name}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {d.description}
              </p>
            </div>
          ))}
        </section>

        <CandidateSelector
          allCandidates={candidates}
          initialSlugs={DEFAULT_SLUGS}
        />
      </div>
    </Shell>
  );
}
