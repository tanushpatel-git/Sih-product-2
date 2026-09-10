"use client";

import { motion } from "framer-motion";
import { Users, AlertTriangle, Brain, TrendingUp } from "lucide-react";

interface MetricProps {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  trend: "up" | "warning" | "neutral";
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  trend,
}: MetricProps) {
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

export default function DoctorMetrics() {
  return (
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
  );
}