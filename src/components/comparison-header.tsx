"use client";

// Cabeçalho de comparação: coluna por candidato, foto, nome, partido,
// número, idade, cargo. Ao rolar, colapsa para o modo compacto sticky.

import { CandidateAvatar } from "@/components/candidate-avatar";
import { SLOT } from "@/components/slot";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Candidate } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown, RotateCcw, X } from "lucide-react";
import Link from "next/link";

export function ComparisonHeader({
  candidates,
  allCandidates,
  compact,
  onSwap,
  onRemove,
}: {
  candidates: Candidate[];
  allCandidates: Candidate[];
  compact?: boolean;
  onSwap: (slotIndex: number, slug: string) => void;
  onRemove: (slotIndex: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:cmp-grid",
        compact ? "sm:items-center" : "sm:items-end",
      )}
      style={{ "--cmp-cols": candidates.length } as React.CSSProperties}
    >
      {/* Coluna de rótulo — mesma largura da linha, para alinhar tudo */}
      <div className="hidden sm:block" aria-hidden />

      {candidates.map((c, i) => {
        const slot = SLOT[(["a", "b", "c"] as const)[i] ?? "a"];
        return (
          <div
            key={c.slug}
            className={`relative flex ${compact ? "flex-row items-center gap-3" : "flex-col gap-3 sm:pr-8"} border-t-2 pt-2 sm:border-t-0 sm:pt-0 ${slot.border}`}
          >
            {compact ? (
              <CandidateAvatar name={c.name} slot={(["a","b","c"] as const)[i] ?? "a"} size="sm" photo={c.photo || undefined} />
            ) : null}

            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className={`shrink-0 self-center rounded px-1 py-0.5 text-[10px] font-semibold uppercase leading-none text-background ${slot.bg}`}
                >
                  {(["a", "b", "c"] as const)[i] ?? "a"}
                </span>
                <span
                  className={`tabular shrink-0 text-sm font-semibold ${slot.text}`}
                  aria-label={`Candidato ${c.ballotNumber}`}
                >
                  {String(c.ballotNumber).padStart(2, "0")}
                </span>
                <h3
                  className={`font-semibold leading-snug ${compact ? "text-sm" : "text-base"}`}
                >
                  <Link
                    href={`/candidato/${c.slug}`}
                    className="transition-opacity hover:opacity-80"
                    title={c.name}
                  >
                    {c.ballotName || c.name}
                  </Link>
                </h3>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {c.party} · {c.age} anos · {c.currentRole}
              </p>
            </div>

            <div
              className={`flex shrink-0 ${compact ? "ml-auto" : "sm:absolute sm:right-0 sm:top-0"}`}
            >
              <SwapMenu
                candidate={c}
                allCandidates={allCandidates}
                onSwap={onSwap}
                onRemove={onRemove}
                slotIndex={i}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SwapMenu({
  candidate,
  allCandidates,
  slotIndex,
  onSwap,
  onRemove,
}: {
  candidate: Candidate;
  allCandidates: Candidate[];
  slotIndex: number;
  onSwap: (i: number, slug: string) => void;
  onRemove: (i: number) => void;
}) {
  const others = allCandidates.filter(
    (c) => c.slug !== candidate.slug,
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Trocar ${candidate.name}`}
          className="size-7"
        >
          <ChevronDown aria-hidden className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span className="truncate">{candidate.name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/candidato/${candidate.slug}`} className="gap-2">
            <span aria-hidden className="size-4" />
            Perfil completo
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSwap(slotIndex, candidate.slug)}
          className="gap-2"
        >
          <RotateCcw aria-hidden className="size-4" />
          Recolocar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-muted-foreground">
          Trocar por
        </DropdownMenuLabel>
        {others.map((o) => (
          <DropdownMenuItem
            key={o.slug}
            onClick={() => onSwap(slotIndex, o.slug)}
            className="gap-2"
          >
            <span className="tabular text-xs font-semibold text-muted-foreground">
              {String(o.ballotNumber).padStart(2, "0")}
            </span>
            <span className="truncate">{o.name}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {o.party}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onRemove(slotIndex)}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <X aria-hidden className="size-4" />
          Remover da comparação
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
