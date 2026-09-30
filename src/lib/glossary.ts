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
  "ato do executivo": {
    short: "O Executivo pode executar por decreto, portaria ou ato próprio.",
    body: "A proposta pode ser executada por ato do próprio Executivo — decreto, portaria ou ato administrativo — sem aprovação legislativa. O ato continua sujeito a controle judicial.",
  },
  "agentes privados": {
    short: "A execução depende de decisão de empresas ou bancos.",
    body: "A execução depende de decisão de agentes privados — investimento, crédito ou contrapartida de empresas. O governo pode induzir, mas não decretar.",
  },
  "negociação internacional": {
    short: "Exige acordo com outros países ou blocos.",
    body: "Exige negociação com outros países ou blocos — tratados, acordos comerciais ou adesões. O Congresso ainda ratifica o resultado.",
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
  // ── Estado documental (badges) ─────────────────────────────────────
  confirmado: {
    short: "Dado verificado em fonte primária, com endereço para conferir.",
    body: "O dado foi verificado em fonte primária ou em mais de um registro independente, com endereço para conferir.",
  },
  parcial: {
    short: "Dado sustentado por parte da evidência — o resto está em aberto.",
    body: "Parte do dado é sustentada por fonte e parte depende de estimativa ou registro incompleto. A metodologia diz exatamente o que foi estimado e como.",
  },
  indeterminado: {
    short: "As fontes não permitem determinar o valor — fica em aberto, sem número inventado.",
    body: "As fontes disponíveis não permitem determinar o valor. O produto declara a lacuna em vez de preenchê-la com estimativa própria.",
  },
  contestado: {
    short: "Há registros que se contradizem sobre este dado — os dois lados são citados com fonte.",
    body: "Existem registros que se contradizem sobre este dado. A comparação cita os dois lados com fonte, na categoria jurídica exata de cada um.",
  },
  "alta confiança": {
    short: "Fonte primária oficial (tribunal, órgão de controle, diário, dado aberto).",
    body: "A fonte é primária e oficial: tribunal, órgão de controle, diário oficial ou base de dados aberta. Pontuação de confiança da FONTE, não da pessoa.",
  },
  "média confiança": {
    short: "Fonte verificável de segunda mão (imprensa com reputação, documento citado).",
    body: "A fonte é verificável mas de segunda mão: imprensa estabelecida citando fato específico, ou documento citado por terceiro.",
  },
  "baixa confiança": {
    short: "Fonte única, improvável de conferir ou de baixa circulação.",
    body: "A fonte é única, de baixa circulação ou de conferência difícil. O dado entra rotulado para que o leitor pese antes de usar.",
  },
  // ── Cobertura de evidências ───────────────────────────────────────
  "evidências documentadas": {
    short: "3 ou mais evidências com papel, complexidade, resultado e fonte.",
    body: "A capacidade tem três ou mais evidências com papel exercido, complexidade, resultado observado e fonte original.",
  },
  "cobertura parcial": {
    short: "Evidências suficientes para leitura, com lacunas declaradas.",
    body: "Há evidências documentadas, mas não cobrem todo o recorte da capacidade. A nota de cobertura diz o que falta.",
  },
  "cobertura insuficiente": {
    short: "Menos de 3 evidências — leitura frágil, lacuna declarada.",
    body: "Menos de três evidências com critério completo. A leitura é frágil e a lacuna é declarada — não preenchida por proxy de cargo.",
  },
  // ── Natureza da afirmação ──────────────────────────────────────────
  posição: {
    short: "O que o candidato defende hoje.",
    body: "Declaração de defesa no momento da apuração — o que a pessoa diz defender. Diferente de proposta (o que pretende fazer) e de histórico (o que já fez).",
  },
  proposta: {
    short: "O que o candidato pretende fazer.",
    body: "Compromisso futuro declarado no plano de governo ou em campanha. Não pressupõe execução — para isso existe o teste de realidade.",
  },
  histórico: {
    short: "Ato praticado e documentado, com data e fonte.",
    body: "Ato já praticado e documentado, com data e fonte. É o único registro que diz o que a pessoa fez — não o que promete.",
  },
  // ── Origem da posição temática ─────────────────────────────────────
  "posição do candidato": {
    short: "Declaração direta do candidato, com fonte.",
    body: "A posição foi declarada pelo próprio candidato em plano, entrevista, debate ou resposta oficial — com fonte citada.",
  },
  "posição do partido": {
    short: "Posição do partido, rotulada — NÃO é declaração do candidato.",
    body: "Sem declaração localizada do candidato, entra a posição oficial do partido, sempre rotulada como tal. Nunca é atribuída ao candidato.",
  },
  "sem posição localizada": {
    short: "Nem candidato nem partido têm posição localizada nesta apuração.",
    body: "Nem o candidato nem o partido têm posição localizada sobre este tema nesta apuração. Ausência declarada — não silêncio interpretado.",
  },
  // ── Camada analítica (rótulos internos do teste) ────────────────────
  "histórico relacionado": {
    short: "O que o candidato já fez ou sustentou no mesmo assunto, com data e fonte.",
    body: "Registros do passado do candidato no mesmo assunto da proposta: atos praticados, posições sustentadas e votos, cada um com data e fonte. Divide-se em mesmo sentido e sentido diferente.",
  },
  "sustentação observável hoje": {
    short: "Bancadas, coligações e acordos documentados — retrato atual, não previsão.",
    body: "O que se observa hoje da base de sustentação: cadeiras do partido, da coligação e federações, e acordos documentados na trajetória. É um retrato do presente — não uma previsão do próximo Congresso.",
  },
  "pontos de tensão": {
    short: "Confrontos factuais com fonte entre a proposta e registros públicos.",
    body: "Cada tensão é um confronto factual com fonte entre o que se propõe e o que está registrado: mudança de posição, ação em sentido diferente, ausência de precedente, restrição institucional ou contradição com outra proposta do próprio candidato.",
  },
  "o que falta explicar": {
    short: "Perguntas que os documentos não respondem — sempre como pergunta.",
    body: "O que os documentos do candidato e os registros públicos não esclarecem. Sempre em forma de pergunta: a resposta cabe ao candidato, não ao produto.",
  },
  "explicação apresentada pelo candidato": {
    short: "A versão do próprio candidato sobre o ponto questionado.",
    body: "Quando o ponto questionado tem resposta pública do próprio candidato, ela entra aqui ipsis litteris com fonte. Mostrar a tensão e omitir a defesa de quem foi questionado é propaganda às avessas.",
  },
  "metodologia desta análise": {
    short: "Como esta unidade foi confrontada e com quais fontes.",
    body: "Descrição do método usado nesta unidade: o que foi confrontado, quais registros foram usados e o que ficou de fora.",
  },
  "mesmo sentido": {
    short: "Registro passado na mesma direção da proposta atual.",
    body: "Ato ou posição passada que vai na mesma direção da proposta atual, com data e fonte.",
  },
  "sentido diferente": {
    short: "Registro passado em direção contrária à proposta atual.",
    body: "Ato ou posição passada que vai em direção contrária à proposta atual, com data e fonte. O produto registra; quem pesa é quem lê.",
  },
  "acordos documentados": {
    short: "Acordos políticos efetivados na trajetória, com fonte — não promessa de apoio.",
    body: "Acordos de governabilidade efetivados e documentados na trajetória do candidato. Dado real de negociação — não promessa de apoio futuro. Retrato atual, não previsão do próximo Congresso.",
  },
  "instrumento não declarado": {
    short: "O plano não diz qual instrumento executa a proposta.",
    body: "O programa de governo não especifica o instrumento necessário para executar a proposta. Ausência declarada no documento — não falha da apuração.",
  },
  "o que está sendo confrontado": {
    short: "A proposta, no texto do plano, que este teste confronta.",
    body: "O recorte da proposta usado como base do teste — sempre o texto do plano registrado, nunca paráfrase.",
  },
  // ── Coerência (sinais da seção 8) ─────────────────────────────────
  "ação histórica": {
    short: "Há ato praticado documentado sobre o tema, com data e fonte.",
    body: "A seção traz um ato praticado e documentado sobre este tema — algo feito, não só dito.",
  },
  "mudança explicada": {
    short: "O candidato explicou publicamente a mudança de posição.",
    body: "Existe explicação pública do próprio candidato para a mudança de posição. A explicação entra com fonte, sem avaliação.",
  },
  "conexão documentada": {
    short: "A ligação entre posição atual e passado vem de registro, não de inferência.",
    body: "A relação entre a posição atual e o passado é documentada por registro com fonte — não inferida pela comparação.",
  },
  "evolução documentada": {
    short: "Linha do tempo só com posições datadas e com fonte.",
    body: "Cronologia do tema com apenas posições datadas e com fonte — sem interpolação de períodos sem registro.",
  },
  // ── Modelo de desenvolvimento (conceitos citados) ─────────────────
  "estado planejador": {
    short: "Estado define prioridades e aloca investimento diretamente.",
    body: "Modelo em que o Estado define prioridades produtivas e aloca investimento diretamente (Banco Nacional de Desenvolvimento, estatais, plano).",
  },
  "estado indutor": {
    short: "Estado induz via incentivos, crédito e regulação; execução é privada.",
    body: "Modelo em que o Estado induz a atividade econômica por incentivos, crédito subsidiado e regulação, deixando a execução ao setor privado.",
  },
  "responsabilidade fiscal": {
    short: "Compromisso com contas equilibradas e regras de gasto.",
    body: "Compromisso declarado com equilíbrio das contas públicas e respeito a regras fiscais.",
  },
  "industrialização": {
    short: "Política ativa de construção de capacidade produtiva.",
    body: "Política de apoio direcionado a setores produtivos para construir capacidade industrial.",
  },
  concessões: {
    short: "Execução privada de obras/serviços públicos sob contrato.",
    body: "Execução de obras e serviços públicos por contratos privados, com retorno tarifado.",
  },
  "setor privado": {
    short: "Empresas e bancos como motor da execução econômica.",
    body: "Empresas e bancos como agentes da execução econômica — investimento, crédito e prestação de serviços.",
  },
  "ajuste fiscal": {
    short: "Redução de gastos ou aumento de receitas para equilibrar contas.",
    body: "Política de redução de gastos ou aumento de receitas para equilibrar as contas públicas. Cada plano que cita ajuste diz (ou deveria dizer) onde corta ou arrecada.",
  },
  inovação: {
    short: "Apoio a pesquisa, desenvolvimento e novos processos.",
    body: "Apoio a pesquisa, desenvolvimento e adoção de novos processos produtivos.",
  },
  tecnologia: {
    short: "Digitalização e capacitação tecnológica do Estado e da economia.",
    body: "Digitalização de serviços e capacitação tecnológica da economia — dados, conectividade, soberania digital.",
  },
  infraestrutura: {
    short: "Obras de logística, energia e conectividade.",
    body: "Obras e ativos de logística, energia e conectividade — tipicamente o capítulo de maior custo dos planos.",
  },
  sustentabilidade: {
    short: "Requisito socioambiental como parte do modelo econômico.",
    body: "Inclusão de requisito socioambiental no modelo econômico — energia limpa, bioeconomia, redução de emissões.",
  },
  liberal: {
    short: "Menor peso do Estado na economia; regulação e mercado como eixo.",
    body: "Eixo de menor peso do Estado na atividade econômica: regulação, abertura e mercado como coordenadores principais.",
  },
  mercado: {
    short: "Coordenação da economia por preços e competição.",
    body: "Coordenação da atividade econômica por preços e competição, com o Estado em papel regulador.",
  },
  "destino declarado": {
    short: "Para onde o candidato diz que quer levar o país — texto do plano.",
    body: "As prioridades que o próprio plano declara como destino do país. É o texto do documento — não uma síntese do produto.",
  },
  "conceitos citados no modelo": {
    short: "Termos econômico-institucionais presentes no texto do modelo.",
    body: "Termos econômico-institucionais localizados no texto do modelo declarado. É um rótulo analítico do documento — não uma avaliação do produto.",
  },
  "visão completa": {
    short: "O texto integral da visão de país declarada pelo candidato.",
    body: "O texto integral da visão de país declarada no plano de governo — sem cortes mecânicos que removam o contexto da frase.",
  },
  "modelo de desenvolvimento": {
    short: "Como o candidato organiza Estado, mercado e investimento.",
    body: "Como o candidato organiza a relação entre Estado, mercado e investimento: quem planeja, quem executa, quem financia.",
  },
  privatização: {
    short: "Transferência de controle estatal para o setor privado.",
    body: "Transferência do controle de empresas ou ativos estatais para o setor privado.",
  },
  // ── Política externa (eixos citados) ───────────────────────────────
  onu: {
    short: "Organização das Nações Unidas — fórum multilateral global.",
    body: "Organização das Nações Unidas: o principal fórum multilateral global, do qual o Brasil é membro fundador.",
  },
  multilateralismo: {
    short: "Decisões por fóruns e tratados coletivos, não bilaterais.",
    body: "Preferência por resolver questões em fóruns e tratados coletivos, em vez de acordos bilaterais isolados.",
  },
  "não alinhamento": {
    short: "Autonomia frente aos grandes blocos — sem alinhamento automático.",
    body: "Posição de autonomia frente aos grandes blocos de poder, sem alinhamento automático a nenhum deles.",
  },
  soberania: {
    short: "Prioridade à decisão nacional sobre recursos e política.",
    body: "Prioridade declarada à decisão nacional sobre recursos, território e política externa.",
  },
  "integração regional": {
    short: "Aprofundamento dos vínculos com América do Sul e Latina.",
    body: "Aprofundamento dos vínculos econômicos e políticos com a América do Sul e Latina — Mercosul, infraestrutura regional, cooperação.",
  },
  "estados unidos": {
    short: "Relação com o maior parceiro bilateral do Brasil.",
    body: "Os Estados Unidos: o maior parceiro bilateral relevante para comércio, investimento e cooperação de segurança. A relação oscila entre comércio e fricção tarifária.",
  },
  china: {
    short: "Maior parceiro comercial de exportação do Brasil.",
    body: "A China: o maior destino das exportações brasileiras e parceiro central de investimento em infraestrutura.",
  },
  "eixos citados": {
    short: "Blocos e princípios presentes no texto da visão e da estratégia.",
    body: "Eixos de política externa localizados no texto declarado de visão de mundo e estratégia. Rótulo analítico do documento — não avaliação.",
  },
  "visão e estratégia": {
    short: "Primeira frase completa da estratégia declarada — o resto abre no clique.",
    body: "Trecho de abertura da estratégia declarada. O texto integral, o contexto e as fontes abrem em “Ler política externa completa e fontes”.",
  },
  "atuação internacional": {
    short: "Primeira frase da atuação declarada — o resto abre no clique.",
    body: "Trecho de abertura da atuação internacional declarada. O texto integral e as fontes abrem em “Ler política externa completa e fontes”.",
  },
  "visão de mundo": {
    short: "Como o candidato descreve o lugar do Brasil no mundo.",
    body: "O texto declarado sobre o lugar do Brasil no mundo — texto do candidato, com fonte.",
  },
  "estratégia externa": {
    short: "Os meios declarados para a política externa.",
    body: "Os meios declarados para conduzir a política externa: fóruns, alianças e instrumentos preferidos.",
  },
  "projeção internacional": {
    short: "Como o candidato dimensiona o papel global pretendido.",
    body: "Como o candidato dimensiona o papel global pretendido para o Brasil — ambição declarada, sempre com fonte.",
  },
  // ── Cabeçalhos de bloco do resumo ──────────────────────────────────
  "dependências declaradas": {
    short: "De quem a execução depende, conforme o próprio plano.",
    body: "Quem a execução de cada proposta depende de — Congresso, estados, municípios — conforme declarado no plano e identificado pelo teste de realidade.",
  },
  "base factual publicada": {
    short: "O que o produto conseguiu documentar com fonte, unidade a unidade.",
    body: "O recorte do que está documentado com fonte nesta apuração: capacidades com evidências, temas com origem declarada, unidades com teste de realidade, tensões e questões em aberto. Ausência é sempre declarada como ausência.",
  },
  "número eleitoral": {
    short: "Número que identifica o partido na urna.",
    body: "Número com que o partido do candidato aparece na urna. Atribuição do TSE, não escolha da campanha.",
  },
  "zero documentado": {
    short: "O valor é exatamente zero, com fonte.",
    body: "O valor é zero e isso está documentado. Zero não é desconhecido — quando o dado não existe, a etiqueta é outra.",
  },
  "não informado": {
    short: "O documento existe mas não traz o dado.",
    body: "O documento oficial existe e foi lido, mas não contém este dado. Lacuna do documento, não da apuração.",
  },
  "não encontrado": {
    short: "Dado não localizado em fonte verificável.",
    body: "Não localizamos o dado em fonte verificável nesta apuração. Ausência declarada — o produto não estima.",
  },
  "não aplicável": {
    short: "A métrica não se aplica a este caso.",
    body: "A métrica não faz sentido para este caso específico — por exemplo, exigir instrumento do Congresso para ato do Executivo.",
  },
  "em análise": {
    short: "Apuração em andamento — sem número provisório.",
    body: "A apuração está em andamento. Entra o número quando houver fonte — nada provisório, nada estimado.",
  },
  "sem registro": {
    short: "Nenhum dado desta métrica para este candidato na apuração.",
    body: "Nenhum dado desta métrica foi localizado para este candidato nesta apuração. Ausência declarada — não é zero, não é estimativa.",
  },
  "coligação": {
    short: "Partidos que sustentam juntos a mesma candidatura.",
    body: "Conjunto de partidos que registram juntos a mesma candidatura. Afeta tempo de TV, fundo e sustentação potencial.",
  },
  "partido": {
    short: "Bancada própria do partido do candidato na Câmara.",
    body: "Cadeiras do próprio partido do candidato na Câmara dos Deputados. Base inicial de sustentação — nem todo voto do partido segue o governo.",
  },
  "federação": {
    short: "Aliança partidária permanente com candidatura uninominal.",
    body: "Federação partidária: aliança permanente entre partidos que atuam como um só na eleição e no Congresso. Conta como base de sustentação.",
  },
  "dependências identificadas": {
    short: "De quem a execução das propostas depende, conforme o plano.",
    body: "Cada proposta analisada diz se a execução depende do Congresso, dos estados ou dos municípios — conforme declarado no plano e identificado pelo teste de realidade. Zero é ausência declarada, não esquecimento.",
  },
  "propostas analisadas": {
    short: "Propostas do plano que passaram por análise proposta a proposta.",
    body: "As propostas do plano de governo que já passaram pela análise proposta a proposta — com objetivo, instrumento legal e teste de realidade. O total registrado no TSE pode ser maior; o que falta analisar é declarado como tal.",
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
