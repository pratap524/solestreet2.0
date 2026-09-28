import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-zinc-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-zinc-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
          have been removed, renamed, or didn&apos;t exist in the first place.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-zinc-300 text-zinc-900 rounded-full text-sm font-semibold hover:bg-zinc-50 transition-colors"
          >
            Browse Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
