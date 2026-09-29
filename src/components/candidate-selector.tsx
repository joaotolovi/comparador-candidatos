"use client";

// Home: seleção de candidatos (cards com checkbox-style toggle) + comparação
// inicial sugerida. Mobile-first, até 3 selecionados.

import { useMemo, useState } from "react";
import type { Candidate } from "@/types";
import { CandidateAvatar } from "@/components/candidate-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function CandidateSelector({
  allCandidates,
  initialSlugs,
}: {
  allCandidates: Candidate[];
  initialSlugs: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCandidates;
    return allCandidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.party.toLowerCase().includes(q) ||
        String(c.ballotNumber).includes(q),
    );
  }, [allCandidates, query]);

  const toggle = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev; // até 3 simultâneos
      return [...prev, slug];
    });
  };

  const compare = () => {
    if (selected.length === 0) return;
    router.push(`/comparar?c=${selected.join(",")}`);
  };

  const selectedCandidates = allCandidates.filter((c) =>
    selected.includes(c.slug),
  );

  return (
    <section
      aria-labelledby="h-select"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h2 id="h-select" className="display-2">
          Monte sua comparação
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Escolha até três candidaturas. As 13 candidaturas registradas à
          Presidência estão disponíveis, com os mesmos critérios de análise.
        </p>
      </div>

      {/* Slots de seleção */}
      <div className="flex flex-col gap-4">
        <div
          role="group"
          aria-label="Candidatos selecionados"
          className="grid gap-3 sm:grid-cols-3"
        >
          {[0, 1, 2].map((i) => {
            const c = selectedCandidates[i];
            return (
              <div
                key={i}
                className={cn(
                  "flex min-h-20 items-center gap-3 rounded-md border bg-card p-4 transition-colors",
                  c ? "border-foreground/25" : "border-dashed border-border",
                )}
              >
                {c ? (
                  <>
                    <CandidateAvatar name={c.name} slot={(["a","b","c"] as const)[i]} size="sm" photo={c.photo || undefined} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">
                        {c.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.party} · {String(c.ballotNumber).padStart(2, "0")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(c.slug)}
                      aria-label={`Remover ${c.name} da comparação`}
                      className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X aria-hidden className="size-4" />
                    </button>
                  </>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Plus aria-hidden className="size-4" />
                    {i === 0
                      ? "Primeiro candidato"
                      : i === 1
                        ? "Segundo candidato"
                        : "Terceiro (opcional)"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={compare}
            disabled={selected.length < 1}
            className="bg-foreground text-background hover:bg-foreground/85"
          >
            Comparar {selected.length > 1 ? `${selected.length} candidatos` : selected.length === 1 ? "candidato" : ""}
          </Button>
          <span className="text-xs text-muted-foreground">
            {selected.length}/3 selecionados
          </span>
        </div>
      </div>

      {/* Busca */}
      <div className="flex flex-col gap-3">
        <label htmlFor="q" className="label-field">
          Buscar candidato por nome, partido ou número
        </label>
        <input
          id="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex.: Lula, PL, 55…"
          className="w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-foreground/40"
        />
      </div>

      {/* Lista de candidaturas */}
      <ul
        aria-label="Candidaturas registradas"
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((c) => {
          const isSelected = selected.includes(c.slug);
          return (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => toggle(c.slug)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full flex-col gap-2.5 rounded-md border bg-card p-4 text-left transition-colors",
                  isSelected
                    ? "border-foreground/40 ring-1 ring-foreground/20"
                    : "border-border hover:border-foreground/25",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="tabular text-sm font-bold text-muted-foreground">
                      {String(c.ballotNumber).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-medium">{c.party}</span>
                  </div>
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-transparent",
                    )}
                  >
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                </div>
                <span className="font-semibold leading-snug">{c.name}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {c.currentRole} · {c.age} anos
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
