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
  | "imprensa";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string; // ISO
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
  evidenceStatus: EvidenceStatus;
  confidenceLevel: ConfidenceLevel;
  availability: DataAvailability;
  sources: Source[];
  updatedAt: string; // ISO
  /** texto opcional de contexto exibido no drawer de evidências */
  context?: string;
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
  totalProposals: number;
  registeredWith: string; // onde o plano está registrado
  registeredUrl?: string;
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
    | "patrimonial";
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
    | "regular";
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
