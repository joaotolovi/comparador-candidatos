// ─── Seed de identificação ───────────────────────────────────────────────────
// As 13 candidaturas registradas ao TSE para a Eleição 2026 (após as
// substituições de prazo legal de 14/09/2026). Apenas identificação factual:
// número, partido, fórmula. Os dados profundos vêm de src/data/research.ts
// (gerado por scripts/normalize.mjs a partir de research/*.json).
import type { Candidate } from "@/types";

export interface CandidateSeed
  extends Omit<
    Candidate,
    | "id"
    | "updatedAt"
    | "photo"
    | "education"
    | "professionalExperience"
    | "politicalExperience"
    | "executiveExperience"
    | "achievements"
    | "governmentPlan"
    | "currentSupport"
    | "negotiationHistory"
    | "institutionalHistory"
    | "metrics"
    | "sources"
  > {
  photoUrl?: string;
}

// Ordem de aparição na home: por relevância nas pesquisas de intenção de voto.
export const seeds: CandidateSeed[] = [
  {
    slug: "lula",
    name: "Luiz Inácio Lula da Silva",
    ballotName: "Lula",
    ballotNumber: 13,
    party: "PT",
    coalition: "Frente Ampla pelo Trabalho e Soberania — vice Geraldo Alckmin (PSB)",
    birthDate: "1945-10-27",
    birthplace: "Garanhuns, PE",
    age: 80,
    profession: "Metalúrgico",
    currentRole: "Presidente da República",
    tagline:
      "Ex-metalúrgico e sindicalista; presidente em dois períodos (2003–2010 e 2023–atual), candidato à reeleição.",
  },
  {
    slug: "flavio-bolsonaro",
    name: "Flávio Nantes Bolsonaro",
    ballotName: "Flávio Bolsonaro",
    ballotNumber: 22,
    party: "PL",
    coalition: "Aliança pelo Brasil — vice Alfredo Gaspar (PL)",
    birthDate: "1981-04-30",
    birthplace: "Rio de Janeiro, RJ",
    age: 45,
    profession: "Advogado",
    currentRole: "Senador da República (RJ)",
    tagline:
      "Senador em segundo mandato e ex-deputado estadual no RJ por quatro mandatos; principal adversário de Lula nas pesquisas nacionais.",
  },
  {
    slug: "renan-santos",
    name: "Renan Antônio Ferreira dos Santos",
    ballotName: "Renan Santos",
    ballotNumber: 14,
    party: "Missão",
    coalition: "Missão — vice Coronel Medina (Missão)",
    birthDate: "1984-02-13",
    birthplace: "Vinhedo, SP",
    age: 42,
    profession: "Empresário",
    currentRole: "Presidente nacional do Partido Missão",
    tagline:
      "Fundador do MBL e 1º presidente nacional do Partido Missão; disputa sua primeira eleição majoritária.",
  },
  {
    slug: "caiado",
    name: "Ronaldo Ramos Caiado",
    ballotName: "Ronaldo Caiado",
    ballotNumber: 55,
    party: "PSD",
    coalition: "Governo Popular — vice Gilberto Kassab (PSD)",
    birthDate: "1949-09-25",
    birthplace: "Anápolis, GO",
    age: 77,
    profession: "Médico ortopedista",
    currentRole: "Governador de Goiás",
    tagline:
      "Médico e ruralista, fundador da UCD; governador de Goiás em dois mandatos e ex-senador.",
  },
  {
    slug: "zema",
    name: "Romeu Zema Neto",
    ballotName: "Romeu Zema",
    ballotNumber: 30,
    party: "NOVO",
    coalition: "NOVO — vice Eduardo Girão (NOVO)",
    birthDate: "1964-11-09",
    birthplace: "Araxá, MG",
    age: 61,
    profession: "Empresário",
    currentRole: "Governador de Minas Gerais",
    tagline:
      "Empresário eleito governador de Minas Gerais em 2018 e reeleito em 2022 pelo Partido NOVO.",
  },
  {
    slug: "leonardo-avalanche",
    name: "Leonardo Avalanche",
    ballotName: "Leonardo Avalanche",
    ballotNumber: 28,
    party: "PRTB",
    coalition: "PRTB — vice Silvia Hellen da Silva Pereira (PRTB)",
    birthDate: "1977-10-23",
    birthplace: "",
    age: 48,
    profession: "Empresário",
    currentRole: "Presidente nacional do PRTB",
    tagline:
      "Presidente nacional do PRTB desde 2024; substituiu Pablo Marçal na cabeça de chapa após o TSE indeferir o registro deste em 11/09/2026.",
  },
  {
    slug: "augusto-cury",
    name: "Augusto Cury",
    ballotName: "Augusto Cury",
    ballotNumber: 70,
    party: "Avante",
    coalition: "Avante — vice Júlio Delgado (Avante)",
    birthDate: "1958-10-09",
    birthplace: "São Paulo, SP",
    age: 67,
    profession: "Médico psiquiatra",
    currentRole: "Candidato à Presidência da República",
    tagline:
      "Psiquiatra e escritor de obras de divulgação psicológica, em primeira disputa eleitoral pelo Avante.",
  },
  {
    slug: "clariana-barao",
    name: "Clariana Barão",
    ballotName: "Clariana Barão",
    ballotNumber: 27,
    party: "DC",
    coalition: "DC — vice Fabiana Torquato (DC)",
    birthDate: "1990-05-04",
    birthplace: "São Paulo, SP",
    age: 36,
    profession: "Advogada",
    currentRole: "Candidata à Presidência da República",
    tagline:
      "Advogada e militante do movimento estudantil e social, indicada pela Democracia Cristã.",
  },
  {
    slug: "samara-martins",
    name: "Samara Martins",
    ballotName: "Samara Martins",
    ballotNumber: 80,
    party: "UP",
    coalition: "Unidade Popular — vice Raquel Brício (UP)",
    birthDate: "1993-06-15",
    birthplace: "Belo Horizonte, MG",
    age: 33,
    profession: "Militante social",
    currentRole: "Candidata à Presidência da República",
    tagline:
      "Militante de movimentos sociais e candidata do Unidade Popular, em primeira disputa presidencial.",
  },
  {
    slug: "edmilson-costa",
    name: "Edmilson da Costa Lima",
    ballotName: "Edmilson Costa",
    ballotNumber: 21,
    party: "PCB",
    coalition: "PCB — vice Cleusa Santos (PCB)",
    birthDate: "1963-12-20",
    birthplace: "Teresina, PI",
    age: 62,
    profession: "Metalúrgico",
    currentRole: "Candidato à Presidência da República",
    tagline:
      "Dirigente histórico do PCB e ex-vereador em São Paulo, candidato do Partido Comunista Brasileiro.",
  },
  {
    slug: "hertz-dias",
    name: "Hertz Dias",
    ballotName: "Hertz Dias",
    ballotNumber: 16,
    party: "PSTU",
    coalition: "PSTU — vice Vanessa Portugal (PSTU)",
    birthDate: "1972-03-30",
    birthplace: "São José dos Campos, SP",
    age: 54,
    profession: "Metalúrgico",
    currentRole: "Candidato à Presidência da República",
    tagline: "Sindicalista metalúrgico e dirigente nacional do PSTU.",
  },
  {
    slug: "rui-costa-pimenta",
    name: "Rui Costa Pimenta",
    ballotName: "Rui Pimenta",
    ballotNumber: 29,
    party: "PCO",
    coalition: "PCO — vice Antônio Carlos (PCO)",
    birthDate: "1954-08-14",
    birthplace: "São Paulo, SP",
    age: 72,
    profession: "Escritor",
    currentRole: "Candidato à Presidência da República",
    tagline:
      "Escritor e fundador do PCO, candidato à Presidência de forma reiterada desde 2002.",
  },
  {
    slug: "wilson-grassi",
    name: "Wilson Grassi Júnior",
    ballotName: "Wilson Veterinário",
    ballotNumber: 35,
    party: "Democrata",
    coalition: "Democrata — vice Suêd Haidar (Democrata)",
    birthDate: "1970-07-11",
    birthplace: "São Paulo, SP",
    age: 56,
    profession: "Médico veterinário",
    currentRole: "Candidato à Presidência da República",
    tagline:
      "Médico veterinário, atuou na criação do primeiro hospital público para cães e gatos de São Paulo; candidato em quarta tentativa.",
  },
];

export const seedShell = (s: CandidateSeed): Candidate => ({
  id: s.slug,
  ballotName: s.ballotName,
  photo: s.photoUrl ?? "",
  education: [],
  professionalExperience: [],
  politicalExperience: [],
  executiveExperience: [],
  achievements: [],
  governmentPlan: {
    totalProposals: 0,
    registeredWith: "TSE — registro de candidatura",
    proposals: [],
    sources: [],
    updatedAt: "2026-08-16",
  },
  currentSupport: [],
  negotiationHistory: [],
  institutionalHistory: [],
  metrics: [],
  sources: [],
  updatedAt: "2026-09-29",
  ...s,
});
