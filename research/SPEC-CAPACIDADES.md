# SPEC-CAPACIDADES — contrato de conteúdo da V3 (capacidades demonstradas)

Este é o contrato para quem enriquece `research/*.json` na V3. Ele **substitui a hierarquia**
do `SPEC-ENRICA.md` (que continua válido para currículo, plano estruturado e opinião pública),
mudando a unidade de análise: **de currículo para capacidade demonstrada**.

Princípio central: **não comparar currículos, comparar capacidades demonstradas, usando o
currículo e o histórico como evidência.**

---

## 1. Vocabulário

| Termo | Significado |
|---|---|
| **Capacidade** | nível 1 da interface — o que o usuário precisa saber ("consegue transformar prioridades em entregas?"). Nunca um número. |
| **Evidência** | nível 2 — fato concreto e verificável que sustenta a capacidade (iniciativa, papel exercido, complexidade, resultado). |
| **Fonte** | nível 3 — documento, publicação oficial, votação, entrevista, legislação, dado público, vídeo. |
| **POSIÇÃO** (`posicao`) | "o candidato defende X". Declaração, plano, discurso. |
| **PROPOSTA** (`proposta`) | "o programa propõe Y" — o que ele pretende fazer. |
| **HISTÓRICO** (`historico`) | "no cargo Z, fez/decidiu W" — evidência de ato praticado. |

**Nunca misturar as três naturezas.** Querer fazer ≠ ter feito ≠ ter capacidade garantida de repetir.

## 2. Regras proibidas (violação = patch rejeitado)

1. **Sem nota, score, estrela ou ranking.** Nada de 0–10, nada de "nota de qualidade", nada de "melhor/pior", "mais preparado", "excelente", "fraco", "insuficiente" como juízo.
2. **Nada de contagem de cargo como competência.** `nº de servidores`, `anos em cargo executivo`, `tamanho do orçamento`, `nº de cargos/mandatos`, `nº de projetos apresentados`, `nº de seguidores` **não** são evidências de capacidade. Podem aparecer dentro da descrição de contexto de uma evidência (`context`), jamais como a evidência.
3. **Sem "Não encontrado" onde existe base razoável.** Análise aproximada é permitida e esperada, com `evidenceStatus: "parcial"` e `confidenceLevel: "low"|"medium"` + explicação no `methodology`/`coverageNote`.
4. **Sem célula vazia sem explicação.** Se não houver evidência suficiente, `coverage: "insuficiente"` e `coverageNote` dizendo o porquê (ex.: "nunca exerceu função pública; evidências de gestão são da trajetória privada/sindical").
5. **Sem fonte única fraca.** Verbete enciclopédico nunca sozinho: se for o único achado, declarar e procurar primária correspondente.

## 3. Faixa de evidências

- **Mínimo 3, máximo 6** evidências por capacidade por candidato.
- Quando a fonte permite mais que 6, escolher as de maior complexidade/resultado.
- Quando só existem 1–2, usar `coverage: "parcial"` + `coverageNote` e manter as que existem (nunca inventar nem omitir o que existe).

## 4. As 8 capacidades (bloco "Capacidade para governar")

| slug | nome | pergunta do usuário | o que **não** conta |
|---|---|---|---|
| `execucao` | Capacidade de execução | consegue transformar prioridades em entregas concretas? | nº de servidores, tempo de cargo, tamanho do orçamento |
| `dialogo-negociacao` | Diálogo, negociação e articulação | consegue construir entendimento e coordenar atores com interesses distintos? | nº de partidos sem explicar o que foi negociado |
| `lideranca-equipes` | Liderança e formação de equipes | consegue montar, coordenar, delegar e manter equipes funcionando? | quantas pessoas estavam formalmente subordinadas |
| `tomada-decisao` | Tomada de decisão | como enfrentou decisões difíceis e trade-offs? | anos de experiência executiva |
| `gestao-crises` | Gestão de crises e mudança | como atuou quando o cenário mudou ou surgiu situação crítica? | ausência de crise na gestão como mérito |
| `coordenacao-institucional` | Coordenação institucional | consegue trabalhar entre instituições, níveis de governo e organizações? | tempo no Executivo |
| `comunicacao-publica` | Comunicação pública | consegue explicar prioridades, decisões e posições de forma compreensível e consistente? | nº de seguidores, aparições na mídia sem conteúdo |
| `visao-estrategica` | Visão estratégica | consegue definir prioridades e conectar curto prazo a objetivos maiores? | tamanho do plano de governo |

Cada capacidade, no patch, entrega: `synthesis` (camada 1, 2–3 linhas factuais, sem adjetivo de valor), `coverage`, `coverageNote` (quando não `documentada`), `evidences[]`.

### 4.1 Evidência — campos obrigatórios

```json
{
  "id": "ev-cap-execucao-01",
  "kind": "historico",
  "title": "Coordenação do plano de contenção de desastres em X",
  "role": "coordenador estadual (nomeado por ato publicado em DD/MM/AAAA)",
  "complexity": "12 municípios, 4 órgãos, R$ 380 mi, prazo de 90 dias",
  "outcome": "prazo cumprido; relatório final publicado no Diário Oficial",
  "period": "2021–2022",
  "context": "contexto em 1–2 linhas (situação, pressão, restrições)",
  "sources": [{ "id": "src-cg-70" }],
  "evidenceStatus": "confirmado",
  "confidenceLevel": "high"
}
```

`role`, `complexity` e `sources` são **obrigatórios**. `outcome` é fortemente preferível: evidência sem resultado observável deve declarar isso em `context`.

### 4.2 Escala de complexidade (usar sempre os mesmos eixos)

Declarar de forma objetiva: **alcance** (municipal/estadual/nacional/internacional) · **nº de atores/instituições envolvidos** · **recursos envolvidos** (R$ ou nº de pessoas, quando houver) · **duração** · **resultado observável**.

### 4.3 Comparabilidade entre trajetórias

Vale para qualquer origem: mandato legislativo, ministério, governo estadual/municipal, sindicato, empresa, associação, campanha, organismo internacional. Liderar iniciativa complexa em qualquer uma dessas arenas é evidência legítima — o que muda é o `context`, não o peso do cargo.

## 5. Bloco 1 — PROJETO DE PAÍS (campo `countryProject`)

```json
{
  "vision": "síntese neutra em 2–3 linhas do Brasil descrito para 10–20 anos",
  "nationalPriorities": ["economia", "educação", "segurança", "saúde", "infraestrutura", "tecnologia", "meio ambiente"],
  "developmentModel": "síntese do papel atribuído a crescimento, Estado, setor privado, tecnologia, educação, infraestrutura, meio ambiente e desigualdade",
  "sources": [{ "id": "src-...-01" }],
  "evidenceStatus": "confirmado",
  "confidenceLevel": "high",
  "methodology": "de onde saiu (plano registrado no TSE, discursos, entrevistas, programa partidário) e o que não foi possível extrair"
}
```

`nationalPriorities`: **5 a 7** prioridades **declaradas pelo próprio candidato**, não inferidas por nós.

## 6. Bloco 4 — BRASIL NO MUNDO (campo `foreignPolicy`)

```json
{
  "worldView": "posições documentadas por região/tema (EUA, China, América Latina, UE, BRICS, Mercosul, Sul Global, multilateralismo, conflitos, comércio, clima, segurança)",
  "strategy": "o que pretende obter: comércio/investimento, influência diplomática, integração regional, defesa, clima/energia, tecnologia",
  "internationalExperience": "negociações conduzidas, fóruns multilaterais, acordos, relação institucional — com peso proporcional à responsabilidade efetiva",
  "projection": "projeção internacional: veículos estrangeiros, fóruns globais, convites institucionais, interlocução com lideranças",
  "projectionNote": "projeção internacional mede notoriedade, não capacidade diplomática",
  "sources": [{ "id": "src-...-02" }],
  "evidenceStatus": "parcial",
  "confidenceLevel": "medium",
  "methodology": "..."
}
```

Regras específicas desta área:
- **Reunião protocolar ≠ negociação conduzida.** Qualificar a responsabilidade (participou / representou / conduziu / decidiu).
- Quando não houver posição documentada sobre um tema, dizer que não há — não inferir alinhamento por partido.

## 7. Transversal — COERÊNCIA (campo `coherence[]`)

```json
{
  "id": "coh-previdencia",
  "theme": "previdência",
  "timeline": [
    { "year": "2019", "position": "votou a favor da reforma (votação nominal, fonte)", "sources": [{"id": "src-...-03"}] },
    { "year": "2026", "position": "propõe revisão de X", "sources": [{"id": "src-...-04"}] }
  ],
  "publicExplanation": "explicação pública da mudança, quando existir",
  "statedPosition": "POSIÇÃO atual declarada",
  "proposedAction": "PROPOSTA relacionada",
  "historicalAction": "HISTÓRICO — voto, medida, projeto ou decisão já praticada",
  "tensionNote": "tensão documentada, sem juízo: 'a proposta A implica despesa; o plano fiscal prevê B; não detalha conciliação'",
  "evidenceStatus": "confirmado",
  "confidenceLevel": "medium"
}
```

Nunca concluir "portanto vai cumprir" ou "portanto é incoerente". Mostrar a relação e o contexto.

## 8. Formato do patch (obrigatório)

Arquivo: `research/_patches/capacidades/<grupo>.<escopo>.json`

```json
{
  "grupo": "g1",
  "escopo": "capacidade:execucao",
  "sources": [ { "id": "src-lula-90", "title": "...", "publisher": "...", "url": "...", "publishedAt": "2026-...", "accessedAt": "2026-09-29", "sourceType": "imprensa", "notes": "..." } ],
  "candidates": {
    "lula": {
      "capacities": [
        { "slug": "execucao", "synthesis": "...", "coverage": "documentada", "coverageNote": null, "evidences": [ /* §4.1 */ ] }
      ]
    }
  },
  "dataGaps": ["o que não foi possível encontrar e por quê"]
}
```

Campos aceitos por candidato no patch: `capacities[]`, `countryProject`, `foreignPolicy`, `coherence[]`.
IDs de fonte novos seguem o padrão `src-<slug-curto>-NN` (ex.: `src-caiado-70`) e **nunca** colidem com ids existentes no JSON principal (conferir antes).

## 9. Fontes

Prioridade: **fonte primária** (diário oficial, ato de nomeação, votação nominal, ficha de matéria, prestação de contas TSE, relatório de órgão de controle, plano registrado no TSE) → **imprensa de referência** → **verbete/enciclopédia** (só como apoio, nunca sozinho).
Recência: para **posições atuais e projeção**, usar 2025–2026. Para **fatos históricos**, manter a data real do fato (não "atualizar" o passado).

## 10. Protocolo anti-rejeição (obrigatório)

1. Escrever o **esqueleto do patch ANTES** das buscas (todos os candidatos do grupo, com `coverage: "insuficiente"` e `coverageNote: "em consolidação"`).
2. Atualizar o arquivo a cada 2–3 buscas — nunca acumular para o fim.
3. `thinking` curto; fatos judiciais/categóricos copiados literalmente da fonte, sem interpretar mérito.
4. Se uma busca bloquear (403/WAF), tentar Wayback Machine, `web_search` com trecho literal, ou curl com UA de navegador. `web_extract` não funciona neste ambiente.
5. Última mensagem: ≤8 linhas — o que entregou, contagens, lacunas.

## 11. Gates de validação (aplicados no merge)

O merge (`scripts/merge-capacidades.py`) rejeita o patch se:
- `slug` de capacidade fora dos 8 canônicos; campo obrigatório de evidência ausente;
- `sources[].id` não existir no pool do candidato **nem** no bloco `sources` do patch;
- `synthesis` contiver adjetivo de valor (`melhor|pior|maior articulador|excelente|fraco|ineficiente|brilhante`);
- capacidade com `< 3` evidências e `coverage` diferente de `parcial`/`insuficiente`, ou sem `coverageNote`;
- `id` de evidência duplicado.
