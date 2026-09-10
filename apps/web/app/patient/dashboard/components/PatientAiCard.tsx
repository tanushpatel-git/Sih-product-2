"use client";

import { Sparkles, MessageCircle, ArrowRight } from "lucide-react";

interface PatientAiCardProps {
  onAiClick: () => void;
}

export default function PatientAiCard({ onAiClick }: PatientAiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[25px] border border-[#d8e5e0] bg-[#edf5f2] p-6">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#d5e8e2] blur-[45px]" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#17221f] text-white">
              <Sparkles size={14} />
            </div>

            <div>
              <p className="text-[10px] font-medium">
                TLUX
              </p>

              <p className="text-[7px] uppercase tracking-[0.18em] text-[#8a9993]">
                Health assistant
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1.5 text-[7px] text-[#668278]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6da294]" />
            Ready
          </span>
        </div>

        <h3 className="mt-8 max-w-[260px] text-[25px] font-medium leading-[1.05] tracking-[-0.045em]">
          Have a question about your health?
        </h3>

        <p className="mt-3 max-w-[300px] text-[9px] leading-5 text-[#74847e]">
          Ask TLUX to explain your health signals,
          prepare questions for your doctor, or help
          you understand your medical records.
        </p>

        <button
          onClick={onAiClick}
          className="mt-7 flex items-center gap-2 rounded-[12px] bg-white px-4 py-3 text-[9px] font-medium text-[#30423c] shadow-[0_10px_25px_rgba(45,74,65,0.06)] transition hover:-translate-y-0.5"
        >
          <MessageCircle size={13} />

          Start a conversation

          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}