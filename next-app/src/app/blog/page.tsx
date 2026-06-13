import type { Metadata } from "next";
import Link from "next/link";
import { getAllPostsMeta } from "@/lib/blog";
import { getBlogListingSchema } from "@/lib/schema/blog";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's `%s | Liquid Lounge IV` template so
  // the brand suffix is not appended twice.
  title: {
    absolute:
      "IV Therapy Blog | Liquid Lounge Mobile IV Therapy Cabo San Lucas",
  },
  description:
    "Expert IV therapy advice from Nathan Brown, BSN RN. Hangover recovery, NAD+ therapy, hydration tips, travel recovery, and group IV therapy in Los Cabos.",
  openGraph: {
    title: "IV Therapy Blog | Liquid Lounge",
    description:
      "Expert IV therapy advice from Nathan Brown, BSN RN in Cabo San Lucas.",
    type: "website",
    url: "https://liquidloungeiv.com/blog",
  },
  alternates: { canonical: "https://liquidloungeiv.com/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();
  const schema = getBlogListingSchema(posts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main>
        <section>
          <h1>IV Therapy Blog</h1>
          <p>
            Expert advice from{" "}
            <Link href="/about">Nathan Brown, BSN RN</Link> — mobile IV therapy
            in Cabo San Lucas.
          </p>
        </section>

        <section>
          {posts.map((post) => (
            <article key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt={post.coverImageAlt}
                    loading="lazy"
                  />
                )}
                <h2>{post.title}</h2>
              </Link>
              <p>{post.description}</p>
              <div>
                <span>By {post.author}</span>
                {" · "}
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {" · "}
                <span>{post.readingTime} min read</span>
              </div>
              {post.tags.length > 0 && (
                <div>
                  {post.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
