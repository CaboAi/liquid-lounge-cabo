import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://liquidloungeiv.com";

  return [
    { url: baseUrl, lastModified: new Date("2026-04-13"), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date("2026-04-13"), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/iv-menu`, lastModified: new Date("2026-04-13"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date("2026-04-13"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date("2026-04-13"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/find-your-iv`, lastModified: new Date("2026-04-13"), changeFrequency: "monthly", priority: 0.6 },
  ];
}
