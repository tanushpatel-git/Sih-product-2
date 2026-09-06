'use client';

import React, { useState } from 'react';
import { HospitalNode, TimelineDayId, DayForecastPoint } from '../../../../lib/types';
import { REGIONAL_HOSPITAL_NODES } from '../../../../lib/mockData';
import { MapPin, ArrowRight, Ambulance, ShieldCheck, Share2, AlertTriangle } from 'lucide-react';

interface HospitalNetworkProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
  onOpenCoordination: (preselectedHospitalId?: string) => void;
}

export const HospitalNetwork: React.FC<HospitalNetworkProps> = ({
  selectedDay,
  forecastData,
  onOpenCoordination,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hosp-a-aiims');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const originNode = REGIONAL_HOSPITAL_NODES.find((n) => n.isCurrent) || REGIONAL_HOSPITAL_NODES[0];
  const satelliteNodes = REGIONAL_HOSPITAL_NODES.filter((n) => !n.isCurrent);
  const activeNode =
    REGIONAL_HOSPITAL_NODES.find((n) => n.id === selectedNodeId) || satelliteNodes[0];

  const isOriginBreached = forecastData.resources.icu.shortageDelta > 0;

  // SVG coordinate dimensions
  const svgWidth = 800;
  const svgHeight = 520;

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#080909] p-4 lg:p-8">
      <div className="max-w-[1720px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D3FD50]" />
              <span className="text-xs font-mono tracking-widest text-[#D3FD50] uppercase font-bold">
                REGIONAL SURGE COORDINATION GRID
              </span>
              <span className="text-[10px] font-mono text-white/40 uppercase">
                • BHOPAL HEALTHCARE CORRIDOR
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black font-mono tracking-tight text-white uppercase">
              NEARBY HOSPITAL CAPACITY & LOAD-SHEDDING NETWORK
            </h2>
            <p className="text-xs font-mono text-white/50">
              Real-time regional bed telemetry mapping destination facilities to absorb projected patient overflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCoordination()}
              className="px-3 py-1.5 rounded-lg bg-[#D3FD50] text-[#080909] hover:bg-[#b5dc3f] transition-all text-xs font-mono font-bold flex items-center gap-2"
            >
              COORDINATE CAPACITY <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Interactive Map (Left 8 cols) + Hospital Inspector (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stylized Dark Geospatial Network Canvas */}
          <div className="lg:col-span-8 rounded-xl border border-white/[0.08] bg-[#0b0d0f] p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
            {/* Top Toolbar / Compass / Coordinates */}
            <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D3FD50]" /> Receiving Capacity
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Saturated / Origin
                </span>
              </div>
              <span className="text-[11px] text-white/40">
                GEO-GRID: BHOPAL METROPOLITAN (23.2599° N, 77.4126° E)
              </span>
            </div>

            {/* Network SVG Map */}
            <div className="w-full flex items-center justify-center py-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full max-w-[760px] h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern id="geoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                  </pattern>

                  {/* Flow arrow marker for load-shedding route */}
                  <marker
                    id="flowArrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#D3FD50" />
                  </marker>
                </defs>

                {/* Background Grid */}
                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#geoGrid)" />

                {/* Radial Distance Rings Centered on Origin */}
                {[90, 160, 230].map((radius, idx) => (
                  <g key={`ring-${radius}`}>
                    <circle
                      cx={(originNode.coordinates.x / 100) * svgWidth}
                      cy={(originNode.coordinates.y / 100) * svgHeight}
                      r={radius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={(originNode.coordinates.x / 100) * svgWidth + radius - 15}
                      y={(originNode.coordinates.y / 100) * svgHeight - 6}
                      className="text-[9px] font-mono fill-white/25"
                    >
                      {idx === 0 ? '8 km' : idx === 1 ? '15 km' : '20 km'}
                    </text>
                  </g>
                ))}

                {/* Connection Vector Lines from Origin to Satellite Hospitals */}
                {satelliteNodes.map((target) => {
                  const x1 = (originNode.coordinates.x / 100) * svgWidth;
                  const y1 = (originNode.coordinates.y / 100) * svgHeight;
                  const x2 = (target.coordinates.x / 100) * svgWidth;
                  const y2 = (target.coordinates.y / 100) * svgHeight;

                  const isTargetSelected = target.id === selectedNodeId;
                  const isHovered = target.id === hoveredNodeId;

                  return (
                    <g key={`vector-${target.id}`}>
                      {/* Connection Line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isTargetSelected || isHovered ? '#D3FD50' : 'rgba(255, 255, 255, 0.15)'}
                        strokeWidth={isTargetSelected ? 2 : 1}
                        strokeDasharray={isOriginBreached ? '6 4' : 'none'}
                        markerEnd={isOriginBreached ? 'url(#flowArrow)' : undefined}
                      />

                      {/* Distance pill in middle of vector */}
                      <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                        <rect
                          x="-26"
                          y="-10"
                          width="52"
                          height="20"
                          rx="4"
                          fill="#0b0d0f"
                          stroke={isTargetSelected ? '#D3FD50' : 'rgba(255, 255, 255, 0.1)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-white/70 font-semibold"
                        >
                          {target.distanceKm} km
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* SATELLITE HOSPITAL NODES */}
                {satelliteNodes.map((node) => {
                  const cx = (node.coordinates.x / 100) * svgWidth;
                  const cy = (node.coordinates.y / 100) * svgHeight;
                  const isSelected = node.id === selectedNodeId;
                  const isHovered = node.id === hoveredNodeId;

                  // Node size based on available ICU capacity
                  const radius = 14 + (node.availableIcuBeds / 35) * 10;

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      {/* Outer pulse halo if selected */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius + 8}
                          fill="none"
                          stroke="#D3FD50"
                          strokeWidth="1.5"
                          opacity="0.6"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="#121519"
                        stroke={isSelected ? '#D3FD50' : '#4B5563'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />

                      {/* Available Bed Count inside Node */}
                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-black fill-[#D3FD50] tabular-nums"
                      >
                        +{node.availableIcuBeds}
                      </text>

                      {/* Label Card under Node */}
                      <g transform={`translate(${cx}, ${cy + radius + 12})`}>
                        <rect
                          x="-70"
                          y="0"
                          width="140"
                          height="28"
                          rx="4"
                          fill="#15181b"
                          stroke={isSelected ? '#D3FD50' : 'rgba(255, 255, 255, 0.1)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="12"
                          textAnchor="middle"
                          className="text-[9px] font-mono font-bold fill-white uppercase"
                        >
                          {node.name.split('—')[0]}
                        </text>
                        <text
                          x="0"
                          y="22"
                          textAnchor="middle"
                          className="text-[8px] font-mono fill-[#D3FD50] font-semibold"
                        >
                          {node.availableIcuBeds} ICU • {node.transitTimeMinutes} min transit
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* CENTRAL ORIGIN NODE (BHOPAL DISTRICT HOSPITAL) */}
                {(() => {
                  const cx = (originNode.coordinates.x / 100) * svgWidth;
                  const cy = (originNode.coordinates.y / 100) * svgHeight;
                  return (
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(originNode.id)}
                    >
                      {/* Pulsing hazard if breached */}
                      {isOriginBreached && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="32"
                          fill="#EF4444"
                          opacity="0.2"
                          className="animate-ping"
                        />
                      )}

                      <circle
                        cx={cx}
                        cy={cy}
                        r="22"
                        fill="#15181b"
                        stroke={isOriginBreached ? '#EF4444' : '#D3FD50'}
                        strokeWidth="3"
                      />

                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-black fill-white"
                      >
                        CORE
                      </text>

                      {/* Origin Callout Flag */}
                      <g transform={`translate(${cx}, ${cy - 48})`}>
                        <rect
                          x="-80"
                          y="0"
                          width="160"
                          height="32"
                          rx="5"
                          fill="#181c20"
                          stroke={isOriginBreached ? '#EF4444' : '#D3FD50'}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="13"
                          textAnchor="middle"
                          className="text-[9px] font-mono font-black fill-white uppercase tracking-wider"
                        >
                          BHOPAL DISTRICT HOSPITAL
                        </text>
                        <text
                          x="0"
                          y="24"
                          textAnchor="middle"
                          className={`text-[8px] font-mono font-black uppercase ${isOriginBreached ? 'fill-[#EF4444]' : 'fill-[#D3FD50]'
                            }`}
                        >
                          {isOriginBreached
                            ? `SOURCE OF SURGE: +${forecastData.resources.icu.shortageDelta} OVERLOAD`
                            : 'CURRENT FACILITY (ORIGIN)'}
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Bottom Caption */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/40">
              <span>Interactive Network: Click any hospital node to review receiving capacity</span>
              <span className="text-white/70">
                Transit times calculated via MP Emergency Medical Highway Corridor
              </span>
            </div>
          </div>

          {/* Right Column: Selected Hospital Node Telemetry Inspector */}
          <div className="lg:col-span-4 rounded-xl border border-white/[0.08] bg-[#0d0f12] p-5 flex flex-col justify-between">
            <div>
              {/* Top Status */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">
                  FACILITY PROFILE
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#D3FD50]/15 text-[#D3FD50] border border-[#D3FD50]/30">
                  {activeNode.badge}
                </span>
              </div>

              {/* Name & Code */}
              <div className="mb-4">
                <h3 className="text-lg font-mono font-black text-white uppercase leading-tight">
                  {activeNode.name}
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-mono text-white/40 mt-1">
                  <span>CODE: {activeNode.code}</span>
                  <span>•</span>
                  <span>{activeNode.facilityType}</span>
                </div>
              </div>

              {/* Transit & Geospatial Distance */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Distance</div>
                  <div className="text-2xl font-mono font-bold text-white tabular-nums">
                    {activeNode.distanceKm}{' '}
                    <span className="text-xs text-white/40">KM</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-white/40 uppercase">Ambulance Transit</div>
                  <div className="text-2xl font-mono font-bold text-[#D3FD50] tabular-nums">
                    ~{activeNode.transitTimeMinutes}{' '}
                    <span className="text-xs text-[#D3FD50]/60">MIN</span>
                  </div>
                </div>
              </div>

              {/* Bed & Equipment Telemetry Breakdown */}
              <div className="space-y-2.5 text-xs font-mono mb-4">
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">
                  VERIFIED RECEIVING BUFFER
                </div>

                <div className="flex justify-between p-2.5 rounded bg-white/[0.02] border border-white/[0.06] items-center">
                  <span className="text-white/60">Available ICU Beds:</span>
                  <span className="text-base font-bold text-[#D3FD50] tabular-nums">
                    {activeNode.availableIcuBeds}{' '}
                    <span className="text-[10px] text-white/40">/ {activeNode.totalIcuBeds}</span>
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded bg-white/[0.02] border border-white/[0.06] items-center">
                  <span className="text-white/60">Available General Inpatient:</span>
                  <span className="text-white font-bold tabular-nums">
                    {activeNode.availableGeneralBeds} Beds
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded bg-white/[0.02] border border-white/[0.06] items-center">
                  <span className="text-white/60">Standby Ventilators:</span>
                  <span className="text-white font-bold tabular-nums">
                    {activeNode.availableVentilators} Units
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded bg-white/[0.02] border border-white/[0.06] items-center">
                  <span className="text-white/60">Inter-Hospital Compatibility:</span>
                  <span className="text-[#D3FD50] font-bold tabular-nums">
                    {activeNode.compatibilityScore}% Compatibility
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button: Allocate Patients */}
            {!activeNode.isCurrent && (
              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => onOpenCoordination(activeNode.id)}
                  className="w-full py-2.5 rounded-lg bg-[#D3FD50] text-[#080909] font-mono font-bold text-xs hover:bg-[#b8e336] transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  INITIATE LOAD-SHEDDING PROTOCOL →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
