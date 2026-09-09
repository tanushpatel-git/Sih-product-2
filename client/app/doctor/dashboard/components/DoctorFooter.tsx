"use client";

import { Clock3 } from "lucide-react";

export default function DoctorFooter() {
  return (
    <footer className="mt-8 flex flex-col gap-3 border-t border-black/[0.06] py-5 text-[9px] uppercase tracking-[0.14em] text-black/25 sm:flex-row sm:items-center sm:justify-between">
      <span>VITAWEAVE / Doctor Workspace</span>

      <span className="flex items-center gap-2">
        <Clock3 size={12} />
        Last synchronized 2 min ago
      </span>
    </footer>
  );
}