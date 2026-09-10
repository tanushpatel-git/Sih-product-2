"use client";

import { useState, useRef } from "react";
import { FileText, Save, ChevronDown, Upload, Trash2 } from "lucide-react";
import DoctorSidebar from "./components/DoctorSidebar";
import DoctorTopBar from "./components/DoctorTopBar";
import TluxFloatingButton from "./components/TluxFloatingButton";
import TluxChatDrawer from "./components/TluxChatDrawer";

// ─── Knowledge Document types ───────────────────────────────────────────────

interface KnowledgeDoc {
  id: string;
  name: string;
  version: string;
  filename: string;
  fileType: string;
  uploadedAt: string;
  content: string;
}

const STORAGE_KEY = "vitaweave_doctor_knowledge_docs";

function loadDocs(): KnowledgeDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KnowledgeDoc[]) : [];
  } catch {
    return [];
  }
}

function saveDocs(docs: KnowledgeDoc[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

const ACCEPTED = ".txt,.md,.csv,.json";

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTlux, setShowTlux] = useState(false);
  const [activeTab, setActiveTab] = useState("ai-config");

  // ── AI Config state ─────────────────────────────────────────────────────
  const [config, setConfig] = useState(() => {
    const defaults = {
      extraSystemInstructions: "",
      responseStyle: "default",
      language: "en",
      maxTokens: "512",
      temperature: "0.7",
      emergencyPolicy: "",
    };
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem("vitaweave_doctor_ai_config");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return defaults;
    }
  });

  const handleSave = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vitaweave_doctor_ai_config", JSON.stringify(config));
      } catch { }
    }
    console.log("Saving configuration:", config);
    alert("Configuration saved successfully!");
  };

  // ── Knowledge Docs state ─────────────────────────────────────────────────
  const [docs, setDocs] = useState<KnowledgeDoc[]>(() => loadDocs());
  const [docName, setDocName] = useState("");
  const [docVersion, setDocVersion] = useState("v1");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError("");
    if (file && !docName) {
      const base = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setDocName(base.charAt(0).toUpperCase() + base.slice(1));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file.");
      return;
    }
    if (!docName.trim()) {
      setUploadError("Please enter a document name.");
      return;
    }
    if (!docVersion.trim()) {
      setUploadError("Please enter a version.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const content = await selectedFile.text();
      const ext = selectedFile.name.split(".").pop()?.toLowerCase() ?? "";

      const newDoc: KnowledgeDoc = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: docName.trim(),
        version: docVersion.trim(),
        filename: selectedFile.name,
        fileType: ext.toUpperCase() || "TXT",
        uploadedAt: new Date().toISOString(),
        content,
      };

      const updated = [newDoc, ...docs];
      setDocs(updated);
      saveDocs(updated);

      setSelectedFile(null);
      setDocName("");
      setDocVersion("v1");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setUploadError("Failed to read file. Please ensure it is a valid text file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    saveDocs(updated);
  };

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17201d]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <DoctorSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === "tlux") {
            setShowTlux(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* MAIN */}
      <div className="lg:pl-[260px]">
        {/* TOP BAR */}
        <DoctorTopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {/* AI CONFIG SECTION */}
          {activeTab === "ai-config" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-3xl font-medium tracking-[-0.045em]">
                  AI Response Configuration
                </h2>
                <p className="mt-2 text-sm text-[#7b8581]">
                  Customize how TLUX responds in your clinical workspace
                </p>
              </div>

              <div className="space-y-6 rounded-[22px] border border-[#e0e6e2] bg-white p-7 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
                {/* Extra System Instructions */}
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                    Extra system instructions
                  </label>
                  <textarea
                    value={config.extraSystemInstructions}
                    onChange={(e) =>
                      setConfig({ ...config, extraSystemInstructions: e.target.value })
                    }
                    placeholder="Enter additional system instructions..."
                    className="w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] p-4 text-sm outline-none transition placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    rows={4}
                  />
                </div>

                {/* Response Style */}
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                    Response style
                  </label>
                  <div className="relative">
                    <select
                      value={config.responseStyle}
                      onChange={(e) =>
                        setConfig({ ...config, responseStyle: e.target.value })
                      }
                      className="h-13 w-full appearance-none rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm text-[#35403c] outline-none transition focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    >
                      <option value="default">Default</option>
                      <option value="simple">Simple and concise</option>
                      <option value="detailed">Detailed</option>
                      <option value="empathetic">Empathetic</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                    />
                  </div>
                </div>

                {/* Language — Indian languages */}
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      value={config.language}
                      onChange={(e) =>
                        setConfig({ ...config, language: e.target.value })
                      }
                      className="h-13 w-full appearance-none rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm text-[#35403c] outline-none transition focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                      <option value="mr">Marathi</option>
                      <option value="te">Telugu</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                    />
                  </div>
                </div>

                {/* Max Tokens */}
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                    Max tokens
                  </label>
                  <input
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) =>
                      setConfig({ ...config, maxTokens: e.target.value })
                    }
                    className="h-13 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none transition placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    placeholder="512"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <label className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                      Temperature
                    </label>
                    <span className="rounded-lg border border-[#dfe5e2] bg-[#f9faf9] px-2.5 py-1 font-mono text-xs font-medium text-[#35403c]">
                      {parseFloat(config.temperature || "0.7").toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) =>
                      setConfig({ ...config, temperature: e.target.value })
                    }
                    className="h-2 w-full cursor-pointer accent-[#17201d]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-[#a4aca8]">
                    <span>0.0 (Precise / Deterministic)</span>
                    <span>1.0 (Creative / Exploratory)</span>
                  </div>
                </div>

                {/* Emergency Policy */}
                <div>
                  <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                    Emergency policy
                  </label>
                  <textarea
                    value={config.emergencyPolicy}
                    onChange={(e) =>
                      setConfig({ ...config, emergencyPolicy: e.target.value })
                    }
                    placeholder="Enter emergency policy instructions..."
                    className="w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] p-4 text-sm outline-none transition placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    rows={4}
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#17201d] px-6 text-sm font-medium text-white shadow-[0_12px_30px_rgba(23,32,29,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#26332e] hover:shadow-[0_18px_40px_rgba(23,32,29,0.2)] active:translate-y-0"
                >
                  <Save size={17} />
                  Save configuration
                </button>
              </div>
            </div>
          )}

          {/* CONVERSATIONS SECTION */}
          {activeTab === "conversations" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-3xl font-medium tracking-[-0.045em]">
                  Conversations
                </h2>
                <p className="mt-2 text-sm text-[#7b8581]">
                  Your conversation history with clinical AI and consultations
                </p>
              </div>
              <div className="rounded-[22px] border border-[#e0e6e2] bg-white p-7 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
                <p className="text-sm text-[#929b97]">
                  No active clinical conversations in archive. Start a new session using Ask TLUX.
                </p>
              </div>
            </div>
          )}

          {/* KNOWLEDGE DOCUMENTS SECTION */}
          {activeTab === "knowledge" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-3xl font-medium tracking-[-0.045em]">
                  Knowledge Documents
                </h2>
                <p className="mt-2 text-sm text-[#7b8581]">
                  Manage your clinical guidelines and medical knowledge base
                </p>
              </div>

              {/* Upload Card */}
              <div className="rounded-[22px] border border-[#e0e6e2] bg-white p-7 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
                <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                  Upload new document
                </p>

                <div className="space-y-4">
                  {/* File picker */}
                  <div>
                    <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                      File
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED}
                      onChange={handleFileChange}
                      className="w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 py-3 text-sm text-[#35403c] outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[#17201d] file:px-3 file:py-1.5 file:text-[10px] file:font-medium file:text-white hover:file:bg-[#26332e] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    />
                    <p className="mt-1.5 text-[10px] text-[#a4aca8]">
                      Accepted: .txt, .md, .csv, .json
                    </p>
                  </div>

                  {/* Document name */}
                  <div>
                    <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                      Document name
                    </label>
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="e.g. Clinical Guidelines"
                      className="h-13 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none transition placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    />
                  </div>

                  {/* Version */}
                  <div>
                    <label className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                      Version
                    </label>
                    <input
                      type="text"
                      value={docVersion}
                      onChange={(e) => setDocVersion(e.target.value)}
                      placeholder="e.g. v1"
                      className="h-13 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none transition placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                    />
                  </div>

                  {/* Error */}
                  {uploadError && (
                    <p className="text-xs text-red-500">{uploadError}</p>
                  )}

                  {/* Upload button */}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-[#17201d] px-6 text-sm font-medium text-white shadow-[0_12px_30px_rgba(23,32,29,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#26332e] hover:shadow-[0_18px_40px_rgba(23,32,29,0.2)] active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Upload size={17} />
                    {uploading ? "Uploading..." : "Upload document"}
                  </button>
                </div>
              </div>

              {/* Uploaded documents list */}
              {docs.length > 0 && (
                <div className="mt-6 rounded-[22px] border border-[#e0e6e2] bg-white p-7 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
                  <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                    Uploaded documents ({docs.length})
                  </p>

                  <div className="space-y-3">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-5 py-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfe5e2] bg-white">
                            <FileText size={15} className="text-[#69736f]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#17201d]">
                              {doc.name}
                              <span className="ml-2 rounded-full bg-[#edf3f1] px-2 py-0.5 font-mono text-[9px] text-[#4c756c]">
                                {doc.version}
                              </span>
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#929b97]">
                              {doc.filename}
                            </p>
                            <div className="mt-1 flex items-center gap-3">
                              <span className="rounded-full border border-[#e0e6e2] bg-white px-2 py-0.5 font-mono text-[9px] text-[#69736f]">
                                {doc.fileType}
                              </span>
                              <span className="text-[9px] text-[#b0b8b4]">
                                {new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#dfe5e2] bg-white text-[#b0b8b4] transition hover:border-red-200 hover:bg-red-50 hover:text-red-400"
                          title="Remove document"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TLUX CHAT DRAWER */}
      <TluxChatDrawer isOpen={showTlux} onClose={() => setShowTlux(false)} />

      {/* TLUX FLOATING BUTTON */}
      <TluxFloatingButton />
    </main>
  );
}