"use client";

import { Search, Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function getISTDate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";
  return `${weekday} · ${day} ${month} ${year}`;
}

function getISTGreeting(): string {
  const now = new Date();
  const hourString = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  }).format(now);
  const hour = parseInt(hourString, 10);

  if (hour >= 4 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

function getInitials(name?: string): string {
  if (!name) return "PT";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface PatientTopBarProps {
  patientName?: string;
}

export default function PatientTopBar({ patientName }: PatientTopBarProps) {
  const router = useRouter();
  const [dateStr, setDateStr] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Good day");

  useEffect(() => {
    const update = () => {
      setDateStr(getISTDate());
      setGreeting(getISTGreeting());
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const firstName = patientName ? patientName.trim().split(/\s+/)[0] : "";
  const displayGreeting = firstName ? `${greeting}, ${firstName}.` : `${greeting}.`;

  return (
    <header className="flex h-[78px] items-center justify-between border-b border-[#e1e7e4] bg-[#f7f9f8]/90 px-6 backdrop-blur-xl md:px-9">
      <div>
        <p className="text-[8px] uppercase tracking-[0.25em] text-[#9aa5a1]">
          {dateStr || "Today · IST"}
        </p>

        <h2 className="mt-1 text-[13px] font-medium tracking-[-0.01em]">
          {displayGreeting}
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

        {/* Sign out */}
        <button
          onClick={() => router.push("/patient/login")}
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#e0e6e3] bg-white text-[#697872] transition hover:bg-[#f0f4f2]"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>

        {/* Avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#17221f] text-[9px] font-medium text-white">
          {getInitials(patientName)}
        </button>
      </div>
    </header>
  );
}