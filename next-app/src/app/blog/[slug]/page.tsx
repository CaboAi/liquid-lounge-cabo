import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { getBlogPostingSchema } from "@/lib/schema/blog";
import { contactInfo } from "@/lib/data";
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
      siteName: "Liquid Lounge IV",
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

      <Header />
      <main className="pt-20">
        <section className="section-teal aurora">
          <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="eyebrow justify-center text-[hsl(43_74%_72%)]">
              The journal
            </p>
            <h1 className="mt-5 text-3xl font-medium text-white sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-white/70">
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
          </div>
        </section>

        <article className="section-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {post.coverImage && (
              <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-border/60">
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt}
                  width={1260}
                  height={750}
                  priority
                  className="w-full object-cover"
                />
              </div>
            )}

            <div className="prose-blog mt-10">
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            {/* Article footer / CTA */}
            <footer className="mt-14">
              <div className="card-lux text-center">
                <h3 className="text-2xl font-medium">
                  Ready to Book Your Mobile IV Session?
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Nathan Brown, BSN RN, comes directly to your hotel, villa, or
                  resort anywhere in Los Cabos. No clinic. No waiting room.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="medical" size="lg" asChild>
                    <Link href="/contact">Book a Session</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a
                      href={contactInfo.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      WhatsApp Nate
                    </a>
                  </Button>
                </div>
              </div>

              {post.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">Tags:</strong>
                  {post.tags.map((tag) => (
                    <span key={tag} className="trust-badge text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <Link
                  href="/blog"
                  className="font-semibold text-medical-teal hover:underline"
                >
                  ← Back to all articles
                </Link>
              </div>
            </footer>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
