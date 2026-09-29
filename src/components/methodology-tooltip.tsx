"use client";

// Tooltip de metodologia — dispara ao focar/entrar; conteúdo textual,
// acessível via Radix TooltipProvider.

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { HelpCircle } from "lucide-react";

export function MethodologyTooltip({
  methodology,
  children,
}: {
  methodology: string;
  children: ReactNode;
}) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs text-xs leading-relaxed"
        >
          {methodology}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function MethodologyIcon({ methodology }: { methodology: string }) {
  return (
    <MethodologyTooltip methodology={methodology}>
      <button
        type="button"
        aria-label={`Metodologia: ${methodology}`}
        className="inline-flex shrink-0 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <HelpCircle aria-hidden className="size-3.5" />
      </button>
    </MethodologyTooltip>
  );
}
