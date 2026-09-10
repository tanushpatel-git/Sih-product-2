'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Building2, User, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState('HOSP-BPL-094');
  const [email, setEmail] = useState('dr.verma@bhopaldistrict.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080909] text-[#F4F3EF] flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Subtle Background Hospital Network Topology SVG */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <svg viewBox="0 0 1000 800" className="w-full h-full">
          <circle cx="500" cy="400" r="180" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="500" cy="400" r="320" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="500" y1="400" x2="320" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="500" y1="400" x2="680" y2="280" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="500" y1="400" x2="600" y2="580" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <line x1="500" y1="400" x2="360" y2="540" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <circle cx="500" cy="400" r="6" fill="#F4F3EF" />
          <circle cx="320" cy="240" r="4" fill="#71736F" />
          <circle cx="680" cy="280" r="4" fill="#71736F" />
          <circle cx="600" cy="580" r="4" fill="#71736F" />
          <circle cx="360" cy="540" r="4" fill="#71736F" />
        </svg>
      </div>

      {/* Header */}
      <header className="w-full px-6 lg:px-12 py-6 flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#141619] border border-white/[0.15] flex items-center justify-center">
            <span className="text-[#F4F3EF] font-bold text-sm tracking-tight font-mono">N</span>
          </div>
          <div>
            <span className="text-[#F4F3EF] font-bold text-sm tracking-wider uppercase font-mono">NEXUS</span>
            <span className="text-[10px] font-mono text-[#A5A7A3] block">HOSPITAL INTELLIGENCE SYSTEM</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-[#A5A7A3] hover:text-[#F4F3EF] transition-colors"
        >
          ← RETURN TO HOME
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 relative z-10 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#0D0E10] p-8 shadow-2xl">
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] text-[10px] font-mono text-[#D8D9D5] font-bold uppercase mb-3">
              ENTERPRISE ACCESS
            </div>
            <h1 className="text-2xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
              FACILITY SIGN IN
            </h1>
            <p className="text-xs font-mono text-[#A5A7A3] mt-1">
              Operational portal for medical superintendents and district triage authorities.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A5A7A3] block mb-1.5">
                Hospital ID
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A5A7A3] block mb-1.5">
                Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#A5A7A3] block mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/[0.1] text-[#F4F3EF] font-mono text-xs focus:outline-none focus:border-white/40 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-[#D3FD50] text-[#080909] font-mono font-black text-xs uppercase tracking-wider hover:bg-[#bde535] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D3FD50]/10 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  SIGN IN →
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Access Trigger */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <button
              type="button"
              onClick={() => {
                setHospitalId('HOSP-BPL-094');
                setEmail('dr.verma@bhopaldistrict.gov.in');
                setIsLoading(true);
                setTimeout(() => router.push('/dashboard'), 400);
              }}
              className="w-full py-2.5 rounded-xl bg-[#141619] border border-white/[0.1] hover:bg-[#181B1F] text-[#F4F3EF] font-mono text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>DEMO ACCESS: BHOPAL DISTRICT HOSPITAL</span>
              <ArrowRight className="w-3 h-3 text-[#D8D9D5]" />
            </button>
            <div className="text-[10px] font-mono text-[#A5A7A3] mt-2">
              Bypasses OTP verification for SIH judge evaluation
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 text-center text-[10px] font-mono text-[#6B6D69] relative z-10">
        NEXUS SECURITY CLEARANCE LEVEL 3 • 256-BIT ENCRYPTION
      </footer>
    </div>
  );
}
