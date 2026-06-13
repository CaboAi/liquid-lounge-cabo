import type { BlogPost, BlogPostMeta } from "@/lib/blog";

const SITE_URL = "https://liquidloungeiv.com";

export function getBlogPostingSchema(post: BlogPost | BlogPostMeta) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: {
      "@type": "ImageObject",
      url: post.coverImage,
      width: 1260,
      height: 750,
    },
    datePublished: `${post.date}T00:00:00-07:00`,
    dateModified: `${post.lastUpdated}T00:00:00-07:00`,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: "Registered Nurse",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Liquid Lounge Mobile IV Therapy",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    keywords: post.tags.join(", "),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: "Liquid Lounge IV Therapy Blog",
      url: `${SITE_URL}/blog`,
    },
  };
}

export function getBlogListingSchema(posts: BlogPostMeta[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Liquid Lounge IV Therapy Blog",
    description:
      "Expert IV therapy advice from Nathan Brown, BSN RN — hangover recovery, NAD+ therapy, hydration tips, and mobile IV service in Cabo San Lucas.",
    url: `${SITE_URL}/blog`,
    author: {
      "@type": "Person",
      name: "Nathan Brown, BSN RN",
      url: `${SITE_URL}/about`,
    },
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.date,
    })),
  };
}
