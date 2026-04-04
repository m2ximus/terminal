import Link from "next/link";
import { Clawd } from "@/components/Clawd";

export default function LevelNotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <Clawd size={64} className="mx-auto mb-6 opacity-40" />

        <div className="rounded-xl border border-card-border bg-card-bg p-8">
          <p className="text-term-yellow font-bold text-sm mb-1">error: no such level</p>
          <h1 className="text-2xl font-bold text-text-bright tracking-tight mb-3">
            Level not found
          </h1>
          <p className="text-sm text-text-muted mb-6">
            This level doesn&apos;t exist. Check the URL or pick a level from the home page.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-black font-bold py-2 px-5 rounded-lg transition-colors text-sm active:scale-[0.98]"
            >
              View all levels
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center border border-card-border hover:border-accent/30 text-text py-2 px-5 rounded-lg transition-colors text-sm"
            >
              cd ~
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
