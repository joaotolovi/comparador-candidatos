import type { MetadataRoute } from "next";
import { getCandidates } from "@/lib/data";

const BASE = "https://candidato.joaotolovi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const candidates = await getCandidates();
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    {
      url: `${BASE}/comparar`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE}/metodologia`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...candidates.map((c) => ({
      url: `${BASE}/candidato/${c.id}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
