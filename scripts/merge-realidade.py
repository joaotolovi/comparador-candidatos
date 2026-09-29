#!/usr/bin/env python3
"""Merge da camada analítica (V4 — Teste de realidade) nos JSONs principais.

Fontes: research/_patches/realidade/*.json
Alvos por candidato:
  reality            → countryProject.reality
  proposals[].reality→ governmentPlan.proposals[i].reality (casa por id, depois por título)
  capacities[].reality → capacities[slug].reality
  foreignPolicy.reality → foreignPolicy.reality
  themes[]           → main.themes (lista completa, 10 temas fixos)

GATES (§4, §5, §2 do SPEC-REALIDADE.md) — abortam o merge:
  - id de fonte já existente redefinido com URL diferente (citação enganosa)
  - fonte referenciada que não resolve no pool do candidato nem no patch
  - vocabulário de juízo / adjetivo de valor (minúsculo)
  - limite de texto (150 / 400)
  - kind de tensão fora da taxonomia; path institucional fora da taxonomia
  - tensão sem fonte; openQuestion que não é pergunta
  - RealityCheck sem methodology / evidenceStatus / confidenceLevel

Uso: python3 scripts/merge-realidade.py [--dry-run]
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys
import unicodedata

RESEARCH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "research")
PATCH_DIR = os.path.join(RESEARCH, "_patches", "realidade")

PATHS = {
    "ato-executivo", "lei-ordinaria", "lei-complementar", "pec",
    "depende-estados", "depende-municipios", "depende-privado",
    "negociacao-internacional", "indefinido",
}
TENSION_KINDS = {
    "mudanca-de-posicao", "acao-em-sentido-diferente", "proposta-sem-precedente",
    "proposta-x-restricao-institucional", "proposta-x-outra-proposta",
}
QUORUM_REQUIRED = {"pec", "lei-complementar"}
THEME_SLUGS = [
    "economia", "seguranca", "saude", "educacao", "clima",
    "trabalho", "tributacao", "previdencia", "habitacao", "instituicoes",
]
STATUSES = {"confirmado", "parcial", "indeterminado", "contestado"}
CONFIDENCES = {"high", "medium", "low"}

# Adjetivo de valor só em minúscula (nome próprio capitalizado é fato: "Conselho Superior")
VALUE_ADJ = re.compile(
    r"(?<![A-ZÀ-Ý])\b(melhor|pior|superior|inferior|excelente|fraco|ineficiente|brilhante|medíocre)\b"
)
OPINION_PHRASES = [
    r"invi[áa]vel", r"n[ãa]o conseguir[áa]", r"n[ãa]o tem for[çc]a", r"nunca fez",
    r"promessa vazia", r"na pr[áa]tica n[ãa]o", r"claramente", r"obviamente",
    r"n[ãa]o vai cumprir", r"n[ãa]o cumprir[áa]", r"portanto[^.]{0,40}\b(vai|n[ãa]o vai|é|cumprir|consegue)\b",
]
OPINION_RE = re.compile("|".join(OPINION_PHRASES))


STOP = {"de", "da", "do", "das", "dos", "e", "a", "o", "as", "os", "para", "no", "na",
        "nos", "nas", "com", "por", "em", "um", "uma", "ao", "à", "que", "como", "sobre"}


def tokens(text):
    plain = unicodedata.normalize("NFKD", (text or "").lower())
    plain = "".join(ch for ch in plain if not unicodedata.combining(ch))
    plain = re.sub(r"[^a-z0-9 ]+", " ", plain)
    return {t for t in plain.split() if len(t) > 2 and t not in STOP}


def best_title_match(title, proposals):
    """Casa título do patch com a proposta do plano: cobertura de tokens ≥ 0.6,
    melhor colocado isolado dos demais (evita casar com a proposta errada)."""
    want = tokens(title)
    if not want:
        return None
    scored = sorted(
        ((len(want & tokens(p.get("title") or "")) / len(want), p) for p in proposals),
        key=lambda kv: kv[0],
        reverse=True,
    )
    if not scored or scored[0][0] < 0.6:
        return None
    if len(scored) > 1 and scored[1][0] >= scored[0][0] - 0.15:
        return None
    return scored[0][1]


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def dump(path, data):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def refs_of(obj, acc=None):
    """Coleta ids de fonte citados (strings 'src-x' e objetos {'id': ...})."""
    if acc is None:
        acc = set()
    if isinstance(obj, dict):
        for key, val in obj.items():
            if key == "sources" and isinstance(val, list):
                for item in val:
                    if isinstance(item, str):
                        acc.add(item)
                    elif isinstance(item, dict) and item.get("id"):
                        acc.add(item["id"])
            else:
                refs_of(val, acc)
    elif isinstance(obj, list):
        for item in obj:
            refs_of(item, acc)
    return acc


def resolve_refs(obj, pool):
    """Troca refs (string ou {'id': …}) pelos objetos de fonte completos."""
    if isinstance(obj, dict):
        out = {}
        for key, val in obj.items():
            if key == "sources" and isinstance(val, list):
                resolved = []
                for item in val:
                    ref = item if isinstance(item, str) else item.get("id")
                    if not ref:
                        continue
                    if ref in pool:
                        src = pool[ref]
                        resolved.append(src if isinstance(src, dict) else item)
                    elif isinstance(item, dict):
                        resolved.append(item)
                out[key] = resolved
            else:
                out[key] = resolve_refs(val, pool)
        return out
    if isinstance(obj, list):
        return [resolve_refs(v, pool) for v in obj]
    return obj


# Classificação do caminho institucional quando o pesquisador escreveu em prosa
# (o contrato pede o rótulo da taxonomia; a prosa não se perde — vira `note`).
PATH_RULES = [
    ("pec", ("emenda constitucional", "pec ", "constituinte")),
    ("lei-complementar", ("lei complementar", "lc ", "projeto de lei complementar")),
    ("lei-ordinaria", ("lei ordin", "leis ordin", "medida provis", "orçamentár", "orcamentar",
                       "loa", "ldo", "projeto de lei", "lei nº", "lei no ", "lei federal",
                       "legislação ordinária")),
    ("negociacao-internacional", ("tratado", "internacional", "acordo bilateral", "multilateral")),
    ("depende-estados", ("estado", "governadores", "federativ")),
    ("depende-municipios", ("municíp", "municip", "prefeit")),
    ("depende-privado", ("privado", "concessão", "concessao", "ppp", "parceria", "mercado", "empresas")),
    ("ato-executivo", ("decreto", "ato do executivo", "atos do executivo", "portaria",
                       "regulamento", "instrução normativa")),
]
PATH_LABELS_PT = {
    "ato-executivo": "ato do Executivo",
    "lei-ordinaria": "lei ordinária",
    "lei-complementar": "lei complementar",
    "pec": "emenda constitucional",
    "depende-estados": "depende também dos estados",
    "depende-municipios": "depende também dos municípios",
    "depende-privado": "depende de agentes privados",
    "negociacao-internacional": "negociação internacional",
    "indefinido": "não declarado no documento",
}

QUORUM_FATOS = {
    "pec": "308 deputados e 49 senadores, em dois turnos em cada Casa (CF, art. 60, §2º)",
    "lei-complementar": "257 deputados e 41 senadores — maioria absoluta (CF, art. 69)",
}


def classify_path(prose):
    """Caminho mais exigente presente na prosa (PEC > LC > LO > externo > entes > privado > ato)."""
    low = " ".join((prose or "").lower().split())
    for path, keys in PATH_RULES:
        if any(k in low for k in keys):
            return path
    return "indefinido"


def normalize_requirement(rc):
    """Aceita requirement em prosa e devolve o rótulo da taxonomia, preservando o texto."""
    req = rc.get("requirement")
    if req is None:
        return
    if isinstance(req, str):
        prose = req
        req = {"path": classify_path(prose), "note": prose.strip()}
    elif isinstance(req, dict) and req.get("path") not in PATHS:
        prose = str(req.get("path") or "").strip()
        req = {**req, "path": classify_path(prose)}
        if prose:
            req["note"] = ((req.get("note") or "") + " " + prose).strip()
    if req.get("path") in QUORUM_FATOS and not (req.get("quorum") or "").strip():
        req["quorum"] = QUORUM_FATOS[req["path"]]
    rc["requirement"] = req


def normalize_support(rc, main):
    """`documentedAgreements` vem do histórico de negociação apurado — dado real, não estimativa."""
    support = rc.get("support")
    if support is None:
        return
    if isinstance(support, dict) and not isinstance(support.get("documentedAgreements"), int):
        n = len(main.get("negotiationHistory") or [])
        # A nota é o texto curado pelo pesquisador; a contagem de acordos tem
        # campo próprio na interface, então só entra no texto se couber.
        note = (support.get("note") or "").strip()
        addition = f" Acordos documentados: {n} episódio(s) no histórico de negociação apurado."
        if len(note) + len(addition) <= 400:
            note = (note + addition).strip()
        support = {**support, "documentedAgreements": n, "note": note}
        rc["support"] = support


# Termos factuais que contêm palavra "de valor" e não são juízo:
# "ensino superior", "nível superior", "melhores práticas" etc.
FACTUAL_COLLOCATIONS = (
    "ensino superior", "educação superior", "nivel superior", "nível superior",
    "curso superior", "superior imediato", "melhores práticas", "boas práticas",
    "superior tribunal", "conselho superior", "tribunal superior",
)
# Frases de juízo só contam como juízo NOSSO: relato da fala do candidato
# ("afirmou que não cumprirá decisões do STF") é fato, com fonte.
REPORT_MARKERS = ("afirmou que", "disse que", "declarou que", "prometeu que", "sustentou que",
                  "defendeu que", "escreveu que", "respondeu que")


def _clean_factual(text):
    low = text
    for phrase in FACTUAL_COLLOCATIONS:
        low = low.replace(phrase, phrase.replace(" ", "_").replace("superior", "Xsuperior"))
    return low


def _opinion_match(text):
    """Primeira ocorrência de juízo que não seja relato de fala do candidato."""
    for m in OPINION_RE.finditer(text.lower()):
        antes = text.lower()[max(0, m.start() - 45):m.start()]
        if any(marker in antes for marker in REPORT_MARKERS):
            continue
        return m
    return None


def check_text(errs, where, field, text, limit):
    if text is None:
        return
    if not isinstance(text, str):
        errs.append(f"{where}: {field} não é texto")
        return
    if len(text) > limit:
        errs.append(f"{where}: {field} com {len(text)} chars (limite {limit})")
    cleaned = _clean_factual(text)
    if VALUE_ADJ.search(cleaned):
        errs.append(f"{where}: {field} usa adjetivo de valor")
    m = _opinion_match(text)
    if m:
        errs.append(f"{where}: {field} usa juízo/opinião ({m.group(0)!r})")


def validate_reality(errs, where, rc):
    if not isinstance(rc, dict):
        errs.append(f"{where}: reality não é objeto")
        return
    for field in ("methodology", "evidenceStatus", "confidenceLevel"):
        if not rc.get(field):
            errs.append(f"{where}: reality sem {field}")
    if rc.get("evidenceStatus") not in STATUSES:
        errs.append(f"{where}: evidenceStatus inválido ({rc.get('evidenceStatus')})")
    if rc.get("confidenceLevel") not in CONFIDENCES:
        errs.append(f"{where}: confidenceLevel inválido ({rc.get('confidenceLevel')})")

    check_text(errs, where, "proposal", rc.get("proposal"), 150)
    if not (rc.get("proposal") or "").strip():
        errs.append(f"{where}: reality sem proposal")

    req = rc.get("requirement")
    if req is not None:
        if not isinstance(req, dict) or req.get("path") not in PATHS:
            errs.append(f"{where}: requirement.path fora da taxonomia ({req.get('path') if isinstance(req, dict) else req})")
        elif req.get("path") in QUORUM_REQUIRED and not (req.get("quorum") or "").strip():
            errs.append(f"{where}: requirement {req['path']} sem quorum factual")

    hist = rc.get("history")
    if hist is not None:
        for key in ("aligned", "divergent"):
            for item in hist.get(key) or []:
                if isinstance(item, dict):
                    if not (item.get("fact") or "").strip():
                        errs.append(f"{where}: history.{key} sem fato")
                    check_text(errs, where, f"history.{key}.fact", item.get("fact"), 250)
                    check_text(errs, where, f"history.{key}.date", item.get("date"), 40)
                else:
                    check_text(errs, where, f"history.{key}", item, 250)
        if hist.get("noComparablePrecedent"):
            check_text(errs, where, "history.noComparablePrecedent", hist["noComparablePrecedent"], 400)

    support = rc.get("support")
    if support is not None:
        if not isinstance(support.get("documentedAgreements"), int):
            errs.append(f"{where}: support sem documentedAgreements numérico")
        check_text(errs, where, "support.note", support.get("note"), 400)

    for tension in rc.get("tensions") or []:
        if tension.get("kind") not in TENSION_KINDS:
            errs.append(f"{where}: tensão com kind fora da taxonomia ({tension.get('kind')})")
        check_text(errs, where, "tension.title", tension.get("title"), 150)
        check_text(errs, where, "tension.detail", tension.get("detail"), 400)
        if not tension.get("sources"):
            errs.append(f"{where}: tensão sem fonte ({tension.get('title','')[:40]})")
        if tension.get("evidenceStatus") not in STATUSES:
            errs.append(f"{where}: tensão com evidenceStatus inválido")

    for oq in rc.get("openQuestions") or []:
        q = (oq.get("question") or "").strip()
        if not q.endswith("?"):
            errs.append(f"{where}: openQuestion não é pergunta ({q[:40]})")
        check_text(errs, where, "openQuestions.question", q, 150)
        check_text(errs, where, "openQuestions.why", oq.get("why"), 400)

    check_text(errs, where, "publicExplanation", rc.get("publicExplanation"), 400)
    check_text(errs, where, "methodology", rc.get("methodology"), 400)


def main():
    dry = "--dry-run" in sys.argv
    patches = sorted(glob.glob(os.path.join(PATCH_DIR, "*.json")))
    if not patches:
        print("nenhum patch em", PATCH_DIR)
        return 1

    mains = {}
    for path in sorted(glob.glob(os.path.join(RESEARCH, "*.json"))):
        slug = os.path.basename(path)[:-5]
        if slug.startswith("_") or slug.startswith("SPEC") or slug == "TEMPLATE":
            continue
        mains[slug] = (path, load(path))

    errs, stats, added = [], {}, []
    for patch_path in patches:
        patch_name = os.path.basename(patch_path)
        patch = load(patch_path)
        patch_pool = {s["id"]: s for s in (patch.get("sources") or []) if isinstance(s, dict) and s.get("id")}
        for slug, block in (patch.get("candidates") or {}).items():
            if slug not in mains:
                errs.append(f"{patch_name}: candidato desconhecido {slug!r}")
                continue
            path, main = mains[slug]
            pool = {s["id"]: s for s in (main.get("sources") or []) if isinstance(s, dict) and s.get("id")}

            for ref in refs_of(block):
                if ref in pool:
                    novo = patch_pool.get(ref)
                    if novo is not None:
                        url_pool = (pool[ref].get("url") or "").strip()
                        url_novo = (novo.get("url") or "").strip()
                        if url_pool and url_novo and url_pool != url_novo:
                            errs.append(
                                f"{patch_name}/{slug}: id de fonte {ref!r} reutilizado com URL diferente "
                                f"({url_pool[:55]} != {url_novo[:55]}) — renumerar no patch"
                            )
                    continue
                if ref in patch_pool:
                    pool[ref] = patch_pool[ref]
                else:
                    errs.append(f"{patch_name}/{slug}: fonte não resolvida {ref!r}")
            main["sources"] = list(pool.values())

            count = stats.setdefault(slug, {"pais": 0, "prop": 0, "cap": 0, "mundo": 0, "temas": 0})

            rc = block.get("reality")
            if isinstance(rc, dict):
                normalize_requirement(rc)
                normalize_support(rc, main)
                validate_reality(errs, f"{patch_name}/{slug}/pais", rc)
                main.setdefault("countryProject", {})["reality"] = resolve_refs(rc, pool)
                count["pais"] = 1

            # O template grava governmentPlan.keyProposals (sem id); o domínio
            # gera id depois. O casamento é por título, com tolerância para o
            # título compactado que os pesquisadores escrevem.
            gp = main.get("governmentPlan", {})
            proposals = gp.get("keyProposals") or gp.get("proposals") or []
            by_id = {p.get("id"): p for p in proposals if p.get("id")}
            for item in block.get("proposals") or []:
                target = None
                if item.get("id") and item["id"] in by_id:
                    target = by_id[item["id"]]
                else:
                    target = best_title_match(item.get("title") or "", proposals)
                if target is None and (item.get("title") or "").strip():
                    # O plano tem mais propostas do que a curadoria inicial: a
                    # proposta analisada passa a integrar a lista, com os campos
                    # derivados do próprio teste de realidade (nada inventado).
                    rc_novo = item.get("reality") or {}
                    req_path = ((rc_novo.get("requirement") or {}) if isinstance(rc_novo.get("requirement"), dict) else {}).get("path")
                    target = {
                        "title": item["title"].strip(),
                        "theme": item.get("theme") or "propostas analisadas",
                        "description": rc_novo.get("proposal") or item["title"].strip(),
                        "hasCost": False,
                        "legalInstrument": PATH_LABELS_PT.get(req_path or "", "não declarado no documento"),
                        "dependsOnCongress": req_path in {"pec", "lei-complementar", "lei-ordinaria"},
                        "sources": [],
                    }
                    gp.setdefault("keyProposals", []).append(target)
                    added.append(f"{slug}: proposta adicionada à lista analisada — {target['title'][:50]}")
                if target is None:
                    errs.append(f"{patch_name}/{slug}: proposta não casada ({item.get('id') or (item.get('title') or '')[:50]})")
                    continue
                label = (target.get("id") or target.get("title") or "")[:40]
                normalize_requirement(item.get("reality") or {})
                normalize_support(item.get("reality") or {}, main)
                validate_reality(errs, f"{patch_name}/{slug}/prop:{label}", item.get("reality"))
                target["reality"] = resolve_refs(item["reality"], pool)
                count["prop"] += 1

            caps = {c.get("slug"): c for c in (main.get("capacities") or [])}
            for item in block.get("capacities") or []:
                cap = caps.get(item.get("slug"))
                if cap is None:
                    errs.append(f"{patch_name}/{slug}: capacidade desconhecida ({item.get('slug')})")
                    continue
                normalize_requirement(item.get("reality") or {})
                normalize_support(item.get("reality") or {}, main)
                validate_reality(errs, f"{patch_name}/{slug}/cap:{item['slug']}", item.get("reality"))
                cap["reality"] = resolve_refs(item["reality"], pool)
                count["cap"] += 1

            fp = block.get("foreignPolicy")
            if isinstance(fp, dict) and isinstance(fp.get("reality"), dict):
                normalize_requirement(fp["reality"])
                normalize_support(fp["reality"], main)
                validate_reality(errs, f"{patch_name}/{slug}/mundo", fp["reality"])
                main.setdefault("foreignPolicy", {})["reality"] = resolve_refs(fp["reality"], pool)
                count["mundo"] = 1

            themes = block.get("themes") or block.get("themePositions")
            if isinstance(themes, list) and themes:
                seen = {}
                for item in themes:
                    tslug = item.get("slug")
                    if tslug not in THEME_SLUGS:
                        errs.append(f"{patch_name}/{slug}: tema fora do conjunto ({tslug})")
                        continue
                    if item.get("sourceKind") not in {"candidato", "partido", "ausente"}:
                        errs.append(f"{patch_name}/{slug}/{tslug}: sourceKind inválido")
                    check_text(errs, f"{patch_name}/{slug}/tema:{tslug}", "position", item.get("position"), 150)
                    if isinstance(item.get("reality"), dict):
                        normalize_requirement(item["reality"])
                        normalize_support(item["reality"], main)
                        validate_reality(errs, f"{patch_name}/{slug}/tema:{tslug}", item["reality"])
                    seen[tslug] = resolve_refs(item, pool)
                if len(seen) < len(THEME_SLUGS):
                    missing = [t for t in THEME_SLUGS if t not in seen]
                    errs.append(f"{patch_name}/{slug}: temas faltando {missing}")
                ordered = [seen[t] for t in THEME_SLUGS if t in seen]
                main["themes"] = ordered
                count["temas"] = len(ordered)

    if errs:
        print(f"✗ {len(errs)} erro(s) nos gates:")
        for e in errs[:40]:
            print("  -", e)
        print("\n(nada gravado)")
        return 1

    if added:
        print("propostas incorporadas à lista analisada:")
        for a in added:
            print("  +", a)

    print("cobertura analítica:")
    for slug in sorted(stats):
        s = stats[slug]
        print(f"  {slug:22s} projeto={s['pais']} propostas={s['prop']} capacidades={s['cap']} mundo={s['mundo']} temas={s['temas']}")

    if dry:
        print("\n✓ gates §2/§4/§5 do SPEC-REALIDADE: OK (--dry-run: nada gravado)")
        return 0

    for slug, (path, main) in mains.items():
        dump(path, main)
    print(f"\n✓ merge gravado em {len(mains)} JSONs de research/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
