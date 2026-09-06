'use client';

import React, { useState } from 'react';
import { HospitalNode, TimelineDayId, DayForecastPoint } from '@/lib/types';
import { REGIONAL_HOSPITAL_NODES } from '@/lib/mockData';
import { ArrowRight, Share2 } from 'lucide-react';

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

  const svgWidth = 800;
  const svgHeight = 520;

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#07090C] p-6 lg:p-10">
      <div className="max-w-[1720px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              <span className="text-xs font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
                REGIONAL SURGE COORDINATION GRID
              </span>
              <span className="text-[10px] font-mono text-[#66707C] uppercase">
                • BHOPAL HEALTHCARE CORRIDOR
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
              REGIONAL HOSPITAL CAPACITY & PATIENT TRANSFER NETWORK
            </h2>
            <p className="text-xs font-mono text-[#A7ADB5] mt-1">
              Verified bed and ventilator reserves across the Bhopal medical corridor to absorb overflow patients.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCoordination()}
              className="px-4 py-2 rounded-xl bg-[#151B23] border border-white/[0.14] text-[#F4F3EF] hover:bg-[#11161D] hover:border-white/30 transition-all text-xs font-mono font-bold flex items-center gap-2"
            >
              COORDINATE PATIENT TRANSFER <ArrowRight className="w-3.5 h-3.5 text-[#60A5FA]" />
            </button>
          </div>
        </div>

        {/* 2-Column Grid: Geospatial Map + Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Geospatial Network Map */}
          <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#0D1117] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-[#A7ADB5] mb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" /> Receiving Nodes
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Saturated / Origin
                </span>
              </div>
              <span className="text-[11px] text-[#66707C]">
                GEO-COORDINATES: BHOPAL METROPOLITAN (23.2599° N, 77.4126° E)
              </span>
            </div>

            <div className="w-full flex items-center justify-center py-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full max-w-[760px] h-auto overflow-visible select-none"
              >
                <defs>
                  <pattern id="geoGridMaster" width="40" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="40" y2="0" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
                    <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="1" />
                  </pattern>
                </defs>

                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#geoGridMaster)" />

                {/* Radial Distance Rings */}
                {[90, 160, 230].map((radius, idx) => (
                  <g key={`ring-${radius}`}>
                    <circle
                      cx={(originNode.coordinates.x / 100) * svgWidth}
                      cy={(originNode.coordinates.y / 100) * svgHeight}
                      r={radius}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={(originNode.coordinates.x / 100) * svgWidth + radius - 15}
                      y={(originNode.coordinates.y / 100) * svgHeight - 6}
                      className="text-[9px] font-mono fill-[#66707C]"
                    >
                      {idx === 0 ? '8 km' : idx === 1 ? '15 km' : '20 km'}
                    </text>
                  </g>
                ))}

                {/* Connection Vector Lines */}
                {satelliteNodes.map((target) => {
                  const x1 = (originNode.coordinates.x / 100) * svgWidth;
                  const y1 = (originNode.coordinates.y / 100) * svgHeight;
                  const x2 = (target.coordinates.x / 100) * svgWidth;
                  const y2 = (target.coordinates.y / 100) * svgHeight;

                  const isTargetSelected = target.id === selectedNodeId;
                  const isHovered = target.id === hoveredNodeId;

                  return (
                    <g key={`vector-${target.id}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isTargetSelected || isHovered ? '#60A5FA' : 'rgba(255, 255, 255, 0.12)'}
                        strokeWidth={isTargetSelected ? 1.75 : 1}
                        strokeDasharray={isOriginBreached ? '6 4' : 'none'}
                      />

                      <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                        <rect
                          x="-26"
                          y="-10"
                          width="52"
                          height="20"
                          rx="4"
                          fill="#0D1117"
                          stroke={isTargetSelected ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          className="text-[9px] font-mono fill-[#A7ADB5] font-semibold"
                        >
                          {target.distanceKm} km
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Satellite Nodes */}
                {satelliteNodes.map((node) => {
                  const cx = (node.coordinates.x / 100) * svgWidth;
                  const cy = (node.coordinates.y / 100) * svgHeight;
                  const isSelected = node.id === selectedNodeId;
                  const isHovered = node.id === hoveredNodeId;

                  const radius = 14 + (node.availableIcuBeds / 35) * 8;

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                    >
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={radius + 6}
                          fill="none"
                          stroke="rgba(96, 165, 250, 0.4)"
                          strokeWidth="1"
                        />
                      )}

                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="#151B23"
                        stroke={isSelected ? '#60A5FA' : 'rgba(255, 255, 255, 0.2)'}
                        strokeWidth={isSelected ? 2 : 1}
                      />

                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-black fill-[#F4F3EF] tabular-nums"
                      >
                        +{node.availableIcuBeds}
                      </text>

                      <g transform={`translate(${cx}, ${cy + radius + 12})`}>
                        <rect
                          x="-70"
                          y="0"
                          width="140"
                          height="28"
                          rx="4"
                          fill="#151B23"
                          stroke={isSelected ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="12"
                          textAnchor="middle"
                          className="text-[9px] font-mono font-bold fill-[#F4F3EF] uppercase"
                        >
                          {node.name.split('—')[0]}
                        </text>
                        <text
                          x="0"
                          y="22"
                          textAnchor="middle"
                          className="text-[8px] font-mono fill-[#A7ADB5] font-semibold"
                        >
                          {node.availableIcuBeds} ICU • {node.transitTimeMinutes} min transit
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Origin Facility Node */}
                {(() => {
                  const cx = (originNode.coordinates.x / 100) * svgWidth;
                  const cy = (originNode.coordinates.y / 100) * svgHeight;
                  return (
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(originNode.id)}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r="20"
                        fill="#151B23"
                        stroke={isOriginBreached ? '#EF4444' : '#F4F3EF'}
                        strokeWidth="2.5"
                      />

                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        className="text-[10px] font-mono font-black fill-white"
                      >
                        CORE
                      </text>

                      <g transform={`translate(${cx}, ${cy - 48})`}>
                        <rect
                          x="-80"
                          y="0"
                          width="160"
                          height="32"
                          rx="5"
                          fill="#151B23"
                          stroke={isOriginBreached ? '#EF4444' : 'rgba(255, 255, 255, 0.14)'}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="13"
                          textAnchor="middle"
                          className="text-[9px] font-mono font-black fill-[#F4F3EF] uppercase tracking-wider"
                        >
                          BHOPAL DISTRICT HOSPITAL
                        </text>
                        <text
                          x="0"
                          y="24"
                          textAnchor="middle"
                          className={`text-[8px] font-mono font-black uppercase ${
                            isOriginBreached ? 'fill-[#EF4444]' : 'fill-[#60A5FA]'
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

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#A7ADB5]">
              <span>Select any hospital node to review receiving capacity</span>
              <span className="text-[#A7ADB5]">
                Transit times calculated via MP Emergency Medical Highway Corridor
              </span>
            </div>
          </div>

          {/* Right Column: Inspector */}
          <div className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#0D1117] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
                <span className="text-xs font-mono font-bold text-[#A7ADB5] uppercase tracking-wider">
                  FACILITY PROFILE
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#151B23] text-[#A7ADB5] border border-white/[0.1]">
                  {activeNode.badge}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-mono font-black text-[#F4F3EF] uppercase leading-tight">
                  {activeNode.name}
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#66707C] mt-1">
                  <span>CODE: {activeNode.code}</span>
                  <span>•</span>
                  <span>{activeNode.facilityType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-xl bg-[#07090C] border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-[#66707C] uppercase">Distance</div>
                  <div className="text-2xl font-mono font-bold text-[#F4F3EF] tabular-nums">
                    {activeNode.distanceKm}{' '}
                    <span className="text-xs text-[#66707C]">KM</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#07090C] border border-white/[0.06]">
                  <div className="text-[10px] font-mono text-[#66707C] uppercase">Ambulance Transit</div>
                  <div className="text-2xl font-mono font-bold text-[#60A5FA] tabular-nums">
                    ~{activeNode.transitTimeMinutes}{' '}
                    <span className="text-xs text-[#66707C]">MIN</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono mb-4">
                <div className="text-[10px] uppercase tracking-widest text-[#66707C] font-bold mb-1">
                  VERIFIED RECEIVING BUFFER
                </div>

                <div className="flex justify-between p-2.5 rounded bg-[#11161D] border border-white/[0.06] items-center">
                  <span className="text-[#A7ADB5]">Available ICU Beds:</span>
                  <span className="text-base font-bold text-[#F4F3EF] tabular-nums">
                    {activeNode.availableIcuBeds}{' '}
                    <span className="text-[10px] text-[#66707C]">/ {activeNode.totalIcuBeds}</span>
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded bg-[#11161D] border border-white/[0.06] items-center">
                  <span className="text-[#A7ADB5]">Available General Inpatient:</span>
                  <span className="text-[#F4F3EF] font-bold tabular-nums">
                    {activeNode.availableGeneralBeds} Beds
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded bg-[#11161D] border border-white/[0.06] items-center">
                  <span className="text-[#A7ADB5]">Standby Ventilators:</span>
                  <span className="text-[#F4F3EF] font-bold tabular-nums">
                    {activeNode.availableVentilators} Units
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded bg-[#11161D] border border-white/[0.06] items-center">
                  <span className="text-[#A7ADB5]">Inter-Hospital Compatibility:</span>
                  <span className="text-[#60A5FA] font-bold tabular-nums">
                    {activeNode.compatibilityScore}% Compatibility
                  </span>
                </div>
              </div>
            </div>

            {!activeNode.isCurrent && (
              <div className="pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => onOpenCoordination(activeNode.id)}
                  className="w-full py-2.5 rounded-xl bg-[#151B23] border border-white/[0.14] hover:bg-[#11161D] hover:border-white/30 text-[#F4F3EF] font-mono font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#60A5FA]" />
                  COORDINATE PATIENT TRANSFER →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
