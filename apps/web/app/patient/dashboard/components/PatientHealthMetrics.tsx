"use client";

import { Activity, HeartPulse, ShieldCheck, Moon } from "lucide-react";

export default function PatientHealthMetrics() {
  return (
    <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Health signal */}
      <div className="rounded-[22px] border border-[#e0e7e3] bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
              Health signal
            </p>

            <div className="mt-4 flex items-end gap-2">
              <span className="text-[37px] font-medium tracking-[-0.06em]">
                82
              </span>

              <span className="mb-1.5 rounded-full bg-[#e7f1ed] px-2 py-1 text-[7px] text-[#598377]">
                Stable
              </span>
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#edf5f2] text-[#628d80]">
            <Activity size={16} />
          </div>
        </div>

        <p className="mt-3 text-[9px] text-[#89948f]">
          Based on your latest health signals.
        </p>
      </div>

      {/* Heart rate */}
      <div className="rounded-[22px] border border-[#e0e7e3] bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
              Heart rate
            </p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-[31px] font-medium tracking-[-0.05em]">
                72
              </span>

              <span className="mb-1 text-[9px] text-[#8b9691]">
                bpm
              </span>
            </div>
          </div>

          <HeartPulse
            size={17}
            className="text-[#73988d]"
          />
        </div>

        <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-[#edf1ef]">
          <div className="h-full w-[64%] rounded-full bg-[#7da99d]" />
        </div>

        <p className="mt-2 text-[9px] text-[#89948f]">
          Within your usual range
        </p>
      </div>

      {/* Blood pressure */}
      <div className="rounded-[22px] border border-[#e0e7e3] bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
              Blood pressure
            </p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-[29px] font-medium tracking-[-0.05em]">
                118/76
              </span>
            </div>
          </div>

          <ShieldCheck
            size={17}
            className="text-[#73988d]"
          />
        </div>

        <p className="mt-4 text-[9px] text-[#5d8277]">
          Healthy range
        </p>
      </div>

      {/* Sleep */}
      <div className="rounded-[22px] border border-[#e0e7e3] bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
              Sleep
            </p>

            <div className="mt-4 flex items-end gap-1">
              <span className="text-[31px] font-medium tracking-[-0.05em]">
                7.4
              </span>

              <span className="mb-1 text-[9px] text-[#8b9691]">
                hrs
              </span>
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#edf5f2] text-[#628d80]">
            <Moon size={16} />
          </div>
        </div>

        <p className="mt-3 text-[9px] text-[#89948f]">
          Good recovery
        </p>
      </div>
    </section>
  );
}