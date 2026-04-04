"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#141413",
          color: "#e8e6dc",
          fontFamily: 'ui-monospace, "SF Mono", "Cascadia Mono", monospace',
        }}
      >
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center", padding: "1.5rem" }}>
          <div
            style={{
              borderRadius: "0.75rem",
              border: "1px solid rgba(255,255,255,0.06)",
              backgroundColor: "#1a1a19",
              padding: "2rem",
            }}
          >
            <p
              style={{
                color: "#f87171",
                fontWeight: 700,
                fontSize: "0.875rem",
                marginBottom: "0.25rem",
              }}
            >
              fatal: unrecoverable error
            </p>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#faf9f5",
                letterSpacing: "-0.025em",
                marginBottom: "0.75rem",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#b0aea5",
                marginBottom: "1.5rem",
              }}
            >
              A critical error occurred. Try refreshing the page.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => unstable_retry()}
                style={{
                  backgroundColor: "#4ade80",
                  color: "#000",
                  fontWeight: 700,
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try again
              </button>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#e8e6dc",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  fontFamily: "inherit",
                }}
              >
                cd ~
              </Link>
            </div>
          </div>

          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#b0aea5", marginTop: "1rem" }}>
              Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
