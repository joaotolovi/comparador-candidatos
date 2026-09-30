import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { CAPACITY_CATALOG, SECTIONS } from "@/types";
import { getCandidates } from "@/lib/data";

export const metadata: Metadata = {
  title: "Metodologia",
  description:
    "Como o comparador passa de currículo a capacidades demonstradas: evidências verificáveis, fontes auditáveis e nenhuma nota, score ou ranking.",
};

/** As três naturezas de afirmação — nunca misturadas. */
const CLAIMS = [
  {
    kind: "Posição",
    desc: "O candidato defende algo — declaração, plano, discurso, entrevista.",
  },
  {
    kind: "Proposta",
    desc: "O programa propõe uma medida. É intenção documentada, não execução.",
  },
  {
    kind: "Histórico",
    desc: "Em determinado cargo, praticou o ato: votou, decidiu, nomeou, implementou.",
  },
];

const COVERAGE = [
  {
    level: "Evidências documentadas",
    desc: "Três ou mais evidências com papel exercido, complexidade e resultado observável.",
  },
  {
    level: "Cobertura parcial",
    desc: "Existem evidências, mas incompletas para o período ou para o tipo de trajetória — com o motivo declarado.",
  },
  {
    level: "Cobertura insuficiente",
    desc: "Não há base localizada. A lacuna fica visível em vez de ser preenchida por proxy de cargo.",
  },
];

const EVIDENCE = [
  { status: "Confirmado", desc: "Existe evidência documental suficientemente clara." },
  { status: "Parcial", desc: "Existe evidência, mas incompleta." },
  { status: "Indeterminado", desc: "Não existem informações suficientes." },
  { status: "Contestado", desc: "Existem fontes confiáveis divergentes ou disputa factual relevante." },
];

const CONFIDENCE = [
  { level: "Alta confiança", desc: "Documento oficial e dado diretamente mensurável." },
  { level: "Confiança média", desc: "Reconstrução a partir de múltiplas fontes confiáveis." },
  { level: "Baixa confiança", desc: "Dados incompletos ou difíceis de verificar." },
];

const MISSING = [
  ["Zero", "O valor é efetivamente zero, documentado com fonte."],
  ["Não informado", "O candidato não informou."],
  ["Não aplicável", "A trajetória que sustenta o indicador nunca existiu."],
  ["Em análise", "A equipe de dados ainda está apurando."],
];

const DIFFS = [
  {
    term: "Diferença entre candidatos",
    definition:
      "Diferença absoluta (A − B), razão (A / B) e pontos percentuais (p.p.) para métricas percentuais.",
    rule:
      "Razão só quando é legível (≥ 2×, maior valor ≥ 10 e menor > 0). Ex.: 62% − 24% = +38 p.p.",
  },
  {
    term: "Nenhum indicador é “quanto maior, melhor”",
    definition:
      "Todo indicador é descritivo; atribuir pesos é do usuário, não do produto.",
    rule:
      "30 anos de política não são automaticamente melhores que 8, e 1 milhão de servidores não torna ninguém mais capaz de executar.",
  },
];

const REALITY_TESTS = [
  {
    t: "Proposta × histórico",
    d: "Existem ações anteriores no mesmo sentido? Existem no sentido oposto? Houve mudança de posição? O resultado é factual, nunca uma nota.",
  },
  {
    t: "Proposta × poder real do cargo",
    d: "O que a proposta exige para sair do papel: ato do Executivo, lei ordinária, lei complementar, emenda constitucional, estados, municípios, agentes privados ou negociação internacional — com o quórum factual de cada caminho.",
  },
  {
    t: "Proposta × sustentação política",
    d: "Apenas elementos observáveis hoje: cadeiras do partido, coligação formalizada, federação e acordos documentados. Sempre com o aviso de que é o retrato atual, não a previsão do próximo Congresso.",
  },
  {
    t: "Proposta × capacidade de articulação",
    d: "Quantas negociações documentadas, com quantos atores diferentes e quantas envolveram posições inicialmente divergentes. Sem material suficiente, isso é dito — não estimado.",
  },
  {
    t: "Discurso × ações",
    d: "Para conceitos amplos — soberania, democracia, responsabilidade fiscal, liberdade, combate à corrupção, meio ambiente, segurança, direitos sociais: posição atual, ações relacionadas datadas, evidências em linha, evidências em sentido diferente e a explicação pública do próprio candidato quando existir.",
  },
  {
    t: "Proposta × detalhes de implementação",
    d: "Meta, prazo, custo, fonte de recursos, instrumento legal, dependência do Congresso e indicador de resultado. O que não estiver no documento vira pergunta, não acusação.",
  },
];

const TENSIONS = [
  ["Mudança de posição", "defendia um caminho antes e apresenta outro agora, com as duas datas na fonte."],
  ["Ação em sentido diferente", "o discurso atual e um ato praticado apontam para direções distintas — o fato e a explicação do candidato aparecem juntos."],
  ["Proposta sem precedente", "não localizamos na trajetória analisada nenhum episódio diretamente comparável com o que é prometido."],
  ["Proposta × restrição institucional", "o que se promete depende de decisão que não está nas mãos do cargo — o quórum e o caminho aparecem no lugar do veredito."],
  ["Proposta × outra proposta", "duas promessas do mesmo documento apontam para direções que se limitam entre si."],
];

const LAYERS = [
  {
    t: "Camada 1 — entendimento",
    d: "Síntese factual de 2–3 linhas: o que o usuário precisa saber em segundos.",
  },
  {
    t: "Camada 2 — evidência",
    d: "Ao clicar: 3 a 6 evidências concretas, com papel exercido, complexidade e resultado observável.",
  },
  {
    t: "Camada 3 — fonte",
    d: "Ao clicar novamente: documento oficial, plano registrado, votação, entrevista, legislação ou dado público.",
  },
];

export default async function MetodologiaPage() {
  const CANDIDATES = await getCandidates();
  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-14 sm:px-6">
        <section className="flex flex-col gap-4">
          <h1 className="display-1 !text-4xl sm:!text-5xl">Metodologia</h1>
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
            A imparcialidade está em usar os mesmos critérios para todos, aplicar a
            mesma metodologia, citar fontes verificáveis e permitir auditar cada
            afirmação até o documento original.
          </p>
        </section>

        {/* Mudança de unidade de análise */}
        <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-6 sm:p-8">
          <h2 className="display-2 !text-2xl">O que este produto compara</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
            Não comparamos currículos: comparamos <strong>capacidades
            demonstradas</strong>, usando o currículo e o histórico como evidência.
            Cargo, tamanho de estrutura e tempo de exposição medem a oportunidade
            que a pessoa teve — não a capacidade que demonstrou. Por isso
            &ldquo;pessoas sob gestão&rdquo;, &ldquo;orçamento administrado&rdquo; e
            &ldquo;anos em cargo executivo&rdquo; deixaram de ser indicadores de
            competência e passaram a integrar, como contexto, a área{" "}
            <em>Histórico e trajetória</em>.
          </p>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-md border border-dashed border-border p-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Antes (pergunta implícita)
              </h3>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                <li>Quem teve mais cargos?</li>
                <li>Quem administrou mais dinheiro?</li>
                <li>Quem comandou mais pessoas?</li>
                <li>Quem ficou mais anos no Executivo?</li>
              </ul>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-border p-4">
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Agora (pergunta explícita)
              </h3>
              <ul className="flex flex-col gap-1 text-sm text-foreground/90">
                <li>Que Brasil essa pessoa propõe?</li>
                <li>Quais são suas prioridades e como pretende realizá-las?</li>
                <li>Quais capacidades seu histórico demonstra?</li>
                <li>Como constrói acordos, decide e reage a crises?</li>
                <li>Como vê o Brasil no mundo?</li>
                <li>Que evidências sustentam cada resposta?</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Estrutura da comparação */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Estrutura da comparação</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A tela abre com cinco seções — o currículo não é o coração da
            comparação. Escrutínio (opinião pública, histórico e integridade) vem
            depois e nunca é usado como prova de capacidade.
          </p>
          <ol className="flex flex-col divide-y divide-border rounded-md border border-border">
            {SECTIONS.map((s, i) => {
              const isMain = !s.secondary;
              const n = SECTIONS.slice(0, i + 1).filter((x) => !x.secondary).length;
              return (
                <li
                  key={s.slug}
                  className="flex flex-col gap-1 p-5 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-8"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {isMain ? `Seção ${n}` : "Área separada"}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      {s.question}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="grid gap-3 sm:grid-cols-3">
            {LAYERS.map((c) => (
              <div key={c.t} className="flex flex-col gap-1 rounded-md border border-border bg-card p-4">
                <h3 className="text-sm font-semibold">{c.t}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Capacidades */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">As 8 capacidades — e o que não conta</h2>
          <dl className="flex flex-col divide-y divide-border rounded-md border border-border">
            {CAPACITY_CATALOG.map((c) => (
              <div
                key={c.slug}
                className="flex flex-col gap-2 p-5 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-8"
              >
                <dt className="text-sm font-semibold">{c.name}</dt>
                <dd className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                  <span>{c.question}</span>
                  <span className="text-xs">
                    <strong className="font-medium text-foreground">Não conta:</strong>{" "}
                    {c.excludes}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Uma evidência vale para qualquer trajetória: mandato legislativo,
            ministério, governo estadual ou municipal, sindicato, empresa,
            associação, movimento ou organismo internacional. O que muda é o
            contexto, não o peso do cargo.
          </p>
        </section>

        {/* Posição / Proposta / Histórico */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">
            Posição, proposta e histórico não são a mesma coisa
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CLAIMS.map((c) => (
              <div key={c.kind} className="flex flex-col gap-1 rounded-md border border-border bg-card p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {c.kind}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
            Querer fazer não é ter feito — e ter feito não garante repetir. Cada
            afirmação traz o rótulo da sua natureza para que a leitura não
            confunda intenção com ato praticado.
          </p>
        </section>

{/* Teste de realidade — a camada analítica */}
        <section className="flex flex-col gap-4 border-t border-border pt-10">
          <h2 className="display-2 !text-2xl">Teste de realidade — como a análise aparece</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
            Em vez de dizer se uma proposta é boa ou ruim, ou se um candidato
            &ldquo;consegue&rdquo; ou &ldquo;não consegue&rdquo;, o comparador
            confronta a promessa com fatos observáveis e mostra a distância entre
            elas. A análise aparece dentro de cada assunto — nunca como uma seção
            de opinião da casa — e nunca conclui no lugar de quem lê.
          </p>
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            {REALITY_TESTS.map((x) => (
              <li key={x.t} className="flex flex-col gap-1 p-5 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-8">
                <span className="text-sm font-semibold">{x.t}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{x.d}</span>
              </li>
            ))}
          </ul>
          <h3 className="text-sm font-semibold">Pontos de tensão — cinco tipos, todos factuais</h3>
          <ul className="flex flex-col gap-2">
            {TENSIONS.map(([t, d]) => (
              <li key={t} className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{t}:</span> {d}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Limites que nos impomos</h3>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Sem veredito.</span> Nenhuma
                tensão recebe nota, selo de &ldquo;inviável&rdquo; ou frase de
                conclusão. Um revisor automático reprova o texto antes da
                publicação se aparecer juízo de valor ou adjetivo comparativo.
              </li>
              <li>
                <span className="font-medium text-foreground">Versão do candidato</span>{" "}
                sempre que existir. Mostrar a tensão e omitir a explicação pública
                de quem foi questionado seria propaganda — nossa, no sentido
                contrário.
              </li>
              <li>
                <span className="font-medium text-foreground">Ausência declarada.</span>{" "}
                Quando não há precedente comparável, isso é escrito com essas
                palavras. Lacuna nunca é preenchida por inferência sobre o partido.
              </li>
              <li>
                <span className="font-medium text-foreground">Posição do partido, rotulada.</span>{" "}
                Se o candidato não se pronunciou sobre um tema, a posição do partido
                pode aparecer — sempre marcada como posição partidária, nunca
                atribuída ao candidato.
              </li>
              <li>
                <span className="font-medium text-foreground">Em consolidação.</span>{" "}
                Onde a apuração ainda não terminou, a interface diz que está em
                consolidação. Nada é estimado para preencher espaço.
              </li>
            </ul>
          </div>
        </section>

        {/* Cobertura e honestidade */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Cobertura e honestidade das lacunas</h2>
          <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
            {COVERAGE.map((c) => (
              <li
                key={c.level}
                className="flex flex-col gap-1 p-5 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-8"
              >
                <span className="text-sm font-semibold">{c.level}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{c.desc}</span>
              </li>
            ))}
          </ul>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
            Análise aproximada é permitida e esperada quando existe base razoável:
            ela vem marcada como parcial ou de baixa confiança, com a explicação do
            método. O que nunca fazemos é preencher lacuna com proxy de cargo, nem
            deixar &ldquo;não encontrado&rdquo; onde há base documental. Zero só
            aparece quando é zero documentado.
          </p>
        </section>

        {/* Estados de evidência */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Estados de evidência</h2>
          <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {EVIDENCE.map((e) => (
              <div key={e.status} className="flex flex-col gap-1 bg-card p-5">
                <dt className="text-sm font-semibold">{e.status}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">{e.desc}</dd>
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
                <dd className="text-xs leading-relaxed text-muted-foreground">{c.desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Dados ausentes */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Quando falta dado</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Ausência de informação nunca é interpretada como zero. Estes estados
            aparecem visualmente distintos em todo o produto:
          </p>
          <dl className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {MISSING.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 bg-card p-4">
                <dt className="text-sm font-semibold">{k}</dt>
                <dd className="text-xs leading-relaxed text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Diferenças */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Como as diferenças são calculadas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {DIFFS.map((d) => (
              <div key={d.term} className="flex flex-col gap-1 rounded-md border border-border bg-card p-4">
                <h3 className="text-sm font-semibold">{d.term}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{d.definition}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{d.rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Opinião pública e integridade */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">
            Opinião pública e integridade ficam fora da comparação de capacidade
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
            Aprovação de governo e intenção de voto aparecem em área própria,
            sempre com instituto e data: pesquisa mede percepção eleitoral, não
            competência, e por isso nunca entra na comparação de capacidades. A
            integridade é tratada como seção de escrutínio — cada caso registrado
            com a <strong>categoria jurídica exata</strong> (denúncia, investigação,
            inquérito, processo, decisão, condenação, absolvição, arquivamento),
            sem misturar natureza das acusações nem inferir mérito.
          </p>
        </section>

        {/* Fontes */}
        <section className="flex flex-col gap-4">
          <h2 className="display-2 !text-2xl">Fontes</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Prioridade para documentação primária e institucional: Justiça
            Eleitoral, Câmara, Senado, Executivo federal, Diários Oficiais, portais
            de transparência, tribunais, tribunais de contas, órgãos estatísticos e
            econômicos, governos estaduais, prefeituras e planos de governo
            registrados. Para posições atuais e projeção internacional, fontes de
            2025–2026; para fatos históricos, a data real do fato. Imprensa entra
            como contexto complementar, sempre identificada — e verbete
            enciclopédico nunca sustenta uma afirmação sozinho.
          </p>
        </section>

        {/* Fotos */}
        <section className="flex flex-col gap-3">
          <h2 className="display-2 !text-2xl">Fotos dos candidatos</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Retratos de domínio público ou licenças livres (Wikimedia Commons),
            mantidos como arquivo local do site. Candidatos sem retrato
            disponível aparecem pelas iniciais — ausência declarada, não
            esquecimento. Créditos:
          </p>
          <ul className="flex flex-col gap-1.5">
            {CANDIDATES.filter((c) => c.photoCredit).map((c) => (
              <li key={c.slug} className="text-sm leading-snug text-foreground/85">
                <span className="font-medium">{c.name}</span> — {c.photoCredit}
              </li>
            ))}
          </ul>
        </section>

        {/* Auditoria */}
        <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-6 sm:p-8">
          <h2 className="display-2 !text-2xl">Como auditar</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-foreground/85">
            Toda evidência abre a fonte com data de publicação e de acesso, e todo
            indicador mostra o método de cálculo. A plataforma não pede
            &ldquo;acredite na nossa conclusão&rdquo;: apresenta a síntese, as
            evidências e as fontes — e não emite nota, score, ranking nem
            recomendação de voto. A avaliação final é sua.
          </p>
        </section>
      </div>
    </Shell>
  );
}
