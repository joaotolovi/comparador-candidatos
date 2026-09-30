/**
 * Glossário editorial — definições curtas (tooltip) e longas (painel lateral).
 *
 * Regras (SPEC-REALIDADE / TEMPLATE.md):
 * - definição factual e neutra, sem adjetivo de valor;
 * - uma frase curta para o tooltip; um parágrafo para o painel;
 * - nada aqui conclui sobre candidato — apenas explica conceito, instrumento
 *   ou como o produto mede o que mede.
 */

export interface GlossaryEntry {
  /** uma linha — aparece ao passar o mouse */
  short: string;
  /** parágrafo — aparece no painel lateral ao clicar */
  body?: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  "projeto de país": {
    short: "Prioridades declaradas no programa de governo registrado no TSE — transcrição, não avaliação.",
    body: "As prioridades e o modelo declarados no programa de governo registrado no TSE. Esta comparação transcreve o que o documento diz, sem resumir a avaliação do produto. A ordem é a do documento.",
  },
  "prioridades declaradas": {
    short: "Lista transcrita do próprio plano, na ordem do documento.",
    body: "A lista é transcrita do programa de governo registrado no TSE, na ordem do documento. O texto completo de cada prioridade e as fontes abrem ao clicar.",
  },
  "objetivo explícito": {
    short: "A proposta declara para que serve, nos termos do candidato — sem avaliar viabilidade.",
    body: "Conta como 1 a proposta que declara um objetivo próprio, ainda que o produto entenda que ele não será cumprido. Mede o que está escrito, não o que é provável.",
  },
  "meta quantitativa": {
    short: "Número-alvo declarado na proposta (%, vagas, reais). Só conta se estiver escrito.",
    body: "Conta como 1 a proposta que declara um número-alvo (porcentagem, vagas, valores). A fonte é sempre o próprio plano — o produto não estima a meta pelo candidato.",
  },
  prazo: {
    short: "Quando a proposta diz que será cumprida (ano ou mandato). Só conta se escrito.",
    body: "Conta como 1 a proposta que declara um horizonte de tempo (ano, mandato, primeira gestão). Mede o que está escrito.",
  },
  "custo estimado": {
    short: "Estimativa de custo em reais declarada no plano ou em documento do candidato.",
    body: "Conta como 1 a proposta (ou o plano) que estima custo em reais. Zero significa que o documento não estima — o produto não preenche a ausência com número próprio.",
  },
  "fonte de financiamento": {
    short: "De onde viria o dinheiro, conforme declarado no plano.",
    body: "Conta como 1 a proposta cujo plano declara de onde viria o dinheiro (economia, corte, imposto novo, crédito). Zero significa ausência declarada.",
  },
  "caminho institucional": {
    short: "Instrumento legal necessário para executar a proposta — ato, lei ou emenda à Constituição.",
    body: "O instrumento legal que a execução exige: ato do Executivo, lei ordinária, lei complementar, emenda à Constituição (PEC), envolvimento de estados, municípios, agentes privados ou negociação internacional. É identificado pelo produto a partir do que a proposta declara e da Constituição.",
  },
  congresso: {
    short: "Propostas que dependem de aprovação legislativa (lei ou emenda).",
    body: "Propostas que o próprio plano ou o teste de realidade indicam como dependendo de aprovação no Congresso Nacional — lei ordinária, lei complementar ou emenda à Constituição. Clicar na quantidade lista as propostas.",
  },
  estados: {
    short: "Execução que depende de governos estaduais.",
    body: "Propostas cuja execução envolve governos estaduais — por exemplo, segurança pública, que é competência compartilhada pela Constituição. Clicar na quantidade lista as propostas.",
  },
  municípios: {
    short: "Execução que depende de prefeituras.",
    body: "Propostas cuja execução envolve prefeituras — por exemplo, rede municipal de educação e atenção primária. Clicar na quantidade lista as propostas.",
  },
  capacidades: {
    short: "8 categorias fixas de capacidade demonstrada, com evidências documentadas.",
    body: "Oito categorias fixas, iguais para todos: gestão pública, construção de coalizão, capacidade econômico-fiscal, segurança pública, capacidade federativa, capacidade internacional, capacidade tecnológica e comunicação com a sociedade. Cada célula traz evidências documentadas com fonte.",
  },
  temas: {
    short: "10 temas fixos, iguais para todos, com origem declarada da posição.",
    body: "Dez grandes temas, o mesmo conjunto para todos os candidatos. Cada posição diz de onde vem: declaração do candidato, posição do partido (rotulada como tal) ou sem posição localizada. Ausência é sempre declarada como ausência.",
  },
  "testes de realidade": {
    short: "Confronto da proposta com histórico, instrumento legal, sustentação e base institucional.",
    body: "O teste confronta o que o candidato propõe com quatro registros: o que ele já fez ou sustentou (histórico), o instrumento legal exigido, a sustentação política observável hoje e a base institucional da área. Nunca prevê o futuro — registra o que está documentado e lista o que não está.",
  },
  "tensões documentadas": {
    short: "Confrontos factuais com fonte, em 5 tipos fixos.",
    body: "Tensão é um confronto factual entre a proposta e um registro público, com fonte citada. Cinco tipos fixos: mudança de posição; ação em sentido diferente; proposta sem precedente; proposta × restrição institucional; proposta × outra proposta do próprio candidato. Clicar lista os títulos.",
  },
  "questões em aberto": {
    short: "O que os documentos não esclarecem — sempre como pergunta.",
    body: "O que os documentos do candidato e os registros públicos não esclarecem sobre a proposta. Sempre em forma de pergunta: a resposta cabe ao candidato, não ao produto. Clicar lista as perguntas.",
  },
  "brasil no mundo": {
    short: "Discurso declarado sobre relações exteriores, comparado tema a tema.",
    body: "O que o candidato declara sobre as principais relações externas do Brasil — BRICS, Mercosul, Estados Unidos, China e União Europeia — confrontado, na seção completa, com ações documentadas e a posição do governo atual.",
  },
  "plano de governo": {
    short: "Documento registrado no TSE com as propostas do candidato — fonte primária desta comparação.",
    body: "O programa de governo é registrado no TSE antes da campanha. É a fonte primária desta comparação: propostas, metas, custos e financiamento declarados vêm dele. O link para o documento registrado abre nos painéis.",
  },
  pec: {
    short: "Emenda à Constituição: exige 3/5 da Câmara e do Senado, em dois turnos.",
    body: "Emenda à Constituição. Aprovada apenas com três quintos dos votos da Câmara e do Senado, em dois turnos em cada casa — o quórum mais alto do processo legislativo.",
  },
  "lei complementar": {
    short: "Exige maioria absoluta dos membros da Câmara e do Senado.",
    body: "Lei complementar: aprovada por maioria absoluta — mais da metade dos membros, não apenas dos presentes — da Câmara e do Senado. A Constituição reserva a ela matérias específicas.",
  },
  "lei ordinária": {
    short: "Exige maioria simples dos presentes.",
    body: "Lei ordinária: aprovada por maioria simples dos presentes na votação, a maior parte da legislação federal.",
  },
  "arcabouço fiscal": {
    short: "Regras que limitam o gasto do governo federal e definem metas e gatilhos.",
    body: "Conjunto de regras que limita o gasto do governo federal. O vigente — nova regra fiscal, LC 200/2023 — define metas de resultado primário com gatilhos de contenção. Alterá-lo costuma exigir lei complementar.",
  },
  "cláusula de barreira": {
    short: "Regra que liga acesso de partidos a recursos e TV ao desempenho eleitoral.",
    body: "Regra constitucional que condiciona o acesso de partidos a recursos do fundo eleitoral e tempo de TV ao desempenho nas urnas. Afeta diretamente a sustentação parlamentar de legendas pequenas.",
  },
  brics: {
    short: "Bloco de economias emergentes — Brasil, Rússia, Índia, China, África do Sul e novos membros.",
    body: "Bloco de cooperação entre grandes economias emergentes: Brasil, Rússia, Índia, China e África do Sul, com membros que aderiram a partir de 2024. O Brasil é membro fundador.",
  },
  mercosul: {
    short: "Bloco regional sul-americano — Brasil, Argentina, Paraguai, Uruguai e Bolívia.",
    body: "Bloco regional de integração sul-americana formado por Brasil, Argentina, Paraguai, Uruguai e Bolívia, com acordos de livre comércio internos e negociação externa em bloco.",
  },
  "união europeia": {
    short: "Bloco de 27 países europeus; negocia acordos comerciais em nome do conjunto.",
    body: "Bloco político e econômico de 27 países europeus. Negocia acordos comerciais em nome do conjunto — caso do acordo Mercosul–União Europeia, pendente de ratificação.",
  },
  tse: {
    short: "Tribunal Superior Eleitoral — registra candidaturas e programas de governo.",
    body: "Tribunal Superior Eleitoral: registra candidaturas e os programas de governo que passam a ser documentos oficiais da eleição. Os links de plano apontam para os documentos registrados.",
  },
  "federação partidária": {
    short: "Partidos unidos formalmente que contam como um só para a cláusula de barreira.",
    body: "Partidos unidos formalmente para a eleição e o mandato: contam como um só para a cláusula de barreira e não podem ser desfeitas no curso do mandato.",
  },
  "prestação de contas": {
    short: "Relatórios públicos de execução orçamentária e de campanha.",
    body: "Relatórios públicos: execução orçamentária do governo federal (Portal da Transparência, SIAFI) e contas eleitorais no TSE. São a base documental das evidências de gestão e financiamento.",
  },
  "inconsistência": {
    short: "Quando dois documentos do próprio candidato se contradizem, os dois lados são citados.",
    body: "Quando dois documentos do próprio candidato se contradizem (plano × resposta oficial × declaração), a comparação cita os dois lados com fonte e marca a inconsistência — não escolhe qual prevalece.",
  },
};

/** Busca tolerante: acha a entrada de glossário para um rótulo do produto. */
export function glossaryFor(label: string): GlossaryEntry | undefined {
  const key = label.trim().toLowerCase();
  return (
    GLOSSARY[key] ??
    GLOSSARY[key.replace(/s$/, "")] ??
    Object.entries(GLOSSARY).find(([k]) => key.includes(k))?.[1]
  );
}

/** Definição direta por chave literal (uso em componentes cliente). */
export function glossaryEntry(term: string): GlossaryEntry | undefined {
  return GLOSSARY[term.trim().toLowerCase()];
}
