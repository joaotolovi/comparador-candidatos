// Formatação pt-BR centralizada — números, valores, datas, durações.

const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatNumber(v: number): string {
  return Number.isInteger(v) ? nf0.format(v) : nf1.format(v);
}

export function formatPct(v: number): string {
  return `${nf1.format(v)}%`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function formatPeriod(start: string, end: string | null): string {
  const fmt = (s: string) => s.slice(0, 4) + (s.length > 4 ? "/" + s.slice(5, 7) : "");
  return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – atual`;
}

/** Extrai anos completos entre datas YYYY ou YYYY-MM (YYYY = 01/01) */
export function yearsBetween(start: string, end: string | null): number {
  const s = new Date(start.length === 7 ? start + "-01" : start);
  const e = end ? new Date(end.length === 7 ? end + "-01" : end) : new Date();
  const years = (e.getTime() - s.getTime()) / (365.25 * 24 * 3600 * 1000);
  return Math.max(0, Math.round(years * 10) / 10);
}

export function ageFrom(birthDate: string): number {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
