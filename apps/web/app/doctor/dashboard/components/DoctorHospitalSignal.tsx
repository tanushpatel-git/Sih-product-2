"use client";

export default function DoctorHospitalSignal() {
  return (
    <div className="rounded-[26px] border border-black/[0.06] bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.17em] text-black/30">
            Hospital intelligence
          </p>

          <h3 className="mt-2 text-xl font-medium tracking-[-0.035em]">
            Capacity signal
          </h3>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[#edf3f1] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#668f84]" />
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#55766e]">
            Stable
          </span>
        </div>
      </div>

      <div className="mt-7 flex items-end justify-between">
        <div>
          <p className="text-[clamp(3rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.07em]">
            78%
          </p>

          <p className="mt-3 text-xs text-black/40">
            Current hospital capacity
          </p>
        </div>

        <div className="text-right">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/25">
            7 DAY OUTLOOK
          </p>

          <p className="mt-2 text-sm font-medium">
            Moderate pressure
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-7 h-20">
        <svg
          viewBox="0 0 600 100"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <path
            d="M0 78 C60 72, 80 65, 130 68 C180 71, 195 50, 240 56 C290 62, 310 42, 355 48 C400 54, 420 36, 465 39 C510 42, 530 22, 600 28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#5f8b80]"
          />

          <path
            d="M0 78 C60 72, 80 65, 130 68 C180 71, 195 50, 240 56 C290 62, 310 42, 355 48 C400 54, 420 36, 465 39 C510 42, 530 22, 600 28 L600 100 L0 100 Z"
            className="fill-[#edf3f1]"
          />
        </svg>
      </div>

      <div className="mt-3 flex justify-between font-mono text-[8px] text-black/25">
        <span>TODAY</span>
        <span>+2D</span>
        <span>+4D</span>
        <span>+7D</span>
      </div>
    </div>
  );
}