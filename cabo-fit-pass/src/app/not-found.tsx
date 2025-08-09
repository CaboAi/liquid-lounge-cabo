'use client'

import Link from "next/link";
import { useEffect } from "react";

const NotFound = () => {
  useEffect(() => {
    console.error(`404 - Page not found`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Go Home
            </button>
          </Link>
          <Link href="/classes">
            <button className="px-6 py-2 border border-input rounded-md hover:bg-accent">
              Browse Classes
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
