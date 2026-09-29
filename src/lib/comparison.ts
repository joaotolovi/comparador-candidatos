// ─── Motor de comparação ─────────────────────────────────────────────────────
// Regras matemáticas da comparação (seção 11 do briefing):
//  - diferença absoluta: A − B
//  - razão: A / B
//  - p.p. para percentuais
//  - nunca porcentagem relativa quando gerar interpretação confusa
// Métrica descritiva ≠ métrica direcional: nunca geramos "melhor/pior".

import type { Metric, MetricType, DataAvailability } from "@/types";

export interface ComparisonDelta {
  /** "diff-abs" | "ratio" | "pp" | "none" */
  kind: "diff-abs" | "ratio" | "pp" | "none";
  /** texto pronto p/ exibição, ex.: "+5 anos" */
  display: string;
  /** texto nomeando quem tem o valor maior, ex.: "A" */
  leader?: string;
  /** valor numérico do delta (absoluto, razão, ou p.p.) */
  numeric?: number;
}

export function formatDelta(
  metric: Metric,
  values: { a: number; b: number },
  names: { a: string; b: string },
): ComparisonDelta {
  const { a, b } = values;
  if (a === b) return { kind: "none", display: "Valores iguais" };

  const max = Math.max(a, b);
  const min = Math.min(a, b);
  const leader = max === a ? names.a : names.b;

  switch (metric.metricType) {
    case "percentage": {
      const pp = Number((a - b).toFixed(1));
      return {
        kind: "pp",
        display: `${pp > 0 ? "+" : "−"}${Math.abs(pp).toLocaleString("pt-BR")} p.p. para ${leader}`,
        leader,
        numeric: Math.abs(pp),
      };
    }
    case "duration": {
      // Duração: sempre diferença absoluta — "8 anos vs 3 anos → +5 anos".
      // Razão em anos (2,7× maior) confunde mais do que esclarece.
      const diff = Number((max - min).toFixed(1));
      const unit = metric.unit ?? "";
      return {
        kind: "diff-abs",
        display: `+${diff.toLocaleString("pt-BR")}${unit ? " " + unit : ""} para ${leader}`,
        leader,
        numeric: diff,
      };
    }
    case "number": {
      const ratio = min === 0 ? Infinity : max / min;
      // razão ≥ 2× é mais legível que diferença bruta; contagens pequenas usam diferença
      if (ratio >= 2 && min > 0 && max >= 10) {
        const r = Math.round(ratio * 10) / 10;
        return {
          kind: "ratio",
          display: `${r.toLocaleString("pt-BR")}× maior para ${leader}`,
          leader,
          numeric: r,
        };
      }
      const diff = Number((max - min).toFixed(1));
      const unit = metric.unit ?? "";
      return {
        kind: "diff-abs",
        display: `+${diff.toLocaleString("pt-BR")}${unit ? " " + unit : ""} para ${leader}`,
        leader,
        numeric: diff,
      };
    }
    case "currency": {
      const ratio = min === 0 ? Infinity : max / min;
      if (ratio >= 2 && min > 0) {
        const r = Math.round(ratio * 10) / 10;
        return {
          kind: "ratio",
          display: `${r.toLocaleString("pt-BR")}× maior para ${leader}`,
          leader,
          numeric: r,
        };
      }
      const diff = Number((max - min).toFixed(1));
      const unit = metric.unit ?? "";
      return {
        kind: "diff-abs",
        display: `+${diff.toLocaleString("pt-BR")}${unit ? " " + unit : ""} para ${leader}`,
        leader,
        numeric: diff,
      };
    }
    default:
      return { kind: "none", display: `${metric.displayValue} vs ${leader}` };
  }
}

export function isComparable(m: Metric): boolean {
  return (
    (m.availability === "available" || m.availability === "zero") &&
    m.value !== null &&
    (m.metricType === "number" ||
      m.metricType === "percentage" ||
      m.metricType === "currency" ||
      m.metricType === "duration")
  );
}

export function availabilityIsMissing(
  a: DataAvailability,
): boolean {
  return (
    a === "not_informed" ||
    a === "not_found" ||
    a === "not_applicable" ||
    a === "under_analysis"
  );
}

export const AVAILABILITY_LABEL: Record<DataAvailability, string> = {
  available: "",
  zero: "Zero documentado",
  not_informed: "Não informado",
  not_found: "Não encontrado",
  not_applicable: "Não aplicável",
  under_analysis: "Em análise",
};

export const EVIDENCE_LABEL: Record<string, string> = {
  confirmado: "Confirmado",
  parcial: "Parcial",
  indeterminado: "Indeterminado",
  contestado: "Contestado",
};

export const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Alta confiança",
  medium: "Confiança média",
  low: "Baixa confiança",
};

export const LEGAL_STATUS_LABEL: Record<string, string> = {
  denuncia: "Denúncia",
  acusacao: "Acusação",
  investigacao: "Investigação",
  inquerito: "Inquérito",
  processo: "Processo",
  decisao: "Decisão",
  condenacao: "Condenação",
  condenacao_definitiva: "Condenação definitiva",
  absolvicao: "Absolvição",
  arquivamento: "Arquivamento",
  decisao_anulada: "Decisão anulada",
  aprovacao: "Aprovação",
  reprovacao: "Reprovação",
  regular: "Regular",
  investigacao_com_medidas_cautelares: "Investigação com medidas cautelares",
  registro_indeferido: "Registro indeferido",
  decisao_judicial_eleitoral: "Decisão judicial eleitoral",
  candidatura_nao_apta: "Candidatura não apta",
};

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  oficial_eleitoral: "Justiça Eleitoral",
  legislativo: "Legislativo",
  executivo_federal: "Executivo federal",
  diario_oficial: "Diário Oficial",
  transparencia: "Portal de transparência",
  tribunal: "Tribunal",
  tribunal_de_contas: "Tribunal de Contas",
  estatistico: "Órgão estatístico",
  economico: "Órgão econômico",
  estadual: "Governo estadual",
  municipal: "Prefeitura",
  plano_de_governo: "Plano de governo registrado",
  partidaria: "Fonte do partido/campanha",
  pesquisa_eleitoral: "Instituto de pesquisa",
  imprensa: "Imprensa (contexto)",
};

/** Métrica "agregada" do plano: % de propostas que atendem um critério */
export interface PlanStat {
  key: string;
  label: string;
  description: string;
  percentage: number;
  count: number;
  total: number;
}

export function planStats(plan: {
  proposals: PlanProposalStats[];
}): PlanStat[] {
  const t = plan.proposals.length || 1;
  const calc = (fn: (p: PlanProposalStats) => boolean, key: string, label: string, description: string): PlanStat => {
    const count = plan.proposals.filter(fn).length;
    return {
      key,
      label,
      description,
      count,
      total: plan.proposals.length,
      percentage: Math.round((count / t) * 100),
    };
  };
  return [
    calc((p) => p.hasClearObjective, "objective", "Objetivo claramente identificado", "Proposta descreve, sem ambiguidade, o que será entregue ou alterado."),
    calc((p) => p.hasQuantitativeTarget, "target", "Meta quantitativa", "Proposta traz número verificável de resultado (ex.: cobertura, unidades, índice)."),
    calc((p) => p.hasDeadline, "deadline", "Prazo definido", "Proposta indica quando a entrega deve ocorrer ou começar."),
    calc((p) => p.hasCostEstimate, "cost", "Estimativa de custo", "Proposta apresenta valor, intervalo financeiro ou cálculo explícito de custo."),
    calc((p) => p.hasFundingSource, "funding", "Fonte de financiamento", "Proposta indica de onde virão os recursos."),
    calc((p) => p.hasFiscalImpact, "fiscal", "Impacto fiscal estimado", "Proposta discute efeito sobre receitas e despesas públicas."),
    calc((p) => !!p.responsibleAgency, "agency", "Órgão executor identificado", "Proposta nomeia o órgão responsável pela implementação."),
    calc((p) => !!p.legalInstrument, "instrument", "Mecanismo jurídico identificado", "Proposta indica o instrumento legal necessário (lei, decreto, PEC, contrato…)."),
    calc((p) => !!p.resultIndicator, "indicator", "Indicador de resultado", "Proposta define como o resultado será medido após a implementação."),
    calc((p) => p.dependsOnCongress, "congress", "Depende do Congresso", "Proposta exige aprovação legislativa para ser implementada."),
  ];
}

export interface PlanProposalStats {
  hasClearObjective: boolean;
  hasQuantitativeTarget: boolean;
  hasDeadline: boolean;
  hasCostEstimate: boolean;
  hasFundingSource: boolean;
  hasFiscalImpact: boolean;
  responsibleAgency?: string;
  legalInstrument?: string;
  resultIndicator?: string;
  dependsOnCongress: boolean;
}
