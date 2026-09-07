"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
          MedChat
        </Link>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.full_name} ({user.role.toLowerCase()})
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-zinc-600 hover:underline">
              Sign in
            </a>
            <a href="/register" className="text-sm font-medium text-blue-600 hover:underline">
              Register
            </a>
          </div>
        )}
      </div>
    </header>
  );
}