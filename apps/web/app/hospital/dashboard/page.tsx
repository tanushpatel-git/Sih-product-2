"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BedDouble,
  Building2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

// ─── Metric card ─────────────────────────────────────────────────────────────

interface MetricProps {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  trend: "up" | "warning" | "neutral";
}

function Metric({ label, value, detail, icon: Icon, trend }: MetricProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[22px] border border-black/[0.06] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_15px_45px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f3f2] text-black/45">
          <Icon size={16} strokeWidth={1.7} />
        </div>

        {trend === "up" && <TrendingUp size={14} className="text-[#608d82]" />}
        {trend === "warning" && (
          <AlertTriangle size={14} className="text-[#ad8050]" />
        )}
      </div>

      <p className="mt-7 text-[10px] uppercase tracking-[0.12em] text-black/30">
        {label}
      </p>

      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-3xl font-medium tracking-[-0.055em]">{value}</p>
        <p className="mb-1 text-[9px] text-black/35">{detail}</p>
      </div>
    </motion.div>
  );
}

// ─── Ward row ─────────────────────────────────────────────────────────────────

interface WardProps {
  name: string;
  capacity: number;
  occupied: number;
  status: "normal" | "high" | "critical";
}

function WardRow({ name, capacity, occupied, status }: WardProps) {
  const pct = Math.round((occupied / capacity) * 100);
  const barColor =
    status === "critical"
      ? "bg-[#ad8050]"
      : status === "high"
      ? "bg-[#a09b55]"
      : "bg-[#608d82]";
  const badge =
    status === "critical"
      ? "bg-[#fdf3ec] text-[#ad8050]"
      : status === "high"
      ? "bg-[#fdfaec] text-[#8a8440]"
      : "bg-[#edf3f1] text-[#4c756c]";

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-black/[0.05] bg-[#f9faf9] px-5 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-white">
        <BedDouble size={14} className="text-black/40" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium">{name}</p>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${badge}`}
          >
            {status === "critical" ? "Critical" : status === "high" ? "High" : "Normal"}
          </span>
        </div>

        <div className="mt-2 h-1 w-full rounded-full bg-black/[0.06]">
          <div
            className={`h-1 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="mt-1.5 text-[9px] text-black/35">
          {occupied} / {capacity} beds · {pct}% occupied
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#17201d]">
      {/* ── Topbar ── */}
      <header className="flex items-center justify-between border-b border-black/[0.06] bg-[#f8faf9] px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white">
            <Activity size={17} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.02em]">
              VITAWEAVE
            </div>
            <div className="text-[8px] font-medium uppercase tracking-[0.22em] text-[#7a8581]">
              Hospital Workspace
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-black/35 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6c998d]" />
            Operations online
          </div>

          <div className="h-5 w-px bg-black/10" />

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.07] bg-white">
              <Building2 size={14} className="text-black/40" />
            </div>
            <span className="hidden text-xs font-medium sm:block">
              City General Hospital
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-8 sm:px-10">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#edf1f5] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#d4dfe8] opacity-70 blur-3xl" />
          <div className="absolute bottom-[-180px] right-[20%] h-[320px] w-[320px] rounded-full bg-white/70 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_0.55fr]">
            <div>
              <div className="mb-5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#54749a]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#54749a]">
                  Hospital operations
                </span>
              </div>

              <h1 className="max-w-2xl text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[0.88] tracking-[-0.065em]">
                Manage capacity.
                <br />
                <span className="text-black/30">Anticipate demand.</span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-6 text-black/50">
                VITAWEAVE tracks your hospital&apos;s bed occupancy, admission
                forecasts and resource pressure — so your operations team can
                act before capacity is breached.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="group flex h-11 items-center gap-3 rounded-xl bg-[#17201d] px-5 text-xs font-medium text-white transition hover:bg-[#25312d]">
                  View capacity report
                  <ArrowUpRight
                    size={14}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

                <button className="flex h-11 items-center gap-3 rounded-xl border border-black/[0.08] bg-white/70 px-5 text-xs font-medium text-black/60 transition hover:bg-white">
                  <Zap size={14} />
                  7-day forecast
                </button>
              </div>
            </div>

            {/* Capacity visual */}
            <div className="relative hidden h-[280px] lg:block">
              <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.06]" />
              <div className="absolute left-1/2 top-1/2 h-[155px] w-[155px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.07]" />
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white/80 shadow-[0_25px_70px_rgba(30,50,70,0.10)] backdrop-blur-xl">
                <Building2 size={22} strokeWidth={1.4} className="text-[#54749a]" />
                <span className="mt-1.5 font-mono text-[8px] tracking-[0.15em] text-black/35">
                  CAPACITY
                </span>
              </div>

              {[
                { label: "BED OCC.", value: "78%", pos: "left-[4%] top-[22%]" },
                { label: "ADMISSIONS", value: "+14", pos: "right-[2%] top-[28%]" },
                { label: "FORECAST", value: "HIGH", pos: "bottom-[16%] left-[12%]" },
                { label: "ICU", value: "91%", pos: "bottom-[20%] right-[8%]" },
              ].map((node) => (
                <div
                  key={node.label}
                  className={`absolute ${node.pos} rounded-xl border border-black/[0.06] bg-white/75 px-3 py-2 backdrop-blur-xl`}
                >
                  <p className="font-mono text-[7px] text-black/30">{node.label}</p>
                  <p className="mt-0.5 text-xs font-medium">{node.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Metrics ── */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total beds" value="420" detail="+8 since last month" icon={BedDouble} trend="neutral" />
          <Metric label="Occupied beds" value="328" detail="78% occupancy" icon={Users} trend="warning" />
          <Metric label="Admissions today" value="47" detail="+11% vs yesterday" icon={ArrowUpRight} trend="up" />
          <Metric label="Avg wait time" value="24m" detail="−3m vs last week" icon={Clock} trend="up" />
        </section>

        {/* ── Ward capacity ── */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[22px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                  Ward capacity
                </p>
                <p className="mt-1 text-lg font-medium tracking-[-0.03em]">
                  Live occupancy
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-[#f8faf9] px-3 py-1.5 text-[9px] font-medium text-black/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6c998d]" />
                Live
              </span>
            </div>

            <div className="space-y-2.5">
              <WardRow name="General Ward A" capacity={80} occupied={68} status="high" />
              <WardRow name="ICU" capacity={30} occupied={27} status="critical" />
              <WardRow name="Paediatrics" capacity={50} occupied={31} status="normal" />
              <WardRow name="Cardiology" capacity={40} occupied={35} status="critical" />
              <WardRow name="Orthopaedics" capacity={45} occupied={29} status="normal" />
              <WardRow name="General Ward B" capacity={60} occupied={44} status="high" />
            </div>
          </section>

          {/* Demand forecast + alerts */}
          <div className="flex flex-col gap-5">
            <section className="rounded-[22px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                7-day demand forecast
              </p>

              <div className="space-y-2">
                {[
                  { day: "Today", level: 78, label: "High" },
                  { day: "Tomorrow", level: 83, label: "Critical" },
                  { day: "Day 3", level: 75, label: "High" },
                  { day: "Day 4", level: 64, label: "Moderate" },
                  { day: "Day 5", level: 58, label: "Normal" },
                  { day: "Day 6", level: 61, label: "Normal" },
                  { day: "Day 7", level: 70, label: "High" },
                ].map((item) => (
                  <div key={item.day} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[10px] text-black/40">
                      {item.day}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-black/[0.06]">
                      <div
                        className={`h-1.5 rounded-full ${
                          item.level >= 80
                            ? "bg-[#ad8050]"
                            : item.level >= 70
                            ? "bg-[#a09b55]"
                            : "bg-[#608d82]"
                        }`}
                        style={{ width: `${item.level}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-[9px] text-black/35">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[22px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(20,30,25,0.025)]">
              <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">
                Active alerts
              </p>

              <div className="space-y-2">
                {[
                  { msg: "ICU at 90% — escalate admissions review", sev: "critical" },
                  { msg: "Cardiology surge expected tomorrow", sev: "high" },
                  { msg: "Paediatrics staffing below threshold", sev: "high" },
                  { msg: "Laundry & sterilisation delay — 2 h", sev: "normal" },
                ].map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-black/[0.05] bg-[#f9faf9] px-4 py-3"
                  >
                    <AlertTriangle
                      size={13}
                      className={`mt-0.5 shrink-0 ${
                        alert.sev === "critical"
                          ? "text-[#ad8050]"
                          : alert.sev === "high"
                          ? "text-[#a09b55]"
                          : "text-black/30"
                      }`}
                    />
                    <p className="text-[11px] leading-5 text-black/55">{alert.msg}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-8 flex flex-col gap-3 border-t border-black/[0.06] py-5 text-[9px] uppercase tracking-[0.15em] text-black/25 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} />
            Secure hospital operations platform
          </div>
          <div className="font-mono">VITAWEAVE / HOSPITAL INTELLIGENCE SYSTEM</div>
        </footer>
      </div>
    </main>
  );
}
