"use client";

import React, { useState, useRef, useCallback } from "react";

export interface OrganNode {
  id: string;
  name: string;
  status: string;
  statusType: "available" | "normal" | "not_assessed";
  icon: string;
  color: string;
  glowColor: string;
  modelKey?: string;
  top: string;
  left: string;
}

const ORGANS: OrganNode[] = [
  {
    id: "brain",
    name: "Brain",
    status: "Healthy",
    statusType: "available",
    icon: "🧠",
    color: "#0284c7",
    glowColor: "#38bdf8",
    modelKey: "stroke",
    top: "14%",
    left: "50%",
  },
  {
    id: "lungs",
    name: "Lungs",
    status: "Healthy",
    statusType: "not_assessed",
    icon: "🫁",
    color: "#059669",
    glowColor: "#34d399",
    top: "30%",
    left: "45%",
  },
  {
    id: "heart",
    name: "Heart",
    status: "Normal",
    statusType: "available",
    icon: "❤️",
    color: "#e11d48",
    glowColor: "#f43f5e",
    modelKey: "heartDisease",
    top: "33%",
    left: "53%",
  },
  {
    id: "liver",
    name: "Liver",
    status: "Normal",
    statusType: "available",
    icon: "🫀",
    color: "#d97706",
    glowColor: "#fbbf24",
    modelKey: "liverDisease",
    top: "43%",
    left: "46%",
  },
  {
    id: "kidney",
    name: "Kidney",
    status: "Normal",
    statusType: "available",
    icon: "🩺",
    color: "#2563eb",
    glowColor: "#60a5fa",
    modelKey: "kidneyDisease",
    top: "48%",
    left: "54%",
  },
  {
    id: "gut",
    name: "Gut",
    status: "Normal",
    statusType: "not_assessed",
    icon: "🔬",
    color: "#7c3aed",
    glowColor: "#c084fc",
    top: "55%",
    left: "50%",
  },
];

interface HumanBody3DProps {
  onSelectOrgan?: (organ: OrganNode) => void;
  selectedOrganId?: string | null;
}

export default function HumanBody3D({
  onSelectOrgan,
  selectedOrganId,
}: HumanBody3DProps) {
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const lastMouseX = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMouseX.current = e.clientX;
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX.current;
      setRotationY((prev) => prev + dx * 0.4);
      lastMouseX.current = e.clientX;
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative w-full h-[500px] flex items-center justify-center select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Container holding the 3D Body & Pedestal */}
      <div
        className="relative w-full h-full max-w-[480px] flex items-center justify-center transition-transform duration-75 cursor-grab active:cursor-grabbing"
        style={{
          transform: `rotateY(${rotationY}deg)`,
          perspective: "1000px",
        }}
      >
        {/* ── 1. Pedestal Base & Concentric Rings ── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 h-28 pointer-events-none">
          {/* Radial Light Pool */}
          <div className="absolute inset-0 rounded-[100%] bg-gradient-to-t from-sky-400/30 via-cyan-400/15 to-transparent blur-md" />

          {/* Pedestal Rings */}
          <div className="absolute inset-0 rounded-[100%] border-2 border-sky-400/70 shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
          <div className="absolute inset-2 rounded-[100%] border border-sky-300/50" />
          <div className="absolute inset-5 rounded-[100%] border border-cyan-300/40" />
          <div className="absolute inset-8 rounded-[100%] border border-indigo-300/30" />

          {/* Light Beam ascending */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-80 bg-gradient-to-t from-sky-300/20 via-cyan-200/10 to-transparent [clip-path:polygon(15%_100%,85%_100%,70%_0%,30%_0%)] pointer-events-none" />
        </div>

        {/* ── 2. Full 3D Semi-Transparent Human Body Silhouette ── */}
        <svg
          viewBox="0 0 200 400"
          className="w-auto h-[410px] z-10 drop-shadow-[0_0_20px_rgba(56,189,248,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Holographic Body Gradient */}
            <linearGradient id="bodyGrad" x1="100" y1="20" x2="100" y2="380" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#818cf8" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
            </linearGradient>

            {/* Inner Body Glow */}
            <radialGradient id="innerGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>

            {/* Organ Glow Filters */}
            <filter id="glowBrain" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowHeart" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Orbital Rings around Chest/Torso ── */}
          <ellipse cx="100" cy="150" rx="65" ry="18" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" fill="none" transform="rotate(-10 100 150)" />
          <ellipse cx="100" cy="150" rx="78" ry="22" stroke="#818cf8" strokeWidth="0.75" strokeOpacity="0.3" fill="none" transform="rotate(-10 100 150)" />
          <ellipse cx="100" cy="150" rx="90" ry="26" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.2" fill="none" transform="rotate(-10 100 150)" />

          {/* ── Anatomical Full Body Outline (Realistic Head, Torso, Limbs) ── */}
          <path
            d="
              M 100 22 
              C 112 22, 120 32, 120 46 
              C 120 58, 114 66, 108 72 
              C 114 76, 124 82, 134 88 
              C 142 93, 148 100, 150 112 
              C 152 126, 148 150, 144 175 
              C 142 188, 139 200, 137 210 
              C 134 200, 130 185, 128 170 
              C 127 150, 128 135, 128 120 
              C 123 130, 122 150, 121 175 
              C 120 195, 118 215, 117 230 
              C 119 250, 121 280, 120 310 
              C 119 335, 115 360, 112 378 
              C 110 382, 105 382, 103 378 
              C 101 350, 101 310, 101 270 
              C 100 240, 100 240, 99 270 
              C 99 310, 99 350, 97 378 
              C 95 382, 90 382, 88 378 
              C 85 360, 81 335, 80 310 
              C 79 280, 81 250, 83 230 
              C 82 215, 80 195, 79 175 
              C 78 150, 77 130, 72 120 
              C 72 135, 73 150, 72 170 
              C 70 185, 66 200, 63 210 
              C 61 200, 58 188, 56 175 
              C 52 150, 48 126, 50 112 
              C 52 100, 58 93, 66 88 
              C 76 82, 86 76, 92 72 
              C 86 66, 80 58, 80 46 
              C 80 32, 88 22, 100 22 Z
            "
            fill="url(#bodyGrad)"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Anatomical Shading & Ribcage Accents */}
          <path
            d="M 100 78 V 210 M 82 105 Q 100 115 118 105 M 80 120 Q 100 132 120 120 M 82 135 Q 100 147 118 135 M 84 150 Q 100 160 116 150"
            stroke="#60a5fa"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            fill="none"
          />

          {/* ── 3. Glowing Internal Organ Spheres ── */}
          {/* Brain Glow */}
          <circle cx="100" cy="46" r="10" fill="#0284c7" fillOpacity="0.85" filter="url(#glowBrain)" />
          <circle cx="100" cy="46" r="4" fill="#ffffff" />

          {/* Lungs Glow */}
          <ellipse cx="88" cy="118" rx="8" ry="14" fill="#34d399" fillOpacity="0.75" filter="url(#glowBrain)" />
          <ellipse cx="112" cy="118" rx="8" ry="14" fill="#34d399" fillOpacity="0.75" filter="url(#glowBrain)" />

          {/* Heart Glow (Intense Red/Rose) */}
          <circle cx="106" cy="124" r="11" fill="#f43f5e" fillOpacity="0.95" filter="url(#glowHeart)" />
          <circle cx="106" cy="124" r="4.5" fill="#ffffff" />

          {/* Liver Glow (Gold/Amber) */}
          <ellipse cx="90" cy="152" rx="11" ry="8" fill="#fbbf24" fillOpacity="0.85" filter="url(#glowBrain)" />
          <circle cx="90" cy="152" r="3.5" fill="#ffffff" />

          {/* Kidney Glow (Royal Blue) */}
          <circle cx="110" cy="168" r="7" fill="#60a5fa" fillOpacity="0.85" filter="url(#glowBrain)" />
          <circle cx="110" cy="168" r="3" fill="#ffffff" />

          {/* Gut Glow (Purple/Magenta) */}
          <ellipse cx="100" cy="190" rx="10" ry="12" fill="#c084fc" fillOpacity="0.85" filter="url(#glowBrain)" />
          <circle cx="100" cy="190" r="3.5" fill="#ffffff" />
        </svg>

        {/* ── 3. Floating Status Cards (Exact Match to Image 2) ── */}
        {/* Left Side Callouts */}
        {/* Brain */}
        <div
          className="absolute top-[10%] left-2 sm:left-6 z-20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[0])}
          onMouseEnter={() => setHoveredOrgan("brain")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm shadow-xs">
              🧠
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Brain
              </div>
              <div className="text-[11px] font-semibold text-emerald-600">
                Healthy
              </div>
            </div>
          </div>
        </div>

        {/* Lungs */}
        <div
          className="absolute top-[30%] left-0 sm:left-2 z-20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[1])}
          onMouseEnter={() => setHoveredOrgan("lungs")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shadow-xs">
              🫁
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Lungs
              </div>
              <div className="text-[11px] font-semibold text-emerald-600">
                Healthy
              </div>
            </div>
          </div>
        </div>

        {/* Liver */}
        <div
          className="absolute top-[48%] left-2 sm:left-6 z-20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[3])}
          onMouseEnter={() => setHoveredOrgan("liver")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm shadow-xs">
              🫀
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Liver
              </div>
              <div className="text-[11px] font-semibold text-emerald-600">
                Normal
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Callouts */}
        {/* Heart */}
        <div
          className="absolute top-[12%] right-2 sm:right-6 z-20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[2])}
          onMouseEnter={() => setHoveredOrgan("heart")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm shadow-xs">
              ❤️
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Heart
              </div>
              <div className="text-[11px] font-semibold text-emerald-600">
                Normal
              </div>
            </div>
          </div>
        </div>

        {/* Kidney */}
        <div
          className="absolute top-[34%] right-0 sm:right-2 z-20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[4])}
          onMouseEnter={() => setHoveredOrgan("kidney")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm shadow-xs">
              🩺
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Kidney
              </div>
              <div className="text-[11px] font-semibold text-emerald-600">
                Normal
              </div>
            </div>
          </div>
        </div>

        {/* Gut */}
        <div
          className="absolute top-[52%] right-2 sm:right-6 z-20 cursor-pointer transition-transform hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[5])}
          onMouseEnter={() => setHoveredOrgan("gut")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm shadow-xs">
              🔬
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Gut
              </div>
              <div className="text-[11px] font-semibold text-emerald-600">
                Normal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Interaction Hint */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs pointer-events-none z-30">
        <svg
          className="w-3.5 h-3.5 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239a9 9 0 00-4.8 4.8"
          />
        </svg>
        <span>Rotate / Zoom</span>
      </div>
    </div>
  );
}
