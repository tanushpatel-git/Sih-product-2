"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Bell, CircleUserRound } from "lucide-react";
import { formatDoctorName, getISTGreetingAndDate } from "../../doctorAuth";

interface DoctorTopBarProps {
  onMenuClick: () => void;
  doctor?: {
    name: string;
    specialty?: string;
  };
}

export default function DoctorTopBar({ onMenuClick, doctor }: DoctorTopBarProps) {
  const [ist, setIst] = useState(() => getISTGreetingAndDate());

  useEffect(() => {
    setIst(getISTGreetingAndDate());
    const interval = setInterval(() => {
      setIst(getISTGreetingAndDate());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const doctorDisplayName = formatDoctorName(doctor?.name || "Dr. Sharma");

  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-black/[0.06] bg-[#f4f6f5]/85 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.07] bg-white lg:hidden"
        >
          <Menu size={17} />
        </button>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-black/30">
            {ist.dateStr}
          </p>

          <h1 className="mt-1 text-lg font-medium tracking-[-0.025em]">
            {ist.greeting}, {doctorDisplayName}.
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

          <span className="text-xs font-medium">{doctorDisplayName}</span>
        </div>
      </div>
    </header>
  );
}