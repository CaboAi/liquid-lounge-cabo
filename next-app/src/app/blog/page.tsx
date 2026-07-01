import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
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
    siteName: "Liquid Lounge IV",
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
      <Header />
      <main className="pt-20">
        <PageHero
          eyebrow="The journal"
          title="IV Therapy Blog"
          subtitle="Expert advice from Nathan Brown, BSN RN — mobile IV therapy in Cabo San Lucas."
        />

        <section className="section-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="card-lux flex flex-col">
                  <Link href={`/blog/${post.slug}`} className="block">
                    {post.coverImage && (
                      <div className="overflow-hidden rounded-2xl">
                        <Image
                          src={post.coverImage}
                          alt={post.coverImageAlt}
                          width={640}
                          height={400}
                          className="aspect-[16/10] w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <h2 className="mt-5 text-xl font-medium leading-snug text-foreground">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-wide text-muted-foreground">
                    <span>By {post.author}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="trust-badge text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
