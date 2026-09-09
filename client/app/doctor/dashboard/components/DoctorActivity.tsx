"use client";

import { Brain, Activity, Users, MoreHorizontal } from "lucide-react";

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

export default function DoctorActivity() {
  return (
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
  );
}