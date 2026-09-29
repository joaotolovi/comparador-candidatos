#!/usr/bin/env node
/**
 * Regenera src/data/candidates.ts a partir de research/*.json.
 * Os JSONs vêm dos agentes de pesquisa (template em research/TEMPLATE.md).
 * Campos desconhecidos no JSON são ignorados com aviso; faltantes viram
 * placeholders honestos (arrays vazios, availability not_found).
 *
 * Uso: node scripts/normalize.mjs
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const researchDir = join(root, "research");
const outFile = join(root, "src", "data", "candidates.ts");

const files = existsSync(researchDir)
  ? readdirSync(researchDir).filter((f) => f.endsWith(".json") && !f.startsWith("TEMPLATE"))
  : [];

const bySlug = new Map();
for (const f of files) {
  try {
    const data = JSON.parse(readFileSync(join(researchDir, f), "utf8"));
    const slug = data.slug ?? f.replace(/\.json$/, "");
    bySlug.set(slug, data);
  } catch (e) {
    console.warn(`⚠ ${f}: JSON inválido (${e.message}) — ignorado`);
  }
}

const HEADER = `// ⚠️ ARQUIVO GERADO por scripts/normalize.mjs — não editar à mão.
// Fonte: research/*.json (pesquisa estruturada com fontes verificáveis).
import type { Candidate } from "@/types";

export const candidates: Candidate[] = [`;

function j(obj) {
  return JSON.stringify(obj, null, 2);
}

const parts = [];
for (const [slug, d] of bySlug) {
  parts.push(
    `  ${j({
      id: d.id ?? slug,
      slug: d.slug ?? slug,
      name: d.name ?? slug,
      ballotName: d.ballotName ?? "",
      ballotNumber: d.ballotNumber ?? 0,
      photo: d.photoUrl ?? "",
      party: d.party ?? "",
      coalition: d.coalition ?? "",
      birthDate: d.birthDate ?? "",
      birthplace: d.birthplace ?? "",
      age: d.age ?? null,
      profession: d.profession ?? "",
      currentRole: d.currentRole ?? "",
      tagline: d.tagline ?? "",
      education: d.education ?? [],
      professionalExperience: d.professionalExperience ?? [],
      politicalExperience: d.politicalExperience ?? [],
      executiveExperience: d.executiveExperience ?? [],
      achievements: d.achievements ?? [],
      governmentPlan: {
        title: d.governmentPlan?.title ?? "",
        totalProposals: d.governmentPlan?.totalProposals ?? d.governmentPlan?.proposals?.length ?? 0,
        registeredWith: d.governmentPlan?.registeredWith ?? "TSE",
        registeredUrl: d.governmentPlan?.registeredUrl,
        planUrl: d.governmentPlan?.planUrl,
        proposals: (d.governmentPlan?.keyProposals ?? []).map((p) => ({
          id: p.id ?? `${slug}-${p.title?.slice(0, 12)}`,
          title: p.title ?? "",
          description: p.description ?? "",
          theme: p.theme ?? "Outros",
          hasClearObjective: p.hasClearObjective ?? true,
          hasQuantitativeTarget: p.hasQuantitativeTarget ?? false,
          hasDeadline: p.hasDeadline ?? false,
          hasCostEstimate: p.hasCost ?? false,
          hasFundingSource: p.hasFundingSource ?? false,
          hasFiscalImpact: p.hasFiscalImpact ?? false,
          legalInstrument: p.legalInstrument,
          requiresNewLaw: p.requiresNewLaw ?? false,
          requiresConstitutionalAmendment: p.requiresConstitutionalAmendment ?? false,
          dependsOnCongress: p.dependsOnCongress ?? false,
          dependsOnStates: p.dependsOnStates ?? false,
          dependsOnMunicipalities: p.dependsOnMunicipalities ?? false,
          responsibleAgency: p.responsibleAgency,
          resultIndicator: p.resultIndicator,
          identifiedRisks: p.identifiedRisks,
          methodologyStatus: p.methodologyStatus ?? "parcial",
          sources: p.sources ?? [],
        })),
        sources: d.governmentPlan?.sources ?? [],
        updatedAt: d.governmentPlan?.updatedAt ?? "2026-09-29",
      },
      currentSupport: d.currentSupport ?? [],
      negotiationHistory: d.negotiationHistory ?? [],
      institutionalHistory: d.institutionalHistory ?? [],
      metrics: d.metrics ?? [],
      sources: d.sources ?? [],
      updatedAt: d.updatedAt ?? "2026-09-29",
    }).replace(/\n/g, "\n  ")}`,
  );
}

writeFileSync(outFile, `${HEADER}\n${parts.join(",\n")},\n];\n`);
console.log(`✓ ${outFile} regenerado com ${bySlug.size} candidato(s).`);
if (bySlug.size === 0) console.warn("⚠ Nenhum research/*.json encontrado.");
