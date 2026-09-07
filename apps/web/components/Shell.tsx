"use client";

import AppHeader from "./AppHeader";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}