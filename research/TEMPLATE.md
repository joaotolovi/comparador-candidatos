# Template de pesquisa — Comparador de Candidatos 2026

Contexto: produto editorial que compara candidatos à Presidência da República (eleição de 4 de out de 2026; hoje é 29/09/2026, 5 dias antes do 1º turno). NÃO é um portal de notícias: cada dado precisa ser verificável e atribuído a uma fonte. Nunca inventar dado. Dado não localizado = status "not_found", não zero.

## Regras de integridade editorial (obrigatórias)
1. Nada de opinião ou adjetivo avaliativo sem fonte. "Maior número" nunca é "melhor".
2. Integridade (D5): nunca misturar categorias jurídicas. Diferencie SEMPRE: denúncia / investigação / inquérito / processo / decisão / condenação / condenação definitiva / absolvição / arquivamento / decisão anulada. Cada item: status atual + instância + última atualização + fonte.
3. Toda afirmação recebe evidenceStatus: confirmado | parcial | indeterminado | contestado.
4. Toda métrica recebe confidenceLevel: high (documento oficial, direto) | medium (reconstrução de múltiplas fontes) | low (incompleto).
5. Priorizar fonte primária: TSE, Câmara, Senado, Planalto, DOU, portais de transparência, TCU, tribunais (STF/STJ/TSE), tribunais de contas estaduais, IBGE, Receita. Imprensa só para contexto complementar (marcar sourceType "imprensa").
6. Ausência de informação ≠ zero. Usar availability: available | zero | not_informed | not_found | not_applicable | under_analysis.
7. Nunca usar percentagem relativa quando confundir; deltas em p.p. para percentuais.

## Estrutura de saída (JSON, um arquivo por candidato em /root/comparador-candidatos/research/<slug>.json)

Campos (ver src/types/index.ts do projeto para os tipos completos):

```json
{
  "id": "slug",
  "slug": "slug",
  "name": "nome completo",
  "ballotName": "nome de urna",
  "ballotNumber": 13,
  "party": "PT",
  "coalition": "federação/coligação + vice (nome, partido)",
  "photoUrl": "URL de foto oficial/campanha (ou null)",
  "birthDate": "AAAA-MM-DD",
  "age": 80,
  "birthplace": "cidade/UF",
  "profession": "profissão declarada ao TSE",
  "currentRole": "cargo atual",
  "tagline": "1 frase factual-descritiva da trajetória (sem juízo)",
  "education": [ { "level": "graduacao|especializacao|mestrado|doutorado|curso", "field": "", "institution": "", "conclusionYear": 1975, "sources": [] } ],
  "professionalExperience": [ { "role": "", "organization": "", "startDate": "1978", "endDate": null, "description": "", "achievements": [], "sources": [] } ],
  "politicalExperience": [ { "role": "Deputado Federal", "organization": "Câmara", "startDate": "1987", "endDate": "1991", "description": "", "budgetManaged": null, "teamSize": null, "achievements": [], "sources": [] } ],
  "executiveExperience": [ { "role": "Presidente da República", "organization": "Governo Federal", "startDate": "2003", "endDate": "2010", "description": "", "budgetManaged": "R$ X bi/ano (fonte)", "teamSize": null, "achievements": ["..."], "sources": [] } ],
  "achievements": [ { "title": "", "context": "cargo/período", "description": "", "evidenceStatus": "", "confidenceLevel": "", "sources": [], "updatedAt": "" } ],
  "governmentPlan": {
    "title": "título oficial do plano",
    "totalProposals": 0,
    "registeredWith": "TSE (registro)",
    "registeredUrl": null,
    "planUrl": null,
    "statsIfCounted": { "objective": null, "target": null, "deadline": null, "cost": null, "funding": null, "fiscal": null, "agency": null, "instrument": null, "indicator": null, "congress": null },
    "statsEvidence": "parcial|indeterminado|...",
    "keyProposals": [ { "title": "", "theme": "Economia|Saúde|Educação|Segurança|Infraestrutura|Meio ambiente|Política social|Administração pública|Política externa|Ciência e tecnologia|Outros", "description": "", "hasCost": false, "costDetail": null, "deadline": null, "legalInstrument": null, "dependsOnCongress": false, "sources": [] } ],
    "updatedAt": ""
  },
  "metrics": [
    { "id": "anos_executivo", "category": "capacidade-execucao", "name": "Anos em cargos executivos", "displayValue": "N anos", "value": N, "unit": "anos", "metricType": "duration", "directionality": "higher_is_descriptively_more", "methodology": "soma dos períodos em cargos executivos (sem dupla contagem de mandatos simultâneos)", "evidenceStatus": "", "confidenceLevel": "", "availability": "", "sources": [], "updatedAt": "", "context": "" },
    { "id": "maior_orcamento", "displayValue": "R$ X bi/ano", "value": X, "unit": "R$ bi/ano", "metricType": "currency", ... },
    { "id": "anos_politica", "category": "historico-experiencia", ... },
    { "id": "anos_legislativo", "category": "articulacao", ... },
    { "id": "anos_federal", ... },
    { "id": "mandatos_eletivos", "category": "historico-experiencia", "metricType": "number", ... },
    { "id": "equipe_gerida", "displayValue": "N servidores", ... },
    { "id": "propostas_total", "category": "plano", ... },
    { "id": "propostas_com_custo", "metricType": "percentage", ... },
    { "id": "propostas_com_prazo", "metricType": "percentage", ... }
  ],
  "currentSupport": [ { "description": "base no Congresso/partidos que apoiam", "value": "", "date": "", "sources": [] } ],
  "negotiationHistory": [ { "description": "ex.: projetos-chave aprovados com votos, coalizões formadas", "value": "", "date": "", "sources": [] } ],
  "institutionalHistory": [ { "category": "transparencia|prestacao_de_contas|auditoria|contas_publicas|tribunal|patrimonial", "title": "", "legalStatus": "denuncia|investigacao|inquérito|processo|decisao|condenacao|condenacao_definitiva|absolvicao|arquivamento|decisao_anulada|aprovacao|reprovacao|regular", "currentStatus": "em_andamento|encerrado|suspenso", "instance": "", "lastUpdate": "", "description": "", "evidenceStatus": "", "confidenceLevel": "", "sources": [] } ],
  "sources": [],
  "updatedAt": "2026-09-29"
}
```

## Métricas numéricas alvo (calcular quando possível; senão marcar indisponível)
- anos em cargos executivos (sem dupla contagem)
- maior orçamento anual administrado (valor em R$ bi + fonte)
- pessoas/equipe sob gestão (servidores)
- anos de experiência política total / legislativa / executiva / federal
- nº de mandatos eletivos conquistados
- nº de projetos de lei aprovados (autor) quando legislativo
- nº de propostas do plano + % com custo, prazo, meta, financiamento (se plano já registrado/analisável; senão "under_analysis")
- propostas prioritárias que dependem de Congresso (%)
- registro de candidatura: situação no TSE (deferida? impugnações? Ficha Limpa?)

## Fonte mínima por item
{ "id": "src-lula-1", "title": "título da página", "publisher": "TSE", "url": "https://...", "publishedAt": "2026-08-16", "accessedAt": "2026-09-29", "sourceType": "oficial_eleitoral|legislativo|executivo_federal|diario_oficial|transparencia|tribunal|tribunal_de_contas|estatistico|economico|estadual|municipal|plano_de_governo|imprensa", "notes": "" }
