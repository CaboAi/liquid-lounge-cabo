import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { getBlogPostingSchema } from "@/lib/schema/blog";
import mdxComponents from "@/components/mdx-components";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const { slug } = params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    // `absolute` bypasses the root layout's `%s | Liquid Lounge IV` template so
    // the brand suffix is not appended twice.
    title: { absolute: `${post.title} | Liquid Lounge IV Therapy` },
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.lastUpdated,
      authors: [post.author],
      images: [
        {
          url: post.ogImage,
          width: 1260,
          height: 750,
          alt: post.coverImageAlt,
        },
      ],
      url: `https://liquidloungeiv.com/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.ogImage],
    },
    alternates: { canonical: `https://liquidloungeiv.com/blog/${slug}` },
  };
}

export default function BlogPostPage({ params }: Props) {
  const { slug } = params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const schema = getBlogPostingSchema(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article>
        {/* Article header */}
        <header>
          <h1>{post.title}</h1>
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

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.coverImageAlt}
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
          )}
        </header>

        {/* MDX content */}
        <div>
          <MDXRemote source={post.content} components={mdxComponents} />
        </div>

        {/* Article footer / CTA */}
        <footer>
          <div>
            <h3>Ready to Book Your Mobile IV Session?</h3>
            <p>
              Nathan Brown, BSN RN, comes directly to your hotel, villa, or
              resort anywhere in Los Cabos. No clinic. No waiting room.
            </p>
            <Link href="/contact">Book a Session</Link>
            {" · "}
            <a href="tel:+526242287777">+52 624 228 7777</a>
          </div>

          {post.tags.length > 0 && (
            <div>
              <strong>Tags: </strong>
              {post.tags.join(", ")}
            </div>
          )}

          <div>
            <Link href="/blog">← Back to all articles</Link>
          </div>
        </footer>
      </article>
    </>
  );
}
