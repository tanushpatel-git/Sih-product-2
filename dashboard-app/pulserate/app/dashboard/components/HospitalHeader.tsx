'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Bell, Shield, ChevronDown } from 'lucide-react';

interface HospitalHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoordination: () => void;
  breachActive: boolean;
  shortageBeds?: number;
  currentDateString?: string;
}

export const HospitalHeader: React.FC<HospitalHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCoordination,
  breachActive,
  shortageBeds = 13,
  currentDateString = 'May 4, 2025',
}) => {
  const [timeString, setTimeString] = useState('14:32');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md sticky top-0 z-40 px-5 lg:px-8 py-3 transition-colors">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Stylized Geometric N Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1E40AF] to-[#3B82F6] flex items-center justify-center shadow-sm">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20V4l16 16V4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-sans tracking-tight text-[#0F172A]">
                  NEXUS
                </span>
                <span className="hidden sm:inline text-xs text-[#64748B] font-normal pl-2 border-l border-[#E2E8F0]">
                  Smarter Hospitals. Healthier Tomorrows.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hospital, department, or region..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#3B82F6] focus:bg-white focus:ring-2 focus:ring-[#3B82F6]/15 transition-all"
            />
          </div>
        </div>

        {/* Right: Telemetry, Date & User Control */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Date & Time */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-sans text-[#475569] bg-[#F8FAFC] px-3 py-1.5 rounded-full border border-[#E2E8F0]">
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
            <span>{currentDateString}</span>
            <span className="font-semibold text-[#0F172A]">{timeString}</span>
          </div>

          {/* Live Data Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#047857]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="hidden xs:inline">Live Data</span>
          </div>

          {/* Notification Alert Trigger */}
          <button
            onClick={onOpenCoordination}
            className="relative p-2 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            title="Active Operational Notifications"
          >
            <Bell className="w-4 h-4" />
            {breachActive && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold tracking-wider shadow-sm">
              VG
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
};
