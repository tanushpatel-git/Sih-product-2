"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError, type AiConfig } from "@/lib/api";

export default function AiConfigPanel() {
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const { config } = await api.getAiConfig();
    setConfig(config);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"));
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await api.updateAiConfig(config as Partial<AiConfig>);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div>
      <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        AI response configuration
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Control how the assistant behaves for your patients. No model
        retraining needed.
      </p>

      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Extra system instructions
          <textarea
            rows={3}
            value={config?.system_prompt ?? ""}
            onChange={(e) => setConfig({ ...config!, system_prompt: e.target.value })}
            className={inputCls}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Response style
            <select
              value={config?.response_style ?? ""}
              onChange={(e) => setConfig({ ...config!, response_style: e.target.value })}
              className={inputCls}
            >
              <option value="">Default</option>
              <option value="simple">Simple and concise</option>
              <option value="detailed">Detailed</option>
              <option value="empathetic">Empathetic</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Language
            <select
              value={config?.language ?? ""}
              onChange={(e) => setConfig({ ...config!, language: e.target.value })}
              className={inputCls}
            >
              <option value="">Default</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Temperature ({config?.temperature ?? 0.2})
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config?.temperature ?? 0.2}
              onChange={(e) =>
                setConfig({ ...config!, temperature: Number(e.target.value) })
              }
              className="mt-2 w-full"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Max tokens
            <input
              type="number"
              min={64}
              max={2048}
              value={config?.max_tokens ?? 512}
              onChange={(e) =>
                setConfig({ ...config!, max_tokens: Number(e.target.value) })
              }
              className={inputCls}
            />
          </label>
        </div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Emergency policy
          <textarea
            rows={2}
            value={config?.emergency_policy ?? ""}
            onChange={(e) => setConfig({ ...config!, emergency_policy: e.target.value })}
            className={inputCls}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save configuration"}
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  );
}