"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-zinc-100">
              Something went wrong
            </h1>
            <p className="mt-4 text-sm text-zinc-400">
              {error.message || "A critical error occurred."}
            </p>
            <button
              onClick={reset}
              className="mt-8 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
