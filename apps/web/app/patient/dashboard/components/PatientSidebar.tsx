"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  UserRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "health",
    label: "My Health",
    icon: HeartPulse,
  },
];

const secondaryNavigation = [
  {
    key: "tlux",
    label: "TLUX",
    icon: Sparkles,
  },
];

interface PatientSidebarProps {
  patientName?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export default function PatientSidebar({
  patientName,
  activeTab,
  onTabChange,
}: PatientSidebarProps) {
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[245px] border-r border-[#e1e7e4] bg-[#f8faf9] px-5 py-6 lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#17221f]">
          <Activity
            size={17}
            strokeWidth={2.2}
            className="text-white"
          />
        </div>

        <div>
          <p className="text-[15px] font-semibold tracking-[-0.03em]">
            VITAWEAVE
          </p>

          <p className="text-[8px] uppercase tracking-[0.2em] text-[#98a39f]">
            Health Intelligence
          </p>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-9 rounded-[18px] border border-[#e2e8e5] bg-white px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dceae5] text-[#52786d]">
            <UserRound size={16} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium">
              {patientName || "Patient"}
            </p>

            <p className="mt-0.5 text-[8px] text-[#929d99]">
              Patient workspace
            </p>
          </div>

          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#6da293]" />
        </div>
      </div>

      {/* Main navigation */}
      <div className="mt-8">
        <p className="mb-3 px-3 text-[8px] uppercase tracking-[0.22em] text-[#a2aaa7]">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.label}
                onClick={() => onTabChange?.(item.key)}
                className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition ${
                  isActive
                    ? "bg-[#17221f] text-white shadow-[0_8px_20px_rgba(23,34,31,0.12)]"
                    : "text-[#71807a] hover:bg-[#edf2ef] hover:text-[#17221f]"
                }`}
              >
                <Icon size={15} strokeWidth={1.8} />

                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary */}
      <div className="mt-8">
        <p className="mb-3 px-3 text-[8px] uppercase tracking-[0.22em] text-[#a2aaa7]">
          Intelligence
        </p>

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === "tlux") {
                    router.push("/patient/Tlux");
                  }
                }}
                className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[#71807a] transition hover:bg-[#edf2ef] hover:text-[#17221f]"
              >
                <Icon size={15} strokeWidth={1.8} />

                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom security */}
      <div className="mt-auto">
        <div className="rounded-[17px] border border-[#dfe8e3] bg-[#edf4f1] p-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={14}
              className="text-[#608d80]"
            />

            <span className="text-[9px] font-medium text-[#54766c]">
              Secure health workspace
            </span>
          </div>

          <p className="mt-2 text-[8px] leading-4 text-[#879691]">
            Your health information is protected and
            accessible only to you and your care team.
          </p>
        </div>

        <button
          onClick={() => router.push("/patient/login")}
          className="mt-4 flex items-center gap-3 px-2 text-[10px] text-[#6da293] transition hover:text-[#17221f]"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}