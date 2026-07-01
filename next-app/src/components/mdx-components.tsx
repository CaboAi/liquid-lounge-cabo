import { isValidElement } from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

// Images: lazy-load with caption
const MdxImage: MDXComponents["img"] = ({ src, alt, ...props }) => {
  if (!src) return null;
  return (
    <figure style={{ margin: "2rem 0" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src as string}
        alt={alt ?? ""}
        loading="lazy"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          display: "block",
        }}
        {...props}
      />
      {alt && (
        <figcaption
          style={{
            fontSize: "0.8125rem",
            color: "#666",
            marginTop: "0.5rem",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {alt}
        </figcaption>
      )}
    </figure>
  );
};

const mdxComponents: MDXComponents = {
  // Suppress: every post repeats its frontmatter title as a `# ` H1, which
  // would duplicate the page's own <h1> (rendered separately from post.title).
  h1: () => null,
  img: MdxImage,
  // Markdown wraps a bare `![]()` in a <p>, but MdxImage renders a <figure>
  // with a <figcaption> — nesting those inside <p> is invalid HTML and causes
  // a hydration mismatch. Unwrap the <p> when its only child is an image.
  p: ({ children, ...props }) => {
    if (isValidElement(children) && children.type === MdxImage) {
      return children;
    }
    return <p {...props}>{children}</p>;
  },
  // Links: internal → Next Link, external → new tab
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/") || href?.startsWith("#")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
  // Blockquotes styled as branded callout boxes
  blockquote: ({ children, ...props }) => (
    <blockquote
      style={{
        borderLeft: "4px solid hsl(164 44% 28%)",
        backgroundColor: "hsl(164 44% 96%)",
        padding: "1rem 1.25rem",
        margin: "1.5rem 0",
        borderRadius: "0 6px 6px 0",
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),
};

export default mdxComponents;
