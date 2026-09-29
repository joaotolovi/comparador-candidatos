# SPEC — TESTE DE REALIDADE (camada analítica V4)

Contrato de conteúdo para a camada analítica do Comparador de Candidatos 2026.
Complementa `SPEC-ENRICA.md` (fontes) e `SPEC-CAPACIDADES.md` (capacidades).
**Regra-mãe:** a análise mostra a distância entre promessa e realidade observável.
Nunca conclui sobre qualidade, viabilidade, intenção ou capacidade futura.

## §1 Os 6 testes

1. **Proposta × histórico** — há ações anteriores no mesmo sentido? em sentido diferente?
   houve mudança de posição? Resultado sempre factual, nunca nota.
2. **Proposta × poder real do cargo** — o que a proposta exige:
   ato do Executivo · lei ordinária · lei complementar · PEC · depende de estados ·
   depende de municípios · depende de agentes privados · negociação internacional.
   Quóruns (fatos): PEC = 308 deputados + 49 senadores, em dois turnos em cada Casa;
   lei complementar = 257 na Câmara e 41 no Senado (maioria absoluta);
   lei ordinária = maioria dos votos presentes, observado o quórum de deliberação.
3. **Proposta × sustentação política** — só elementos observáveis hoje: cadeiras do partido,
   coligação formalizada, federação, acordos suprapartidários documentados.
   **Sempre** com o aviso: "Retrato atual, não previsão do próximo Congresso."
4. **Proposta × capacidade de articulação** — nº de negociações documentadas, com quantos
   atores diferentes, entre Poderes, e quantas envolveram posições inicialmente divergentes.
   Sem material: "Não localizamos episódios comparáveis suficientes na trajetória analisada."
5. **Discurso × ações** — para conceitos amplos (soberania, democracia, responsabilidade
   fiscal, liberdade, combate à corrupção, defesa ambiental, segurança, direitos sociais):
   posição atual → ações relacionadas (datadas) → evidências em linha → evidências em
   sentido diferente → **explicação pública do próprio candidato, quando existir**.
6. **Proposta × detalhes de implementação** — meta, prazo, custo, fonte de recursos,
   instrumento, dependência do Congresso, indicador de resultado. O que faltar vira
   **"O que falta explicar"** em forma de pergunta, nunca como acusação.

## §2 Pontos de tensão (taxonomia fechada)

`mudanca-de-posicao` · `acao-em-sentido-diferente` · `proposta-sem-precedente` ·
`proposta-x-restricao-institucional` · `proposta-x-outra-proposta`

Cada tensão: `kind`, `title` (≤150 chars), `detail` (≤400 chars), `sources` (≥1),
`evidenceStatus`, `confidenceLevel`. **Nunca** escrever "contradição" como juízo;
"Ponto de atenção" é o rótulo visual, sem alarme.

## §3 Formato de saída (patch)

`research/_patches/realidade/<grupo>.<escopo>.json`:

```json
{
  "grupo": "r1", "escopo": "propostas",
  "sources": [ { "id": "src-re-01", "title": "…", "url": "…", "publisher": "…", "date": "2026-…", "type": "…" } ],
  "candidates": {
    "<slug>": {
      "reality": { "proposal": "…", "requirement": {…}, "history": {…}, "support": {…},
                   "tensions": [ … ], "openQuestions": [ … ], "publicExplanation": "…",
                   "methodology": "…", "evidenceStatus": "parcial", "confidenceLevel": "medium" },
      "proposals": [ { "id": "…", "reality": { … } } ],
      "capacities": [ { "slug": "execucao", "reality": { … } } ],
      "foreignPolicy": { "reality": { … } }
    }
  },
  "dataGaps": [ "…" ]
}
```

Ids de fonte `src-re-NN` (globais do escopo) ou reaproveitados do candidato.
**Nunca** reutilizar um id existente com URL diferente — o merge reprova.

## §4 Limites de texto (gate automático)

- `proposal`, `tension.title`, `openQuestions.question`, `history.*`: **≤150 caracteres**.
- `tension.detail`, `support.note`, `publicExplanation`, `methodology`: **≤400 caracteres**.

## §5 Vocabulário proibido

portanto (concluindo cumprimento) · inviável · não conseguirá · não tem força ·
nunca fez · promessa vazia · na prática não · claramente · obviamente ·
melhor · pior · superior · inferior (em minúscula) · qualquer nota/score/ranking.

## §6 Obrigatório em toda unidade com `reality`

`methodology` (como foi apurado e o que ficou de fora) · `evidenceStatus` ·
`confidenceLevel`. Sem `support` quando não houver dado: explicitar em `methodology`
que a base não foi localizada — nunca inventar número de cadeiras.

## §7 Protocolo de trabalho

Esqueleto antes das buscas; atualizar a cada 2–3 buscas; thinking curto; final ≤8 linhas;
`web_extract` indisponível (`web_search` + `curl` com UA; 403 → Wayback).
Nunca editar os JSONs principais: só o patch do próprio grupo.

## §8 Seção 07 — Posições por grandes temas (10 fixos)

Conjunto fechado, o mesmo para os 13: `economia` · `seguranca` · `saude` · `educacao` ·
`clima` · `trabalho` · `tributacao` · `previdencia` · `habitacao` · `instituicoes`.

Para cada (candidato, tema) produzir um item:

```json
{
  "slug": "saude", "name": "Saúde", "kind": "proposta",
  "position": "≤150 chars — o que propõe, com o rótulo da origem (plano/declaração/ato)",
  "sourceKind": "candidato" | "partido",
  "sources": [ … ],
  "reality": { … RealityCheck … }
}
```

**Regra de origem (decisão do dono):**
1. Prioridade 1 — **posição do próprio candidato**: plano registrado no TSE, sabatina,
   entrevista, voto, ato de governo/mandato. `sourceKind: "candidato"`.
2. Se não houver posição do candidato: usar a **posição do partido** (programa/manifesto/
   resolução registrada no TSE) e **rotular explicitamente** `sourceKind: "partido"` — a
   interface mostra "Posição do partido (não declaração do candidato)".
3. Se não houver nem do candidato nem do partido sobre o tema: `sourceKind: "ausente"`,
   `position` = "Não localizamos posição documentada do candidato nem do partido neste tema"
   e `reality.methodology` registra a base de busca. Nunca preencher por inferência.

O tema `instituicoes` cobre sistema político, Judiciário, Legislativo, federalismo e
regras eleitorais. Em todos os temas o teste de realidade segue §1 (2, 4, 5, 6) e §2.
