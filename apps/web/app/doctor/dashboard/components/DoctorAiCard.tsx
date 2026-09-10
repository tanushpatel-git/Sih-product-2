"use client";

import Link from "next/link";
import { Brain, ArrowUpRight } from "lucide-react";

export default function DoctorAiCard() {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#17201d] p-6 text-white">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#42675e] opacity-30 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <Brain size={15} />
            </div>

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
              TLUX
            </span>
          </div>

          <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-[#9bb9b0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8fb5a9]" />
            Online
          </span>
        </div>

        <h3 className="mt-10 max-w-sm text-2xl font-medium leading-tight tracking-[-0.04em]">
          Your clinical copilot is ready.
        </h3>

        <p className="mt-4 text-xs leading-6 text-white/45">
          Ask TLUX about a patient, explain a prediction, compare clinical
          factors or prepare questions for your next review.
        </p>

        <div className="mt-8 space-y-2">
          {[
            "Explain this patient's risk",
            "What factors contributed most?",
            "Summarize today's priority patients",
          ].map((question) => (
            <Link
              href="/doctor/ai"
              key={question}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[10px] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
            >
              {question}
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>

        <Link
          href="/doctor/ai"
          className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-xs font-medium text-[#17201d] transition hover:bg-[#edf3f1]"
        >
          Open TLUX
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}