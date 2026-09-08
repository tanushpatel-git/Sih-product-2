"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Brain,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  Users,
  X,
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
    label: "NEXUS AI",
    href: "/doctor/ai",
    icon: MessageCircle,
  },
  {
    label: "Settings",
    href: "/doctor/settings",
    icon: Settings,
  },
];

const riskPatients = [
  {
    name: "Rahul Mehta",
    age: 58,
    condition: "Cardiovascular",
    risk: 87,
    status: "High",
    time: "12 min ago",
  },
  {
    name: "Priya Sharma",
    age: 46,
    condition: "Diabetes",
    risk: 74,
    status: "Elevated",
    time: "34 min ago",
  },
  {
    name: "Arjun Patel",
    age: 63,
    condition: "Stroke",
    risk: 69,
    status: "Elevated",
    time: "1 hr ago",
  },
  {
    name: "Sneha Rao",
    age: 39,
    condition: "Kidney Disease",
    risk: 42,
    status: "Moderate",
    time: "2 hrs ago",
  },
];

const activity = [
  {
    title: "Stroke assessment completed",
    patient: "Rahul Mehta",
    time: "12 min ago",
    icon: Brain,
  },
  {
    title: "Diabetes risk reviewed",
    patient: "Priya Sharma",
    time: "34 min ago",
    icon: Activity,
  },
  {
    title: "Patient profile updated",
    patient: "Arjun Patel",
    time: "1 hr ago",
    icon: Users,
  },
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17201d]">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-black/[0.06] bg-[#f8faf9] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                NEXUS
              </p>

              <p className="text-[9px] uppercase tracking-[0.16em] text-black/35">
                Clinical Intelligence
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
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

                  {item.label === "NEXUS AI" && (
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

      {/* MAIN */}
      <div className="lg:pl-[260px]">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-black/[0.06] bg-[#f4f6f5]/85 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.07] bg-white lg:hidden"
            >
              <Menu size={17} />
            </button>

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/30">
                Tuesday / 08 September 2026
              </p>

              <h1 className="mt-1 text-lg font-medium tracking-[-0.025em]">
                Good morning, Dr. Sharma.
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-black/40 transition hover:text-black">
              <Search size={17} />
            </button>

            {/* Notification */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-black/40 transition hover:text-black">
              <Bell size={17} />

              <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-[#c26a52]" />
            </button>

            {/* Profile */}
            <div className="hidden h-10 items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3 sm:flex">
              <CircleUserRound size={17} className="text-black/40" />

              <span className="text-xs font-medium">Dr. Sharma</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#edf3f1] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#d7e7e2] opacity-70 blur-3xl" />

            <div className="absolute bottom-[-180px] right-[20%] h-[320px] w-[320px] rounded-full bg-white/70 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.65fr]">
              <div>
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5c8a7e]" />

                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#4c756c]">
                    Clinical intelligence
                  </span>
                </div>

                <h2 className="max-w-2xl text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[0.88] tracking-[-0.065em]">
                  Understand
                  <br />
                  the patient
                  <br />
                  <span className="text-black/30">before the event.</span>
                </h2>

                <p className="mt-7 max-w-xl text-sm leading-6 text-black/50">
                  NEXUS continuously surfaces clinical risk signals,
                  prioritizes patients and helps you understand what may
                  require attention next.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/doctor/clinical"
                    className="group flex h-11 items-center gap-3 rounded-xl bg-[#17201d] px-5 text-xs font-medium text-white transition hover:bg-[#25312d]"
                  >
                    New patient assessment

                    <ArrowUpRight
                      size={14}
                      className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>

                  <Link
                    href="/doctor/ai"
                    className="flex h-11 items-center gap-3 rounded-xl border border-black/[0.08] bg-white/70 px-5 text-xs font-medium text-black/60 transition hover:bg-white"
                  >
                    <MessageCircle size={14} />
                    Ask NEXUS AI
                  </Link>
                </div>
              </div>

              {/* Clinical signal visual */}
              <div className="relative hidden h-[300px] lg:block">
                <div className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.06]" />

                <div className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.07]" />

                <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white/80 shadow-[0_25px_70px_rgba(30,60,52,0.10)] backdrop-blur-xl">
                  <Brain
                    size={25}
                    strokeWidth={1.4}
                    className="text-[#4c756c]"
                  />

                  <span className="mt-2 font-mono text-[8px] tracking-[0.15em] text-black/35">
                    CLINICAL CORE
                  </span>
                </div>

                <div className="absolute left-[7%] top-[24%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
                  <p className="font-mono text-[7px] text-black/30">
                    RISK
                  </p>

                  <p className="mt-1 text-xs font-medium">87%</p>
                </div>

                <div className="absolute right-[4%] top-[31%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
                  <p className="font-mono text-[7px] text-black/30">
                    SIGNAL
                  </p>

                  <p className="mt-1 text-xs font-medium">STROKE</p>
                </div>

                <div className="absolute bottom-[15%] left-[14%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
                  <p className="font-mono text-[7px] text-black/30">
                    CONFIDENCE
                  </p>

                  <p className="mt-1 text-xs font-medium">91%</p>
                </div>

                <div className="absolute bottom-[18%] right-[10%] rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl">
                  <p className="font-mono text-[7px] text-black/30">
                    MODEL
                  </p>

                  <p className="mt-1 text-xs font-medium">v2.4</p>
                </div>
              </div>
            </div>
          </section>

          {/* METRICS */}
          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Patients monitored"
              value="248"
              detail="+12 this week"
              icon={Users}
              trend="up"
            />

            <Metric
              label="High-risk patients"
              value="17"
              detail="4 require review"
              icon={AlertTriangle}
              trend="warning"
            />

            <Metric
              label="Assessments today"
              value="34"
              detail="+18% vs yesterday"
              icon={Brain}
              trend="up"
            />

            <Metric
              label="Clinical signals"
              value="09"
              detail="3 newly detected"
              icon={TrendingUp}
              trend="neutral"
            />
          </section>

          {/* MAIN GRID */}
          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            {/* PATIENT RISK */}
            <div className="rounded-[26px] border border-black/[0.06] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-black/30">
                    Priority queue
                  </p>

                  <h3 className="mt-2 text-xl font-medium tracking-[-0.035em]">
                    Patients requiring attention
                  </h3>
                </div>

                <Link
                  href="/doctor/patients"
                  className="flex items-center gap-1 text-[10px] font-medium text-[#4c756c]"
                >
                  View all
                  <ChevronRight size={13} />
                </Link>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[650px]">
                  <div className="grid grid-cols-[1.5fr_1fr_0.6fr_0.7fr_0.8fr] border-b border-black/[0.06] px-3 pb-3 font-mono text-[8px] uppercase tracking-[0.12em] text-black/25">
                    <span>Patient</span>
                    <span>Clinical signal</span>
                    <span>Risk</span>
                    <span>Status</span>
                    <span>Updated</span>
                  </div>

                  <div className="divide-y divide-black/[0.05]">
                    {riskPatients.map((patient) => (
                      <Link
                        href="/doctor/patients"
                        key={patient.name}
                        className="group grid grid-cols-[1.5fr_1fr_0.6fr_0.7fr_0.8fr] items-center px-3 py-4 transition hover:bg-[#f7f9f8]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2f0] text-[10px] font-semibold text-black/50">
                            {patient.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>

                          <div>
                            <p className="text-xs font-medium">
                              {patient.name}
                            </p>

                            <p className="mt-0.5 text-[9px] text-black/35">
                              {patient.age} years
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-black/50">
                          {patient.condition}
                        </span>

                        <span className="text-sm font-medium">
                          {patient.risk}%
                        </span>

                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                            patient.status === "High"
                              ? "bg-[#f5e8e4] text-[#a35e49]"
                              : patient.status === "Elevated"
                                ? "bg-[#f3eee2] text-[#8c7044]"
                                : "bg-[#eaf0ee] text-[#5c776f]"
                          }`}
                        >
                          {patient.status}
                        </span>

                        <span className="text-[9px] text-black/30">
                          {patient.time}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* NEXUS AI */}
            <div className="relative overflow-hidden rounded-[26px] border border-black/[0.06] bg-[#17201d] p-6 text-white">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#42675e] opacity-30 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                      <Brain size={15} />
                    </div>

                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                      NEXUS AI
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-[#9bb9b0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8fb5a9]" />
                    Online
                  </span>
                </div>

                <h3 className="mt-10 max-w-sm text-2xl font-medium leading-tight tracking-[-0.04em]">
                  Your clinical copilot is ready.
                </h3>

                <p className="mt-4 text-xs leading-6 text-white/45">
                  Ask about a patient, explain a prediction, compare clinical
                  factors or prepare questions for your next review.
                </p>

                <div className="mt-8 space-y-2">
                  {[
                    "Explain this patient's risk",
                    "What factors contributed most?",
                    "Summarize today's priority patients",
                  ].map((question) => (
                    <Link
                      href="/doctor/ai"
                      key={question}
                      className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[10px] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      {question}
                      <ArrowUpRight size={13} />
                    </Link>
                  ))}
                </div>

                <Link
                  href="/doctor/ai"
                  className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-xs font-medium text-[#17201d] transition hover:bg-[#edf3f1]"
                >
                  Open NEXUS AI
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </section>

          {/* BOTTOM */}
          <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
            {/* ACTIVITY */}
            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-black/30">
                    Recent activity
                  </p>

                  <h3 className="mt-2 text-xl font-medium tracking-[-0.035em]">
                    Clinical activity
                  </h3>
                </div>

                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.07]">
                  <MoreHorizontal size={15} className="text-black/40" />
                </button>
              </div>

              <div className="mt-6 space-y-1">
                {activity.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 rounded-xl px-3 py-3 transition hover:bg-[#f7f9f8]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef3f1] text-[#5c8278]">
                        <Icon size={15} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[9px] text-black/35">
                          {item.patient}
                        </p>
                      </div>

                      <span className="shrink-0 text-[9px] text-black/30">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HOSPITAL SIGNAL */}
            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-black/30">
                    Hospital intelligence
                  </p>

                  <h3 className="mt-2 text-xl font-medium tracking-[-0.035em]">
                    Capacity signal
                  </h3>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#edf3f1] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#668f84]" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#55766e]">
                    Stable
                  </span>
                </div>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="text-[clamp(3rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.07em]">
                    78%
                  </p>

                  <p className="mt-3 text-xs text-black/40">
                    Current hospital capacity
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/25">
                    7 DAY OUTLOOK
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    Moderate pressure
                  </p>
                </div>
              </div>

              {/* Chart */}
              <div className="mt-7 h-20">
                <svg
                  viewBox="0 0 600 100"
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 78 C60 72, 80 65, 130 68 C180 71, 195 50, 240 56 C290 62, 310 42, 355 48 C400 54, 420 36, 465 39 C510 42, 530 22, 600 28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-[#5f8b80]"
                  />

                  <path
                    d="M0 78 C60 72, 80 65, 130 68 C180 71, 195 50, 240 56 C290 62, 310 42, 355 48 C400 54, 420 36, 465 39 C510 42, 530 22, 600 28 L600 100 L0 100 Z"
                    className="fill-[#edf3f1]"
                  />
                </svg>
              </div>

              <div className="mt-3 flex justify-between font-mono text-[8px] text-black/25">
                <span>TODAY</span>
                <span>+2D</span>
                <span>+4D</span>
                <span>+7D</span>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="mt-8 flex flex-col gap-3 border-t border-black/[0.06] py-5 text-[9px] uppercase tracking-[0.14em] text-black/25 sm:flex-row sm:items-center sm:justify-between">
            <span>NEXUS / Doctor Workspace</span>

            <span className="flex items-center gap-2">
              <Clock3 size={12} />
              Last synchronized 2 min ago
            </span>
          </footer>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  trend: "up" | "warning" | "neutral";
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[22px] border border-black/[0.06] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_15px_45px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f3f2] text-black/45">
          <Icon size={16} strokeWidth={1.7} />
        </div>

        {trend === "up" && (
          <TrendingUp size={14} className="text-[#608d82]" />
        )}

        {trend === "warning" && (
          <AlertTriangle size={14} className="text-[#ad8050]" />
        )}
      </div>

      <p className="mt-7 text-[10px] uppercase tracking-[0.12em] text-black/30">
        {label}
      </p>

      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-3xl font-medium tracking-[-0.055em]">
          {value}
        </p>

        <p className="mb-1 text-[9px] text-black/35">{detail}</p>
      </div>
    </motion.div>
  );
}