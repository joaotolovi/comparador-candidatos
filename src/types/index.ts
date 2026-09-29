// ─── Core domain types ────────────────────────────────────────────────────────
// Dados separados da apresentação: tudo que a UI consome vive aqui.
// Arquitetura pronta para API futura: os loaders de src/data são a única
// fronteira entre "de onde vêm os dados" e os componentes.

export type EvidenceStatus =
  | "confirmado"
  | "parcial"
  | "indeterminado"
  | "contestado";

export type ConfidenceLevel = "high" | "medium" | "low";

export type DataAvailability =
  | "available" // valor existe e é conhecido
  | "zero" // valor é efetivamente 0
  | "not_informed" // candidato não informou
  | "not_found" // não localizado em fontes
  | "not_applicable" // não se aplica
  | "under_analysis"; // em análise pela equipe

export type MetricType =
  | "number"
  | "percentage"
  | "currency"
  | "duration"
  | "boolean"
  | "text"
  | "categorical";

/**
 * Directionality SEMPRE descritiva. Nunca existe "higher_is_better":
 * o produto não julga, ele descreve. "context_required" sinaliza que
 * a interpretação depende de pesos que só o usuário pode atribuir.
 */
export type Directionality =
  | "higher_is_descriptively_more"
  | "lower_is_descriptively_less"
  | "neutral"
  | "context_required";

export type SourceType =
  | "oficial_eleitoral"
  | "legislativo"
  | "executivo_federal"
  | "diario_oficial"
  | "transparencia"
  | "tribunal"
  | "tribunal_de_contas"
  | "estatistico"
  | "economico"
  | "estadual"
  | "municipal"
  | "plano_de_governo"
  | "partidaria" // site/oficial de partido ou campanha
  | "pesquisa_eleitoral" // instituto de pesquisa registrado no TSE
  | "imprensa"
  | "editorial"; // verbetes enciclopédicos (ex.: Wikipédia)

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string; // ISO; opcional — nem toda fonte tem data
  accessedAt: string; // ISO
  sourceType: SourceType;
  archivedUrl?: string;
  notes?: string;
}

export interface Metric {
  id: string;
  category: string; // slug da dimensão
  name: string;
  /** valor bruto para cálculo (number) ou null quando indisponível */
  value: number | null;
  displayValue: string;
  unit?: string;
  metricType: MetricType;
  directionality: Directionality;
  methodology: string;
  /** por que o dado não foi encontrado (quando availability é not_* ) */
  notFoundStatus?: string;
  /** texto do valor em métricas de tipo text */
  valueText?: string;
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
  availability: DataAvailability;
  sources: Source[];
  updatedAt: string; // ISO
  /** texto opcional de contexto exibido no drawer de evidências */
  context?: string;
  /** como os dados foram apresentados na fonte (template de pesquisa) */
  dataPresentation?: "structured" | "original" | "editorial" | "notes_only";
}

export interface ExperienceEntry {
  id: string;
  role: string;
  organization: string;
  startDate: string; // YYYY ou YYYY-MM
  endDate: string | null; // null = atual
  description: string;
  budgetManaged?: string; // display value (ex.: "R$ 42 bi/ano")
  teamSize?: number;
  achievements: string[];
  sources: Source[];
}

export interface EducationEntry {
  id: string;
  level: "graduacao" | "especializacao" | "mestrado" | "doutorado" | "curso";
  field: string;
  institution: string;
  conclusionYear: number | null;
  notes?: string;
  sources: Source[];
}

export interface Achievement {
  id: string;
  title: string;
  context: string; // cargo/período ao qual se vincula
  description: string;
  sources: Source[];
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
  updatedAt: string;
}

export interface PlanProposal {
  id: string;
  title: string;
  description: string;
  theme: string; // Economia, Saúde, ...
  hasClearObjective: boolean;
  hasQuantitativeTarget: boolean;
  hasDeadline: boolean;
  hasCostEstimate: boolean;
  hasFundingSource: boolean;
  hasFiscalImpact: boolean;
  legalInstrument?: string;
  requiresNewLaw: boolean;
  requiresConstitutionalAmendment: boolean;
  dependsOnCongress: boolean;
  dependsOnStates: boolean;
  dependsOnMunicipalities: boolean;
  responsibleAgency?: string;
  resultIndicator?: string;
  identifiedRisks?: string[];
  methodologyStatus: EvidenceStatus;
  sources: Source[];
}

export interface GovernmentPlan {
  title?: string;
  planUrl?: string;
  totalProposals: number;
  registeredWith: string; // onde o plano está registrado
  registeredUrl?: string;
  summary?: string;
  /** notas editoriais quando o plano não é contável por proposta */
  notes?: string;
  /** agregações textuais/numéricas do plano, se a análise foi contável */
  statsIfCounted?: Record<string, string | number | null> | null;
  statsEvidence?: EvidenceStatus;
  proposals: PlanProposal[];
  sources: Source[];
  updatedAt: string;
}

export type CoalitionSupport = {
  id: string;
  description: string;
  value: string;
  date: string;
  sources: Source[];
};

export interface InstitutionalRecord {
  id: string;
  category:
    | "transparencia"
    | "prestacao_de_contas"
    | "auditoria"
    | "contas_publicas"
    | "tribunal"
    | "patrimonial"
    | "eleitoral";
  title: string;
  /** categoria jurídica precisa — nunca misturar denúncia com condenação */
  legalStatus:
    | "denuncia"
    | "acusacao"
    | "investigacao"
    | "inquerito"
    | "processo"
    | "decisao"
    | "condenacao"
    | "condenacao_definitiva"
    | "absolvicao"
    | "arquivamento"
    | "decisao_anulada"
    | "aprovacao"
    | "reprovacao"
    | "regular"
    | "investigacao_com_medidas_cautelares"
    | "registro_indeferido"
    | "decisao_judicial_eleitoral"
    | "candidatura_nao_apta";
  currentStatus: "em_andamento" | "encerrado" | "suspenso";
  instance: string;
  lastUpdate: string;
  description: string;
  sources: Source[];
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
}

export interface Candidate {
  id: string;
  slug: string;
  name: string;
  ballotName?: string;
  ballotNumber: number;
  photo: string; // path ou data-uri; mock usa iniciais
  party: string; // partido fictício
  coalition: string;
  birthDate: string;
  birthplace?: string;
  age: number;
  profession: string;
  currentRole: string;
  tagline: string; // descrição editorial de 1 linha factual-descritiva
  education: EducationEntry[];
  professionalExperience: ExperienceEntry[];
  politicalExperience: ExperienceEntry[];
  executiveExperience: ExperienceEntry[];
  achievements: Achievement[];
  governmentPlan: GovernmentPlan;
  /** apoio formal atual — separado do histórico de articulação */
  currentSupport: CoalitionSupport[];
  /** histórico de articulação e governabilidade */
  negotiationHistory: CoalitionSupport[];
  institutionalHistory: InstitutionalRecord[];
  /** V3 — bloco 1: para onde o candidato quer levar o país */
  countryProject?: CountryProject;
  /** V3 — bloco 3: capacidades demonstradas, cada uma com evidências */
  capacities?: Capacity[];
  /** V3 — bloco 4: como enxerga o Brasil no mundo */
  foreignPolicy?: ForeignPolicy;
  /** V3 — transversal: coerência entre posições, propostas e histórico */
  coherence?: CoherenceItem[];
  metrics: Metric[];
  sources: Source[];
  updatedAt: string; // ISO — última atualização do perfil
}

export const DIMENSIONS = [
  {
    slug: "capacidade-execucao",
    name: "Capacidade de execução",
    shortName: "Execução",
    question:
      "Que evidências existem de que esta pessoa consegue transformar objetivos em ações e resultados?",
    description:
      "Cargos executivos ocupados, tempo, orçamento, equipes, programas implementados e histórico de entregas documentados.",
  },
  {
    slug: "plano",
    name: "Qualidade e viabilidade do plano",
    shortName: "Plano",
    question:
      "O plano apresentado possui objetivos claros, detalhamento e mecanismos plausíveis de implementação?",
    description:
      "Cada proposta do plano foi verificada quanto a meta, prazo, custo, financiamento e instrumento jurídico.",
  },
  {
    slug: "historico-experiencia",
    name: "Histórico e experiência",
    shortName: "Histórico",
    question:
      "Qual é a trajetória desta pessoa e que resultados anteriores estão documentados?",
    description:
      "Formação, experiência profissional, trajetória política e realizações associadas a cargos anteriores.",
  },
  {
    slug: "articulacao",
    name: "Articulação e governabilidade",
    shortName: "Articulação",
    question:
      "Que histórico esta pessoa possui na construção de apoio institucional necessário para implementar uma agenda?",
    description:
      "Histórico legislativo, aprovações, coalizões e coordenação federativa — com apoio atual sempre separado do histórico.",
  },
  {
    slug: "integridade",
    name: "Integridade e responsabilidade institucional",
    shortName: "Integridade",
    question:
      "Qual é o histórico público e documentado desta pessoa em relação à transparência, responsabilidade e instituições?",
    description:
      "Transparência, prestação de contas, auditorias e processos — com a categoria jurídica de cada caso sempre explícita.",
  },
] as const;

export type DimensionSlug = (typeof DIMENSIONS)[number]["slug"];

// ─── V3: capacidades demonstradas ────────────────────────────────────────────
// Mudança conceitual: o nível principal compara CAPACIDADES sustentadas por
// EVIDÊNCIAS verificáveis; currículo, orçamento e tamanho de estrutura deixam de
// ser a métrica e passam a ser contexto. Nunca há nota, score ou ranking.

/** Natureza da afirmação. Nunca misturar: querer fazer ≠ ter feito. */
export type ClaimKind = "posicao" | "proposta" | "historico";

export type CapacitySlug =
  | "execucao"
  | "dialogo-negociacao"
  | "lideranca-equipes"
  | "tomada-decisao"
  | "gestao-crises"
  | "coordenacao-institucional"
  | "comunicacao-publica"
  | "visao-estrategica";

export type EvidenceCoverage = "documentada" | "parcial" | "insuficiente";

export interface CapacityEvidence {
  id: string;
  kind: ClaimKind;
  title: string;
  /** papel efetivamente exercido (relator, coordenador, ministro...) */
  role: string;
  /** complexidade objetiva: alcance, atores, recursos, duração */
  complexity: string;
  /** resultado observável, quando existir */
  outcome?: string;
  period: string;
  context?: string;
  sources: Source[];
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
}

export interface Capacity {
  slug: CapacitySlug;
  name: string;
  /** a pergunta do usuário que esta capacidade responde */
  question: string;
  /** camada 1 — síntese factual de 2–3 linhas, sem adjetivo de valor */
  synthesis: string;
  coverage: EvidenceCoverage;
  /** por que a cobertura é parcial/insuficiente (honestidade explícita) */
  coverageNote?: string;
  /** camada 2 — 3 a 6 evidências concretas */
  evidences: CapacityEvidence[];
  updatedAt: string;
}

export interface CountryProject {
  vision: string;
  /** 5–7 prioridades declaradas pelo próprio candidato */
  nationalPriorities: string[];
  developmentModel: string;
  sources: Source[];
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
  methodology?: string;
  updatedAt: string;
}

export interface ForeignPolicy {
  worldView: string;
  strategy: string;
  internationalExperience: string;
  projection: string;
  /** "projeção internacional mede notoriedade, não capacidade diplomática" */
  projectionNote: string;
  sources: Source[];
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
  methodology?: string;
  updatedAt: string;
}

export interface CoherencePoint {
  year: string;
  position: string;
  sources: Source[];
}

export interface CoherenceItem {
  id: string;
  theme: string;
  timeline: CoherencePoint[];
  publicExplanation?: string;
  statedPosition?: string;
  proposedAction?: string;
  historicalAction?: string;
  tensionNote?: string;
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
}

export const CAPACITY_CATALOG: {
  slug: CapacitySlug;
  name: string;
  question: string;
  /** o que NÃO conta como evidência desta capacidade */
  excludes: string;
}[] = [
  {
    slug: "execucao",
    name: "Capacidade de execução",
    question: "Consegue transformar prioridades em entregas concretas?",
    excludes: "Número de servidores, tempo de cargo e tamanho do orçamento.",
  },
  {
    slug: "dialogo-negociacao",
    name: "Diálogo, negociação e articulação",
    question:
      "Consegue construir entendimento e coordenar atores com interesses diferentes?",
    excludes: "Número de partidos sem explicar o que foi negociado.",
  },
  {
    slug: "lideranca-equipes",
    name: "Liderança e formação de equipes",
    question: "Consegue montar, coordenar, delegar e manter equipes funcionando?",
    excludes: "Quantidade de pessoas formalmente subordinadas.",
  },
  {
    slug: "tomada-decisao",
    name: "Tomada de decisão",
    question: "Como enfrentou decisões difíceis, trade-offs e pressão?",
    excludes: "Anos de experiência executiva como proxy de critério.",
  },
  {
    slug: "gestao-crises",
    name: "Gestão de crises e mudança",
    question: "Como atuou quando o cenário mudou ou surgiu uma situação crítica?",
    excludes: "Ausência de crise na gestão como mérito.",
  },
  {
    slug: "coordenacao-institucional",
    name: "Coordenação institucional",
    question:
      "Consegue trabalhar entre instituições, níveis de governo e organizações?",
    excludes: "Tempo acumulado no Executivo.",
  },
  {
    slug: "comunicacao-publica",
    name: "Comunicação pública",
    question:
      "Consegue explicar prioridades, decisões e posições de forma compreensível e consistente?",
    excludes: "Número de seguidores e aparições na mídia sem conteúdo.",
  },
  {
    slug: "visao-estrategica",
    name: "Visão estratégica",
    question:
      "Consegue definir prioridades e conectar decisões de curto prazo a objetivos maiores?",
    excludes: "Tamanho do plano de governo.",
  },
];

/** Seções da experiência V3, na ordem em que aparecem. */
export type SectionSlug =
  | "pais"
  | "caminho"
  | "capacidades"
  | "mundo"
  | "coerencia"
  | "opiniao"
  | "historico"
  | "integridade";

export const SECTIONS: {
  slug: SectionSlug;
  name: string;
  question: string;
  /** content = conteúdo novo (capacidades/projeto/mundo); metrics = linhas de dados */
  kind: "content" | "metrics";
  /** seções de currículo/opinião ficam depois das de capacidade */
  secondary?: boolean;
}[] = [
  {
    slug: "pais",
    name: "Para onde querem levar o Brasil?",
    question: "Qual país cada candidato descreve para os próximos 10–20 anos?",
    kind: "content",
  },
  {
    slug: "caminho",
    name: "Como pretendem chegar lá?",
    question: "Como as prioridades declaradas se transformam em propostas concretas?",
    kind: "content",
  },
  {
    slug: "capacidades",
    name: "Que capacidades suas trajetórias demonstram?",
    question: "Que evidências concretas existem de cada capacidade necessária para governar?",
    kind: "content",
  },
  {
    slug: "mundo",
    name: "Como enxergam o Brasil no mundo?",
    question: "Qual visão de política externa, estratégia e experiência internacional?",
    kind: "content",
  },
  {
    slug: "coerencia",
    name: "O que suas trajetórias mostram?",
    question: "Existe continuidade entre o que dizem, propõem e fizeram?",
    kind: "content",
  },
  {
    slug: "opiniao",
    name: "Opinião pública",
    question: "O que as pesquisas registradas mostram — sem relação com competência.",
    kind: "metrics",
    secondary: true,
  },
  {
    slug: "historico",
    name: "Histórico e trajetória",
    question: "Currículo e percurso: medem oportunidade institucional, não capacidade.",
    kind: "metrics",
    secondary: true,
  },
  {
    slug: "integridade",
    name: "Integridade e responsabilidade institucional",
    question: "Transparência, prestação de contas e processos, com a categoria jurídica explícita.",
    kind: "content",
    secondary: true,
  },
];

/** Métrica do currículo/plano/opinião → seção onde ela aparece. */
export const SECTION_OF_METRIC: Record<string, SectionSlug> = {
  // plano (Como pretendem chegar lá)
  propostas_total: "caminho",
  propostas_com_custo: "caminho",
  propostas_com_prazo: "caminho",
  propostas_dependentes_congresso: "caminho",
  // opinião pública
  aprovacao_gestao: "opiniao",
  intencao_voto_recente: "opiniao",
  // histórico e trajetória (currículo)
  anos_politica: "historico",
  anos_legislativo: "historico",
  anos_federal: "historico",
  anos_executivo: "historico",
  maior_orcamento: "historico",
  equipe_gerida: "historico",
  mandatos_eletivos: "historico",
  votos_recebidos: "historico",
  bens_declarados: "historico",
  registro_tse: "historico",
  // indicadores objetivos que sustentam capacidades (aparecem junto das evidências)
  projetos_lei_aprovados: "capacidades",
  bancada_partidaria_camara: "capacidades",
  capacidade_dialogo: "capacidades",
  negociacao_acordos: "capacidades",
  articulacao_apoio: "capacidades",
};

export function sectionOfMetric(metricId: string): SectionSlug {
  return SECTION_OF_METRIC[metricId] ?? "historico";
}
