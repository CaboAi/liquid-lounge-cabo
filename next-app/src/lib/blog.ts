import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastUpdated: string;
  author: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  ogImage: string;
  content: string;
  readingTime: number;
}

export type BlogPostMeta = Omit<BlogPost, "content">;

function calcReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    date: (data.date as string) ?? "",
    lastUpdated: (data.lastUpdated as string) ?? (data.date as string) ?? "",
    author: (data.author as string) ?? "Nathan Brown, BSN RN",
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    coverImage: (data.coverImage as string) ?? "",
    coverImageAlt: (data.coverImageAlt as string) ?? "",
    ogImage: (data.ogImage as string) ?? (data.coverImage as string) ?? "",
    content,
    readingTime: calcReadingTime(content),
  };
}

export function getAllPosts(): BlogPost[] {
  return getAllSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllPostsMeta(): BlogPostMeta[] {
  return getAllPosts().map((post) => {
    // Strip the full article body so the listing payload stays lightweight.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content: _content, ...meta } = post;
    return meta;
  });
}
