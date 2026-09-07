"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { api, ApiError, type DocumentRow } from "@/lib/api";

const ALLOWED_EXTENSIONS = [".pdf", ".txt", ".md", ".markdown", ".docx"];
const MAX_SIZE_MB = 20;

export default function DocumentManager() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const { documents } = await api.listDocuments();
    setDocuments(documents);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"));
  }, [load]);

  const fileError = useMemo(() => {
    if (!file) return null;
    const lower = (file.name || "").toLowerCase();
    const okExt = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!okExt)
      return `"${file.name}" is not a supported file type. Supported: ${ALLOWED_EXTENSIONS.join(
        ", "
      )}`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `"${file.name}" is larger than ${MAX_SIZE_MB} MB.`;
    return null;
  }, [file]);

  async function onUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (fileError) {
      setError(fileError);
      return;
    }
    setUploading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.uploadDocument(file, title || undefined, "medical", version || undefined);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTitle("");
      setVersion("1");
      setSuccessMsg(`"${file.name}" uploaded and is now active.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    setSuccessMsg(null);
    await api.deleteDocument(id);
    setSuccessMsg("Document deleted.");
    await load();
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  function selectFile(selectedFile: File | null) {
    setFile(selectedFile);
    setError(null);
    setSuccessMsg(null);
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Knowledge documents
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Uploaded documents are chunked, embedded, and made available only to
        your patients via RAG. Supported: .pdf, .txt, .md, .docx (max{" "}
        {MAX_SIZE_MB} MB).
      </p>

      <form onSubmit={onUpload} className="mt-3 space-y-2">
        <input
          ref={fileInputRef}
          id="medical-document-file"
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
          className="sr-only"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-md border-2 border-dashed border-blue-300 bg-blue-50 px-4 py-5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-500 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
        >
          {file ? "Choose a different file" : "Choose a document to upload"}
        </button>
        <p className="text-xs text-zinc-500">
          Select a PDF, TXT, MD, Markdown, or DOCX file.
        </p>
        {file && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Selected: {file.name} ({Math.ceil(file.size / 1024)} KB)
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Title (optional, defaults to filename)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
          <input
            placeholder="Version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className={`${inputCls} sm:w-32`}
          />
          <button
            type="submit"
            disabled={!file || uploading || !!fileError}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>

      {fileError && <p className="mt-2 text-sm text-amber-600">{fileError}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {successMsg && (
        <p className="mt-2 text-sm text-emerald-600">{successMsg}</p>
      )}

      <ul className="mt-4 space-y-2">
        {documents.length === 0 && (
          <li className="text-sm text-zinc-500">No documents uploaded yet.</li>
        )}
        {documents.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {d.title}
              </div>
              <div className="text-xs text-zinc-500">
                v{d.version || "1"} · {d.status}
              </div>
            </div>
            <button
              onClick={() => onDelete(d.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
