"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

export interface OrganNode {
  id: string;
  name: string;
  status: string;
  statusType: "available" | "normal" | "not_assessed";
  x: number; // 3D coordinates relative to body origin (0, 0, 0)
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
    status: "Healthy",
    statusType: "available",
    x: 0,
    y: -145,
    z: 2,
    icon: "🧠",
    color: "#0284c7",
    glowColor: "rgba(56, 189, 248, 0.9)",
    modelKey: "stroke",
  },
  {
    id: "lungs",
    name: "Lungs",
    status: "Healthy",
    statusType: "not_assessed",
    x: -16,
    y: -78,
    z: 4,
    icon: "🫁",
    color: "#059669",
    glowColor: "rgba(52, 211, 153, 0.9)",
  },
  {
    id: "heart",
    name: "Heart",
    status: "Normal",
    statusType: "available",
    x: 14,
    y: -70,
    z: 14,
    icon: "❤️",
    color: "#e11d48",
    glowColor: "rgba(244, 63, 94, 0.95)",
    modelKey: "heartDisease",
  },
  {
    id: "liver",
    name: "Liver",
    status: "Normal",
    statusType: "available",
    x: -15,
    y: -28,
    z: 10,
    icon: "🫀",
    color: "#d97706",
    glowColor: "rgba(251, 191, 36, 0.9)",
    modelKey: "liverDisease",
  },
  {
    id: "kidney",
    name: "Kidney",
    status: "Normal",
    statusType: "available",
    x: 15,
    y: -12,
    z: -12,
    icon: "🩺",
    color: "#2563eb",
    glowColor: "rgba(96, 165, 250, 0.9)",
    modelKey: "kidneyDisease",
  },
  {
    id: "gut",
    name: "Gut",
    status: "Normal",
    statusType: "not_assessed",
    x: 0,
    y: 22,
    z: 8,
    icon: "🔬",
    color: "#7c3aed",
    glowColor: "rgba(192, 132, 252, 0.9)",
  },
];

// 3D Ring structure representing anatomical cross-sections
interface AnatomicalRing {
  y: number;
  radiusX: number;
  radiusZ: number;
  offsetX?: number;
}

function generate3DBodyMesh(): AnatomicalRing[] {
  const rings: AnatomicalRing[] = [];

  // Head (Top to Chin: y = -175 to -130)
  for (let y = -175; y <= -130; y += 3) {
    const progress = (y + 175) / 45; // 0 to 1
    const r = Math.sin(progress * Math.PI) * 18;
    rings.push({ y, radiusX: r, radiusZ: r * 0.9 });
  }

  // Neck (y = -130 to -112)
  for (let y = -128; y <= -112; y += 3) {
    rings.push({ y, radiusX: 9, radiusZ: 8 });
  }

  // Shoulders & Chest (y = -110 to -55)
  for (let y = -110; y <= -55; y += 3.5) {
    const progress = (y + 110) / 55;
    let rx = 18 + Math.sin(progress * Math.PI) * 14;
    let rz = 11 + Math.sin(progress * Math.PI) * 6;
    if (progress < 0.3) {
      // Shoulder flare
      rx = 20 + progress * 40;
    }
    rings.push({ y, radiusX: rx, radiusZ: rz });
  }

  // Waist & Abdomen (y = -55 to 5)
  for (let y = -52; y <= 5; y += 3.5) {
    const progress = (y + 52) / 57;
    const rx = 24 - Math.sin(progress * Math.PI) * 6;
    const rz = 15 - Math.sin(progress * Math.PI) * 4;
    rings.push({ y, radiusX: rx, radiusZ: rz });
  }

  // Hips & Pelvis (y = 5 to 45)
  for (let y = 8; y <= 45; y += 3.5) {
    const progress = (y - 8) / 37;
    const rx = 20 + Math.sin(progress * Math.PI) * 7;
    const rz = 13 + Math.sin(progress * Math.PI) * 4;
    rings.push({ y, radiusX: rx, radiusZ: rz });
  }

  // Dual Thighs & Legs (y = 48 to 175)
  for (let y = 48; y <= 175; y += 4) {
    const legProgress = (y - 48) / 127;
    const rx = 10 - legProgress * 4.5;
    const rz = 9 - legProgress * 4;

    // Left leg
    rings.push({ y, radiusX: rx, radiusZ: rz, offsetX: -11 + legProgress * 3 });
    // Right leg
    rings.push({ y, radiusX: rx, radiusZ: rz, offsetX: 11 - legProgress * 3 });
  }

  return rings;
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
  const [rotationY, setRotationY] = useState(0.3);
  const [rotationX, setRotationX] = useState(-0.05);
  const [zoom, setZoom] = useState(1.1);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Precomputed 3D Body Mesh
  const bodyMesh = useRef<AnatomicalRing[]>([]);
  useEffect(() => {
    bodyMesh.current = generate3DBodyMesh();
  }, []);

  // Screen Projected Organ Positions for HTML Floating Cards
  const [organScreenPositions, setOrganScreenPositions] = useState<
    Record<string, { x: number; y: number; z: number }>
  >({});

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      setRotationY((prev) => prev + dx * 0.01);
      setRotationX((prev) =>
        Math.max(-0.4, Math.min(0.4, prev + dy * 0.008))
      );
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom control
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.8, Math.min(1.4, prev - e.deltaY * 0.001)));
  };

  // Render Engine (True 3D Matrix Projection)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localRotationY = rotationY;

    const render = () => {
      // Auto-rotation when idle
      if (!isDragging) {
        localRotationY += 0.004;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 10;
      const scale = 1.25 * zoom;

      // 3D Point Matrix Projection Function
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const cosY = Math.cos(localRotationY);
        const sinY = Math.sin(localRotationY);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Rotate X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Camera Perspective
        const cameraDist = 380;
        const perspective = cameraDist / (cameraDist - z2);

        return {
          px: centerX + x1 * scale * perspective,
          py: centerY + y2 * scale * perspective,
          pz: z2,
          perspective,
        };
      };

      // ── 1. Pedestal Base & Concentric Holographic Rings ──────────
      const pedestalY = 175;
      const pedestalCenter = project(0, pedestalY, 0);

      // Radial Ambient Light Pool
      const baseGrad = ctx.createRadialGradient(
        pedestalCenter.px,
        pedestalCenter.py,
        5,
        pedestalCenter.px,
        pedestalCenter.py,
        130 * scale
      );
      baseGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
      baseGrad.addColorStop(0.4, "rgba(14, 165, 233, 0.2)");
      baseGrad.addColorStop(0.8, "rgba(99, 102, 241, 0.06)");
      baseGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(
        pedestalCenter.px,
        pedestalCenter.py,
        130 * scale,
        38 * scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Concentric Rings
      [115, 90, 65, 42].forEach((radius, idx) => {
        ctx.strokeStyle =
          idx === 0
            ? "rgba(56, 189, 248, 0.8)"
            : idx === 1
            ? "rgba(14, 165, 233, 0.5)"
            : "rgba(125, 211, 252, 0.35)";
        ctx.lineWidth = idx === 0 ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.ellipse(
          pedestalCenter.px,
          pedestalCenter.py,
          radius * scale,
          radius * 0.29 * scale,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });

      // Pedestal Vertical Hologram Light Beam
      const lightBeam = ctx.createLinearGradient(
        pedestalCenter.px,
        pedestalCenter.py,
        pedestalCenter.px,
        pedestalCenter.py - 330 * scale
      );
      lightBeam.addColorStop(0, "rgba(56, 189, 248, 0.2)");
      lightBeam.addColorStop(0.6, "rgba(125, 211, 252, 0.06)");
      lightBeam.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = lightBeam;
      ctx.beginPath();
      ctx.moveTo(pedestalCenter.px - 80 * scale, pedestalCenter.py);
      ctx.lineTo(pedestalCenter.px - 55 * scale, pedestalCenter.py - 330 * scale);
      ctx.lineTo(pedestalCenter.px + 55 * scale, pedestalCenter.py - 330 * scale);
      ctx.lineTo(pedestalCenter.px + 80 * scale, pedestalCenter.py);
      ctx.closePath();
      ctx.fill();

      // ── 2. Render True 3D Anatomical Body Contour Rings ──────────
      const mesh = bodyMesh.current;

      // Draw horizontal cross-sectional 3D rings forming the full human body volume
      mesh.forEach((ring) => {
        const centerOffset = ring.offsetX || 0;
        const ptsCount = 24;
        const ringPoints: { px: number; py: number; pz: number }[] = [];

        for (let i = 0; i < ptsCount; i++) {
          const angle = (i / ptsCount) * Math.PI * 2;
          const x = centerOffset + Math.cos(angle) * ring.radiusX;
          const z = Math.sin(angle) * ring.radiusZ;
          ringPoints.push(project(x, ring.y, z));
        }

        // Draw ring outline
        ctx.beginPath();
        ctx.moveTo(ringPoints[0].px, ringPoints[0].py);
        for (let i = 1; i < ringPoints.length; i++) {
          ctx.lineTo(ringPoints[i].px, ringPoints[i].py);
        }
        ctx.closePath();

        // Holographic fill & stroke
        const avgZ = ringPoints.reduce((acc, p) => acc + p.pz, 0) / ptsCount;
        const alpha = Math.max(0.12, Math.min(0.75, (avgZ + 80) / 160));

        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.12})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.65})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });

      // Draw vertical body seam lines for 3D depth curves
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        ctx.beginPath();
        let started = false;
        mesh.forEach((ring) => {
          if (ring.offsetX) return; // Skip dual limbs for central seams
          const x = Math.cos(angle) * ring.radiusX;
          const z = Math.sin(angle) * ring.radiusZ;
          const p = project(x, ring.y, z);
          if (!started) {
            ctx.moveTo(p.px, p.py);
            started = true;
          } else {
            ctx.lineTo(p.px, p.py);
          }
        });
        ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }

      // ── 3. Orbital Holographic Rings Around Torso ────────────────
      const now = Date.now() * 0.002;
      [ -80, -70, -60 ].forEach((orbitY, idx) => {
        const ringRadius = 55 + idx * 8;
        const orbitPts: { px: number; py: number; pz: number }[] = [];
        for (let a = 0; a < Math.PI * 2; a += 0.2) {
          const x = Math.cos(a + now * (idx % 2 === 0 ? 1 : -1)) * ringRadius;
          const z = Math.sin(a + now * (idx % 2 === 0 ? 1 : -1)) * ringRadius * 0.4;
          orbitPts.push(project(x, orbitY, z));
        }

        ctx.beginPath();
        ctx.moveTo(orbitPts[0].px, orbitPts[0].py);
        for (let i = 1; i < orbitPts.length; i++) {
          ctx.lineTo(orbitPts[i].px, orbitPts[i].py);
        }
        ctx.closePath();
        ctx.strokeStyle = idx === 0 ? "rgba(56, 189, 248, 0.65)" : "rgba(125, 211, 252, 0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // ── 4. True 3D Organs Projection & Depth Sorting ──────────────
      const organCoords: Record<string, { x: number; y: number; z: number }> = {};

      // Sort organs by 3D depth (pz) so back organs draw behind front organs
      const projectedOrgans = ORGANS.map((organ) => {
        const p = project(organ.x, organ.y, organ.z);
        organCoords[organ.id] = { x: p.px, y: p.py, z: p.pz };
        return { organ, proj: p };
      }).sort((a, b) => a.proj.pz - b.proj.pz);

      projectedOrgans.forEach(({ organ, proj }) => {
        const isHovered = hoveredOrgan === organ.id;
        const isSelected = selectedOrganId === organ.id;
        const pulse = Math.sin(now * 2 + organ.y) * 0.25 + 1.0;

        // Radiant organ corona gradient
        const corona = ctx.createRadialGradient(
          proj.px,
          proj.py,
          2,
          proj.px,
          proj.py,
          (isHovered || isSelected ? 28 : 18) * pulse
        );
        corona.addColorStop(0, organ.glowColor);
        corona.addColorStop(0.5, organ.glowColor.replace("0.9", "0.35"));
        corona.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(
          proj.px,
          proj.py,
          (isHovered || isSelected ? 28 : 18) * pulse,
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
        ctx.arc(proj.px, proj.py, isHovered ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();

        // Inner white highlight dot
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(proj.px, proj.py, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing selection ring
        if (isHovered || isSelected) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(
            proj.px,
            proj.py,
            26,
            10,
            now,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      });

      setOrganScreenPositions(organCoords);
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [rotationX, rotationY, zoom, isDragging, hoveredOrgan, selectedOrganId]);

  return (
    <div
      className="relative w-full h-[520px] flex items-center justify-center select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Real 3D Canvas Matrix Visualizer */}
      <canvas
        ref={canvasRef}
        width={540}
        height={520}
        className="cursor-grab active:cursor-grabbing w-full h-full max-w-[520px]"
      />

      {/* ── Dynamic Floating Organ Callout Cards (Track 3D Organ Screen Coords) ── */}
      {ORGANS.map((organ) => {
        const pos = organScreenPositions[organ.id];
        if (!pos) return null;

        // Position callout cards dynamically around the canvas
        // Left side for Brain, Lungs, Liver; Right side for Heart, Kidney, Gut
        const isLeft = ["brain", "lungs", "liver"].includes(organ.id);
        const cardStyle: React.CSSProperties = {
          position: "absolute",
          top: `${pos.y - 20}px`,
          left: isLeft ? `${Math.max(10, pos.x - 180)}px` : `${Math.min(360, pos.x + 40)}px`,
        };

        return (
          <div
            key={organ.id}
            style={cardStyle}
            className="z-20 cursor-pointer transition-transform duration-150 hover:scale-105"
            onClick={() => onSelectOrgan && onSelectOrgan(organ)}
            onMouseEnter={() => setHoveredOrgan(organ.id)}
            onMouseLeave={() => setHoveredOrgan(null)}
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-2xl px-3.5 py-2 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-sm shadow-xs">
                {organ.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {organ.name}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600">
                  {organ.status}
                </div>
              </div>
            </div>
          </div>
        );
      })}

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
        <span>Rotate 360° / Drag</span>
      </div>
    </div>
  );
}
