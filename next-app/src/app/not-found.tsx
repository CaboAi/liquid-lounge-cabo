import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 pt-20">
        <p className="overline">404</p>
        <h1 className="text-4xl font-semibold">Page Not Found</h1>
        <p className="max-w-md text-center text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get
          you back on track.
        </p>
        <div className="flex gap-3">
          <Button variant="default" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="medical" asChild>
            <Link href="/contact">Book an IV</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
