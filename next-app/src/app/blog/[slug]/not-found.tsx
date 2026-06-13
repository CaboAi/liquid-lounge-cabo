import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main>
      <h1>Article Not Found</h1>
      <p>
        This article doesn&apos;t exist or may have moved. Browse all of our IV
        therapy articles below.
      </p>
      <Link href="/blog">← Back to the blog</Link>
    </main>
  );
}
