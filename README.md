# Comparador de Candidatos à Presidência 2026

Comparador **analítico** — não informativo — das candidaturas registradas no TSE
(1º turno em 4 de outubro de 2026). Cada promessa é confrontada com fatos
observáveis: histórico, instrumento legal necessário, base institucional, custo,
prazo, precedentes e evidências em sentido contrário. **A análise nunca conclui no
lugar de quem lê** — quem compara e quem julga é quem vota.

Produção: <https://candidato.joaotolovi.com>

## A regra editorial

Não existe uma seção "nossa análise". A análise mora **dentro de cada assunto**,
como um *teste de realidade* transversal:

| Teste | O que confronta |
|---|---|
| Proposta × histórico | Ações anteriores no mesmo sentido, no sentido oposto ou mudança de posição — com datas |
| Proposta × poder real do cargo | Ato do Executivo, lei ordinária, lei complementar, PEC, estados, municípios, agentes privados, negociação internacional — com o quórum factual de cada caminho |
| Proposta × sustentação política | Cadeiras do partido, coligação formalizada, federação, acordos documentados — sempre com o aviso "retrato atual, não previsão do próximo Congresso" |
| Proposta × capacidade de articulação | Negociações documentadas: com quantos atores, entre quais Poderes, quantas envolveram posições inicialmente divergentes |
| Discurso × ações | Para conceitos amplos (soberania, responsabilidade fiscal, meio ambiente…): posição, atos datados, evidências em linha, evidências em sentido diferente **e a explicação pública do próprio candidato** |
| Proposta × implementação | Meta, prazo, custo, fonte de recursos, instrumento, dependência do Congresso, indicador. O que falta vira **pergunta**, não acusação |

Cinco tipos de **ponto de tensão**, todos factuais e com fonte:
`mudanca-de-posicao`, `acao-em-sentido-diferente`, `proposta-sem-precedente`,
`proposta-x-restricao-institucional`, `proposta-x-outra-proposta`.

O que **não** existe no produto: nota, score, ranking, adjetivo de valor
("melhor/pior"), veredito de viabilidade ou conclusão sobre intenção. Um revisor
automático reprova o texto antes da publicação se aparecer juízo de valor.

Se o candidato não se pronunciou sobre um tema, a posição do **partido** pode
aparecer — sempre rotulada como posição partidária, nunca atribuída ao candidato.
Se não há nada, a lacuna é declarada. Onde a apuração não terminou, a interface diz
**"em consolidação"**: nada é estimado para preencher espaço.

## Números da base

- **13** candidaturas registradas no TSE
- **8** capacidades demonstradas por candidato, com **452** evidências (papel
  efetivamente exercido, complexidade, resultado observado, fonte)
- **10** temas fixos iguais para todos, com posição e teste de realidade
- **320** unidades com teste de realidade publicado (projeto de país, propostas,
  capacidades, Brasil no mundo, temas)
- **1.230** fontes catalogadas, todas com URL

Cada afirmação carrega `evidenceStatus` (`confirmado` | `parcial` |
`indeterminado` | `contestado`) e cada métrica carrega `confidenceLevel`
(`high` | `medium` | `low`).

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix), tipografia Inter
- Dados: `research/*.json` → `scripts/normalize.mjs` → `src/data/research.ts`
- Deploy: Docker multi-stage em Docker Swarm, atrás do Traefik

## Pipeline

```bash
# 1. patches de pesquisa (escritos em research/_patches/**)
python3 scripts/repair-realidade-patches.py    # namespace de id de fonte
python3 scripts/merge-realidade.py --dry-run   # gates do SPEC-REALIDADE
python3 scripts/merge-realidade.py             # grava nos JSONs de research/
python3 scripts/merge-patches.py               # métricas canônicas

# 2. verificação
node scripts/normalize.mjs
node scripts/audit-nivel1.mjs      # capacidades, evidências, indicadores de nível 1
node scripts/audit-analise.mjs     # gates anti-opinião da camada analítica
npx tsc --noEmit && npm run build
```

### Gates que abortam o merge

Juízo de valor ou adjetivo comparativo em minúscula (`melhor`, `pior`,
`superior`…) · `portanto … vai` · `proposal` e `tension.title` acima de 150
caracteres · `detail` e notas acima de 400 · tensão sem fonte ou com `kind` fora
da taxonomia · `path` institucional fora da taxonomia · PEC/LC sem quórum factual
· pergunta aberta que não é pergunta · `RealityCheck` sem methodology, status ou
confiança · fonte não resolvida · **id de fonte redefinido com URL diferente** (o
bug silencioso que faz a citação apontar para a fonte errada).

## Contratos de conteúdo

- `research/TEMPLATE.md` — formato do dossiê de cada candidato
- `research/SPEC-ENRICA.md` — regras de enriquecimento e uso de fontes
- `research/SPEC-CAPACIDADES.md` — as 8 capacidades e o que conta como evidência
- `research/SPEC-REALIDADE.md` — os 6 testes, a taxonomia de tensões e os 10 temas

## Rotas

- `/` — seleção de candidatos (até 3 simultâneos)
- `/comparar?c=slug,slug[,slug]` — comparação lado a lado (deep-linkável)
- `/candidato/[slug]` — perfil completo na mesma ordem das seções
- `/metodologia` — definições, quóruns, estados de evidência e limites do método

## Desenvolvimento

```bash
npm run dev        # http://localhost:3000
npm run build      # build de produção
node scripts/normalize.mjs   # regenera o dataset a partir de research/
```

## Deploy

Docker Swarm atrás do Traefik (rede `traefik-public`), host
`candidato.joaotolovi.com`:

```bash
docker build --no-cache -t comparador-candidatos:latest .
docker stack deploy -c docker-compose.yml comparador
docker service update --force comparador_comparador   # tag igual: o Swarm não recria sozinho
# DNS: registro A candidato.joaotolovi.com → 209.126.11.124 (Cloudflare, proxied)
# Certresolver do Traefik: letsencrypt
```

Frescor do deploy se prova pelo conjunto: digest do container == digest da tag,
container criado **depois** da imagem, `1/1 Up`, 200 nas rotas, marcador textual da
fase presente no HTML servido e zero erro no log. O ID impresso por
`docker build -q` **não** serve como prova (multi-stage/não determinístico).

## Fontes de dados

Prioridade a documentação primária: TSE (planos registrados, prestação de contas,
tabela de representatividade), Câmara, Senado, Executivo federal, Diários
Oficiais, portais de transparência, tribunais, tribunais de contas, órgãos
estatísticos, governos estaduais e prefeituras. Fontes jornalísticas apenas como
contexto complementar, identificadas — e a versão do próprio candidato entra
sempre que existe.

## Limites conhecidos

- Comparação de **documentos e atos**, não de intenções; ausência de precedente é
  declarada, nunca estimada.
- Base institucional é retrato do Congresso atual, não previsão eleitoral.
- Lacunas ficam visíveis: 3 candidatos não têm estrutura de equipe documentada,
  4 não têm posição pública sobre a guerra da Ucrânia, parte dos planos não
  informa custo total.
