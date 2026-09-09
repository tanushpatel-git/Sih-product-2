"use client";

import { motion } from "framer-motion";
import { Sparkles, X, Activity, ShieldCheck, MessageCircle, ArrowUpRight } from "lucide-react";

interface PatientAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PatientAiDrawer({ isOpen, onClose }: PatientAiDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#17221f]/20 backdrop-blur-sm"
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
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-[#dce5e0] bg-[#f8faf9] shadow-[-25px_0_70px_rgba(25,45,39,0.12)]"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e1e7e4] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#17221f] text-white">
              <Sparkles size={15} />
            </div>

            <div>
              <p className="text-[12px] font-medium">
                TLUX
              </p>

              <p className="mt-0.5 text-[8px] uppercase tracking-[0.18em] text-[#98a39f]">
                Health intelligence assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-[9px] border border-[#e0e6e3] bg-white text-[#71807a]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Context */}
        <div className="border-b border-[#e1e7e4] bg-[#edf5f2] px-6 py-5">
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#79938b]">
            Current context
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-[12px] bg-white/70 p-3">
              <p className="text-[7px] text-[#9aa49f]">
                Signal
              </p>

              <p className="mt-1 text-[14px] font-medium">
                82
              </p>
            </div>

            <div className="rounded-[12px] bg-white/70 p-3">
              <p className="text-[7px] text-[#9aa49f]">
                Heart
              </p>

              <p className="mt-1 text-[14px] font-medium">
                72
              </p>
            </div>

            <div className="rounded-[12px] bg-white/70 p-3">
              <p className="text-[7px] text-[#9aa49f]">
                BP
              </p>

              <p className="mt-1 text-[14px] font-medium">
                118/76
              </p>
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-6 py-7">
          <div className="max-w-[330px] rounded-[17px] rounded-tl-[5px] border border-[#e0e7e3] bg-white p-4 shadow-[0_10px_30px_rgba(40,66,58,0.04)]">
            <p className="text-[10px] leading-5 text-[#596963]">
              Hello Vedant. I can help you understand your
              health signals and prepare questions for your
              next clinical conversation.
            </p>
          </div>

          <div className="mt-5 ml-auto max-w-[300px] rounded-[17px] rounded-tr-[5px] bg-[#17221f] p-4 text-white">
            <p className="text-[10px] leading-5 text-white/80">
              What does my current health signal mean?
            </p>
          </div>

          <div className="mt-5 max-w-[330px] rounded-[17px] rounded-tl-[5px] border border-[#e0e7e3] bg-white p-4 shadow-[0_10px_30px_rgba(40,66,58,0.04)]">
            <p className="text-[10px] leading-5 text-[#596963]">
              Your current signal is shown as stable based
              on the information available in your
              workspace. Your heart rate and blood pressure
              are also currently within the ranges displayed
              in your latest records.
            </p>

            <div className="mt-4 rounded-[12px] bg-[#edf5f2] p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={13}
                  className="text-[#628d80]"
                />

                <span className="text-[8px] font-medium text-[#52766c]">
                  Clinical context
                </span>
              </div>

              <p className="mt-2 text-[8px] leading-4 text-[#82918b]">
                For medical interpretation or changes in
                treatment, discuss your results with your
                healthcare professional.
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#e1e7e4] bg-white p-5">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#dfe6e2] bg-[#f8faf9] p-2">
            <input
              placeholder="Ask TLUX about your health..."
              className="min-w-0 flex-1 bg-transparent px-2 text-[10px] outline-none placeholder:text-[#a1aba7]"
            />

            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#17221f] text-white">
              <ArrowUpRight size={13} />
            </button>
          </div>

          <p className="mt-3 text-center text-[7px] text-[#a0aaa6]">
            TLUX provides informational support and does
            not replace professional medical advice.
          </p>
        </div>
      </motion.aside>
    </div>
  );
}