"use client";

// Compressão editorial: a página principal mostra no máximo ~150 caracteres;
// o texto completo fica a um clique. Nunca "texto → texto → texto → fonte".

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ExpandableText({
  text,
  limit = 150,
  label = "Ver explicação e fontes",
  className,
}: {
  text: string;
  limit?: number;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > limit;
  const shown = !long || open ? text : `${text.slice(0, limit).trimEnd()}…`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="text-sm leading-relaxed text-foreground/90">{shown}</p>
      {long ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-fit text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          {open ? "Mostrar menos" : label}
        </button>
      ) : null}
    </div>
  );
}
