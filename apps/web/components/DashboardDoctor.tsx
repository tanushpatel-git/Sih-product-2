"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, type Conversation } from "@/lib/api";
import DocumentManager from "./DocumentManager";
import AiConfigPanel from "./AiConfigPanel";

type Tab = "conversations" | "documents" | "config";

export default function DashboardDoctor() {
  const [tab, setTab] = useState<Tab>("conversations");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { conversations } = await api.listConversations();
    setConversations(conversations);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"));
  }, [load]);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "conversations", label: "Conversations" },
    { key: "documents", label: "Knowledge documents" },
    { key: "config", label: "AI configuration" },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Doctor dashboard
      </h1>

      <div className="mt-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {tab === "conversations" && (
        <ul className="mt-6 space-y-2">
          {conversations.length === 0 && (
            <li className="text-sm text-zinc-500">No conversations yet.</li>
          )}
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/chat/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div>
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">
                    {c.title || "Consultation"}
                  </div>
                  <div className="text-sm text-zinc-500">
                    {c.patient_name || "Patient"}
                  </div>
                </div>
                <span className="rounded-full px-2 py-1 text-xs font-medium capitalize text-zinc-600 dark:text-zinc-400">
                  {c.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {tab === "documents" && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <DocumentManager />
        </div>
      )}

      {tab === "config" && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <AiConfigPanel />
        </div>
      )}
    </div>
  );
}