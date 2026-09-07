"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT";
  full_name: string;
  doctor_id?: string;
  patient_id?: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("medchat_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("medchat_token", token);
  else localStorage.removeItem("medchat_token");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("medchat_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem("medchat_user");
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem("medchat_user", JSON.stringify(user));
  else localStorage.removeItem("medchat_user");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm) headers["Content-Type"] = "application/json";
  if (withAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export interface Doctor {
  id: string;
  full_name: string;
  email: string;
  specialty: string | null;
}

export interface Conversation {
  id: string;
  patient_id?: string;
  doctor_id?: string;
  doctor_name?: string;
  patient_name?: string;
  title: string | null;
  status: "open" | "closed" | "escalated";
  summary?: string | null;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: "patient" | "ai" | "doctor" | "system";
  content: string;
  safety_flags: Record<string, unknown>;
  created_at: string;
}

export interface DocumentRow {
  id: string;
  title: string;
  file_name: string;
  document_type: string | null;
  version: string | null;
  status: "pending" | "processing" | "active" | "error";
  created_at: string;
}

export interface AiConfig {
  system_prompt?: string;
  response_style?: string;
  language?: string;
  temperature: number;
  max_tokens: number;
  emergency_policy?: string;
}

export const api = {
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    role: "DOCTOR" | "PATIENT";
    specialty?: string;
    licenseNo?: string;
  }) =>
    request<{ token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }, false),

  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),

  me: () => request<{ user: never }>("/api/auth/me"),

  listDoctors: () => request<{ doctors: Doctor[] }>("/api/doctors"),

  listConversations: () =>
    request<{ conversations: Conversation[] }>("/api/conversations"),

  getConversation: (id: string) =>
    request<{ conversation: Conversation; messages: Message[] }>(
      `/api/conversations/${id}`
    ),

  createConversation: (doctorId: string, title?: string) =>
    request<{ conversation: Conversation }>("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ doctorId, title }),
    }),

  sendMessage: (id: string, content: string) =>
    request<{
      message: Message;
      sources: Array<{ documentId: string; title: string; content: string }>;
      emergency: boolean;
    }>(`/api/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  listDocuments: () =>
    request<{ documents: DocumentRow[] }>("/api/documents"),

  uploadDocument: (file: File, title?: string, documentType?: string, version?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);
    if (documentType) form.append("documentType", documentType);
    if (version) form.append("version", version);
    return request<{ document: DocumentRow; chunks: number }>("/api/documents", {
      method: "POST",
      body: form,
    });
  },

  deleteDocument: (id: string) =>
    request<{ deleted: boolean }>(`/api/documents/${id}`, { method: "DELETE" }),

  getAiConfig: () => request<{ config: AiConfig | null }>("/api/ai-config"),

  updateAiConfig: (cfg: Partial<AiConfig>) =>
    request<{ config: AiConfig }>("/api/ai-config", {
      method: "PUT",
      body: JSON.stringify(cfg),
    }),
};

export { ApiError };