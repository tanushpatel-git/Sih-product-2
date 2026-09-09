"use client";

import { Search, Bell } from "lucide-react";

export default function PatientTopBar() {
  return (
    <header className="flex h-[78px] items-center justify-between border-b border-[#e1e7e4] bg-[#f7f9f8]/90 px-6 backdrop-blur-xl md:px-9">
      <div>
        <p className="text-[8px] uppercase tracking-[0.25em] text-[#9aa5a1]">
          Tuesday · 09 September 2026
        </p>

        <h2 className="mt-1 text-[13px] font-medium tracking-[-0.01em]">
          Good evening, Vedant.
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden h-9 items-center gap-2 rounded-[11px] border border-[#e0e6e3] bg-white px-3 text-[#899590] md:flex">
          <Search size={13} />

          <span className="text-[9px]">
            Search health records
          </span>

          <span className="ml-5 rounded-md bg-[#f1f4f2] px-1.5 py-0.5 text-[7px]">
            /
          </span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#e0e6e3] bg-white text-[#697872] transition hover:bg-[#f0f4f2]">
          <Bell size={14} />

          <span className="absolute right-[8px] top-[7px] h-1.5 w-1.5 rounded-full border border-white bg-[#6e9d90]" />
        </button>

        {/* Avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#17221f] text-[9px] font-medium text-white">
          VG
        </button>
      </div>
    </header>
  );
}