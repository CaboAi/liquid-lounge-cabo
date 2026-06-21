import Link from "next/link";
import type { MDXComponents } from "mdx/types";

const mdxComponents: MDXComponents = {
  // Images: lazy-load with caption
  img: ({ src, alt, ...props }) => {
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
        borderLeft: "4px solid #2E86C1",
        backgroundColor: "#EBF5FB",
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
