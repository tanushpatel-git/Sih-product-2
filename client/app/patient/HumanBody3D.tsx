"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";

export interface OrganNode {
  id: string;
  name: string;
  status: string;
  statusType: "available" | "normal" | "not_assessed";
  icon: string;
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
    modelKey: "stroke",
    top: "13%",
    left: "48%",
  },
  {
    id: "lungs",
    name: "Lungs",
    status: "Healthy",
    statusType: "not_assessed",
    icon: "🫁",
    top: "34%",
    left: "42%",
  },
  {
    id: "heart",
    name: "Heart",
    status: "Normal",
    statusType: "available",
    icon: "❤️",
    modelKey: "heartDisease",
    top: "32%",
    left: "52%",
  },
  {
    id: "liver",
    name: "Liver",
    status: "Normal",
    statusType: "available",
    icon: "🫀",
    modelKey: "liverDisease",
    top: "44%",
    left: "44%",
  },
  {
    id: "kidney",
    name: "Kidney",
    status: "Normal",
    statusType: "available",
    icon: "🩺",
    modelKey: "kidneyDisease",
    top: "47%",
    left: "54%",
  },
  {
    id: "gut",
    name: "Gut",
    status: "Normal",
    statusType: "not_assessed",
    icon: "🔬",
    top: "52%",
    left: "49%",
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
  const [activeOrgan, setActiveOrgan] = useState<string | null>(null);
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
      setRotationY((prev) => prev + dx * 0.3);
      setRotationX((prev) => Math.max(-12, Math.min(12, prev + dy * 0.2)));
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
      className="relative w-full h-[500px] flex items-center justify-center select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Interactive 3D Container with Perspective Transform */}
      <div
        className="relative w-full h-full max-w-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75"
        style={{
          transform: `scale(${zoom}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Exact High-Definition 3D Anatomical Human Model Image Asset */}
        <div className="relative w-[480px] h-[480px] flex items-center justify-center">
          <Image
            src="/3d-human-body.png"
            alt="3D Anatomical Human Model"
            width={520}
            height={520}
            priority
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_30px_rgba(56,189,248,0.25)]"
          />

          {/* Interactive Organ Hotspots over Image */}
          {ORGANS.map((organ) => {
            const isSelected = selectedOrganId === organ.id || activeOrgan === organ.id;
            return (
              <div
                key={organ.id}
                style={{ top: organ.top, left: organ.left }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                onClick={() => {
                  setActiveOrgan(organ.id);
                  if (onSelectOrgan) onSelectOrgan(organ);
                }}
                onMouseEnter={() => setActiveOrgan(organ.id)}
                onMouseLeave={() => setActiveOrgan(null)}
              >
                {/* Glowing Pulse Node */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`w-6 h-6 rounded-full animate-ping absolute ${
                      isSelected ? "bg-sky-400/80" : "bg-sky-400/40"
                    }`}
                  />
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform ${
                      isSelected
                        ? "bg-sky-500 scale-125 ring-4 ring-sky-300/50"
                        : "bg-sky-400 group-hover:scale-110"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
