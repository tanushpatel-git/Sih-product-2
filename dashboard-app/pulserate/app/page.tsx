'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Lock, Building2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080909] text-[#F4F3EF] flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Top Header */}
      <header className="w-full border-b border-white/[0.08] bg-[#080909]/95 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 py-4">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141619] border border-white/[0.15] flex items-center justify-center">
              <span className="text-[#F4F3EF] font-bold text-sm tracking-tight font-mono">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#F4F3EF] font-bold text-sm tracking-wider uppercase font-mono">NEXUS</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.05] text-[#A5A7A3] border border-white/[0.08]">
                  OPERATIONAL INTELLIGENCE
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-mono text-[#A5A7A3] hover:text-[#F4F3EF] transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              LOGIN
            </Link>

            <Link
              href="/onboarding"
              className="hidden sm:flex text-xs font-mono text-[#A5A7A3] hover:text-[#F4F3EF] transition-colors items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              ONBOARDING
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#D3FD50] text-[#080909] hover:bg-[#bce433] transition-all text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-[#D3FD50]/10"
            >
              ENTER COMMAND CENTER <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto w-full">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141619] border border-white/[0.1] text-xs font-mono text-[#A5A7A3] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D3FD50]" />
            <span>SIH 2026 • HOSPITAL DEMAND & RESOURCE INTELLIGENCE</span>
          </div>

          {/* Hero Typography */}
          <div className="max-w-5xl mb-8">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase leading-[1.05]">
              HOSPITALS DON&apos;T NEED <br />
              <span className="text-white/40">MORE DATA.</span> <br />
              THEY NEED TO KNOW <br />
              <span className="text-[#F4F3EF]">WHAT HAPPENS NEXT.</span>
            </h1>

            <p className="text-base sm:text-xl font-mono text-[#A5A7A3] max-w-3xl mt-6 leading-relaxed">
              NEXUS forecasts hospital demand, identifies upcoming resource shortages,
              and coordinates capacity before the crisis arrives.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-[#D3FD50] text-[#080909] font-mono font-black text-sm uppercase tracking-wider hover:bg-[#c0ec39] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#D3FD50]/15"
            >
              LAUNCH BHOPAL COMMAND VIEW <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/onboarding"
              className="px-6 py-4 rounded-xl bg-[#141619] border border-white/[0.12] text-[#F4F3EF] hover:bg-[#181B1F] hover:border-white/20 transition-all font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              REGISTER NEW FACILITY
            </Link>
          </div>

          {/* 7 DAYS AHEAD Card */}
          <div className="rounded-2xl border border-white/[0.1] bg-[#0D0E10] p-6 sm:p-8 lg:p-10 relative overflow-hidden mb-16 hover:border-white/20 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono font-bold tracking-widest text-[#A5A7A3] uppercase block mb-1">
                  PREDICTIVE HORIZON
                </span>
                <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
                  7 DAYS AHEAD
                </h2>
                <p className="text-xs font-mono text-[#A5A7A3] mt-1">
                  Temporal progression from current baseline load to upcoming Friday ICU capacity breach.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#F4F3EF] hover:underline"
              >
                OPEN SIMULATION ENGINE <ChevronRight className="w-4 h-4 text-[#A5A7A3]" />
              </Link>
            </div>

            {/* 4 Metrics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              <div className="p-5 rounded-xl bg-[#141619] border border-white/[0.06]">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-[#F4F3EF] tracking-tight tabular-nums">
                  1,284
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#A5A7A3] mt-1 font-semibold">
                  PROJECTED PATIENTS
                </div>
                <div className="text-[10px] font-mono text-white/30 mt-0.5">
                  7-Day Regional Influx
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#141619] border border-white/[0.06]">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-[#D8D9D5] tracking-tight tabular-nums">
                  +17%
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#A5A7A3] mt-1 font-semibold">
                  EXPECTED DEMAND
                </div>
                <div className="text-[10px] font-mono text-white/30 mt-0.5">
                  Outbreak Acceleration
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#140D0E] border border-[#EF4444]/30">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-[#EF4444] tracking-tight tabular-nums">
                  4 DAYS
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#EF4444] mt-1 font-black">
                  UNTIL ICU BREACH
                </div>
                <div className="text-[10px] font-mono text-[#A5A7A3] mt-0.5">
                  Action Window Remaining
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#141619] border border-white/[0.06]">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono text-[#F4F3EF] tracking-tight tabular-nums">
                  91%
                </div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#A5A7A3] mt-1 font-semibold">
                  FORECAST CONFIDENCE
                </div>
                <div className="text-[10px] font-mono text-white/30 mt-0.5">
                  Bayesian Ensemble Model
                </div>
              </div>
            </div>
          </div>

          {/* Sequence Strip */}
          <div className="mb-16">
            <div className="text-xs font-mono font-bold tracking-widest text-[#A5A7A3] uppercase mb-4">
              FIRST-PRINCIPLES INTELLIGENCE SEQUENCE
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-mono">
              {[
                { step: '01', title: 'CURRENT STATE', desc: '78% Occupancy' },
                { step: '02', title: 'ML FORECAST', desc: 'Bayesian LSTM' },
                { step: '03', title: 'NEXT 7 DAYS', desc: 'Auto-Scrubber' },
                { step: '04', title: 'DEMAND CURVE', desc: 'Resource Surge' },
                { step: '05', title: 'CAPACITY BREACH', desc: '+9 ICU Shortage' },
                { step: '06', title: 'NEARBY HOSPITALS', desc: 'Bhopal Network' },
                { step: '07', title: 'RECOMMENDED ACTION', desc: 'Load-Shedding' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-3.5 rounded-xl bg-[#0D0E10] border border-white/[0.06] hover:border-white/20 transition-all"
                >
                  <span className="text-[10px] text-[#D8D9D5] font-bold block mb-1">
                    {item.step}
                  </span>
                  <div className="text-[#F4F3EF] font-bold uppercase text-[11px]">
                    {item.title}
                  </div>
                  <div className="text-[#A5A7A3] text-[10px] mt-0.5">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-[#070809] py-8 px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#A5A7A3]">
          <div className="flex items-center gap-3">
            <span className="text-[#F4F3EF] font-bold">NEXUS</span>
            <span>•</span>
            <span>SMART INDIA HACKATHON 2026</span>
          </div>
          <div>
            Built for District Health Authorities & Hospital Command Centers
          </div>
        </div>
      </footer>
    </div>
  );
}
