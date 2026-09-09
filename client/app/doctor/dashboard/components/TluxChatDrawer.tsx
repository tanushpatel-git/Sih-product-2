"use client";

import { motion } from "framer-motion";
import { Sparkles, X, Brain, ArrowUpRight } from "lucide-react";

interface TluxChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TluxChatDrawer({ isOpen, onClose }: TluxChatDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#17201d]/20 backdrop-blur-sm"
      />

      <motion.aside
        initial={{
          x: "100%",
        }}
        animate={{
          x: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 28,
        }}
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-black/[0.06] bg-[#f8faf9] shadow-[-25px_0_70px_rgba(0,0,0,0.12)]"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#4a7c6e] to-[#3d6b5e] text-white">
              <Sparkles size={15} />
            </div>

            <div>
              <p className="text-[12px] font-medium">
                TLUX
              </p>

              <p className="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-black/35">
                AI Assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white text-black/40"
          >
            <X size={14} />
          </button>
        </div>

        {/* Context */}
        <div className="border-b border-black/[0.06] bg-[#edf3f1] px-6 py-5">
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#4c756c]">
            Current context
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-[12px] bg-white/70 p-3">
              <p className="text-[7px] text-black/30">
                Patients
              </p>

              <p className="mt-1 text-[14px] font-medium">
                248
              </p>
            </div>

            <div className="rounded-[12px] bg-white/70 p-3">
              <p className="text-[7px] text-black/30">
                Risk
              </p>

              <p className="mt-1 text-[14px] font-medium">
                17
              </p>
            </div>

            <div className="rounded-[12px] bg-white/70 p-3">
              <p className="text-[7px] text-black/30">
                Signals
              </p>

              <p className="mt-1 text-[14px] font-medium">
                9
              </p>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-6 py-7">
          <div className="max-w-[330px] rounded-[17px] rounded-tl-[5px] border border-black/[0.06] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] leading-5 text-black/50">
              Hello Dr. Sharma. I can help you analyze patient
              risk, understand clinical signals, and prepare
              for your consultations.
            </p>
          </div>

          <div className="mt-5 ml-auto max-w-[300px] rounded-[17px] rounded-tr-[5px] bg-[#17201d] p-4 text-white">
            <p className="text-[10px] leading-5 text-white/80">
              What are the priority patients for today?
            </p>
          </div>

          <div className="mt-5 max-w-[330px] rounded-[17px] rounded-tl-[5px] border border-black/[0.06] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-[10px] leading-5 text-black/50">
              Based on current signals, you have 4 high-risk
              patients requiring immediate attention. Rahul
              Mehta (Cardiovascular, 87% risk) and Priya
              Sharma (Diabetes, 74% risk) should be prioritized.
            </p>

            <div className="mt-4 rounded-[12px] bg-[#edf3f1] p-3">
              <div className="flex items-center gap-2">
                <Brain
                  size={13}
                  className="text-[#4c756c]"
                />

                <span className="text-[8px] font-medium text-[#4c756c]">
                  Clinical insight
                </span>
              </div>

              <p className="mt-2 text-[8px] leading-4 text-black/35">
                Review their latest assessments and consider
                scheduling follow-ups within 48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-black/[0.06] bg-white p-5">
          <div className="flex items-center gap-2 rounded-[14px] border border-black/[0.07] bg-[#f8faf9] p-2">
            <input
              placeholder="Ask TLUX about clinical data..."
              className="min-w-0 flex-1 bg-transparent px-2 text-[10px] outline-none placeholder:text-black/30"
            />

            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#4a7c6e] to-[#3d6b5e] text-white">
              <ArrowUpRight size={13} />
            </button>
          </div>

          <p className="mt-3 text-center text-[7px] text-black/25">
            TLUX provides clinical decision support and does
            not replace professional medical judgment.
          </p>
        </div>
      </motion.aside>
    </div>
  );
}