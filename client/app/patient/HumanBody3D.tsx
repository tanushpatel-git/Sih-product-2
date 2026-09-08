"use client";

import React, { useState, useRef, useCallback } from "react";

export interface OrganNode {
  id: string;
  name: string;
  status: string;
  statusType: "available" | "normal" | "not_assessed";
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  statusColorClass: string;
  modelKey?: string;
}

const ORGANS: OrganNode[] = [
  {
    id: "brain",
    name: "Brain",
    status: "Healthy",
    statusType: "available",
    icon: "🧠",
    iconBgClass: "bg-blue-50/90 border border-blue-100",
    iconColorClass: "text-blue-600",
    statusColorClass: "text-emerald-600",
    modelKey: "stroke",
  },
  {
    id: "lungs",
    name: "Lungs",
    status: "Healthy",
    statusType: "not_assessed",
    icon: "🫁",
    iconBgClass: "bg-sky-50/90 border border-sky-100",
    iconColorClass: "text-sky-600",
    statusColorClass: "text-emerald-600",
  },
  {
    id: "heart",
    name: "Heart",
    status: "Normal",
    statusType: "available",
    icon: "❤️",
    iconBgClass: "bg-rose-50/90 border border-rose-100",
    iconColorClass: "text-rose-600",
    statusColorClass: "text-emerald-600",
    modelKey: "heartDisease",
  },
  {
    id: "liver",
    name: "Liver",
    status: "Normal",
    statusType: "available",
    icon: "🫀",
    iconBgClass: "bg-emerald-50/90 border border-emerald-100",
    iconColorClass: "text-emerald-600",
    statusColorClass: "text-emerald-600",
    modelKey: "liverDisease",
  },
  {
    id: "kidney",
    name: "Kidney",
    status: "Normal",
    statusType: "available",
    icon: "🩺",
    iconBgClass: "bg-indigo-50/90 border border-indigo-100",
    iconColorClass: "text-indigo-600",
    statusColorClass: "text-emerald-600",
    modelKey: "kidneyDisease",
  },
  {
    id: "gut",
    name: "Gut",
    status: "Normal",
    statusType: "not_assessed",
    icon: "🔬",
    iconBgClass: "bg-purple-50/90 border border-purple-100",
    iconColorClass: "text-purple-600",
    statusColorClass: "text-emerald-600",
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
  const [rotationX, setRotationX] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setRotationY((prev) => prev + dx * 0.4);
      setRotationX((prev) => Math.max(-15, Math.min(15, prev + dy * 0.2)));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.85, Math.min(1.25, prev - e.deltaY * 0.001)));
  };

  return (
    <div
      className="relative w-full h-[520px] flex items-center justify-center select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* ── Background Spherical Grid Lines (Matching Reference Image) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[440px] h-[440px] rounded-full border border-sky-200/60" />
        <div className="absolute w-[360px] h-[360px] rounded-full border border-indigo-200/50" />
        <div className="absolute w-[280px] h-[280px] rounded-full border border-sky-300/40" />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-cyan-200/50" />

        {/* Diagonal Perspective Rays */}
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-sky-200/30 to-transparent rotate-45" />
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-200/30 to-transparent -rotate-45" />
      </div>

      {/* ── 3D Interactive Human Body Container ── */}
      <div
        className="relative w-full h-full max-w-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75"
        style={{
          transform: `scale(${zoom}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ── 3D Circular Glass Pedestal Base ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 h-32 pointer-events-none">
          {/* Base Glow Pool */}
          <div className="absolute inset-0 rounded-[100%] bg-gradient-to-t from-sky-400/35 via-cyan-300/15 to-transparent blur-md" />

          {/* Concentric Disc Borders */}
          <div className="absolute inset-0 rounded-[100%] border-2 border-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.5)] bg-sky-500/10 backdrop-blur-xs" />
          <div className="absolute inset-2.5 rounded-[100%] border border-sky-300/60" />
          <div className="absolute inset-6 rounded-[100%] border border-cyan-300/50" />
          <div className="absolute inset-10 rounded-[100%] border border-indigo-300/40" />

          {/* Upward Volumetric Hologram Light Column */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-52 h-84 bg-gradient-to-t from-sky-400/25 via-cyan-200/10 to-transparent [clip-path:polygon(15%_100%,85%_100%,70%_0%,30%_0%)]" />
        </div>

        {/* ── High-Definition Semi-Transparent Holographic Female 3D Body Figure ── */}
        <div className="relative z-10 w-[240px] h-[430px] flex items-center justify-center">
          <svg
            viewBox="0 0 240 430"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Semi-Transparent Body Gradient (Holographic Blue/Purple) */}
              <linearGradient id="bodyHoloGrad" x1="120" y1="20" x2="120" y2="410" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
                <stop offset="25%" stopColor="#818cf8" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
              </linearGradient>

              {/* Inner Organ Radiant Glow Filters */}
              <filter id="glowBrainOrb" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glowHeartOrb" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glowSolarOrb" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ── Holographic Concentric Orbital Grid Rings Around Torso ── */}
            <ellipse cx="120" cy="165" rx="72" ry="20" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.5" fill="none" transform="rotate(-12 120 165)" />
            <ellipse cx="120" cy="165" rx="88" ry="25" stroke="#818cf8" strokeWidth="0.9" strokeOpacity="0.4" fill="none" transform="rotate(-12 120 165)" />
            <ellipse cx="120" cy="165" rx="104" ry="30" stroke="#38bdf8" strokeWidth="0.6" strokeOpacity="0.25" fill="none" transform="rotate(-12 120 165)" />

            {/* ── Realistic Female Anatomical Contour Body Path ── */}
            <path
              d="
                M 120 22 
                C 134 22, 142 34, 142 48 
                C 142 60, 136 68, 129 74 
                C 136 78, 148 85, 160 92 
                C 168 97, 173 105, 174 118 
                C 176 135, 172 165, 166 195 
                C 164 210, 160 225, 157 235 
                C 154 225, 150 210, 148 190 
                C 146 170, 146 150, 146 130 
                C 142 142, 140 165, 138 195 
                C 136 220, 134 245, 133 260 
                C 135 285, 137 320, 136 350 
                C 134 380, 130 405, 127 418 
                C 125 422, 120 422, 118 418 
                C 115 385, 115 340, 115 290 
                C 114 260, 114 260, 113 290 
                C 113 340, 113 385, 110 418 
                C 108 422, 103 422, 101 418 
                C 98 405, 94 380, 92 350 
                C 91 320, 93 285, 95 260 
                C 94 245, 92 220, 90 195 
                C 88 165, 86 142, 82 130 
                C 82 150, 82 170, 80 190 
                C 78 210, 74 225, 71 235 
                C 68 225, 64 210, 62 195 
                C 56 165, 52 135, 54 118 
                C 55 105, 60 97, 68 92 
                C 80 85, 92 78, 99 74 
                C 92 68, 86 60, 86 48 
                C 86 34, 94 22, 120 22 Z
              "
              fill="url(#bodyHoloGrad)"
              stroke="#60a5fa"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />

            {/* Inner Skeletal / Ribcage / Spinal Line Accents */}
            <path
              d="M 120 74 V 230 M 100 102 Q 120 112 140 102 M 98 120 Q 120 132 142 120 M 100 138 Q 120 150 140 138 M 102 156 Q 120 166 138 156 M 104 174 Q 120 184 136 174"
              stroke="#93c5fd"
              strokeWidth="1.0"
              strokeOpacity="0.4"
              fill="none"
            />

            {/* ── 3. INTENSE GLOWING ORGAN CORES (EXACT MATCH TO REFERENCE IMAGE) ── */}
            {/* Brain Core (Crown/Head) */}
            <circle cx="120" cy="42" r="11" fill="#818cf8" fillOpacity="0.85" filter="url(#glowBrainOrb)" />
            <circle cx="120" cy="42" r="4.5" fill="#ffffff" />

            {/* Lungs Core (Chest Lobes) */}
            <ellipse cx="106" cy="120" rx="9" ry="15" fill="#34d399" fillOpacity="0.7" filter="url(#glowBrainOrb)" />
            <ellipse cx="134" cy="120" rx="9" ry="15" fill="#34d399" fillOpacity="0.7" filter="url(#glowBrainOrb)" />

            {/* Heart Core (Intense Glowing Red/Orange in Left Upper Chest) */}
            <circle cx="128" cy="128" r="16" fill="#f43f5e" fillOpacity="0.95" filter="url(#glowHeartOrb)" />
            <circle cx="128" cy="128" r="9" fill="#fb923c" fillOpacity="0.9" />
            <circle cx="128" cy="128" r="4" fill="#ffffff" />

            {/* Abdominal / Solar Plexus / Pelvic Core (Intense Glowing Orange/Red Center) */}
            <circle cx="120" cy="195" r="22" fill="#f97316" fillOpacity="0.9" filter="url(#glowSolarOrb)" />
            <circle cx="120" cy="195" r="12" fill="#fbbf24" fillOpacity="0.9" />
            <circle cx="120" cy="195" r="5" fill="#ffffff" />

            {/* Radiating Light Rays from Pelvic Center */}
            <line x1="120" y1="195" x2="80" y2="175" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="120" y1="195" x2="160" y2="175" stroke="#fbbf24" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="120" y1="195" x2="95" y2="235" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="120" y1="195" x2="145" y2="235" stroke="#f97316" strokeWidth="1" strokeOpacity="0.5" />

            {/* Liver Node */}
            <circle cx="106" cy="162" r="7" fill="#fbbf24" fillOpacity="0.85" filter="url(#glowBrainOrb)" />
            <circle cx="106" cy="162" r="2.5" fill="#ffffff" />

            {/* Kidney Node */}
            <circle cx="132" cy="175" r="6" fill="#60a5fa" fillOpacity="0.85" filter="url(#glowBrainOrb)" />
            <circle cx="132" cy="175" r="2.5" fill="#ffffff" />
          </svg>
        </div>

        {/* ── 4. FLOATING ORGAN CARDS (EXACT MATCH TO REFERENCE IMAGE) ── */}
        {/* Left Column: Brain, Lungs, Liver */}
        {/* Brain */}
        <div
          className="absolute top-[8%] left-1 sm:left-4 z-20 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[0])}
          onMouseEnter={() => setHoveredOrgan("brain")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs ${ORGANS[0].iconBgClass}`}>
              <span className={ORGANS[0].iconColorClass}>{ORGANS[0].icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Brain
              </div>
              <div className={`text-[11px] font-semibold ${ORGANS[0].statusColorClass}`}>
                Healthy
              </div>
            </div>
          </div>
        </div>

        {/* Lungs */}
        <div
          className="absolute top-[32%] left-0 sm:left-2 z-20 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[1])}
          onMouseEnter={() => setHoveredOrgan("lungs")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs ${ORGANS[1].iconBgClass}`}>
              <span className={ORGANS[1].iconColorClass}>{ORGANS[1].icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Lungs
              </div>
              <div className={`text-[11px] font-semibold ${ORGANS[1].statusColorClass}`}>
                Healthy
              </div>
            </div>
          </div>
        </div>

        {/* Liver */}
        <div
          className="absolute top-[54%] left-1 sm:left-4 z-20 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[3])}
          onMouseEnter={() => setHoveredOrgan("liver")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs ${ORGANS[3].iconBgClass}`}>
              <span className={ORGANS[3].iconColorClass}>{ORGANS[3].icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Liver
              </div>
              <div className={`text-[11px] font-semibold ${ORGANS[3].statusColorClass}`}>
                Normal
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Heart, Kidney, Gut */}
        {/* Heart */}
        <div
          className="absolute top-[10%] right-1 sm:right-4 z-20 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[2])}
          onMouseEnter={() => setHoveredOrgan("heart")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs ${ORGANS[2].iconBgClass}`}>
              <span className={ORGANS[2].iconColorClass}>{ORGANS[2].icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Heart
              </div>
              <div className={`text-[11px] font-semibold ${ORGANS[2].statusColorClass}`}>
                Normal
              </div>
            </div>
          </div>
        </div>

        {/* Kidney */}
        <div
          className="absolute top-[36%] right-0 sm:right-2 z-20 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[4])}
          onMouseEnter={() => setHoveredOrgan("kidney")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs ${ORGANS[4].iconBgClass}`}>
              <span className={ORGANS[4].iconColorClass}>{ORGANS[4].icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Kidney
              </div>
              <div className={`text-[11px] font-semibold ${ORGANS[4].statusColorClass}`}>
                Normal
              </div>
            </div>
          </div>
        </div>

        {/* Gut */}
        <div
          className="absolute top-[58%] right-1 sm:right-4 z-20 cursor-pointer transition-all duration-200 hover:scale-105"
          onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[5])}
          onMouseEnter={() => setHoveredOrgan("gut")}
          onMouseLeave={() => setHoveredOrgan(null)}
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm shadow-xs ${ORGANS[5].iconBgClass}`}>
              <span className={ORGANS[5].iconColorClass}>{ORGANS[5].icon}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                Gut
              </div>
              <div className={`text-[11px] font-semibold ${ORGANS[5].statusColorClass}`}>
                Normal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Right Control Legend: Mouse Icon + Rotate / Zoom ── */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs pointer-events-none z-30">
        <svg
          className="w-4 h-4 text-slate-500"
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
