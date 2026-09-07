"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, type Conversation, type Doctor } from "@/lib/api";

export default function DashboardPatient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [convs, docs] = await Promise.all([api.listConversations(), api.listDoctors()]);
    setConversations(convs.conversations);
    setDoctors(docs.doctors);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"));
  }, [load]);

  async function startConversation() {
    if (!selectedDoctor) return;
    setCreating(true);
    setError(null);
    try {
      const { conversation } = await api.createConversation(selectedDoctor);
      window.location.href = `/chat/${conversation.id}`;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to start conversation");
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Your consultations
      </h1>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Start a new consultation
        </h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Choose a doctor…</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name}
                {d.specialty ? ` — ${d.specialty}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={startConversation}
            disabled={!selectedDoctor || creating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? "Starting…" : "Start chat"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {conversations.length === 0 && (
          <li className="text-sm text-zinc-500">
            No consultations yet — start one above.
          </li>
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
                  {c.doctor_name || "Doctor"}
                </div>
              </div>
              <span className="rounded-full px-2 py-1 text-xs font-medium capitalize text-zinc-600 dark:text-zinc-400">
                {c.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}