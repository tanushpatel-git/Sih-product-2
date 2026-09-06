'use client';

import React, { useState } from 'react';
import { TimelineDayId, DayForecastPoint, RiskLevel } from '@/lib/types';
import { DIGITAL_TWIN_BASE_ZONES } from '@/lib/mockData';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Bed, Wind, Droplets } from 'lucide-react';

interface DigitalTwinProps {
  selectedDay: TimelineDayId;
  forecastData: DayForecastPoint;
  onOpenCoordination: () => void;
  onViewForecast: () => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  selectedDay,
  forecastData,
  onOpenCoordination,
  onViewForecast,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('icu');
  const offset = forecastData.dayOffset;

  // Real clinical state calculation based on timeline progression
  const getZoneStatus = (zoneId: string) => {
    if (zoneId === 'icu') {
      const shortage = forecastData.resources.icu.shortageDelta;
      if (shortage > 0 || offset >= 4) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: Math.round((forecastData.resources.icu.projectedDemand / 50) * 100),
          fill: '#260B0E',
          floorFill: '#381014',
          stroke: '#EF4444',
          glowColor: '#EF4444',
          accent: '#EF4444',
          label: `CRITICAL • 118% • 13 BEDS DEFICIT`,
        };
      }
      if (offset === 3) {
        return {
          risk: 'WATCH' as RiskLevel,
          utilization: 98,
          fill: '#241708',
          floorFill: '#33200B',
          stroke: '#F59E0B',
          glowColor: '#F59E0B',
          accent: '#F59E0B',
          label: '98% CAPACITY • SATURATION IMMINENT',
        };
      }
      if (offset === 2) {
        return {
          risk: 'WATCH' as RiskLevel,
          utilization: 90,
          fill: '#0D1726',
          floorFill: '#122033',
          stroke: '#60A5FA',
          glowColor: '#155EEF',
          accent: '#60A5FA',
          label: '90% CAPACITY • ELEVATED INFLOW',
        };
      }
      return {
        risk: 'STABLE' as RiskLevel,
        utilization: 82,
        fill: '#0B1E22',
        floorFill: '#0F282D',
        stroke: '#16434A',
        glowColor: '#1C3F4B',
        accent: '#9DF0DA',
        label: '82% CAPACITY • 9 BEDS AVAILABLE',
      };
    }

    if (zoneId === 'emergency') {
      if (offset >= 4) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: 96,
          fill: '#260B0E',
          floorFill: '#381014',
          stroke: '#EF4444',
          glowColor: '#EF4444',
          accent: '#EF4444',
          label: '96% FLOW • SEVERE INTAKE QUEUE',
        };
      }
      return {
        risk: 'STABLE' as RiskLevel,
        utilization: 76 + offset * 4,
        fill: '#11161D',
        floorFill: '#151B23',
        stroke: '#60A5FA',
        glowColor: '#155EEF',
        accent: '#60A5FA',
        label: `${76 + offset * 4}% FLOW • TRIAGE NOMINAL`,
      };
    }

    if (zoneId === 'general_wards') {
      const occ = Math.min(100, 82 + offset * 3);
      return {
        risk: occ >= 95 ? ('HIGH' as RiskLevel) : ('WATCH' as RiskLevel),
        utilization: occ,
        fill: '#11161D',
        floorFill: '#151B23',
        stroke: occ >= 95 ? '#F97316' : '#155EEF',
        glowColor: occ >= 95 ? '#F97316' : '#155EEF',
        accent: occ >= 95 ? '#F97316' : '#60A5FA',
        label: `${occ}% OCCUPIED • INPATIENT SURGE`,
      };
    }

    if (zoneId === 'ventilator_storage') {
      if (forecastData.resources.ventilators.shortageDelta > 0) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: 100,
          fill: '#260B0E',
          floorFill: '#381014',
          stroke: '#EF4444',
          glowColor: '#EF4444',
          accent: '#EF4444',
          label: `DEPLETED • +${forecastData.resources.ventilators.shortageDelta} UNITS REQUIRED`,
        };
      }
      return {
        risk: 'WATCH' as RiskLevel,
        utilization: 90,
        fill: '#11161D',
        floorFill: '#151B23',
        stroke: '#60A5FA',
        glowColor: '#60A5FA',
        accent: '#9DDFF2',
        label: '18 / 20 IN USE • 2 RESERVES',
      };
    }

    if (zoneId === 'oxygen_substation') {
      if (forecastData.resources.oxygen.daysRemaining <= 2.5) {
        return {
          risk: 'CRITICAL' as RiskLevel,
          utilization: forecastData.resources.oxygen.projectedPercentage,
          fill: '#260B0E',
          floorFill: '#381014',
          stroke: '#EF4444',
          glowColor: '#EF4444',
          accent: '#EF4444',
          label: `${forecastData.resources.oxygen.daysRemaining.toFixed(1)} DAYS RUNWAY REMAINING`,
        };
      }
      return {
        risk: 'STABLE' as RiskLevel,
        utilization: forecastData.resources.oxygen.projectedPercentage,
        fill: '#0B1E22',
        floorFill: '#0F282D',
        stroke: '#16434A',
        glowColor: '#16434A',
        accent: '#9DF0DA',
        label: `${forecastData.resources.oxygen.projectedPercentage}% BULK TANK RESERVE`,
      };
    }

    return {
      risk: 'STABLE' as RiskLevel,
      utilization: 75,
      fill: '#11161D',
      floorFill: '#151B23',
      stroke: 'rgba(255, 255, 255, 0.12)',
      glowColor: '#151B23',
      accent: '#A7ADB5',
      label: 'NOMINAL',
    };
  };

  const activeZone =
    DIGITAL_TWIN_BASE_ZONES.find((z) => z.id === selectedZoneId) || DIGITAL_TWIN_BASE_ZONES[0];
  const activeZoneStatus = getZoneStatus(activeZone.id);
  const icuStatus = getZoneStatus('icu');
  const isBreach = forecastData.isBreach || forecastData.resources.icu.shortageDelta > 0;
  const shortageBeds = Math.max(9, forecastData.resources.icu.shortageDelta);

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#07090C] p-6 lg:p-10 relative overflow-hidden">
      <div className="max-w-[1780px] mx-auto">
        {/* Section Header: Clinical Infrastructure Focus */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              <span className="text-[11px] font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
                ARCHITECTURAL DIGITAL TWIN • 2.5D STRUCTURAL CUTAWAY
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
              BHOPAL DISTRICT HOSPITAL • FACILITY CUTAWAY
            </h2>
            <p className="text-xs font-mono text-[#66707C] mt-1 max-w-3xl">
              Physical architectural cutaway. Scrubbing the 7-day forecast illuminates where patient surge will overwhelm clinical capacity before admissions occur.
            </p>
          </div>

          {/* Clinical Focal Status Indicator */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#0D1117] border border-white/[0.08] flex items-center gap-2">
              <span className="text-[#66707C]">MONITORED HORIZON:</span>
              <span className="text-[#F4F3EF] font-bold uppercase">{forecastData.label} (DAY 0{offset})</span>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-2 ${
                isBreach
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                  : 'bg-[#10252C] border-[#16434A] text-[#9DF0DA]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isBreach ? 'bg-[#EF4444]' : 'bg-[#9DF0DA]'}`} />
              <span>{isBreach ? `PROJECTED BREACH: +${shortageBeds} BEDS` : 'CAPACITY NOMINAL'}</span>
            </div>
          </div>
        </div>

        {/* Master Spatial Canvas: Architectural Centerpiece (Left 8 cols) + Decision Instrument (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Architectural Model Stage (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-white/[0.08] bg-[#0D1117] p-6 lg:p-8 relative overflow-hidden flex flex-col justify-between">
            {/* Top Palette Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A7ADB5] relative z-20 mb-2">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#10252C] border border-[#9DF0DA]" /> Normal (Teal/Mint)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#155EEF]" /> Forecast Demand (Cobalt)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]" /> Saturated (Amber)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]" /> Critical Breach (Red)
                </span>
              </div>
              <span className="text-[10px] text-[#66707C] uppercase tracking-wider">
                AXONOMETRIC CUTAWAY PROJECTION
              </span>
            </div>

            {/* Believable Architectural Hospital Isometric SVG with Slabs, Corridors, Rooms, and Spatial Leader Lines */}
            <div className="w-full flex items-center justify-center py-4 relative z-10">
              <svg
                viewBox="0 0 920 620"
                className="w-full max-w-[880px] h-auto overflow-visible select-none"
              >
                <defs>
                  {/* Subtle architectural isometric coordinate grid */}
                  <pattern id="archGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path
                      d="M 20,0 L 40,10 L 20,20 L 0,10 Z"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.02)"
                      strokeWidth="1"
                    />
                  </pattern>

                  {/* Red Volumetric Breach Glow Filter for ICU */}
                  <filter id="icuBreachRadiation" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <rect x="0" y="0" width="920" height="620" fill="url(#archGrid)" />

                {/* Ground Base Slab Foundation */}
                <path
                  d="M 120,440 L 460,260 L 800,430 L 460,600 Z"
                  fill="#0A0D12"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="1"
                />

                {/* ========================================================= */}
                {/* 1. SUBSTRUCTURE & AUXILIARY FACILITIES (GROUND LEVEL)    */}
                {/* ========================================================= */}

                {/* A. Cryogenic Liquid Oxygen VIE Bulk Tank */}
                {(() => {
                  const status = getZoneStatus('oxygen_substation');
                  const isSelected = selectedZoneId === 'oxygen_substation';
                  return (
                    <g
                      className="cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => setSelectedZoneId('oxygen_substation')}
                    >
                      {/* Cylindrical Base Foundation */}
                      <ellipse cx="230" cy="465" rx="35" ry="18" fill="#11161D" stroke={status.stroke} strokeWidth="1" />
                      {/* Cylinder Body */}
                      <path
                        d="M 195,465 L 195,420 A 35 18 0 0 1 265,420 L 265,465 A 35 18 0 0 1 195,465 Z"
                        fill={status.fill}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Dished Top Head */}
                      <ellipse
                        cx="230"
                        cy="420"
                        rx="35"
                        ry="18"
                        fill={status.floorFill}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Vaporizer Coils beside tank */}
                      <line x1="272" y1="440" x2="285" y2="433" stroke={status.stroke} strokeWidth="1.5" />
                      <line x1="272" y1="448" x2="285" y2="441" stroke={status.stroke} strokeWidth="1.5" />
                      <line x1="272" y1="456" x2="285" y2="449" stroke={status.stroke} strokeWidth="1.5" />

                      <text
                        x="230"
                        y="442"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-[#F4F3EF] uppercase tracking-wider"
                      >
                        OXYGEN VIE
                      </text>
                      <text
                        x="230"
                        y="454"
                        textAnchor="middle"
                        className="text-[8px] font-mono font-bold fill-[#9DF0DA]"
                      >
                        71% RESERVE
                      </text>

                      {/* Apple Vision Pro Spatial Leader Line for Oxygen */}
                      <g transform="translate(195, 430)">
                        <circle cx="0" cy="0" r="2.5" fill="#9DF0DA" />
                        <line x1="0" y1="0" x2="-40" y2="-20" stroke="#9DF0DA" strokeWidth="0.8" strokeDasharray="2 2" />
                        <text x="-45" y="-18" textAnchor="end" className="text-[9px] font-mono font-bold fill-[#9DF0DA] uppercase">
                          CRYOGENIC OXYGEN • 2.9d RUNWAY
                        </text>
                      </g>
                    </g>
                  );
                })()}

                {/* B. Ventilator Storage & Biomedical Depot */}
                {(() => {
                  const status = getZoneStatus('ventilator_storage');
                  const isSelected = selectedZoneId === 'ventilator_storage';
                  return (
                    <g
                      className="cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => setSelectedZoneId('ventilator_storage')}
                    >
                      {/* Equipment Depot Volume */}
                      <path
                        d="M 640,410 L 730,360 L 730,395 L 640,445 Z"
                        fill="#0D1117"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <path
                        d="M 730,360 L 800,395 L 800,430 L 730,395 Z"
                        fill="#07090C"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <path
                        d="M 640,410 L 710,375 L 800,420 L 730,455 Z"
                        fill={status.fill}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text
                        x="720"
                        y="415"
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-[#F4F3EF] uppercase"
                      >
                        VENTILATOR DEPOT
                      </text>
                      <text
                        x="720"
                        y="428"
                        textAnchor="middle"
                        className={`text-[8px] font-mono font-bold ${
                          status.risk === 'CRITICAL' ? 'fill-[#EF4444]' : 'fill-[#60A5FA]'
                        }`}
                      >
                        18 / 20 IN USE
                      </text>

                      {/* Spatial Leader Line for Ventilators */}
                      <g transform="translate(800, 410)">
                        <circle cx="0" cy="0" r="2.5" fill="#60A5FA" />
                        <line x1="0" y1="0" x2="35" y2="-15" stroke="#60A5FA" strokeWidth="0.8" strokeDasharray="2 2" />
                        <text x="40" y="-13" textAnchor="start" className="text-[9px] font-mono font-bold fill-[#60A5FA] uppercase">
                          VENTILATOR DEPOT • 2 AVAILABLE
                        </text>
                      </g>
                    </g>
                  );
                })()}

                {/* ========================================================= */}
                {/* 2. LEVEL 01: GROUND FLOOR (EMERGENCY, TRIAGE, PHARMACY)   */}
                {/* ========================================================= */}
                {/* Floor Slab Thickness (Ground Level) */}
                <path
                  d="M 230,370 L 460,250 L 690,365 L 460,485 Z"
                  fill="#11161D"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 230,370 L 230,385 L 460,500 L 460,485 Z"
                  fill="#0D1117"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
                <path
                  d="M 460,485 L 460,500 L 690,380 L 690,365 Z"
                  fill="#080B0F"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />

                {/* Emergency & Trauma Bay (West Wing Ground) */}
                {(() => {
                  const status = getZoneStatus('emergency');
                  const isSelected = selectedZoneId === 'emergency';
                  return (
                    <g
                      className="cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => setSelectedZoneId('emergency')}
                    >
                      {/* Room Interior Floor & Partition Walls */}
                      <path
                        d="M 240,365 L 450,255 L 450,335 L 240,445 Z"
                        fill={status.fill}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      {/* Ambulance intake drive canopy */}
                      <path
                        d="M 200,390 L 240,370 L 240,440 L 200,460 Z"
                        fill="#0A0E14"
                        stroke={status.stroke}
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* Interior Triage Cubicles */}
                      <line x1="310" y1="330" x2="310" y2="410" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      <line x1="380" y1="295" x2="380" y2="375" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                      <text
                        x="345"
                        y="360"
                        textAnchor="middle"
                        className="text-[11px] font-mono font-black fill-[#F4F3EF] uppercase tracking-wider"
                      >
                        EMERGENCY & TRAUMA BAY
                      </text>
                      <text
                        x="345"
                        y="376"
                        textAnchor="middle"
                        className={`text-[9.5px] font-mono font-bold ${
                          status.risk === 'CRITICAL' ? 'fill-[#EF4444]' : 'fill-[#60A5FA]'
                        }`}
                      >
                        {status.label}
                      </text>
                    </g>
                  );
                })()}

                {/* Central Sterile Pharmacy & Diagnostic Lab (East Wing Ground) */}
                {(() => {
                  const isSelected = selectedZoneId === 'pharmacy';
                  return (
                    <g
                      className="cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => setSelectedZoneId('pharmacy')}
                    >
                      <path
                        d="M 460,260 L 670,365 L 670,445 L 460,340 Z"
                        fill="#0D1117"
                        stroke="rgba(255, 255, 255, 0.12)"
                        strokeWidth={isSelected ? 1.75 : 1}
                      />
                      {/* Internal Dispensary counter */}
                      <line x1="530" y1="295" x2="530" y2="375" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                      <text
                        x="565"
                        y="355"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold fill-[#A7ADB5] uppercase tracking-wider"
                      >
                        STERILE PHARMACY & LABS
                      </text>
                      <text
                        x="565"
                        y="370"
                        textAnchor="middle"
                        className="text-[8.5px] font-mono font-semibold fill-[#66707C] uppercase"
                      >
                        GROUND LEVEL • FORMULARY STABLE
                      </text>
                    </g>
                  );
                })()}

                {/* Central Corridor / Public Concourse Spine */}
                <line x1="455" y1="255" x2="455" y2="480" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />

                {/* ========================================================= */}
                {/* 3. VERTICAL CIRCULATION CORE (ELEVATORS & SHAFTS)         */}
                {/* ========================================================= */}
                {/* Structural concrete elevator core linking Ground -> L2 -> L3 */}
                <path
                  d="M 440,110 L 480,90 L 480,310 L 440,330 Z"
                  fill="#0B0F14"
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1.2"
                />
                <text
                  x="460"
                  y="200"
                  textAnchor="middle"
                  transform="rotate(-26 460 200)"
                  className="text-[8px] font-mono fill-[#66707C] uppercase tracking-widest"
                >
                  CORE TRANSIT
                </text>

                {/* ========================================================= */}
                {/* 4. LEVEL 02: INPATIENT GENERAL WARDS & BIO-ISOLATION     */}
                {/* ========================================================= */}
                {/* Floor Slab Thickness (Level 02) */}
                <path
                  d="M 260,265 L 460,165 L 660,265 L 460,365 Z"
                  fill="#11161D"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1.2"
                />
                <path
                  d="M 260,265 L 260,278 L 460,378 L 460,365 Z"
                  fill="#0D1117"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />
                <path
                  d="M 460,365 L 460,378 L 660,278 L 660,265 Z"
                  fill="#080B0F"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />

                {/* General Inpatient Wards (Wings A & B) */}
                {(() => {
                  const status = getZoneStatus('general_wards');
                  const isSelected = selectedZoneId === 'general_wards';
                  return (
                    <g
                      className="cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => setSelectedZoneId('general_wards')}
                    >
                      <path
                        d="M 270,260 L 450,170 L 650,270 L 470,360 Z"
                        fill={status.fill}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.2 : 1}
                      />

                      {/* Ward Room Partitions (North Wing A / South Wing B) */}
                      <line x1="330" y1="230" x2="390" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      <line x1="530" y1="230" x2="590" y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                      <text
                        x="460"
                        y="265"
                        textAnchor="middle"
                        className="text-[11px] font-mono font-black fill-[#F4F3EF] uppercase tracking-wider"
                      >
                        GENERAL INPATIENT WARDS (A & B)
                      </text>
                      <text
                        x="460"
                        y="280"
                        textAnchor="middle"
                        className={`text-[9.5px] font-mono font-bold ${
                          status.risk === 'HIGH' ? 'fill-[#F97316]' : 'fill-[#A7ADB5]'
                        }`}
                      >
                        {status.label}
                      </text>
                    </g>
                  );
                })()}

                {/* Skybridge & Bio-Isolation Pod (East Wing Elevated) */}
                {(() => {
                  const isSelected = selectedZoneId === 'isolation';
                  return (
                    <g
                      className="cursor-pointer transition-opacity hover:opacity-90"
                      onClick={() => setSelectedZoneId('isolation')}
                    >
                      {/* Skybridge connector */}
                      <path
                        d="M 650,270 L 700,245 L 700,265 L 650,290 Z"
                        fill="#0A0E14"
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="1"
                      />
                      {/* Isolation Pod Room */}
                      <path
                        d="M 700,245 L 770,210 L 820,235 L 750,270 Z"
                        fill="#0D1117"
                        stroke="rgba(255, 255, 255, 0.14)"
                        strokeWidth={isSelected ? 1.75 : 1}
                      />
                      <text
                        x="760"
                        y="245"
                        textAnchor="middle"
                        className="text-[8.5px] font-mono font-bold fill-[#A7ADB5] uppercase"
                      >
                        BIO-ISOLATION POD
                      </text>
                    </g>
                  );
                })()}

                {/* ========================================================= */}
                {/* 5. LEVEL 03: INTENSIVE CARE UNIT (ICU) — CENTERPIECE      */}
                {/* ========================================================= */}
                {(() => {
                  const status = getZoneStatus('icu');
                  const isSelected = selectedZoneId === 'icu';
                  const isBreachActive = status.risk === 'CRITICAL';

                  return (
                    <g
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedZoneId('icu')}
                    >
                      {/* Volumetric ambient red floor radiance during breach */}
                      {isBreachActive && (
                        <ellipse
                          cx="450"
                          cy="95"
                          rx="170"
                          ry="65"
                          fill="#EF4444"
                          fillOpacity="0.16"
                          filter="url(#icuBreachRadiation)"
                        />
                      )}

                      {/* Floor Slab Thickness (Level 03 - ICU Apex) */}
                      <path
                        d="M 300,150 L 460,70 L 620,150 L 460,230 Z"
                        fill={status.floorFill}
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <path
                        d="M 300,150 L 300,165 L 460,245 L 460,230 Z"
                        fill="#0A0E14"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      <path
                        d="M 460,230 L 460,245 L 620,165 L 620,150 Z"
                        fill="#07090C"
                        stroke={status.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />

                      {/* Cutaway Wall Facets (Left & Right Exterior Glass Envelopes) */}
                      <path
                        d="M 300,150 L 460,70 L 460,110 L 300,190 Z"
                        fill={status.fill}
                        fillOpacity="0.8"
                        stroke={status.stroke}
                        strokeWidth="1.2"
                      />
                      <path
                        d="M 460,70 L 620,150 L 620,190 L 460,110 Z"
                        fill="#07090C"
                        fillOpacity="0.8"
                        stroke={status.stroke}
                        strokeWidth="1.2"
                      />

                      {/* Individual ICU Bed Bays (8 visible cubicles around perimeter) */}
                      {/* Left perimeter bays */}
                      <line x1="340" y1="130" x2="370" y2="175" stroke={status.stroke} strokeWidth="1" strokeDasharray="1 2" />
                      <line x1="380" y1="110" x2="410" y2="155" stroke={status.stroke} strokeWidth="1" strokeDasharray="1 2" />
                      <line x1="420" y1="90" x2="450" y2="135" stroke={status.stroke} strokeWidth="1" strokeDasharray="1 2" />
                      {/* Right perimeter bays */}
                      <line x1="500" y1="90" x2="470" y2="135" stroke={status.stroke} strokeWidth="1" strokeDasharray="1 2" />
                      <line x1="540" y1="110" x2="510" y2="155" stroke={status.stroke} strokeWidth="1" strokeDasharray="1 2" />
                      <line x1="580" y1="130" x2="550" y2="175" stroke={status.stroke} strokeWidth="1" strokeDasharray="1 2" />

                      {/* Central Nurse Monitoring Core Station */}
                      <ellipse
                        cx="460"
                        cy="150"
                        rx="22"
                        ry="11"
                        fill="#07090C"
                        stroke={status.stroke}
                        strokeWidth="1.5"
                      />

                      {/* Department Label on Roofline */}
                      <text
                        x="460"
                        y="105"
                        textAnchor="middle"
                        className={`text-[12px] font-mono font-black uppercase tracking-widest ${
                          isBreachActive ? 'fill-[#EF4444]' : 'fill-[#F4F3EF]'
                        }`}
                      >
                        INTENSIVE CARE UNIT (LEVEL 03)
                      </text>
                      <text
                        x="460"
                        y="125"
                        textAnchor="middle"
                        className="text-[10px] font-mono font-bold tracking-wider"
                        fill={status.accent}
                      >
                        {status.label}
                      </text>

                      {/* ===================================================== */}
                      {/* APPLE VISION PRO SPATIAL FLOATING LEADER CALLOUT      */}
                      {/* ===================================================== */}
                      <g transform="translate(460, 60)">
                        {/* Spatial Leader Anchor Pin */}
                        <circle cx="0" cy="0" r="3.5" fill={status.accent} stroke="#ffffff" strokeWidth="1.5" />
                        <line x1="0" y1="0" x2="0" y2="-36" stroke={status.accent} strokeWidth="1.2" strokeDasharray="2 2" />

                        {/* Floating Spatial Card */}
                        <g transform="translate(0, -36)">
                          <rect
                            x="-165"
                            y="-44"
                            width="330"
                            height="44"
                            rx="8"
                            fill="#0D1117"
                            stroke={status.stroke}
                            strokeWidth="1.5"
                            className="shadow-2xl"
                          />
                          <text
                            x="0"
                            y="-27"
                            textAnchor="middle"
                            className="text-[9px] font-mono font-bold uppercase tracking-wider fill-[#A7ADB5]"
                          >
                            ICU TRAJECTORY: 82% NOW → 98% DAY 3 → 118% DAY 4 → {isBreachActive ? 'BREACH' : 'STABLE'}
                          </text>
                          <text
                            x="0"
                            y="-12"
                            textAnchor="middle"
                            className={`text-[11px] font-mono font-black uppercase tracking-wider ${
                              isBreachActive ? 'fill-[#EF4444]' : 'fill-[#60A5FA]'
                            }`}
                          >
                            {isBreachActive
                              ? `DEMAND: 59 / 50 BEDS • ${shortageBeds} BEDS MISSING`
                              : `DEMAND: ${forecastData.resources.icu.projectedDemand} / 50 BEDS • ${50 - forecastData.resources.icu.currentCapacity} AVAILABLE`}
                          </text>
                        </g>
                      </g>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Bottom Facility Ticker */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#66707C]">
              <span>Select any department to inspect unit-level bed telemetry</span>
              <span className="text-[#9DF0DA] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Building Architecture Synchronized
              </span>
            </div>
          </div>

          {/* Right Column: DECISION & ACTION INSTRUMENT (4 cols / ~34% width) */}
          <div className="lg:col-span-4 rounded-2xl border border-white/[0.08] bg-[#0D1117] p-6 lg:p-7 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header: Clinical Decision Focus */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isBreach ? 'bg-[#EF4444]' : 'bg-[#60A5FA]'
                    }`}
                  />
                  <span className="text-xs font-mono font-bold text-[#F4F3EF] uppercase tracking-wider">
                    DECISION & ACTION INSTRUMENT
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded border ${
                    isBreach
                      ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                      : 'bg-[#151B23] border-white/[0.1] text-[#A7ADB5]'
                  }`}
                >
                  {isBreach ? 'PROJECTED BREACH' : 'SURPLUS SECURE'}
                </span>
              </div>

              {/* 1. PROJECTED BREACH HORIZON (Dramatic Scale Contrast) */}
              <div className="p-4 rounded-xl bg-[#07090C] border border-white/[0.06] space-y-2">
                <div className="text-[10px] font-mono text-[#66707C] uppercase tracking-wider font-bold">
                  PROJECTED BREACH HORIZON
                </div>
                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums ${
                      isBreach ? 'text-[#EF4444]' : 'text-[#F4F3EF]'
                    }`}
                  >
                    {isBreach ? 'DAY 04 (FRIDAY)' : 'NOMINAL (T+0)'}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#60A5FA]">
                    91% CONFIDENCE
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#A7ADB5] leading-relaxed">
                  {isBreach
                    ? `ICU bed capacity ceiling will be breached in 4 days. Projected shortage: ${shortageBeds} ICU beds.`
                    : 'Facility bed capacity remains within normal operating limits across the current 24-hour horizon.'}
                </p>
              </div>

              {/* 2. CRITICAL RESOURCE STATUS */}
              <div className="space-y-3">
                <div className="text-[10px] font-mono text-[#66707C] uppercase tracking-wider font-bold">
                  CRITICAL RESOURCE AVAILABILITY
                </div>

                {/* Resource A: ICU Beds (50-Bay Matrix) */}
                <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#F4F3EF] font-bold flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-[#60A5FA]" /> ICU BED BAYS
                    </span>
                    <span className={isBreach ? 'text-[#EF4444] font-bold' : 'text-[#A7ADB5]'}>
                      {forecastData.resources.icu.projectedDemand} / 50 BEDS
                    </span>
                  </div>

                  {/* 50 Physical Bed Bays Matrix (5 rows x 10 cols) */}
                  <div className="grid grid-cols-10 gap-1 my-2">
                    {Array.from({ length: 50 }).map((_, idx) => {
                      const isOccupied = idx < forecastData.resources.icu.currentCapacity;
                      const isProjectedOverflow =
                        idx < forecastData.resources.icu.projectedDemand && idx >= 45;
                      return (
                        <div
                          key={`icu-bay-${idx}`}
                          className={`h-2 rounded-xs transition-all ${
                            isProjectedOverflow && isBreach
                              ? 'bg-[#EF4444]'
                              : isOccupied
                              ? 'bg-[#155EEF]'
                              : 'bg-white/[0.08]'
                          }`}
                          title={`ICU Bay #${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#66707C] mt-1">
                    <span>50 Licensed ICU Bays</span>
                    <span className={isBreach ? 'text-[#EF4444] font-bold' : 'text-[#60A5FA]'}>
                      {isBreach ? `+${shortageBeds} BEDS SHORTAGE` : '9 Free Bays'}
                    </span>
                  </div>
                </div>

                {/* Resource B: Ventilators & Cryogenic Oxygen */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-[#66707C] uppercase flex items-center gap-1">
                      <Wind className="w-3 h-3 text-[#60A5FA]" /> VENTILATORS
                    </div>
                    <div className="text-lg font-mono font-bold text-[#F4F3EF] tabular-nums mt-1">
                      {forecastData.resources.ventilators.currentCapacity} / {forecastData.resources.ventilators.totalCapacity}
                    </div>
                    <div className="text-[9px] font-mono text-[#A7ADB5] mt-0.5">
                      {forecastData.resources.ventilators.shortageDelta > 0
                        ? `Shortage: +${forecastData.resources.ventilators.shortageDelta}`
                        : '2 Available'}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-[#66707C] uppercase flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-[#9DF0DA]" /> OXYGEN RESERVE
                    </div>
                    <div className="text-lg font-mono font-bold text-[#F4F3EF] tabular-nums mt-1">
                      {forecastData.resources.oxygen.projectedPercentage}%
                    </div>
                    <div className="text-[9px] font-mono text-[#9DF0DA] mt-0.5">
                      {forecastData.resources.oxygen.daysRemaining.toFixed(1)} Days Runway
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. RECOMMENDED ACTION & TRANSFER ADVISORY */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isBreach
                    ? 'bg-[#181112] border-[#EF4444]/40'
                    : 'bg-[#07090C] border-white/[0.08]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isBreach ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                    }`}
                  />
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7ADB5]">
                      RECOMMENDED ACTION
                    </div>
                    <p className="text-xs font-mono text-[#F4F3EF] mt-1 leading-snug">
                      {isBreach
                        ? `Hamidia Hospital (4.2 km) has 18 ICU beds available. Initiate patient transfer coordination now to avert triage diversion.`
                        : 'Capacity indicators stable. Maintain baseline admission triage routing and reserve allocations.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Coordinate Patient Transfer Button */}
            <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col gap-2.5">
              <button
                onClick={onOpenCoordination}
                className="w-full py-3 px-4 rounded-xl bg-[#155EEF] hover:bg-[#155EEF]/90 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <span>COORDINATE PATIENT TRANSFER ({shortageBeds} PATIENTS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewForecast}
                className="w-full py-2 px-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-white/20 text-[#A7ADB5] hover:text-white font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>VIEW 7-DAY DEMAND FORECAST</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
