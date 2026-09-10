"use client";

import Link from "next/link";
import { ArrowUpRight, MessageCircle, Brain } from "lucide-react";

interface DoctorHeroProps {
  doctor?: {
    name: string;
    specialty: string;
    licenseNumber: string;
  };
}

export default function DoctorHero({ doctor }: DoctorHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#edf3f1] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#d7e7e2] opacity-70 blur-3xl" />

      <div className="absolute bottom-[-180px] right-[20%] h-[320px] w-[320px] rounded-full bg-white/70 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.65fr]">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5c8a7e]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4c756c]">
              Clinical intelligence
            </span>

            {doctor && (
              <>
                <span className="text-black/20">·</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">
                  {doctor.specialty || "General Medicine"}
                </span>
                <span className="text-black/20">·</span>
                <span className="font-mono text-[9px] tracking-wider text-[#4c756c]">
                  LIC: {doctor.licenseNumber || "LIC-IN-2026"}
                </span>
              </>
            )}
          </div>

          <h2 className="max-w-2xl text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[0.88] tracking-[-0.065em]">
            Understand
            <br />
            the patient
            <br />
            <span className="text-black/30">before the event.</span>
          </h2>

          <p className="mt-7 max-w-xl text-sm leading-6 text-black/50">
            VITAWEAVE continuously surfaces clinical risk signals,
            prioritizes patients and helps you understand what may
            require attention next.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/doctor/clinical"
              className="group flex h-11 items-center gap-3 rounded-xl bg-[#17201d] px-5 text-xs font-medium text-white transition hover:bg-[#25312d]"
            >
              New patient assessment

              <ArrowUpRight
                size={14}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>

            <Link
              href="/doctor/ai"
              className="flex h-11 items-center gap-3 rounded-xl border border-black/[0.08] bg-white/70 px-5 text-xs font-medium text-black/60 transition hover:bg-white"
            >
              <MessageCircle size={14} />
              Ask TLUX
            </Link>
          </div>
        </div>

        {/* Clinical signal visual */}
        <div className="relative hidden h-[300px] lg:block">
          <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.06]" />

          <div className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.07]" />

          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white/80 shadow-[0_25px_70px_rgba(30,60,52,0.10)] backdrop-blur-xl">
            <Brain
              size={25}
              strokeWidth={1.4}
              className="text-[#4c756c]"
            />

            <span className="mt-2 font-mono text-[8px] tracking-[0.15em] text-black/35">
              CLINICAL CORE
            </span>
          </div>

          <div className="absolute left-[7%] top-[24%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
            <p className="font-mono text-[7px] text-black/30">
              RISK
            </p>

            <p className="mt-1 text-xs font-medium">87%</p>
          </div>

          <div className="absolute right-[4%] top-[31%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
            <p className="font-mono text-[7px] text-black/30">
              SIGNAL
            </p>

            <p className="mt-1 text-xs font-medium">STROKE</p>
          </div>

          <div className="absolute bottom-[15%] left-[14%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
            <p className="font-mono text-[7px] text-black/30">
              CONFIDENCE
            </p>

            <p className="mt-1 text-xs font-medium">91%</p>
          </div>

          <div className="absolute bottom-[18%] right-[10%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
            <p className="font-mono text-[7px] text-black/30">
              MODEL
            </p>

            <p className="mt-1 text-xs font-medium">v2.4</p>
          </div>
        </div>
      </div>
    </section>
  );
}