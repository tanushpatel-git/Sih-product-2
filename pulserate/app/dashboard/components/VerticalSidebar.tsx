'use client';

import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Cpu,
  Bell,
  Network,
  FileText,
  Activity,
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
      label: 'Overview',
      icon: LayoutDashboard,
      sectionId: 'section-overview',
    },
    {
      id: 'forecast',
      label: 'Forecast',
      icon: TrendingUp,
      sectionId: 'section-forecast',
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building2,
      sectionId: 'section-twin',
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: Cpu,
      sectionId: 'section-resources',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      sectionId: 'section-risk',
      hasAlert: breachActive,
    },
    {
      id: 'network',
      label: 'Network',
      icon: Network,
      sectionId: 'section-network',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      sectionId: 'section-insights',
    },
  ];

  return (
    <aside className="w-56 shrink-0 hidden xl:flex flex-col justify-between py-6 px-4 bg-transparent select-none">
      {/* Navigation Menu Pill Group */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id === 'alerts' && breachActive) {
                  onOpenCoordination();
                } else {
                  const target = document.getElementById(item.sectionId);
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </div>

              {item.hasAlert && (
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Brand Intelligence Card */}
      <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E2E8F0]/80 shadow-xs">
        {/* Sine Wave Graphic */}
        <div className="w-full h-8 mb-2 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-6 text-[#3B82F6]/40" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M0,12 Q15,0 30,12 T60,12 T90,12 T100,12" strokeLinecap="round" />
          </svg>
        </div>
        <div className="text-[11px] font-semibold text-[#0F172A] leading-snug">
          AI-Powered Healthcare Intelligence
        </div>
        <div className="text-[10px] text-[#64748B] mt-0.5">
          Predict. Prepare. Save Lives.
        </div>
      </div>
    </aside>
  );
};
