"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Clawd } from "@/components/Clawd";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <Clawd size={64} className="mx-auto mb-6 opacity-40" />

        <div className="rounded-xl border border-card-border bg-card-bg p-8">
          <p className="text-term-red font-bold text-sm mb-1">error: process exited with code 1</p>
          <h1 className="text-2xl font-bold text-text-bright tracking-tight mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-text-muted mb-6">
            An unexpected error occurred. You can try again or head back to the home page.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => unstable_retry()}
              className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-black font-bold py-2 px-5 rounded-lg transition-colors text-sm active:scale-[0.98]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-card-border hover:border-accent/30 text-text py-2 px-5 rounded-lg transition-colors text-sm"
            >
              cd ~
            </Link>
          </div>
        </div>

        {error.digest && <p className="text-xs text-text-muted mt-4">Digest: {error.digest}</p>}
      </div>
    </div>
  );
}
