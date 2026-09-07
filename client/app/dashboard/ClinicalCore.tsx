"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ClinicalModelConfig, ClinicalFactor } from "./clinical-models";

export type ClinicalState = "IDLE" | "ASSESSING" | "RESULT";
export type AssessingPhase = "INGESTING" | "SCANNING" | "CALCULATING";

interface ClinicalCoreProps {
  config: ClinicalModelConfig;
  state: ClinicalState;
  assessingPhase: AssessingPhase;
  selectedFactorId: string | null;
  onSelectFactor: (id: string | null) => void;
  onTriggerAssess: () => void;
}

export default function ClinicalCore({
  config,
  state,
  assessingPhase,
  selectedFactorId,
  onSelectFactor,
  onTriggerAssess,
}: ClinicalCoreProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse offset normalized from -1 to 1 relative to center
  const [mouseOffset, setMouseOffset] = useState({ dx: 0, dy: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredFactorId, setHoveredFactorId] = useState<string | null>(null);

  // Measure container for sub-pixel normalized rendering
  const [dimensions, setDimensions] = useState({ width: 680, height: 560 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Capped motion calculations as specified:
  // const rotateX = Math.max(-8, Math.min(8, -dy * 10));
  // const rotateY = Math.max(-10, Math.min(10, dx * 12));
  const rotateX = isHovered
    ? Math.max(-8, Math.min(8, -mouseOffset.dy * 10))
    : 0;
  const rotateY = isHovered
    ? Math.max(-10, Math.min(10, mouseOffset.dx * 12))
    : 0;

  const shadowTranslateX = -mouseOffset.dx * 18;
  const shadowTranslateY = -mouseOffset.dy * 14;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Normalized -1 to +1 from container center
      const dx = (x / rect.width - 0.5) * 2;
      const dy = (y / rect.height - 0.5) * 2;

      setMouseOffset({ dx, dy });
    },
    []
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ dx: 0, dy: 0 });
    setHoveredFactorId(null);
  };

  const activeFactor =
    config.factors.find(
      (f) => f.id === (hoveredFactorId || selectedFactorId)
    ) || null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[540px] lg:h-[600px] flex items-center justify-center select-none overflow-visible"
      style={{ perspective: "1100px" }}
    >
      {/* ========================================================================= */}
      {/* LAYER 0: Ambient Depth & Physics-Based Perspective Shadow */}
      {/* ========================================================================= */}
      <div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.045] blur-[110px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(calc(-50% + ${shadowTranslateX * 0.4}px), calc(-50% + ${shadowTranslateY * 0.4}px))`,
        }}
      />

      {/* Subtle floor contact shadow */}
      <div
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[340px] h-[34px] rounded-full bg-slate-800/[0.07] blur-[22px] pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(calc(-50% + ${shadowTranslateX}px), ${shadowTranslateY * 0.5}px) scale(${
            1 - Math.abs(mouseOffset.dy) * 0.08
          })`,
        }}
      />

      {/* ========================================================================= */}
      {/* LAYER 1: 2.5D Anatomical Digital Twin (No container, floats directly in UI) */}
      {/* ========================================================================= */}
      <div
        className="relative z-10 w-[min(560px,88%)] aspect-square flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Breathing organic float when idle */}
        <div
          className={`relative w-full h-full flex items-center justify-center ${
            !isHovered && state === "IDLE" ? "animate-pulse" : ""
          }`}
          style={{ animationDuration: "5s" }}
        >
          <Image
            src={config.asset}
            alt={`${config.name} 3D Digital Twin`}
            width={760}
            height={760}
            priority
            className="w-full h-full object-contain pointer-events-none mix-blend-multiply drop-shadow-[0_20px_35px_rgba(15,23,42,0.12)] transition-opacity duration-500"
          />

          {/* Calibrated Scanning Beam (Active strictly during ASSESSING phase) */}
          {state === "ASSESSING" && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
              <div
                className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-amber-400/20 to-transparent border-b border-amber-500/40 animate-clinical-scan"
                style={{
                  boxShadow: "0 0 15px rgba(245, 158, 11, 0.25)",
                }}
              />
            </div>
          )}

          {/* Internal clinical risk vascular pulse (Restrained, subtle) */}
          <div
            className="absolute rounded-full pointer-events-none blur-[14px] opacity-70 transition-opacity duration-700"
            style={{
              left: `${config.primarySignal.x * 100}%`,
              top: `${config.primarySignal.y * 100}%`,
              width: "48px",
              height: "48px",
              transform: "translate(-50%, -50%)",
              background:
                state === "RESULT"
                  ? "radial-gradient(circle, rgba(245,158,11,0.5) 0%, rgba(245,158,11,0) 70%)"
                  : "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0) 70%)",
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYER 2 & 3: SVG Leader Lines & Normalized Hotspots (Layers 2 & 3) */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX * 0.7}deg) rotateY(${rotateY * 0.7}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Dynamic SVG Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="lineActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Primary Signal Hairline Leader */}
          {state !== "ASSESSING" && (
            <g className="transition-opacity duration-500">
              {(() => {
                const px = dimensions.width * (0.5 + (config.primarySignal.x - 0.5) * 0.75);
                const py = dimensions.height * (0.5 + (config.primarySignal.y - 0.5) * 0.75);
                const targetX = dimensions.width * 0.88;
                const targetY = dimensions.height * 0.24;
                const elbowX = px + (targetX - px) * 0.5;

                return (
                  <path
                    d={`M ${px} ${py} L ${elbowX} ${py} L ${targetX} ${targetY}`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="transition-all duration-300"
                  />
                );
              })()}
            </g>
          )}

          {/* Interactive Factor Lines when hovered or selected */}
          {activeFactor && state === "RESULT" && (
            <g className="transition-opacity duration-300">
              {(() => {
                const px = dimensions.width * (0.5 + (activeFactor.x - 0.5) * 0.75);
                const py = dimensions.height * (0.5 + (activeFactor.y - 0.5) * 0.75);
                const isRight = activeFactor.x >= 0.5;
                const targetX = isRight ? dimensions.width * 0.84 : dimensions.width * 0.16;
                const targetY = py - 40;
                const elbowX = isRight ? px + 40 : px - 40;

                return (
                  <>
                    <path
                      d={`M ${px} ${py} L ${elbowX} ${targetY} L ${targetX} ${targetY}`}
                      fill="none"
                      stroke="url(#lineActiveGrad)"
                      strokeWidth="1.5"
                    />
                    <circle cx={px} cy={py} r="4" fill="#f59e0b" />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Normalized Hotspots on the Organ Surface */}
        {config.factors.map((factor) => {
          const isSelected = selectedFactorId === factor.id;
          const isHover = hoveredFactorId === factor.id;
          const isActive = isSelected || isHover;

          // Normalized coordinates mapped into the 3D organ bounding region
          const leftPercent = 50 + (factor.x - 0.5) * 75;
          const topPercent = 50 + (factor.y - 0.5) * 75;

          return (
            <div
              key={factor.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectFactor(isSelected ? null : factor.id);
              }}
              onMouseEnter={() => setHoveredFactorId(factor.id)}
              onMouseLeave={() => setHoveredFactorId(null)}
              className="absolute pointer-events-auto cursor-pointer group"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Outer pulsing ping for high contribution factors */}
              {factor.contribution >= 18 && state === "RESULT" && (
                <span className="absolute -inset-2 rounded-full bg-amber-400/20 animate-ping pointer-events-none" />
              )}

              {/* Core Hotspot Dot */}
              <div
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-6 h-6 bg-amber-500/20 border-2 border-amber-500 shadow-md shadow-amber-500/20 scale-125"
                    : "w-4 h-4 bg-white/90 border border-slate-300 hover:border-amber-400 hover:scale-110 shadow-sm"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                    isActive ? "bg-amber-600" : "bg-slate-500 group-hover:bg-amber-500"
                  }`}
                />
              </div>

              {/* Hover Tooltip Pill */}
              {isHover && !isSelected && (
                <div
                  className={`absolute z-30 pointer-events-none whitespace-nowrap px-2.5 py-1 rounded bg-slate-900/90 text-white text-[11px] font-medium shadow-lg backdrop-blur-sm -translate-y-8 ${
                    factor.x > 0.6 ? "-translate-x-full left-0" : "left-5"
                  }`}
                >
                  <span className="text-amber-400 font-semibold">+{factor.contribution}%</span>{" "}
                  {factor.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Primary Signal Fixed Callout Label (Top Right) */}
        {state !== "ASSESSING" && (
          <div className="absolute right-[4%] top-[18%] pointer-events-auto">
            <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                {config.primarySignal.label}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic State Overlay Indicator (Center Bottom) */}
        <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 pointer-events-auto">
          {state === "IDLE" && (
            <button
              onClick={onTriggerAssess}
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium tracking-wide shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>RUN CLINICAL ASSESSMENT</span>
              <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          )}

          {state === "ASSESSING" && (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-amber-200 shadow-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-800">
                {assessingPhase === "INGESTING" && "ANALYZING CLINICAL SIGNALS"}
                {assessingPhase === "SCANNING" && `SCANNING ${config.scanLabel}`}
                {assessingPhase === "CALCULATING" && "CALCULATING RISK ATTRIBUTION"}
              </span>
            </div>
          )}

          {state === "RESULT" && (
            <button
              onClick={onTriggerAssess}
              className="text-[11px] font-medium tracking-wider uppercase text-slate-600 hover:text-slate-800 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              ↻ RE-RUN ASSESSMENT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
