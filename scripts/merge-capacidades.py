#!/usr/bin/env python3
"""Merge dos patches de capacidades (V3) nos JSONs principais de pesquisa.

Idempotente: upsert por (candidato, capacidade) e pelos campos simples
(countryProject, foreignPolicy, coherence). Aplica os gates do
SPEC-CAPACIDADES §11 e imprime a matriz de cobertura.

Uso:  python3 scripts/merge-capacidades.py [--dry-run]
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATCH_DIR = os.path.join(ROOT, "research", "_patches", "capacidades")
RESEARCH = os.path.join(ROOT, "research")

CAP_SLUGS = [
    "execucao",
    "dialogo-negociacao",
    "lideranca-equipes",
    "tomada-decisao",
    "gestao-crises",
    "coordenacao-institucional",
    "comunicacao-publica",
    "visao-estrategica",
]
CAP_NAMES = {
    "execucao": (
        "Capacidade de execução",
        "Consegue transformar prioridades em entregas concretas?",
    ),
    "dialogo-negociacao": (
        "Diálogo, negociação e articulação",
        "Consegue construir entendimento e coordenar atores com interesses diferentes?",
    ),
    "lideranca-equipes": (
        "Liderança e formação de equipes",
        "Consegue montar, coordenar, delegar e manter equipes funcionando?",
    ),
    "tomada-decisao": (
        "Tomada de decisão",
        "Como enfrentou decisões difíceis, trade-offs e pressão?",
    ),
    "gestao-crises": (
        "Gestão de crises e mudança",
        "Como atuou quando o cenário mudou ou surgiu uma situação crítica?",
    ),
    "coordenacao-institucional": (
        "Coordenação institucional",
        "Consegue trabalhar entre instituições, níveis de governo e organizações?",
    ),
    "comunicacao-publica": (
        "Comunicação pública",
        "Consegue explicar prioridades, decisões e posições de forma compreensível e consistente?",
    ),
    "visao-estrategica": (
        "Visão estratégica",
        "Consegue definir prioridades e conectar decisões de curto prazo a objetivos maiores?",
    ),
}
# Adjetivos de valor. Só casa em MINÚSCULA: nomes próprios capitalizados
# ("Conselho Superior", "Superior Tribunal de Justiça") são fatos, não juízo.
# Frase iniciada por adjetivo capitalizado é caso raro — revisão humana cobre.
VALUE_ADJ = re.compile(
    r"(?<![A-ZÀ-Ý])\b(melhor|pior|maior articulador|excelente|fraco|ineficiente|brilhante|medíocre|superior|inferior)\b"
)
COVERAGE_OK = {"documentada", "parcial", "insuficiente"}
EV_STATUS = {"confirmado", "parcial", "indeterminado", "contestado"}
CONF = {"high", "medium", "low"}


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def dump(path, data):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)


def refs_of(obj, acc=None):
    """Coleta os ids de fonte referenciados em qualquer profundidade."""
    if acc is None:
        acc = []
    if isinstance(obj, dict):
        if set(obj.keys()) == {"id"} and isinstance(obj.get("id"), str):
            acc.append(obj["id"])
        else:
            for v in obj.values():
                refs_of(v, acc)
    elif isinstance(obj, list):
        for v in obj:
            refs_of(v, acc)
    return acc


def resolve_refs(obj, pool):
    """Troca refs {id} / 'src-x' pelos objetos de fonte completos do pool."""
    if isinstance(obj, dict):
        if set(obj.keys()) == {"id"} and obj["id"] in pool:
            return pool[obj["id"]]
        return {k: resolve_refs(v, pool) for k, v in obj.items()}
    if isinstance(obj, list):
        return [resolve_refs(v, pool) for v in obj]
    if isinstance(obj, str) and obj in pool:
        return pool[obj]
    return obj


def validate_capacity(errs, slug, cap):
    cap_slug = cap.get("slug")
    if cap_slug not in CAP_SLUGS:
        errs.append(f"{slug}: capacidade com slug inválido {cap_slug!r}")
        return
    synthesis = (cap.get("synthesis") or "").strip()
    if not synthesis:
        errs.append(f"{slug}/{cap_slug}: synthesis vazia")
    if VALUE_ADJ.search(synthesis):
        errs.append(f"{slug}/{cap_slug}: adjetivo de valor na synthesis")
    coverage = cap.get("coverage")
    if coverage not in COVERAGE_OK:
        errs.append(f"{slug}/{cap_slug}: coverage inválida {coverage!r}")
    evidences = cap.get("evidences") or []
    if len(evidences) < 3 and coverage == "documentada":
        errs.append(f"{slug}/{cap_slug}: {len(evidences)} evidências com coverage=documentada")
    if len(evidences) < 3 and coverage in {"parcial", "insuficiente"} and not (cap.get("coverageNote") or "").strip():
        errs.append(f"{slug}/{cap_slug}: cobertura {coverage} sem coverageNote")
    seen = set()
    for ev in evidences:
        eid = ev.get("id")
        if eid in seen:
            errs.append(f"{slug}/{cap_slug}: id de evidência duplicado {eid!r}")
        seen.add(eid)
        for field in ("title", "role", "complexity", "period"):
            if not (ev.get(field) or "").strip():
                errs.append(f"{slug}/{cap_slug}/{eid}: campo obrigatório vazio ({field})")
        kind = ev.get("kind")
        if kind not in {"posicao", "proposta", "historico"}:
            errs.append(f"{slug}/{cap_slug}/{eid}: kind inválido {kind!r}")
        if ev.get("evidenceStatus") not in EV_STATUS:
            errs.append(f"{slug}/{cap_slug}/{eid}: evidenceStatus inválido {ev.get('evidenceStatus')!r}")
        if ev.get("confidenceLevel") not in CONF:
            errs.append(f"{slug}/{cap_slug}/{eid}: confidenceLevel inválido {ev.get('confidenceLevel')!r}")
        if not (ev.get("sources") or []):
            errs.append(f"{slug}/{cap_slug}/{eid}: sem fonte")
    return len(evidences)


def main():
    dry = "--dry-run" in sys.argv
    patches = sorted(glob.glob(os.path.join(PATCH_DIR, "*.json")))
    if not patches:
        print("nenhum patch em", PATCH_DIR)
        return 1

    mains = {}
    for path in sorted(glob.glob(os.path.join(RESEARCH, "*.json"))):
        slug = os.path.basename(path)[:-5]
        if slug.startswith("_") or slug in {"TEMPLATE", "SPEC-ENRICA", "SPEC-CAPACIDADES"}:
            continue
        mains[slug] = (path, load(path))

    errs, applied = [], {}
    for patch_path in patches:
        patch_name = os.path.basename(patch_path)
        patch = load(patch_path)
        patch_pool = {
            s["id"]: s for s in (patch.get("sources") or []) if isinstance(s, dict) and s.get("id")
        }
        for slug, block in (patch.get("candidates") or {}).items():
            if slug not in mains:
                errs.append(f"{patch_name}: candidato desconhecido {slug!r}")
                continue
            path, main = mains[slug]
            pool = {
                s["id"]: s for s in (main.get("sources") or []) if isinstance(s, dict) and s.get("id")
            }

            # 1) fontes novas referenciadas pelo patch entram no pool do candidato
            for ref in refs_of(block):
                if ref in pool:
                    continue
                if ref in patch_pool:
                    pool[ref] = patch_pool[ref]
                else:
                    errs.append(f"{patch_name}/{slug}: fonte não resolvida {ref!r}")
            # 2) atualiza o pool do candidato
            main["sources"] = list(pool.values())

            # 3) campos simples
            for field in ("countryProject", "foreignPolicy"):
                if isinstance(block.get(field), dict):
                    main[field] = resolve_refs(block[field], pool)
            if isinstance(block.get("coherence"), list) and block["coherence"]:
                main["coherence"] = resolve_refs(block["coherence"], pool)

            # 4) capacidades: upsert por slug
            if block.get("capacities"):
                current = {c["slug"]: c for c in (main.get("capacities") or []) if isinstance(c, dict)}
                counts = {}
                for cap in block["capacities"]:
                    validate_capacity(errs, slug, cap)
                    cap_slug = cap.get("slug")
                    name, question = CAP_NAMES.get(cap_slug, (cap_slug, ""))
                    merged = dict(resolve_refs(cap, pool))
                    merged["name"] = name
                    merged["question"] = question
                    merged.pop("coverage", None)
                    merged["coverage"] = cap.get("coverage") or (
                        "documentada" if len(cap.get("evidences") or []) >= 3 else "parcial"
                    )
                    if cap.get("coverageNote"):
                        merged["coverageNote"] = cap["coverageNote"]
                    merged.setdefault("updatedAt", main.get("updatedAt"))
                    current[cap_slug] = merged
                    counts[cap_slug] = len(cap.get("evidences") or [])
                main["capacities"] = [current[s] for s in CAP_SLUGS if s in current]
                main["updatedAt"] = "2026-09-29"
                applied[slug] = {**applied.get(slug, {}), **counts}

            # 5) dataGaps do patch viram registro interno
            if patch.get("dataGaps"):
                existing = main.get("dataGaps") or []
                for gap in patch["dataGaps"]:
                    if gap not in existing:
                        existing.append(gap)
                main["dataGaps"] = existing

    if errs:
        print(f"✗ {len(errs)} problema(s) de validação:")
        for e in errs[:40]:
            print("  -", e)
    else:
        print("✓ validação dos gates §11: OK")

    print("\ncobertura por candidato (capacidades: nº de evidências)")
    for slug in sorted(applied):
        items = ", ".join(f"{k}={v}" for k, v in sorted(applied[slug].items()))
        print(f"  {slug:22s} {items}")

    if errs:
        return 1
    if dry:
        print("\n(--dry-run: nada gravado)")
        return 0
    for slug, (path, main) in mains.items():
        dump(path, main)
    print(f"\n✓ merge gravado em {len(mains)} JSONs de research/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
