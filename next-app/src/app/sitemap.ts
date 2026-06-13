import { MetadataRoute } from "next";
import { getAllPostsMeta } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://liquidloungeiv.com";

  // ── Static pages ──
  const posts = getAllPostsMeta();
  const blogIndexLastModified = posts[0]?.date
    ? new Date(posts[0].date)
    : new Date("2026-06-03");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/services`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/iv-menu`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/find-your-iv`, lastModified: new Date("2026-06-03") },
    { url: `${baseUrl}/about`, lastModified: new Date("2026-01-01") },
    { url: `${baseUrl}/contact`, lastModified: new Date("2026-01-01") },
    { url: `${baseUrl}/blog`, lastModified: blogIndexLastModified },
  ];

  // ── Blog posts (dynamic) ──
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastUpdated || post.date),
  }));

  return [...staticPages, ...blogPages];
}
