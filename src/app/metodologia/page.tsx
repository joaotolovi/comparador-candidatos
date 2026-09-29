import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { DIMENSIONS } from "@/types";

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Como cada indicador é definido, medido e verificado. Os mesmos critérios para todos os candidatos.",
};

const DEFS: { term: string; definition: string; rule?: string }[] = [
  {
    term: "Experiência executiva",
    definition:
      "Períodos em cargos com responsabilidade direta pela gestão de uma organização pública ou privada relevante.",
    rule: "Mandatos simultâneos não são contabilizados duas vezes.",
  },
  {
    term: "Propostas com estimativa de custo",
    definition:
      "Percentual das propostas identificadas no plano que apresentam valor, intervalo financeiro ou cálculo explícito de custo.",
    rule: "propostas_com_custo / total_de_propostas × 100",
  },
  {
    term: "Experiência política",
    definition:
      "Anos em cargos eletivos ou de nomeação política nos três poderes.",
    rule:
      "Considerados: vereador, prefeito, deputado estadual, deputado federal, senador, governador, ministro, vice-presidente e presidente.",
  },
  {
    term: "Maior orçamento administrado",
    definition:
      "Maior orçamento anual sob responsabilidade direta do gestor em qualquer cargo executivo ocupado.",
    rule:
      "Valores sempre em reais do período, com fonte oficial (LOA ou equivalente).",
  },
  {
    term: "Métrica descritiva vs. direcional",
    definition:
      "Nenhuma métrica política complexa recebe o rótulo de “quanto maior, melhor”.",
    rule:
      "Métricas apenas descrevem: 30 anos na política não são automaticamente melhores que 8. A interpretação pertence a você.",
  },
  {
    term: "Diferença entre candidatos",
    definition:
      "Diferença absoluta (A − B), razão (A / B) e pontos percentuais (p.p.) para métricas percentuais.",
    rule:
      "Percentual relativo não é usado quando gera interpretação confusa. Ex.: 62% − 24% = +38 p.p.",
  },
];

const EVIDENCE = [
  {
    status: "Confirmado",
    desc: "Existe evidência documental suficientemente clara.",
  },
  {
    status: "Parcial",
    desc: "Existe evidência, mas incompleta.",
  },
  {
    status: "Indeterminado",
    desc: "Não existem informações suficientes.",
  },
  {
    status: "Contestado",
    desc: "Existem fontes confiáveis divergentes ou disputa factual relevante.",
  },
];

const CONFIDENCE = [
  { level: "Alta confiança", desc: "Documento oficial e dado diretamente mensurável." },
  { level: "Confiança média", desc: "Reconstrução a partir de múltiplas fontes confiáveis." },
  { level: "Baixa confiança", desc: "Dados incompletos ou difíceis de verificar." },
];

const MISSING = [
  ["Zero", "O valor é efetivamente zero, documentado."],
  ["Não informado", "O candidato não informou."],
  ["Não encontrado", "Não localizado nas fontes consultadas."],
  ["Não aplicável", "O indicador não se aplica a este perfil."],
  ["Em análise", "A equipe de dados ainda está apurando."],
];

export default function MetodologiaPage() {
  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6">
        <section className="flex flex-col gap-4">
          <h1 className="display-1 !text-4xl sm:!text-5xl">Metodologia</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A imparcialidade está em usar os mesmos critérios para todos, a
            mesma metodologia, fontes verificáveis e na possibilidade de
            auditar cada número até a origem.
          </p>
        </section>

        {/* Princípio de comparação */}
        <section className="rounded-md border border-border bg-card p-6 sm:p-8">
          <h2 className="display-2 !text-2xl">Princípio de comparação</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/85">
            Não neutralizamos diferenças objetivas: se um candidato tem 5
            anos a mais de experiência executiva registrada, o produto
            mostra isso. Também não transformamos métricas em veredito:
            nenhum número isolado define “melhor candidato”, e o produto
            nunca recomenda voto. Fatos são assertivos; conclusões que
            dependem de pesos pessoais são transparentes sobre isso.
          </p>
        </section>

        {/* Definições de indicadores */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Indicadores</h2>
          <dl className="flex flex-col divide-y divide-border rounded-md border border-border">
            {DEFS.map((d) => (
              <div
                key={d.term}
                className="flex flex-col gap-2 p-5 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-8"
              >
                <dt className="text-sm font-semibold">{d.term}</dt>
                <dd className="flex flex-col gap-1.5">
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {d.definition}
                  </p>
                  {d.rule ? (
                    <p className="rounded bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                      {d.rule}
                    </p>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Dimensões e perguntas */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">As cinco dimensões</h2>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
            {DIMENSIONS.map((d, i) => (
              <div key={d.slug} className="flex flex-col gap-2 bg-card p-5">
                <span className="tabular text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold">{d.name}</h3>
                <p className="text-xs italic leading-relaxed text-muted-foreground">
                  “{d.question}”
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Estados de evidência */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Estados de evidência</h2>
          <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {EVIDENCE.map((e) => (
              <div key={e.status} className="flex flex-col gap-1 bg-card p-5">
                <dt className="text-sm font-semibold">{e.status}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">
                  {e.desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Confiabilidade */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Confiabilidade dos dados</h2>
          <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {CONFIDENCE.map((c) => (
              <div key={c.level} className="flex flex-col gap-1 bg-card p-5">
                <dt className="text-sm font-semibold">{c.level}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">
                  {c.desc}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Dados ausentes */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Quando falta dado</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ausência de informação nunca é interpretada como zero. Estes
            estados aparecem visualmente distintos em todo o produto:
          </p>
          <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {MISSING.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 bg-card p-4">
                <dt className="text-sm font-semibold">{k}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Fontes priorizadas */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Fontes</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Prioridade para documentação primária e institucional: Justiça
            Eleitoral, Câmara, Senado, Executivo federal, Diários Oficiais,
            portais de transparência, tribunais, tribunais de contas, órgãos
            estatísticos e econômicos, governos estaduais, prefeituras e
            planos de governo registrados. Fontes jornalísticas aparecem
            apenas como contexto complementar, sempre identificadas.
          </p>
        </section>
      </div>
    </Shell>
  );
}
