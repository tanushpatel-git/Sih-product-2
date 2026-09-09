"use client";

import { FileText, ArrowUpRight } from "lucide-react";

const records = [
  {
    title: "Complete Blood Count",
    date: "06 Sep 2026",
    type: "Laboratory",
  },
  {
    title: "General Health Consultation",
    date: "02 Sep 2026",
    type: "Consultation",
  },
  {
    title: "Blood Pressure Assessment",
    date: "29 Aug 2026",
    type: "Vitals",
  },
];

export default function PatientRecords() {
  return (
    <div className="rounded-[25px] border border-[#e0e7e3] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
            Health history
          </p>

          <h3 className="mt-2 text-[19px] font-medium tracking-[-0.04em]">
            Recent records
          </h3>
        </div>

        <button className="text-[9px] text-[#63857b]">
          View all
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {records.map((record) => (
          <div
            key={record.title}
            className="flex items-center gap-4 rounded-[16px] border border-[#e8edeb] p-4 transition hover:border-[#d5e3de] hover:bg-[#fafcfb]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#f1f5f3] text-[#70867e]">
              <FileText size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-medium">
                {record.title}
              </p>

              <p className="mt-1 text-[8px] text-[#909a96]">
                {record.type} · {record.date}
              </p>
            </div>

            <ArrowUpRight
              size={14}
              className="text-[#9ca8a3]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}