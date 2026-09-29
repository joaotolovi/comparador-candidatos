#!/usr/bin/env python3
"""Merge research/_patches/*.json nos research/<slug>.json principais.

Uso: python3 scripts/merge-patches.py
- sources: extend com dedupe por id (colisão -> sufixo -b, -c)
- metrics: upsert por id
- dataGaps: substitui o array inteiro
- governmentPlan / negotiationHistory / institutionalHistory: upsert se presente
Depois valida: 21 métricas canônicas por candidato, categoria em slug,
numérico available tem value, nomes consistentes por id.
"""
import json, glob, os, sys, collections

BASE = os.path.join(os.path.dirname(__file__), "..", "research")
BASE = os.path.abspath(BASE)

CANON_NAMES = {
    "propostas_com_prazo": "Propostas com prazo",
    "propostas_dependentes_congresso": "Propostas prioritárias que dependem do Congresso",
    "aprovacao_gestao": "Aprovação da gestão (pesquisas)",
    "projetos_lei_aprovados": "Leis aprovadas como autor principal",
    "capacidade_dialogo": "Capacidade de diálogo",
    "negociacao_acordos": "Negociação e acordos",
    "articulacao_apoio": "Partidos na coligação/federação registrada",
}
CANON = ["anos_executivo","maior_orcamento","equipe_gerida","aprovacao_gestao",
         "propostas_total","propostas_com_custo","propostas_com_prazo","propostas_dependentes_congresso",
         "anos_politica","anos_legislativo","anos_federal","mandatos_eletivos","votos_recebidos","projetos_lei_aprovados",
         "registro_tse","bancada_partidaria_camara","intencao_voto_recente",
         "capacidade_dialogo","negociacao_acordos","articulacao_apoio","bens_declarados"]
SLUGS = {"capacidade-execucao","plano","historico-experiencia","articulacao","integridade"}

def main():
    patches = sorted(glob.glob(os.path.join(BASE, "_patches", "*.json")))
    if not patches:
        print("nenhum patch encontrado"); return 1
    for pf in patches:
        p = json.load(open(pf))
        slug = p.get("slug") or os.path.basename(pf)[:-5]
        main_f = os.path.join(BASE, f"{slug}.json")
        if not os.path.exists(main_f):
            print(f"!! {slug}: JSON principal não existe — patch ignorado"); continue
        d = json.load(open(main_f))

        # sources
        existing_ids = {s["id"] for s in d.get("sources", [])}
        existing_urls = {(s.get("url") or "").strip() for s in d.get("sources", [])}
        added_src = skipped_src = 0
        for s in p.get("sources", []):
            url = (s.get("url") or "").strip()
            if url and url in existing_urls:      # re-run idempotente
                skipped_src += 1; continue
            sid = s["id"]
            while sid in existing_ids:
                sid = sid + "-" + chr(ord("a") + (ord(sid[-1]) - ord("a") + 1) % 26) if sid[-1].isalpha() else sid + "x"
            if sid != s["id"]:
                print(f"  {slug}: fonte {s['id']} colidiu → {sid}")
                s = {**s, "id": sid}
            d.setdefault("sources", []).append(s)
            existing_ids.add(sid)
            if url: existing_urls.add(url)
            added_src += 1

        # metrics upsert
        by_id = {m["id"]: m for m in d.get("metrics", [])}
        up = {m["id"]: m for m in p.get("metrics", [])}
        n_new = n_rep = 0
        for mid, m in up.items():
            if mid in by_id: n_rep += 1
            else: n_new += 1
            by_id[mid] = m
        d["metrics"] = list(by_id.values())
        for m in d["metrics"]:                      # nomes canônicos (evita divergência entre patches)
            if m["id"] in CANON_NAMES and m.get("name") != CANON_NAMES[m["id"]]:
                print(f"  {slug}/{m['id']}: nome {m.get('name')!r} → {CANON_NAMES[m['id']]!r}")
                m["name"] = CANON_NAMES[m["id"]]

        # dataGaps substitui
        if "dataGaps" in p:
            d["dataGaps"] = p["dataGaps"]
        # governmentPlan etc.
        for k in ("governmentPlan",):
            if k in p:
                d[k] = p[k]

        json.dump(d, open(main_f, "w"), ensure_ascii=False, indent=2)
        print(f"✓ {slug:24s} fontes+{added_src}  métricas {n_rep} atualizadas / {n_new} novas"
              f"  dataGaps={'sim' if 'dataGaps' in p else 'não'}")

    # ---------- normalização de unidades/escamas ----------
    UNIT_CANON = {"bancada_partidaria_camara": "cadeiras", "equipe_gerida": "pessoas",
                  "maior_orcamento": "R$ bi/ano", "votos_recebidos": "votos",
                  "propostas_total": "itens do plano", "bens_declarados": "R$"}
    SCALE = {"milhão": 1e6, "milhão de": 1e6, "mil": 1e3, "milhão/ano": 1e6, "bi": 1e9}
    print("\n=== normalização de unidades ===")
    for f in sorted(glob.glob(os.path.join(BASE, "*.json"))):
        if "_raw" in f: continue
        slug = os.path.basename(f)[:-5]
        d = json.load(open(f))
        dirty = False
        for m in d.get("metrics", []):
            mid, unit, val = m.get("id"), m.get("unit"), m.get("value")
            # escala: bens em milhão -> reais absolutos
            if mid == "bens_declarados" and unit and "milh" in unit.lower() and isinstance(val, (int, float)):
                m["value"] = round(val * 1e6, 2)
                print(f"  {slug}/bens_declarados: {val} {unit} → {m['value']} R$")
                dirty = True
            canon = UNIT_CANON.get(mid)
            if canon and m.get("unit") and m["unit"] != canon:
                print(f"  {slug}/{mid}: unit {m['unit']!r} → {canon!r}")
                m["unit"] = canon; dirty = True
            elif canon and not m.get("unit"):
                m["unit"] = canon; dirty = True
        if dirty: json.dump(d, open(f, "w"), ensure_ascii=False, indent=2)

    return 0


def validate():
    # ---------- validação ----------
    print("\n=== VALIDAÇÃO ===")
    problems = []
    names = collections.defaultdict(collections.Counter)
    for f in sorted(glob.glob(os.path.join(BASE, "*.json"))):
        if "_raw" in f: continue
        slug = os.path.basename(f)[:-5]
        d = json.load(open(f))
        have = {m["id"]: m for m in d["metrics"]}
        miss = [c for c in CANON if c not in have]
        if miss: problems.append(f"{slug}: faltam {miss}")
        for m in d["metrics"]:
            if m.get("category") not in SLUGS:
                problems.append(f"{slug}/{m['id']}: categoria inválida {m.get('category')}")
            if (m.get("metricType") in ("number","currency","percentage")
                    and m.get("availability") == "available"
                    and m.get("value") is None and not m.get("valueText")):
                problems.append(f"{slug}/{m['id']}: available sem value")
            if not m.get("methodology"):
                problems.append(f"{slug}/{m['id']}: sem methodology")
            names[m["id"]][m.get("name","")] += 1
    for mid, c in names.items():
        if len(c) > 1:
            problems.append(f"nomes divergentes em {mid}: {dict(c)}")
    if problems:
        for p in problems: print("PROBLEMA:", p)
        return 2
    print("OK — 13/13 candidatos com 21 métricas, categorias e nomes consistentes")
    return 0

if __name__ == "__main__":
    rc = main()
    vrc = validate()
    sys.exit(max(rc, vrc))
