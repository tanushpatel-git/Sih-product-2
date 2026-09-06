'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowRightLeft, ShieldCheck, Activity } from 'lucide-react';

interface HospitalHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoordination: () => void;
  breachActive: boolean;
  shortageBeds?: number;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoordination,
  breachActive,
  shortageBeds = 13,
}) => {
  const [timeString, setTimeString] = useState('08:42:16');

  useEffect(() => {
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
    <header className="w-full border-b border-white/[0.08] bg-[#07090C]/90 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-10 py-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left: Facility Identity & Jurisdictional Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#F4F3EF] tracking-wider uppercase font-mono">
                  BHOPAL DISTRICT HOSPITAL
                </h1>
                <span className="text-[10px] text-[#A7ADB5] font-mono flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-[#66707C]" /> MP-CENTRAL JURISDICTION
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#66707C] font-mono mt-0.5">
                <span className="text-[#A7ADB5]">Surge Intelligence Hub</span>
                <span>•</span>
                <span>7-Day Predictive Horizon Active</span>
                <span>•</span>
                <span className="text-[#9DF0DA]">Model Confidence 91%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operational Status, Military Clock, & Direct Action */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {breachActive && (
            <button
              onClick={onOpenCoordination}
              className="px-3 py-1.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/25 transition-all text-xs font-mono font-bold flex items-center gap-2"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>COORDINATE TRANSFER ({shortageBeds} PATIENTS)</span>
            </button>
          )}

          {/* System Operational Beacon */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0D1117] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9DF0DA]" />
            <span className="text-[11px] font-mono font-semibold tracking-wider text-[#A7ADB5]">
              SYSTEM ACTIVE
            </span>
          </div>

          {/* Military / IST Time */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#F4F3EF] tabular-nums px-2.5 py-1 bg-[#0D1117] rounded-lg border border-white/[0.08]">
            <Clock className="w-3.5 h-3.5 text-[#66707C]" />
            <span>{timeString}</span>
            <span className="text-[9px] text-[#66707C] uppercase ml-0.5">IST</span>
          </div>
        </div>
      </div>
    </header>
  );
};
