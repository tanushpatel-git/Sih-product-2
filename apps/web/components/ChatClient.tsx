"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError, type Message, type Conversation } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ChatClient({ conversationId, conversation, initialMessages }: {
  conversationId: string;
  conversation: Conversation;
  initialMessages: Message[];
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ documentId: string; title: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    setError(null);

    // optimistic append
    const temp: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender: "patient",
      content,
      safety_flags: {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);

    try {
      const res = await api.sendMessage(conversationId, content);
      setMessages((prev) => [
        ...prev,
        {
          id: `res-${Date.now()}`,
          conversation_id: conversationId,
          sender: "ai",
          content: res.message.content,
          safety_flags: res.message.safety_flags,
          created_at: new Date().toISOString(),
        },
      ]);
      setSources(
        (res.sources || []).map((s) => ({ documentId: s.documentId, title: s.title }))
      );
      if (res.emergency) {
        setError(
          "This conversation was escalated. The system detected signs of a potential emergency."
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    } finally {
      setSending(false);
    }
  }

  const canReply = user?.role === "PATIENT" || user?.role === "DOCTOR";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {conversation.title || "Consultation"}
        </h1>
        <p className="text-sm text-zinc-500">
          {conversation.patient_name || conversation.doctor_name || ""} · status:{" "}
          <span className="capitalize">{conversation.status}</span>
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        {messages.length === 0 && (
          <div className="text-center text-sm text-zinc-500">
            Ask your first question to begin.
          </div>
        )}
        {messages.map((m) => {
          const fromPatient = m.sender === "patient";
          const fromDoctor = m.sender === "doctor";
          const right = fromPatient || fromDoctor;
          return (
            <div key={m.id} className={`flex ${right ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                  right
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {sources.length > 0 && (
        <details className="mt-2 text-xs text-zinc-500">
          <summary className="cursor-pointer">
            Sources used ({sources.length})
          </summary>
          <ul className="mt-1 list-disc pl-5">
            {sources.map((s, i) => (
              <li key={i}>{s.title || "Document"}</li>
            ))}
          </ul>
        </details>
      )}

      {error && (
        <p className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {canReply && (
        <form onSubmit={onSend} className="mt-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message…"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}