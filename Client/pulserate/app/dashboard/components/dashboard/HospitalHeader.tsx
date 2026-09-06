'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Activity, MapPin, Clock, ArrowUpRight, UserCheck } from 'lucide-react';

interface HospitalHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoordination: () => void;
  breachActive: boolean;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoordination,
  breachActive,
}) => {
  const [timeString, setTimeString] = useState('08:42:16');

  useEffect(() => {
    // Generate accurate live operational time
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-white/[0.08] bg-[#080909]/95 backdrop-blur-sm sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Brand & System ID */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#15181b] border border-white/[0.15] group-hover:border-[#D3FD50] flex items-center justify-center transition-colors">
              <span className="text-[#D3FD50] font-black text-base tracking-tighter">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-black text-sm tracking-wider uppercase font-mono">NEXUS</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-white/60 border border-white/[0.08]">
                  v2.8-PREDICT
                </span>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                Hospital Intelligence System
              </p>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block h-7 w-[1px] bg-white/[0.08]" />

          {/* Facility Info */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#D3FD50] animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-semibold text-white tracking-wide uppercase">
                  BHOPAL DISTRICT HOSPITAL
                </h1>
                <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-white/40" /> MP-CENTRAL
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono">
                <span className="text-white/70">Operational Forecast</span>
                <span className="text-white/30">•</span>
                <span className="text-white/40">Last updated 2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Fast Navigation */}
        <div className="hidden xl:flex items-center gap-1 p-1 bg-[#0e1012] border border-white/[0.08] rounded-lg">
          {[
            { id: 'overview', label: 'COMMAND' },
            { id: 'forecast', label: 'FORECAST' },
            { id: 'resources', label: 'RESOURCES' },
            { id: 'twin', label: 'DIGITAL TWIN' },
            { id: 'network', label: 'NETWORK GRID' },
            { id: 'disease', label: 'EPIDEMIOLOGY' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 text-[11px] font-mono tracking-wider transition-all rounded ${
                activeTab === tab.id
                  ? 'bg-white/[0.1] text-[#D3FD50] font-semibold border border-[#D3FD50]/30 shadow-sm'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Operational Status, Live Clock, User, Emergency Action */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {breachActive && (
            <button
              onClick={onOpenCoordination}
              className="px-3 py-1.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/50 text-[#EF4444] hover:bg-[#EF4444]/25 transition-all text-xs font-mono font-bold flex items-center gap-2 animate-breach-pulse"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
              COORDINATE PROTOCOL
            </button>
          )}

          {/* Live System State */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0e1012] border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-[#D3FD50] animate-beacon" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-white/80">
              SYSTEM OPERATIONAL
            </span>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/70 num-tabular px-2 py-1 bg-white/[0.03] rounded border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            <span>{timeString}</span>
            <span className="text-[9px] text-white/40 uppercase ml-0.5">IST</span>
          </div>

          {/* Admin Tag */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/60">
            <div className="w-7 h-7 rounded-md bg-[#15181b] border border-white/[0.1] flex items-center justify-center text-white/70">
              <UserCheck className="w-3.5 h-3.5 text-[#D3FD50]" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-white/90 leading-tight">Dr. R. Verma</div>
              <div className="text-[9px] text-white/40 uppercase">Hospital Admin</div>
            </div>
          </div>

          {/* Portal Links */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <Link
              href="/"
              className="text-[11px] font-mono text-white/40 hover:text-[#D3FD50] transition-colors flex items-center gap-1"
            >
              Landing <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
