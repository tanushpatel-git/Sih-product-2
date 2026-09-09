"use client";

import { ChevronRight } from "lucide-react";

export default function PatientHealthTrend() {
  return (
    <div className="rounded-[25px] border border-[#e0e7e3] bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
            Health activity
          </p>

          <h3 className="mt-2 text-[20px] font-medium tracking-[-0.04em]">
            Your week at a glance.
          </h3>

          <p className="mt-1 text-[9px] text-[#8b9691]">
            A simple view of your recent health signals.
          </p>
        </div>

        <button className="flex items-center gap-1 text-[9px] text-[#65857c]">
          7 days
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="mt-7">
        <svg
          viewBox="0 0 760 220"
          className="h-[220px] w-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="healthArea"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#a7c9bf"
                stopOpacity="0.28"
              />

              <stop
                offset="100%"
                stopColor="#a7c9bf"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <line
            x1="0"
            y1="30"
            x2="760"
            y2="30"
            stroke="#edf1ef"
          />

          <line
            x1="0"
            y1="80"
            x2="760"
            y2="80"
            stroke="#edf1ef"
          />

          <line
            x1="0"
            y1="130"
            x2="760"
            y2="130"
            stroke="#edf1ef"
          />

          <line
            x1="0"
            y1="180"
            x2="760"
            y2="180"
            stroke="#edf1ef"
          />

          <path
            d="M0 142 C55 132, 70 105, 120 118 C165 130, 188 92, 240 98 C292 104, 305 72, 355 84 C405 96, 430 68, 478 75 C525 82, 550 53, 595 66 C640 79, 676 42, 760 52 L760 200 L0 200 Z"
            fill="url(#healthArea)"
          />

          <path
            d="M0 142 C55 132, 70 105, 120 118 C165 130, 188 92, 240 98 C292 104, 305 72, 355 84 C405 96, 430 68, 478 75 C525 82, 550 53, 595 66 C640 79, 676 42, 760 52"
            fill="none"
            stroke="#67978a"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle
            cx="760"
            cy="52"
            r="4"
            fill="#5f9184"
          />

          {[
            ["Mon", 0],
            ["Tue", 126],
            ["Wed", 252],
            ["Thu", 378],
            ["Fri", 504],
            ["Sat", 630],
            ["Sun", 746],
          ].map(([day, x]) => (
            <text
              key={String(day)}
              x={Number(x)}
              y="218"
              textAnchor={
                day === "Sun"
                  ? "end"
                  : day === "Mon"
                    ? "start"
                    : "middle"
              }
              fontSize="9"
              fill="#9aa49f"
            >
              {day}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}