// Shell editorial: cabeçalho do site + rodapé com aviso metodológico.
// Sem estética de campanha: logotipo tipográfico, sem cores partidárias.

import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
        >
          Comparador<span className="text-muted-foreground font-medium"> · Candidatos 2026</span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 text-sm">
          <Link
            href="/metodologia"
            className="rounded px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Metodologia
          </Link>
          <Link
            href="/comparar?c=lula,flavio-bolsonaro,renan-santos"
            className="rounded bg-foreground px-3 py-1.5 font-medium text-background transition-opacity hover:opacity-85"
          >
            Comparar
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
        <p className="measure max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Este produto compara candidaturas à Presidência da República do
          Brasil nas eleições de 2026 com base em dados públicos e fontes
          verificáveis. Os números seguem os mesmos critérios para todos os
          candidatos. Diferenças exibidas são fatos documentados, não
          recomendações de voto. Ausência de informação não é tratada como
          zero. Dados mockados/parciais podem estar marcados como “em análise”
          durante a fase de lançamento.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/metodologia"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Metodologia e fontes
          </Link>
          <span className="text-xs text-muted-foreground">
            Eleição presidencial 2026 · 1º turno em 4 de outubro
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
