"use client";

import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  Brain,
  FileText,
  MessageSquare,
  Settings,
  ShieldCheck,
  Stethoscope,
  X,
  LogOut,
} from "lucide-react";
import { formatDoctorName } from "../../doctorAuth";

const navigation = [
  {
    id: "conversations",
    label: "Conversations",
    icon: MessageSquare,
  },
  {
    id: "knowledge",
    label: "Knowledge documents",
    icon: FileText,
  },
  {
    id: "ai-config",
    label: "AI configuration",
    icon: Settings,
  },
];

const secondaryNavigation = [
  {
    id: "tlux",
    label: "TLUX",
    icon: Brain,
  },
];

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  doctor?: {
    name: string;
    specialty: string;
    licenseNumber: string;
  };
}

export default function DoctorSidebar({
  isOpen,
  onClose,
  activeTab = "ai-config",
  onSelectTab,
  doctor,
}: DoctorSidebarProps) {
  const doctorDisplayName = formatDoctorName(doctor?.name || "Dr. Ananya Sharma");

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-black/[0.06] bg-[#f8faf9] transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-[82px] items-center justify-between border-b border-black/[0.06] px-6">
        <button
          onClick={() => onSelectTab?.("ai-config")}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white">
            <Activity size={17} />
          </div>

          <div>
            <p className="text-[13px] font-semibold tracking-[0.18em]">
              VITAWEAVE
            </p>

            <p className="text-[9px] uppercase tracking-[0.16em] text-black/35">
              Clinical Intelligence
            </p>
          </div>
        </button>

        <button
          onClick={onClose}
          className="lg:hidden"
        >
          <X size={18} className="text-black/40" />
        </button>
      </div>

      {/* Doctor */}
      <div className="border-b border-black/[0.06] px-5 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_5px_25px_rgba(0,0,0,0.03)]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4eeeb] text-[#4c756c]">
            <Stethoscope size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {doctorDisplayName}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-black/40">
              {doctor?.specialty || "General Medicine"}
            </p>

            {doctor?.licenseNumber && (
              <p className="mt-0.5 truncate font-mono text-[8px] text-[#4c756c]">
                Lic: {doctor.licenseNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-black/25">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab?.(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs transition ${
                  isActive
                    ? "bg-[#17201d] text-white"
                    : "text-black/50 hover:bg-white hover:text-black"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </span>

                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#91b5aa]" />
                )}
              </button>
            );
          })}
        </nav>

        <p className="mb-3 mt-9 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-black/25">
          Intelligence
        </p>

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab?.(item.id);
                  onClose();
                }}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs transition ${
                  isActive
                    ? "bg-[#17201d] text-white"
                    : "text-black/50 hover:bg-white hover:text-black"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </span>

                {item.label === "TLUX" && (
                  <span className="rounded-full bg-[#e7efec] px-2 py-0.5 font-mono text-[7px] tracking-wider text-[#4c756c]">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Security */}
      <div className="border-t border-black/[0.06] p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={15}
            className="mt-0.5 shrink-0 text-[#5f8b80]"
          />

          <div>
            <p className="text-[10px] font-medium">
              Clinical workspace
            </p>

            <p className="mt-1 text-[9px] leading-4 text-black/35">
              Secure decision-support environment.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/doctor/login";
            }
          }}
          className="mt-5 flex items-center gap-3 px-1 text-[10px] text-black/35 transition hover:text-black/70"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}