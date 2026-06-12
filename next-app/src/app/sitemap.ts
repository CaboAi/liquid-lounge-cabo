import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://liquidloungeiv.com";

  return [
    { url: `${baseUrl}/`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/services`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/iv-menu`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/find-your-iv`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/about`, lastModified: new Date("2026-01-01") },
    { url: `${baseUrl}/contact`, lastModified: new Date("2026-01-01") },
  ];
}
