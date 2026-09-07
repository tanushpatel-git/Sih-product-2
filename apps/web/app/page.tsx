import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your doctor-backed AI consultation assistant
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Ask questions and receive answers grounded in approved medical
          knowledge maintained by your doctor. Your conversations stay private
          and encrypted.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}