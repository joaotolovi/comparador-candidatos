import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Archivo variable: familia única, deliberada — eixo de largura carrega a
// hierarquia (expanded p/ números e display, normal p/ corpo). Sem serifa
// decorativa, sem mono como traje: a personalidade vem da escala e da largura.
const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Comparador de Candidatos à Presidência — Eleição 2026",
    template: "%s — Comparador de Candidatos 2026",
  },
  description:
    "Currículo, experiência, plano de governo e histórico público dos candidatos à Presidência da República do Brasil, lado a lado. Cada dado com fonte e metodologia.",
  openGraph: {
    title: "Comparador de Candidatos à Presidência — Eleição 2026",
    description:
      "Compare as cinco dimensões de cada candidato: execução, plano, histórico, articulação e integridade. Com evidências.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
