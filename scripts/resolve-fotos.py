#!/usr/bin/env python3
"""Resolve fotos dos candidatos para arquivos locais (public/candidatos/).

- photoUrl existente (Commons): resolve página de arquivo / Special:FilePath / URL direta
  → URL de imagem real + crédito (autor, licença) via API do Wikimedia Commons.
- Sem photoUrl: busca no Commons (namespace File), exige token distinto no título
  (evita atleta/homônimo). Match incerto = não baixa (fica nas iniciais, estado seguro).

Uso: python3 scripts/resolve-fotos.py [--aplicar]
Sem --aplicar: só relatório. Com --aplicar: baixa e grava research/_patches/fotos.json
(créditos) + public/candidatos/<slug>.<ext>.
"""
import json, glob, os, sys, urllib.parse, subprocess, re

API = "https://commons.wikimedia.org/w/api.php"
UA = {"User-Agent": "ComparadorCandidatos/1.0 (site: candidato.joaotolovi.com; reunindo retratos oficiais com crédito)"}
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "candidatos")
PATCH_DIR = os.path.join(os.path.dirname(__file__), "..", "research", "_patches")

# Título exato no Commons por candidato (escolha curada; ignora busca).
OVERRIDES = {
    "caiado": "File:Ronaldo Caiado (cropped).jpg",
}

def api(params):
    params = dict(params, format="json")
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(5):
        p = subprocess.run(["curl", "-s", "-w", "\n%{http_code}", "-A", UA["User-Agent"], "--max-time", "40", url],
                           capture_output=True, text=True)
        if p.returncode == 0:
            body, _, code = p.stdout.rpartition("\n")
            if code.strip() == "200":
                return json.loads(body)
        import time as _t
        _t.sleep(2.0 * (attempt + 1))
    return None

def imageinfo(title):
    """title = 'File:X.jpg' → dict {url, thumb, credit, license, title} ou None."""
    d = api({"action": "query", "titles": title, "prop": "imageinfo",
             "iiprop": "url|extmetadata|mime", "iiurlwidth": 400})
    if not d:
        return None
    pages = d.get("query", {}).get("pages", {})
    for p in pages.values():
        ii = p.get("imageinfo")
        if not ii:
            continue
        meta = ii[0].get("extmetadata", {})
        def strip(x):
            return re.sub(r"<[^>]+>", "", meta.get(x, {}).get("value", "") or "").strip()
        return {
            "title": p.get("title"),
            "url": ii[0].get("url"),
            "thumb": ii[0].get("thumburl") or ii[0].get("url"),
            "artist": strip("Artist") or "Autoria não registrada",
            "license": strip("LicenseShortName") or "Licença não registrada",
        }
    return None

def search_files(name, surname_tokens):
    d = api({"action": "query", "list": "search", "srsearch": f'"{name}"', "srnamespace": 6, "srlimit": 10})
    if not d:
        return []
    out = []
    for hit in d.get("query", {}).get("search", []):
        title = hit.get("title", "")
        if any(t.lower() in title.lower() for t in surname_tokens):
            out.append(title)
    return out

def download(url, dest):
    p = subprocess.run(["curl", "-s", "--fail", "-L", "-A", UA["User-Agent"], "--max-time", "90", url],
                       capture_output=True)
    if p.returncode != 0:
        raise RuntimeError(f"curl falhou {p.returncode} para {url[:80]}")
    data = p.stdout
    if len(data) < 5000:
        raise RuntimeError(f"arquivo pequeno demais: {len(data)}B")
    if not (data[:3] == b"\xff\xd8\xff" or data[:8] == b"\x89PNG\r\n\x1a\n" or data[:6] in (b"GIF87a", b"GIF89a") or data[:12] == b"\x00\x00\x00\x0cJXL" or b"WEBP" in data[:16]):
        raise RuntimeError(f"não é imagem reconhecida: {data[:12]!r}")
    ext = ".png" if data[:8] == b"\x89PNG\r\n\x1a\n" else ".jpg"
    path = os.path.join(OUT_DIR, dest + ext)
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    return dest + ext, len(data)

def file_title_from_page_url(u):
    m = re.search(r"/wiki/(File:[^?#]+)", u)
    return urllib.parse.unquote(m.group(1)) if m else None

def file_title_from_direct_url(u):
    m = re.search(r"/wikipedia/(?:commons|pt)/[0-9a-f]/[0-9a-f]{2}/([^/?#]+)", u)
    return urllib.parse.unquote(m.group(1)) if m else None

def main(apply=False):
    results, credits = [], {}
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(PATCH_DIR, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(os.path.dirname(__file__), "..", "research", "*.json"))):
        slug = os.path.basename(f).replace(".json", "")
        d = json.load(open(f))
        c = d.get("candidate", d)
        u = c.get("photoUrl") or ""
        name = c.get("name", slug)
        title = OVERRIDES.get(slug)
        if not title:
            if "commons.wikimedia.org/wiki/File:" in u:
                title = file_title_from_page_url(u)
            elif "Special:FilePath" in u:
                title = "File:" + urllib.parse.unquote(u.rsplit("/", 1)[-1])
            elif "upload.wikimedia.org" in u:
                title = file_title_from_direct_url(u)
            if not title:
                tokens = [t for t in name.split() if len(t) > 3][-2:]
                hits = search_files(name, tokens)
                if hits:
                    title = hits[0]
        if not title:
            results.append((slug, "SEM FOTO NO COMMONS (fica nas iniciais)"))
            continue
        info = imageinfo(title)
        import time as _t
        _t.sleep(0.8)
        if not info or not info.get("thumb"):
            # URL direta no JSON? Baixa direto (crédito genérico do Commons).
            if "upload.wikimedia.org" in u:
                if apply:
                    fname, size = download(u, slug)
                    credits[slug] = {"file": fname, "source": title or u, "artist": "Wikimedia Commons (ver página do ficheiro)", "license": "ver página do ficheiro"}
                    results.append((slug, f"OK direta {fname} {size//1024}KB (crédito a confirmar)"))
                else:
                    results.append((slug, f"BAIXARIA DIRETA de {u[:70]}"))
                continue
            results.append((slug, f"RESOLVEU '{title}' mas sem imagem (API falhou)"))
            continue
        status = f"{info['title']} | {info['artist'][:40]} | {info['license']}"
        if apply:
            fname, size = download(info["thumb"], slug)
            credits[slug] = {"file": fname, "source": info["title"], "artist": info["artist"], "license": info["license"]}
            results.append((slug, f"OK {fname} {size//1024}KB ← {status}"))
        else:
            results.append((slug, f"RESOLVERIA: {status}"))
    for slug, s in results:
        print(f"{slug:22} {s}")
    if apply:
        with open(os.path.join(PATCH_DIR, "fotos.json"), "w") as f:
            json.dump(credits, f, ensure_ascii=False, indent=2)
        print(f"\n{len(credits)} fotos baixadas; créditos em research/_patches/fotos.json")

if __name__ == "__main__":
    main(apply="--aplicar" in sys.argv)
