'use client';

import React from 'react';
import Link from 'next/link';
import {
  Layers,
  TrendingUp,
  Building2,
  Network,
  Activity,
  ArrowRightLeft,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

interface VerticalSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoordination: () => void;
  breachActive: boolean;
  shortageBeds?: number;
}

export const VerticalSidebar: React.FC<VerticalSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoordination,
  breachActive,
  shortageBeds = 13,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'COMMAND DECK',
      icon: Layers,
      sectionId: 'section-twin',
    },
    {
      id: 'twin',
      label: 'DIGITAL TWIN',
      icon: Building2,
      sectionId: 'section-twin',
      badge: '2.5D CUTAWAY',
    },
    {
      id: 'forecast',
      label: '7-DAY FORECAST',
      icon: TrendingUp,
      sectionId: 'section-forecast',
      badge: 'BAYESIAN',
    },
    {
      id: 'network',
      label: 'REGIONAL GRID',
      icon: Network,
      sectionId: 'section-network',
    },
    {
      id: 'disease',
      label: 'EPIDEMIOLOGY',
      icon: Activity,
      sectionId: 'section-disease',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#07090C] border-r border-white/[0.08] flex flex-col justify-between h-screen sticky top-0 z-50 select-none">
      {/* Top Branding & Facility Header */}
      <div>
        <div className="p-5 border-b border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#151B23] border border-white/[0.14] group-hover:border-white/30 flex items-center justify-center transition-all shadow-md">
              <span className="text-[#F4F3EF] font-black text-base font-mono">N</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-black tracking-wider text-[#F4F3EF] uppercase">
                  NEXUS
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#11161D] text-[#60A5FA] border border-white/[0.08] font-semibold">
                  v2.8
                </span>
              </div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#66707C] leading-tight">
                Hospital Intelligence
              </p>
            </div>
          </Link>

          {/* Node Metadata */}
          <div className="mt-4 pt-3 border-t border-white/[0.05]">
            <div className="text-[9px] font-mono text-[#66707C] uppercase tracking-wider font-bold">
              OPERATIONAL NODE
            </div>
            <div className="text-xs font-mono font-bold text-[#F4F3EF] truncate mt-0.5">
              AIIMS BHOPAL REGIONAL
            </div>
            <div className="text-[10px] font-mono text-[#A7ADB5] flex items-center justify-between mt-0.5">
              <span>MP-BPL-094</span>
              <span className="text-[#9DF0DA] text-[9px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9DF0DA]" /> ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Vertical Navigation Stack */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-[#66707C] uppercase font-bold">
            INTELLIGENCE MODULES
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  const el = document.getElementById(item.sectionId);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-mono transition-all group ${
                  isActive
                    ? 'bg-[#151B23] text-[#F4F3EF] font-bold border border-white/[0.14] shadow-sm'
                    : 'text-[#A7ADB5] hover:text-[#F4F3EF] hover:bg-[#0D1117] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#60A5FA]' : 'text-[#66707C] group-hover:text-[#A7ADB5]'
                    }`}
                  />
                  <span className="tracking-wider">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#07090C] text-[#66707C] border border-white/[0.05]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Action Trigger in Sidebar */}
          <div className="pt-3">
            <button
              onClick={onOpenCoordination}
              className={`w-full p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                breachActive
                  ? 'bg-[#1A0E10] border-[#EF4444]/40 hover:bg-[#241215] text-[#EF4444]'
                  : 'bg-[#0D1117] border-white/[0.08] hover:bg-[#11161D] text-[#F4F3EF]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  TRANSFER DISPATCH
                </span>
                {breachActive && (
                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-[#EF4444] text-white">
                    +{shortageBeds} BEDS
                  </span>
                )}
              </div>
              <div className="text-[11px] font-bold tracking-tight text-[#F4F3EF]">
                Coordinate Transfer
              </div>
              <div className="text-[9px] text-[#A7ADB5] mt-0.5">
                Hamidia Hospital (18 beds free)
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Telemetry & User Credentials */}
      <div className="p-4 border-t border-white/[0.08] space-y-3 bg-[#07090C]">
        {/* System Monitoring Health */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#66707C]">
          <span>TELEMETRY MESH</span>
          <span className="text-[#9DF0DA] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9DF0DA]" /> SYNCHRONIZED
          </span>
        </div>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-[#0D1117] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#151B23] border border-white/[0.1] flex items-center justify-center text-xs font-mono font-bold text-[#F4F3EF]">
              RV
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-[#F4F3EF] leading-tight">
                Dr. R. Verma
              </div>
              <div className="text-[9px] font-mono text-[#66707C] leading-tight">
                Chief Medical Officer
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="text-[#66707C] hover:text-[#F4F3EF] transition-colors p-1"
            title="Return to Portal"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
