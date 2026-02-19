import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-zinc-100">404</h1>
        <p className="mt-4 text-lg text-zinc-400">Page not found</p>
        <p className="mt-2 text-sm text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
