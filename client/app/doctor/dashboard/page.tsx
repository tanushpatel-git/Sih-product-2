"use client";

import { useState } from "react";
import { MessageSquare, FileText, Settings, Save, ChevronDown, Activity } from "lucide-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState("ai-config");
  const [config, setConfig] = useState({
    extraSystemInstructions: "",
    responseStyle: "default",
    language: "default",
    maxTokens: "512",
    emergencyPolicy: "",
  });

  const handleSave = () => {
    console.log("Saving configuration:", config);
    alert("Configuration saved successfully!");
  };

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17201d]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#e1e7e4] bg-[#f8faf9] p-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white">
              <Activity size={17} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.02em]">
                VITAWEAVE
              </div>
              <div className="text-[8px] font-medium uppercase tracking-[0.22em] text-[#7a8581]">
                Doctor Workspace
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                activeTab === "conversations"
                  ? "bg-[#17201d] text-white"
                  : "text-[#68716d] hover:bg-white"
              }`}
            >
              <MessageSquare size={17} />
              Conversations
            </button>

            <button
              onClick={() => setActiveTab("knowledge")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                activeTab === "knowledge"
                  ? "bg-[#17201d] text-white"
                  : "text-[#68716d] hover:bg-white"
              }`}
            >
              <FileText size={17} />
              Knowledge documents
            </button>

            <button
              onClick={() => setActiveTab("ai-config")}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                activeTab === "ai-config"
                  ? "bg-[#17201d] text-white"
                  : "text-[#68716d] hover:bg-white"
              }`}
            >
              <Settings size={17} />
              AI configuration
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8">
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

                {/* Language */}
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
                      <option value="default">Default</option>
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
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

          {activeTab === "conversations" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-3xl font-medium tracking-[-0.045em]">
                  Conversations
                </h2>
                <p className="mt-2 text-sm text-[#7b8581]">
                  Your conversation history with patients
                </p>
              </div>
              <div className="rounded-[22px] border border-[#e0e6e2] bg-white p-7 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
                <p className="text-sm text-[#929b97]">Conversation history will appear here...</p>
              </div>
            </div>
          )}

          {activeTab === "knowledge" && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-3xl font-medium tracking-[-0.045em]">
                  Knowledge Documents
                </h2>
                <p className="mt-2 text-sm text-[#7b8581]">
                  Manage your medical knowledge base
                </p>
              </div>
              <div className="rounded-[22px] border border-[#e0e6e2] bg-white p-7 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
                <p className="text-sm text-[#929b97]">Knowledge documents will appear here...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}