# Comparador de Candidatos — Eleição 2026

Comparador editorial de candidaturas à Presidência da República do Brasil
(Eleição 2026, 1º turno em 4 de outubro): currículo, experiência, plano de
governo e histórico público lado a lado, no modelo de comparadores de
produtos — cada afirmação com fonte, metodologia e status de evidência.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui (Radix)
- Tipografia: Archivo variable (eixo de largura como hierarquia)
- Dados: `src/data/candidates.ts` gerado por `scripts/normalize.mjs` a
  partir de `research/*.json` (pesquisa estruturada com fontes).

## Princípios editoriais (não negociáveis)
- Os mesmos critérios para todos os candidatos.
- Diferenças objetivas são mostradas com assertividade; nenhuma métrica é
  transformada automaticamente em "melhor/pior" ou recomendação de voto.
- Ausência de informação não é zero: `not_found` / `not_informed` /
  `not_applicable` / `under_analysis` são estados visuais distintos.
- Integridade: categoria jurídica exata de cada registro (denúncia ≠
  processo ≠ condenação ≠ condenação definitiva), com absolvições e
  arquivamentos no mesmo destaque.
- Toda afirmação relevante tem fonte clicável e data.

## Desenvolvimento
```bash
npm run dev        # http://localhost:3000
npm run build      # build de produção
node scripts/normalize.mjs   # regenera o dataset a partir de research/
```

## Deploy
Docker Compose atrás do Traefik (rede `traefik_public`), host
`candidato.joaotolovi.com`:
```bash
docker build -t comparador-candidatos:latest .
docker stack deploy -c docker-compose.yml comparador

# DNS: registro A candidato.joaotolovi.com → 209.126.11.124 na zona
# joaotolovi.com (Cloudflare, **proxied**). Rede externa: traefik-public.
# Certresolver do Traefik: letsencrypt. Smoke:
#   curl -sSI --resolve candidato.joaotolovi.com:443:209.126.11.124 \
#     https://candidato.joaotolovi.com/
```

## Rotas
- `/` — seleção de candidatos (até 3 simultâneos)
- `/comparar?c=slug,slug[,slug]` — comparação lado a lado (deep-linkável)
- `/candidato/[slug]` — perfil completo com timeline e plano
- `/metodologia` — definições, fórmulas e estados de evidência

## Fontes de dados
Prioridade a documentação primária: TSE, Câmara, Senado, Executivo
federal, Diários Oficiais, portais de transparência, tribunais, tribunais
de contas, órgãos estatísticos, governos estaduais e prefeituras.
Fontes jornalísticas apenas como contexto complementar, identificadas.
