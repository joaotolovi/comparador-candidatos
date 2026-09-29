#!/usr/bin/env python3
"""Repara os patches da camada analítica antes do merge.

1. NAMESPACE — ids de fonte declarados no próprio patch (ex.: `src-re-01`, igual em
   vários grupos) são renomeados para `src-re-<stem>-NN`, e todas as refs atualizadas.
   Sem isso, o mesmo id apontaria para URLs diferentes em grupos diferentes — o bug
   silencioso que já custou uma rodada (citação exibindo a fonte errada).
2. REFS COM PREFIXO TROCADO — `src-flavio-bolsonaro-105` quando o JSON principal usa
   `src-flavio-105`: resolve pelo final numérico, mas só quando for inequívoco.

Uso: python3 scripts/repair-realidade-patches.py [--dry-run]
"""
from __future__ import annotations

import glob
import json
import os
import re
import sys

RESEARCH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "research")
PATCH_DIR = os.path.join(RESEARCH, "_patches", "realidade")


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def dump(path, data):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write("\n")


def stem_ids(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())


def rewrite_ids(obj, mapping):
    """Troca ids no mapa dentro de listas de sources / refs {'id': …}."""
    if isinstance(obj, dict):
        out = {}
        for key, val in obj.items():
            if key == "sources" and isinstance(val, list):
                new = []
                for item in val:
                    if isinstance(item, str):
                        new.append(mapping.get(item, item))
                    elif isinstance(item, dict) and item.get("id"):
                        item = {**item, "id": mapping.get(item["id"], item["id"])}
                        new.append(item)
                    else:
                        new.append(item)
                out[key] = new
            else:
                out[key] = rewrite_ids(val, mapping)
        return out
    if isinstance(obj, list):
        return [rewrite_ids(v, mapping) for v in obj]
    return obj


def main():
    dry = "--dry-run" in sys.argv
    log = []

    mains = {}
    for path in sorted(glob.glob(os.path.join(RESEARCH, "*.json"))):
        slug = os.path.basename(path)[:-5]
        if slug.startswith("_") or slug.startswith("SPEC") or slug == "TEMPLATE":
            continue
        mains[slug] = load(path)

    # ids que existem no pool de algum candidato são REFERÊNCIA, nunca renomear:
    # renomear pelo último segmento numérico colapsava `src-caiado-84` e
    # `src-zema-84` no mesmo id, apontando para URLs diferentes.
    pool_ids = {s["id"] for main in mains.values() for s in (main.get("sources") or [])}

    for patch_path in sorted(glob.glob(os.path.join(PATCH_DIR, "*.json"))):
        name = os.path.basename(patch_path)[:-5]
        prefix = f"src-re-{stem_ids(name)}-"
        patch = load(patch_path)
        declared = patch.get("sources") or []
        if declared:
            mapping = {}
            for src in declared:
                if not src.get("id"):
                    continue
                if src["id"] in pool_ids or src["id"].startswith(prefix):
                    continue  # referência ao pool ou já com namespace: deixa como está
                mapping[src["id"]] = f"{prefix}{src['id']}"
            patch["sources"] = [{**s, "id": mapping.get(s["id"], s["id"])} for s in declared]
            patch["candidates"] = rewrite_ids(patch.get("candidates") or {}, mapping)
            log.append(f"{name}: {len(mapping)} id(s) renomeado(s) → src-re-{stem_ids(name)}-NN")

        # refs órfãs: tenta resolver pelo final numérico único no candidato
        for slug, block in (patch.get("candidates") or {}).items():
            main = mains.get(slug)
            if main is None:
                continue
            pool = {s["id"]: s for s in (main.get("sources") or [])}
            tails = {}
            for sid in pool:
                m = re.search(r"(\d+)$", sid)
                if m:
                    tails.setdefault(m.group(1), []).append(sid)
            declared_ids = {s["id"] for s in (patch.get("sources") or [])}
            fix = {}
            for ref in sorted(collect_refs(block)):
                if ref in pool or ref in declared_ids:
                    continue
                m = re.search(r"(\d+)$", ref)
                if not m:
                    continue
                candidates = tails.get(m.group(1), [])
                if len(candidates) == 1:
                    fix[ref] = candidates[0]
            if fix:
                patch["candidates"][slug] = rewrite_ids(block, fix)
                for old, new in fix.items():
                    log.append(f"{name}/{slug}: ref {old} → {new} (final numérico único)")

        if not dry:
            dump(patch_path, patch)

    print("\n".join(log) if log else "nada a reparar")
    print(f"\n{'(--dry-run: nada gravado)' if dry else f'{len(glob.glob(os.path.join(PATCH_DIR, '*.json')))} patches reparados'}")
    return 0


def collect_refs(obj, acc=None):
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
                collect_refs(val, acc)
    elif isinstance(obj, list):
        for item in obj:
            collect_refs(item, acc)
    return acc


if __name__ == "__main__":
    sys.exit(main())
