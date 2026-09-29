import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter: fonte-padrão de interface — neutra, legível, com algarismos
// tabulares. Sem eixo de largura: a hierarquia vem de tamanho e peso.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://candidato.joaotolovi.com"),
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
