"use client";

import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  Brain,
  Users,
  FileText,
  MessageCircle,
  Settings,
  ShieldCheck,
  Stethoscope,
  X,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Clinical Intelligence",
    href: "/doctor/clinical",
    icon: Brain,
  },
  {
    label: "Patients",
    href: "/doctor/patients",
    icon: Users,
  },
  {
    label: "Assessments",
    href: "/doctor/assessments",
    icon: FileText,
  },
];

const secondaryNavigation = [
  {
    label: "TLUX",
    href: "/doctor/ai",
    icon: MessageCircle,
  },
  {
    label: "Settings",
    href: "/doctor/settings",
    icon: Settings,
  },
];

interface DoctorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DoctorSidebar({ isOpen, onClose }: DoctorSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-black/[0.06] bg-[#f8faf9] transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-[82px] items-center justify-between border-b border-black/[0.06] px-6">
        <Link href="/doctor/dashboard" className="flex items-center gap-3">
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
        </Link>

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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4eeeb] text-[#4c756c]">
            <Stethoscope size={17} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              Dr. Ananya Sharma
            </p>

            <p className="mt-0.5 text-[10px] text-black/40">
              General Medicine
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-black/25">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-3 text-xs transition ${
                  index === 0
                    ? "bg-[#17201d] text-white"
                    : "text-black/50 hover:bg-white hover:text-black"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} strokeWidth={1.8} />
                  {item.label}
                </span>

                {index === 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#91b5aa]" />
                )}
              </Link>
            );
          })}
        </nav>

        <p className="mb-3 mt-9 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-black/25">
          Intelligence
        </p>

        <nav className="space-y-1">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-xl px-3 py-3 text-xs text-black/50 transition hover:bg-white hover:text-black"
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
              </Link>
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

        <button className="mt-5 flex items-center gap-3 px-1 text-[10px] text-black/35 transition hover:text-black/70">
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}