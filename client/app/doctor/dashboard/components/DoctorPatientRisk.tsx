"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

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

export default function DoctorPatientRisk() {
  return (
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
  );
}