"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface OrganNode {
  id: string;
  name: string;
  status: string;
  statusType: "available" | "normal" | "not_assessed";
  x: number; // 3D offset relative to center
  y: number;
  z: number;
  icon: string;
  color: string;
  glowColor: string;
  modelKey?: string;
}

const ORGANS: OrganNode[] = [
  {
    id: "brain",
    name: "Brain",
    status: "Assessment Available",
    statusType: "available",
    x: 0,
    y: -140,
    z: 5,
    icon: "🧠",
    color: "#0284c7",
    glowColor: "rgba(56, 189, 248, 0.9)",
    modelKey: "stroke",
  },
  {
    id: "lungs",
    name: "Lungs",
    status: "Not Assessed",
    statusType: "not_assessed",
    x: -18,
    y: -75,
    z: 10,
    icon: "🫁",
    color: "#059669",
    glowColor: "rgba(16, 185, 129, 0.9)",
  },
  {
    id: "heart",
    name: "Heart",
    status: "Assessment Available",
    statusType: "available",
    x: 12,
    y: -65,
    z: 15,
    icon: "❤️",
    color: "#e11d48",
    glowColor: "rgba(244, 63, 94, 0.95)",
    modelKey: "heartDisease",
  },
  {
    id: "liver",
    name: "Liver",
    status: "Assessment Available",
    statusType: "available",
    x: -15,
    y: -25,
    z: 12,
    icon: "🫀",
    color: "#d97706",
    glowColor: "rgba(245, 158, 11, 0.9)",
    modelKey: "liverDisease",
  },
  {
    id: "kidney",
    name: "Kidney",
    status: "Assessment Available",
    statusType: "available",
    x: 16,
    y: -10,
    z: -10,
    icon: "🩺",
    color: "#2563eb",
    glowColor: "rgba(59, 130, 246, 0.9)",
    modelKey: "kidneyDisease",
  },
  {
    id: "gut",
    name: "Gut",
    status: "Not Assessed",
    statusType: "not_assessed",
    x: 0,
    y: 20,
    z: 8,
    icon: "🔬",
    color: "#7c3aed",
    glowColor: "rgba(168, 85, 247, 0.9)",
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setRotationY((prev) => prev + dx * 0.008);
      setRotationX((prev) =>
        Math.max(-0.25, Math.min(0.25, prev + dy * 0.005))
      );
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.8, Math.min(1.3, prev - e.deltaY * 0.001)));
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localRotationY = rotationY;

    const render = () => {
      if (!isDragging) {
        localRotationY += 0.002;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const scale = 1.15 * zoom;

      // 3D Projection helper
      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(localRotationY);
        const sinY = Math.sin(localRotationY);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const cameraDist = 350;
        const perspective = cameraDist / (cameraDist - z2);

        return {
          px: centerX + x1 * scale * perspective,
          py: centerY + y2 * scale * perspective,
          pz: z2,
          perspective,
        };
      };

      // ── 1. Pedestal Base & Orbital Hologram Rings ──────────────
      const pedestalCenter = project(0, 160, 0);

      // Glowing Pedestal Base Gradient
      const baseGrad = ctx.createRadialGradient(
        pedestalCenter.px,
        pedestalCenter.py,
        5,
        pedestalCenter.px,
        pedestalCenter.py,
        125 * scale
      );
      baseGrad.addColorStop(0, "rgba(56, 189, 248, 0.4)");
      baseGrad.addColorStop(0.4, "rgba(14, 165, 233, 0.18)");
      baseGrad.addColorStop(0.8, "rgba(99, 102, 241, 0.05)");
      baseGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(
        pedestalCenter.px,
        pedestalCenter.py,
        125 * scale,
        36 * scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Concentric Pedestal Bims
      [110, 85, 60, 38].forEach((r, idx) => {
        ctx.strokeStyle =
          idx === 0
            ? "rgba(56, 189, 248, 0.7)"
            : idx === 1
            ? "rgba(14, 165, 233, 0.45)"
            : "rgba(125, 211, 252, 0.3)";
        ctx.lineWidth = idx === 0 ? 2 : 1.2;
        ctx.beginPath();
        ctx.ellipse(
          pedestalCenter.px,
          pedestalCenter.py,
          r * scale,
          r * 0.28 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });

      // Pedestal Vertical Light Column
      const lightBeam = ctx.createLinearGradient(
        pedestalCenter.px,
        pedestalCenter.py,
        pedestalCenter.px,
        pedestalCenter.py - 310 * scale
      );
      lightBeam.addColorStop(0, "rgba(56, 189, 248, 0.16)");
      lightBeam.addColorStop(0.5, "rgba(14, 165, 233, 0.06)");
      lightBeam.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = lightBeam;
      ctx.beginPath();
      ctx.moveTo(pedestalCenter.px - 75 * scale, pedestalCenter.py);
      ctx.lineTo(pedestalCenter.px - 50 * scale, pedestalCenter.py - 310 * scale);
      ctx.lineTo(pedestalCenter.px + 50 * scale, pedestalCenter.py - 310 * scale);
      ctx.lineTo(pedestalCenter.px + 75 * scale, pedestalCenter.py);
      ctx.closePath();
      ctx.fill();

      // ── 2. Render Anatomical Silhouette (Female/Unisex Torso) ──
      // Key anatomical control points for smooth body rendering
      const bodyPoints = [
        // Head top
        { x: 0, y: -175, z: 0 },
        // Head right
        { x: 17, y: -150, z: 0 },
        // Chin
        { x: 0, y: -125, z: 0 },
        // Neck right
        { x: 10, y: -115, z: 0 },
        // Right shoulder
        { x: 34, y: -95, z: 0 },
        // Right chest / armpit
        { x: 26, y: -65, z: 0 },
        // Right waist
        { x: 19, y: -20, z: 0 },
        // Right hip
        { x: 26, y: 25, z: 0 },
        // Right thigh
        { x: 20, y: 75, z: 0 },
        // Right knee
        { x: 14, y: 110, z: 0 },
        // Right ankle
        { x: 10, y: 155, z: 0 },
      ];

      // Draw Body Outer Holographic Glow
      ctx.save();
      const bodyGlowGrad = ctx.createLinearGradient(
        centerX,
        centerY - 180 * scale,
        centerX,
        centerY + 160 * scale
      );
      bodyGlowGrad.addColorStop(0, "rgba(14, 165, 233, 0.22)");
      bodyGlowGrad.addColorStop(0.4, "rgba(99, 102, 241, 0.18)");
      bodyGlowGrad.addColorStop(0.8, "rgba(56, 189, 248, 0.2)");
      bodyGlowGrad.addColorStop(1, "rgba(14, 165, 233, 0.05)");

      // Project right body contour points
      const projectedRight = bodyPoints.map((pt) => project(pt.x, pt.y, pt.z));
      const projectedLeft = bodyPoints.map((pt) =>
        project(-pt.x, pt.y, pt.z)
      );

      // Begin body path
      ctx.beginPath();
      // Head curve
      const pHeadTop = project(0, -175, 0);
      ctx.moveTo(pHeadTop.px, pHeadTop.py);

      // Right side down
      for (let i = 1; i < projectedRight.length; i++) {
        ctx.lineTo(projectedRight[i].px, projectedRight[i].py);
      }
      // Across feet
      const pLeftAnkle = projectedLeft[projectedLeft.length - 1];
      ctx.lineTo(pLeftAnkle.px, pLeftAnkle.py);

      // Left side up (in reverse order)
      for (let i = projectedLeft.length - 2; i >= 0; i--) {
        ctx.lineTo(projectedLeft[i].px, projectedLeft[i].py);
      }
      ctx.closePath();

      // Fill body silhouette with semi-transparent holographic gradient
      ctx.fillStyle = bodyGlowGrad;
      ctx.fill();

      // Body rim stroke
      ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Inner holographic grid scanlines
      ctx.strokeStyle = "rgba(125, 211, 252, 0.12)";
      ctx.lineWidth = 0.8;
      for (let y = -160; y <= 150; y += 12) {
        const p1 = project(-24, y, 0);
        const p2 = project(24, y, 0);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }
      ctx.restore();

      // ── 3. Render Internal Organs with Realistic Radiant Glows ──
      const now = Date.now() * 0.003;
      ORGANS.forEach((organ) => {
        const proj = project(organ.x, organ.y, organ.z);
        const isHovered = hoveredOrgan === organ.id;
        const isSelected = selectedOrganId === organ.id;
        const pulse = Math.sin(now + organ.y) * 0.2 + 1.0;

        // Outer Radiant Organ Halo
        const organCorona = ctx.createRadialGradient(
          proj.px,
          proj.py,
          2,
          proj.px,
          proj.py,
          (isHovered || isSelected ? 26 : 18) * pulse * scale
        );
        organCorona.addColorStop(0, organ.glowColor);
        organCorona.addColorStop(0.5, organ.glowColor.replace("0.9", "0.35"));
        organCorona.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = organCorona;
        ctx.beginPath();
        ctx.arc(
          proj.px,
          proj.py,
          (isHovered || isSelected ? 26 : 18) * pulse * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Organ Core Sphere
        ctx.fillStyle = isSelected
          ? "#2563eb"
          : isHovered
          ? "#0284c7"
          : organ.color;
        ctx.beginPath();
        ctx.arc(
          proj.px,
          proj.py,
          (isHovered || isSelected ? 7 : 5) * scale,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Inner Bright White Highlight Dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Orbital Ring around active organ
        if (isHovered || isSelected) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(
            proj.px,
            proj.py,
            24 * scale,
            8 * scale,
            now,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      });

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [rotationX, rotationY, zoom, isDragging, hoveredOrgan, selectedOrganId]);

  return (
    <div
      className="relative w-full h-[480px] flex items-center justify-center select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={520}
        height={480}
        className="cursor-grab active:cursor-grabbing w-full h-full max-w-[500px]"
      />

      {/* ── Floating Organ Cards (Exact Reference Style: Nexora/Vitaweave) ── */}
      {/* Top Left: Brain */}
      <div
        className="absolute top-8 left-4 sm:left-10 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[0])}
        onMouseEnter={() => setHoveredOrgan("brain")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
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

      {/* Middle Left: Lungs */}
      <div
        className="absolute top-32 left-2 sm:left-6 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[1])}
        onMouseEnter={() => setHoveredOrgan("lungs")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
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

      {/* Lower Left: Liver */}
      <div
        className="absolute top-56 left-4 sm:left-10 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[3])}
        onMouseEnter={() => setHoveredOrgan("liver")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
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

      {/* Top Right: Heart */}
      <div
        className="absolute top-10 right-4 sm:right-10 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[2])}
        onMouseEnter={() => setHoveredOrgan("heart")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
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

      {/* Middle Right: Kidney */}
      <div
        className="absolute top-36 right-2 sm:right-6 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[4])}
        onMouseEnter={() => setHoveredOrgan("kidney")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
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

      {/* Lower Right: Gut */}
      <div
        className="absolute top-60 right-4 sm:right-10 cursor-pointer transition-all duration-200 hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[5])}
        onMouseEnter={() => setHoveredOrgan("gut")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
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

      {/* Bottom Right Interaction Indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs pointer-events-none">
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
