"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError, type Conversation, type Message } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Shell from "@/components/Shell";
import ChatClient from "@/components/ChatClient";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    api
      .getConversation(id)
      .then((d) => {
        setConversation(d.conversation);
        setMessages(d.messages);
      })
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Failed to load conversation")
      );
  }, [id, user, router]);

  if (!user) return <Shell><div /></Shell>;

  return (
    <Shell>
      {error ? (
        <div className="flex flex-1 items-center justify-center text-sm text-red-600">
          {error}
        </div>
      ) : conversation ? (
        <ChatClient
          conversationId={id}
          conversation={conversation}
          initialMessages={messages}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
          Loading…
        </div>
      )}
    </Shell>
  );
}