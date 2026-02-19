"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-zinc-100">Something went wrong</h1>
        <p className="mt-4 text-sm text-zinc-400">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-8 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
