# SPEC de enriquecimento — 29/09/2026

Objetivo: eliminar lacunas ("Não encontrado", "Em análise", "Sem registro") e adicionar
os indicadores de diálogo/negociação/articulação. **Análise aproximada é permitida**
(fundamentar em múltiplas fontes), desde que marcada honestamente.

## Regras editoriais (obrigatórias)

1. **Fontes recentes**: priorizar 2025–2026. Fatos históricos (eleições passadas,
   nascimento, diplomas) mantêm a data real do fato. Pesquisas de opinião/intenção:
   sempre as mais recentes (ago/set 2026 quando existirem).
2. **Aproximação honesta**: dado estimado ⇒ `evidenceStatus: "parcial"` (ou
   `"confirmado"` se a base é oficial), `confidenceLevel: "low"` ou `"medium"`,
   e o `methodology` DEVE dizer como a estimativa foi feita ("estimativa
   aproximada a partir de X, Y e Z", "contagem sobre N itens do plano").
3. **Nunca zero para desconhecido**: desconhecido = `availability: "not_found"`
   (com `dataGaps` explicando). Número que existe mas é estimativa = `available`
   com `confidenceLevel` menor.
4. **Sem adjetivo de valor**: nada de "melhor", "maior articulador", "fraco".
   Só descritivo com fonte. Diferença numérica ≠ recomendação.
5. **Justiça entre candidatos**: candidato pouco exposto NÃO fica com "—".
   Procure proxy documentado (gabinete parlamentar, estrutura de campanha,
   atuação municipal, partido minoritário). Se realmente não houver base,
   use `not_applicable` com nota curta ("nunca ocupou cargo executivo") —
   nunca deixe `not_found` sem ter buscado proxy.
6. **Questões judiciais** são dados categóricos: copie a categoria exata da
   fonte (arquivamento, denúncia, inquérito em curso...) sem interpretação.

## Lista canônica (21 métricas — TODOS os 13 candidatos devem ter TODAS)

| id | name | category | metricType |
|---|---|---|---|
| anos_executivo | Anos em cargos executivos públicos | capacidade-execucao | number |
| maior_orcamento | Maior orçamento anual administrado | capacidade-execucao | currency |
| equipe_gerida | Pessoas/equipe sob gestão (servidores) | capacidade-execucao | number |
| aprovacao_gestao | Aprovação da gestão (pesquisas) | capacidade-execucao | percentage |
| propostas_total | Propostas do plano de governo | plano | number |
| propostas_com_custo | Propostas com custo estimado | plano | percentage |
| propostas_com_prazo | Propostas com prazo declarado | plano | percentage |
| propostas_dependentes_congresso | Propostas dependentes do Congresso | plano | percentage |
| anos_politica | Anos de experiência política | historico-experiencia | number |
| anos_legislativo | Anos em cargos legislativos | historico-experiencia | number |
| anos_federal | Anos em cargos públicos federais | historico-experiencia | number |
| mandatos_eletivos | Mandatos eletivos exercidos | historico-experiencia | number |
| votos_recebidos | Votos recebidos em eleições anteriores | historico-experiencia | number |
| projetos_lei_aprovados | Leis aprovadas como autor principal | historico-experiencia | number |
| registro_tse | Situação do registro — TSE | articulacao | text |
| bancada_partidaria_camara | Bancada do partido na Câmara dos Deputados (antes da eleição de 2026) | articulacao | number |
| intencao_voto_recente | Intenção de voto — pesquisas recentes (1º turno) | articulacao | text |
| capacidade_dialogo | Capacidade de diálogo | articulacao | text |
| negociacao_acordos | Negociação e acordos | articulacao | text |
| articulacao_apoio | Partidos na coligação/federação registrada | articulacao | number |
| bens_declarados | Bens declarados à Justiça Eleitoral | integridade | currency |

Se o candidato **nunca** teve o fato (nunca governou ⇒ aprovacao_gestao;
nunca foi parlamentar ⇒ projetos_lei_aprovados; nunca disputou ⇒ votos_recebidos):
`availability: "not_applicable"`, `value: null`, `displayValue: "—"`,
`evidenceStatus: "confirmado"` (a ausência de carreira é fato), e uma linha no
`context` dizendo por quê. Para `dataPresentation` use `"notes_only"` em textos.

## Definições dos 3 NOVOS indicadores (articulação)

### capacidade_dialogo (text)
- methodology: "Diálogo documentado com setores diversos (sindicatos,
  empresariado, imprensa, oposição, religiosos, sociedade civil) — análise
  aproximada a partir de fontes recentes (2025–2026), com exemplos citados.
  Descrição de fatos, não juízo de valor sobre o diálogo."
- displayValue: síntese curta (máx. ~140 caracteres, sem adjetivo comparativo),
  ex.: "Reuniões com centrais sindicais e federações industriais (2025); diálogo com evangélicos (2026)". Context/notes detalham.
- evidenceStatus: "parcial" (análise), confidenceLevel "low" ou "medium".
- sources: ≥2, URLs reais verificadas via busca.

### negociacao_acordos (text)
- methodology: "Acordos e negociações documentados em fontes recentes
  (2025–2026): pautas, mediações, entendimentos partidários, greves,
  federações — análise aproximada com exemplos citados e fontes."
- mesmas marcas de evidência do diálogo.

### articulacao_apoio (number, unit "partidos")
- methodology: "Quantidade de partidos que compõem a coligação ou federação
  registrada para a Presidência (DJE/TSE, 2026) — proxy objetivo e comparável
  de articulação partidária. Partido isolado conta como 1."
- value: inteiro; displayValue: ex. "7 partidos (Federação …)"; availability "available";
  evidenceStatus "confirmado"; confidenceLevel "high"; fonte: registro DJE/TSE
  (pode reaproveitar a fonte de registro_tse criando id novo com o mesmo URL).

## Enrichments obrigatórios por natureza de dado

- **propostas_com_custo / com_prazo / dependentes_congresso** (hoje
  under_analysis/not_informed): conte sobre as propostas do próprio JSON
  (`governmentPlan.propositions` + fontes do plano). Devolva `value` = percentual
  inteiro (0–100), `availability: "available"`, `evidenceStatus: "parcial"` se
  estimativa de contagem, methodology dizendo "contagem sobre N propostas do
  plano registrado; classificação aproximada…". Se o plano for texto corrido
  sem propostas individuais, dê o percentual estimado com base em análise de
  eixos e explique.
- **equipe_gerida** (not_found em não-executivos): proxy = gabinete parlamentar
  (Câmara/Senado — nº de assessores do gabinete), estrutura de governo/estatal,
  partido ou empresa (fonte oficial/imprensa). value = pessoas (número).
- **maior_orcamento**: executivos = orçamento público real (LOA/união/estado);
  não-executivos = proxy do orçamento de campanha prestado ao TSE
  (prestação de contas 2022/2026) com methodology explicando a troca de base,
  confidenceLevel "low"–"medium". Último recurso: `not_applicable`.
- **bens_declarados**: declaração de bens na candidatura (TSE/jusbrasil/
  imprensa eleitoral) — Clariana e Samara devem ter em suas candidaturas.
- **bancada_partidaria_camara**: PRTB em 2026 (dputados eleitos/efetivos).
- **intencao_voto_recente**: Avalanche — pesquisas pós-15/09/2026 (Quaest
  28/09, Datafolha 24/09, Atlas…); se PRTB não for isolado, registre "fora das
  hipóteses; 'outros' X%" com fonte, availability "available", confidence "medium".
- **aprovacao_gestao**: Lula (aprovação do governo federal, pesquisa 2026) e
  Zema (aprovação da gestão em GO, 2025–2026) além do Caiado (já tem).
- **projetos_lei_aprovados**: parlamentares federais (Caiado, Hertz, Rui,
  Wilson, Flávio já tem) — Câmara/Senado (transparência: leis de autoria
  aprovadas). Vereadores: contar leis municipais se houver fonte; senão
  not_applicable.
- **votos_recebidos**: quem já disputou alguma eleição (nunca deixe por
  preencher se houve candidatura anterior). Zema tem; Cury/Clariana/Samara/
  Renan/Avalanche: pesquisar se já disputaram (vereador 2024, deputado etc.).
- **propostas_total**: Clariana e Samara — plano registrado (TSE/partido);
  se não houver plano publicado até 29/09, mantenha not_found com nota
  "plano não publicado até 29/09/2026" (fato, não falha de pesquisa).

## Formato do arquivo de patch

Escreva APENAS em `research/_patches/<slug>.json`:

```json
{
  "slug": "<slug>",
  "sources": [ { "id": "src-<slug>-NN", "title": "", "publisher": "", "url": "", "publishedAt": "2026-..", "accessedAt": "2026-09-29", "sourceType": "imprensa|oficial|transparencia|plano_de_governo|pesquisa_eleitoral|partidaria|eleitoral|editorial" } ],
  "metrics": [ { ... objeto Metrico COMPLETO, id canônico, categories nos slugs ... } ],
  "dataGaps": [ ... array COMPLETO substituindo o antigo (só lacunas ainda abertas) ... ]
}
```

- `metrics`: upsert por `id` — inclua TODAS as métricas que você preencheu,
  corrigiu ou criou (as demais ficam intocadas no arquivo principal).
- `dataGaps`: array completo do candidato depois das correções.
- id de fonte: prefixe `src-<slug>-` + número que não colida (veja os ids já
  existentes no JSON do candidato).
- Copie a forma dos campos dos arquivos `research/lula.json` ou
  `research/renan-santos.json` (eles são a referência de formato).

## Protocolo anti-falha (IMPORTANTE — segue à risca)

1. **Primeiro passe de escrita**: leia o TEMPLATE e a referência, e já crie
   `research/_patches/<slug>.json` com o esqueleto (sources vazio, metrics com
   as entradas AUSENTE já estruturadas, dataGaps copiado). Guarde cedo.
2. Preencha incrementando o arquivo a cada 2–3 buscas (read_file → patch/write).
   Nunca acumule tudo na memória.
3. `web_extract` costuma falhar neste ambiente — use principalmente
   `web_search` (snippets já trazem números) e tente extract só quando valer.
4. Fatos judiciais: classificação categórica pura, sem raciocínio sobre mérito.
5. Mensagem final: no máximo 8 linhas (o que preencheu + o que ficou aberto).
