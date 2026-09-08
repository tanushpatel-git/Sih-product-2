"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface OrganNode {
  id: string;
  name: string;
  status: string;
  statusType: "available" | "normal" | "not_assessed";
  x: number; // 3D coordinates relative to center
  y: number;
  z: number;
  icon: string;
  color: string;
  modelKey?: string;
}

const ORGANS: OrganNode[] = [
  {
    id: "brain",
    name: "Brain",
    status: "Assessment Available",
    statusType: "available",
    x: 0,
    y: 115,
    z: 10,
    icon: "🧠",
    color: "#0284c7",
    modelKey: "stroke",
  },
  {
    id: "lungs",
    name: "Lungs",
    status: "Not Assessed",
    statusType: "not_assessed",
    x: -16,
    y: 72,
    z: 5,
    icon: "🫁",
    color: "#059669",
  },
  {
    id: "heart",
    name: "Heart",
    status: "Assessment Available",
    statusType: "available",
    x: 10,
    y: 65,
    z: 12,
    icon: "❤️",
    color: "#e11d48",
    modelKey: "heartDisease",
  },
  {
    id: "liver",
    name: "Liver",
    status: "Assessment Available",
    statusType: "available",
    x: -14,
    y: 35,
    z: 10,
    icon: "🫀",
    color: "#d97706",
    modelKey: "liverDisease",
  },
  {
    id: "kidney",
    name: "Kidney",
    status: "Assessment Available",
    statusType: "available",
    x: 14,
    y: 20,
    z: -8,
    icon: "🩺",
    color: "#2563eb",
    modelKey: "kidneyDisease",
  },
  {
    id: "gut",
    name: "Gut",
    status: "Not Assessed",
    statusType: "not_assessed",
    x: 0,
    y: 0,
    z: 8,
    icon: "🔬",
    color: "#7c3aed",
  },
];

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function generateAnatomyMesh(): Point3D[] {
  const points: Point3D[] = [];
  // Head sphere
  for (let u = 0; u < Math.PI * 2; u += 0.4) {
    for (let v = 0; v < Math.PI; v += 0.4) {
      const r = 16;
      points.push({
        x: r * Math.sin(v) * Math.cos(u),
        y: 118 + r * Math.cos(v),
        z: r * Math.sin(v) * Math.sin(u) * 0.8,
      });
    }
  }
  // Neck
  for (let y = 96; y <= 104; y += 4) {
    for (let a = 0; a < Math.PI * 2; a += 0.6) {
      points.push({
        x: 7 * Math.cos(a),
        y,
        z: 6 * Math.sin(a),
      });
    }
  }
  // Torso contours (chest, waist, hips)
  for (let y = -25; y <= 95; y += 4) {
    const progress = (y + 25) / 120; // 0 at hips, 1 at shoulders
    let rx = 18;
    let rz = 12;
    if (progress > 0.7) {
      // Shoulders
      rx = 24 + Math.sin((progress - 0.7) * Math.PI * 2) * 6;
      rz = 13;
    } else if (progress > 0.4) {
      // Waist
      rx = 17;
      rz = 11;
    } else {
      // Hips
      rx = 21;
      rz = 14;
    }
    for (let a = 0; a < Math.PI * 2; a += 0.35) {
      points.push({
        x: rx * Math.cos(a),
        y,
        z: rz * Math.sin(a),
      });
    }
  }
  // Arms
  [-1, 1].forEach((side) => {
    for (let y = -25; y <= 85; y += 5) {
      const armProgress = (85 - y) / 110;
      const xOffset = side * (26 + armProgress * 8);
      for (let a = 0; a < Math.PI * 2; a += 0.8) {
        points.push({
          x: xOffset + 4 * Math.cos(a),
          y,
          z: 4 * Math.sin(a),
        });
      }
    }
  });
  // Legs
  [-1, 1].forEach((side) => {
    for (let y = -125; y <= -25; y += 5) {
      const legProgress = (-25 - y) / 100;
      const xOffset = side * (11 - legProgress * 2);
      const r = 7.5 - legProgress * 2.5;
      for (let a = 0; a < Math.PI * 2; a += 0.7) {
        points.push({
          x: xOffset + r * Math.cos(a),
          y,
          z: r * Math.sin(a),
        });
      }
    }
  });
  return points;
}

interface HumanBody3DProps {
  onSelectOrgan?: (organ: OrganNode) => void;
  selectedOrganId?: string | null;
}

export default function HumanBody3D({
  onSelectOrgan,
  selectedOrganId,
}: HumanBody3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationY, setRotationY] = useState(0.2);
  const [rotationX, setRotationX] = useState(-0.05);
  const [zoom, setZoom] = useState(1.05);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Precomputed anatomy points
  const anatomyPoints = useRef<Point3D[]>([]);
  useEffect(() => {
    anatomyPoints.current = generateAnatomyMesh();
  }, []);

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
        Math.max(-0.35, Math.min(0.35, prev + dy * 0.006))
      );
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.75, Math.min(1.4, prev - e.deltaY * 0.001)));
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localRotationY = rotationY;

    const render = () => {
      // Auto-rotation when not dragging
      if (!isDragging) {
        localRotationY += 0.0025;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const scale = 1.35 * zoom;

      // 3D projection helper
      const project = (p: Point3D) => {
        // Rotate around Y
        const cosY = Math.cos(localRotationY);
        const sinY = Math.sin(localRotationY);
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective
        const cameraDistance = 320;
        const perspective = cameraDistance / (cameraDistance - z2);

        return {
          px: centerX + x1 * scale * perspective,
          py: centerY - y2 * scale * perspective,
          pz: z2,
          alpha: Math.max(0.12, Math.min(0.95, (z2 + 70) / 140)),
        };
      };

      // ── 1. Holographic Pedestal Platform (Bottom) ──────────────
      const pedestalY = -135;
      const pedestalCenter = project({ x: 0, y: pedestalY, z: 0 });

      // Pedestal gradient glow
      const pedestalGlow = ctx.createRadialGradient(
        pedestalCenter.px,
        pedestalCenter.py,
        10,
        pedestalCenter.px,
        pedestalCenter.py,
        110 * scale
      );
      pedestalGlow.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      pedestalGlow.addColorStop(0.5, "rgba(14, 165, 233, 0.15)");
      pedestalGlow.addColorStop(1, "rgba(2, 132, 199, 0)");

      ctx.fillStyle = pedestalGlow;
      ctx.beginPath();
      ctx.ellipse(
        pedestalCenter.px,
        pedestalCenter.py,
        110 * scale,
        32 * scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Concentric Rings
      [95, 75, 55, 35].forEach((radius, idx) => {
        ctx.strokeStyle =
          idx === 0
            ? "rgba(56, 189, 248, 0.65)"
            : idx === 1
            ? "rgba(14, 165, 233, 0.4)"
            : "rgba(99, 102, 241, 0.3)";
        ctx.lineWidth = idx === 0 ? 1.8 : 1;
        ctx.beginPath();
        ctx.ellipse(
          pedestalCenter.px,
          pedestalCenter.py,
          radius * scale,
          (radius * 0.29) * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });

      // Subtle vertical light beam from pedestal
      const beamGrad = ctx.createLinearGradient(
        pedestalCenter.px,
        pedestalCenter.py,
        pedestalCenter.px,
        pedestalCenter.py - 240 * scale
      );
      beamGrad.addColorStop(0, "rgba(56, 189, 248, 0.18)");
      beamGrad.addColorStop(0.6, "rgba(125, 211, 252, 0.05)");
      beamGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(pedestalCenter.px - 65 * scale, pedestalCenter.py);
      ctx.lineTo(pedestalCenter.px - 45 * scale, pedestalCenter.py - 240 * scale);
      ctx.lineTo(pedestalCenter.px + 45 * scale, pedestalCenter.py - 240 * scale);
      ctx.lineTo(pedestalCenter.px + 65 * scale, pedestalCenter.py);
      ctx.closePath();
      ctx.fill();

      // ── 2. Render Anatomical Cloud / Wireframe Points ──────────
      const pts = anatomyPoints.current;
      for (let i = 0; i < pts.length; i += 2) {
        const p = pts[i];
        const proj = project(p);

        ctx.fillStyle = `rgba(14, 165, 233, ${proj.alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connecting translucent lines for holographic body contour
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 0.75;
      for (let i = 0; i < pts.length - 8; i += 8) {
        const p1 = project(pts[i]);
        const p2 = project(pts[i + 8]);
        if (Math.abs(p1.px - p2.px) < 35 && Math.abs(p1.py - p2.py) < 35) {
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
      }

      // ── 3. Render Organs as Glowing Pulsing Nodes ──────────────
      const now = Date.now() * 0.003;
      ORGANS.forEach((organ) => {
        const proj = project(organ);
        const isHovered = hoveredOrgan === organ.id;
        const isSelected = selectedOrganId === organ.id;
        const pulse = Math.sin(now + organ.y) * 0.25 + 1;

        // Glowing corona
        const corona = ctx.createRadialGradient(
          proj.px,
          proj.py,
          2,
          proj.px,
          proj.py,
          (isHovered || isSelected ? 18 : 12) * pulse
        );
        corona.addColorStop(
          0,
          organ.statusType === "available"
            ? "rgba(14, 165, 233, 0.85)"
            : "rgba(99, 102, 241, 0.7)"
        );
        corona.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(
          proj.px,
          proj.py,
          (isHovered || isSelected ? 18 : 12) * pulse,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Organ core node
        ctx.fillStyle = isSelected
          ? "#2563eb"
          : isHovered
          ? "#0284c7"
          : organ.color;
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, isHovered ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Inner white dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, 1.8, 0, Math.PI * 2);
        ctx.fill();
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
      className="relative w-full h-[460px] flex items-center justify-center select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={460}
        className="cursor-grab active:cursor-grabbing w-full h-full max-w-[480px]"
      />

      {/* ── Floating Interactive Organ Badges ── */}
      {/* Top Left: Brain */}
      <div
        className="absolute top-8 left-6 sm:left-10 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[0])}
        onMouseEnter={() => setHoveredOrgan("brain")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-sky-100 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs">
            🧠
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Brain
            </div>
            <div className="text-[10px] font-medium text-emerald-600">
              Assessment Available
            </div>
          </div>
        </div>
      </div>

      {/* Middle Left: Lungs */}
      <div
        className="absolute top-28 left-4 sm:left-6 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[1])}
        onMouseEnter={() => setHoveredOrgan("lungs")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-slate-100 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
            🫁
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Lungs
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              Not Assessed
            </div>
          </div>
        </div>
      </div>

      {/* Lower Left: Liver */}
      <div
        className="absolute top-48 left-6 sm:left-10 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[3])}
        onMouseEnter={() => setHoveredOrgan("liver")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-amber-100 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
            🫀
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Liver
            </div>
            <div className="text-[10px] font-medium text-emerald-600">
              Assessment Available
            </div>
          </div>
        </div>
      </div>

      {/* Top Right: Heart */}
      <div
        className="absolute top-10 right-6 sm:right-10 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[2])}
        onMouseEnter={() => setHoveredOrgan("heart")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-rose-100 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
            ❤️
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Heart
            </div>
            <div className="text-[10px] font-medium text-emerald-600">
              Assessment Available
            </div>
          </div>
        </div>
      </div>

      {/* Middle Right: Kidney */}
      <div
        className="absolute top-32 right-4 sm:right-6 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[4])}
        onMouseEnter={() => setHoveredOrgan("kidney")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-blue-100 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
            🩺
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Kidney
            </div>
            <div className="text-[10px] font-medium text-emerald-600">
              Assessment Available
            </div>
          </div>
        </div>
      </div>

      {/* Lower Right: Gut */}
      <div
        className="absolute top-52 right-6 sm:right-10 cursor-pointer transition-transform hover:scale-105"
        onClick={() => onSelectOrgan && onSelectOrgan(ORGANS[5])}
        onMouseEnter={() => setHoveredOrgan("gut")}
        onMouseLeave={() => setHoveredOrgan(null)}
      >
        <div className="bg-white/90 backdrop-blur-md border border-purple-100 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
            🔬
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">
              Gut
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              Not Assessed
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Interaction Hint: Rotate / Zoom */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[11px] text-slate-400 bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-100 pointer-events-none">
        <svg
          className="w-3.5 h-3.5 text-slate-400"
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
