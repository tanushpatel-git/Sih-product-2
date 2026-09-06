'use client';

import React, { useState, useMemo } from 'react';
import { TimelineDayId } from '@/lib/types';
import { HISTORICAL_PATIENT_DATA, TIMELINE_KEYS, TIMELINE_FORECAST_MAP } from '@/lib/mockData';

interface ForecastChartProps {
  selectedDay: TimelineDayId;
  onSelectDay: (day: TimelineDayId) => void;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  selectedDay,
  onSelectDay,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 1000;
  const height = 340;
  const padding = { top: 35, right: 40, bottom: 45, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minVal = 320;
  const maxVal = 580;
  const capacityThreshold = 500;

  const getY = (val: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return innerHeight - ((clamped - minVal) / (maxVal - minVal)) * innerHeight + padding.top;
  };

  const histCount = HISTORICAL_PATIENT_DATA.length;
  const forecastCount = TIMELINE_KEYS.length;
  const totalPoints = histCount + forecastCount - 1;

  const getX = (index: number) => {
    return padding.left + (index / totalPoints) * innerWidth;
  };

  const historicalCoords = useMemo(() => {
    return HISTORICAL_PATIENT_DATA.map((d, i) => ({
      x: getX(i),
      y: getY(d.admissions),
      admissions: d.admissions,
      date: d.date,
      occupancy: d.occupancyPercent,
    }));
  }, [histCount, innerWidth]);

  const forecastCoords = useMemo(() => {
    return TIMELINE_KEYS.map((key, i) => {
      const point = TIMELINE_FORECAST_MAP[key];
      const globalIndex = histCount - 1 + i;
      return {
        key,
        x: getX(globalIndex),
        y: getY(point.totalAdmittedPatients),
        yLower: getY(point.confidenceInterval.lowerBound),
        yUpper: getY(point.confidenceInterval.upperBound),
        data: point,
      };
    });
  }, [histCount, innerWidth]);

  const histPathD = useMemo(() => {
    return historicalCoords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [historicalCoords]);

  const forecastPathD = useMemo(() => {
    return forecastCoords.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [forecastCoords]);

  const confidenceBandD = useMemo(() => {
    if (forecastCoords.length === 0) return '';
    const topForward = forecastCoords.map((pt) => `${pt.x},${pt.yUpper}`).join(' ');
    const bottomBackward = [...forecastCoords].reverse().map((pt) => `${pt.x},${pt.yLower}`).join(' ');
    return `M ${forecastCoords[0].x},${forecastCoords[0].yUpper} ${topForward} L ${bottomBackward} Z`;
  }, [forecastCoords]);

  const thresholdY = getY(capacityThreshold);
  const selectedIndex = TIMELINE_KEYS.indexOf(selectedDay);
  const selectedX = getX(histCount - 1 + selectedIndex);
  const breachPoint = forecastCoords.find((pt) => pt.key === 'FRI') || forecastCoords[5];

  const activePoint = hoverIndex !== null && hoverIndex >= histCount - 1
    ? forecastCoords[hoverIndex - (histCount - 1)]
    : null;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {/* Soft translucent blue/cyan confidence band */}
          <linearGradient id="forecastConfidenceBand" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#155EEF" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#9DDFF2" stopOpacity="0.02" />
          </linearGradient>

          {/* ML Forecast line: Cobalt #155EEF to breach red */}
          <linearGradient id="cobaltForecastLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#155EEF" />
            <stop offset="60%" stopColor="#60A5FA" />
            <stop offset="78%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines & Y-Axis Labels */}
        {[350, 400, 450, 500, 550].map((level) => {
          const yPos = getY(level);
          const isThreshold = level === 500;
          return (
            <g key={level}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={width - padding.right}
                y2={yPos}
                stroke={isThreshold ? '#EF4444' : 'rgba(255, 255, 255, 0.05)'}
                strokeWidth={isThreshold ? 1.5 : 1}
                strokeDasharray={isThreshold ? '4 4' : '2 4'}
              />
              <text
                x={padding.left - 10}
                y={yPos + 3.5}
                textAnchor="end"
                className={`text-[10px] font-mono tabular-nums ${
                  isThreshold ? 'fill-[#EF4444] font-bold' : 'fill-[#66707C]'
                }`}
              >
                {level}
              </text>
            </g>
          );
        })}

        {/* Capacity Threshold Label Bar */}
        <g>
          <rect
            x={width - padding.right - 220}
            y={thresholdY - 18}
            width="220"
            height="16"
            fill="#EF4444"
            fillOpacity="0.12"
            stroke="#EF4444"
            strokeWidth="0.8"
            rx="3"
          />
          <text
            x={width - padding.right - 10}
            y={thresholdY - 6}
            textAnchor="end"
            className="text-[9px] font-mono font-bold fill-[#EF4444] uppercase tracking-wider"
          >
            MAX CAPACITY LIMIT: 500 BEDS
          </text>
        </g>

        {/* Vertical Separator: Historic Actuals vs 7-Day ML Forecast */}
        <line
          x1={getX(histCount - 1)}
          y1={padding.top}
          x2={getX(histCount - 1)}
          y2={height - padding.bottom}
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={getX(histCount - 1) - 8}
          y={padding.top - 8}
          textAnchor="end"
          className="text-[9px] font-mono uppercase fill-[#66707C] tracking-wider font-semibold"
        >
          ← HISTORICAL ACTUAL
        </text>
        <text
          x={getX(histCount - 1) + 8}
          y={padding.top - 8}
          textAnchor="start"
          className="text-[9px] font-mono uppercase fill-[#60A5FA] font-bold tracking-wider"
        >
          7-DAY ML FORECAST →
        </text>

        {/* Soft Translucent Blue/Cyan Confidence Band */}
        <path d={confidenceBandD} fill="url(#forecastConfidenceBand)" />

        {/* Prediction Boundaries (#60A5FA thin dashed lines) */}
        {forecastCoords.map((pt, i) => {
          if (i === 0) return null;
          const prev = forecastCoords[i - 1];
          return (
            <g key={`bound-${i}`}>
              <line
                x1={prev.x}
                y1={prev.yUpper}
                x2={pt.x}
                y2={pt.yUpper}
                stroke="#60A5FA"
                strokeWidth={0.8}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
              <line
                x1={prev.x}
                y1={prev.yLower}
                x2={pt.x}
                y2={pt.yLower}
                stroke="#60A5FA"
                strokeWidth={0.8}
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
            </g>
          );
        })}

        {/* Historical Actual Line (neutral gray #717882) */}
        <path
          d={histPathD}
          fill="none"
          stroke="#66707C"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Historical Data Dots */}
        {historicalCoords.map((pt, i) => (
          <circle
            key={`hist-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={2}
            className="fill-[#A7ADB5]"
          />
        ))}

        {/* ML Forecast Line (Cobalt #155EEF gradient) */}
        <path
          d={forecastPathD}
          fill="none"
          stroke="url(#cobaltForecastLine)"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Forecast Data Dots & Interactive Hit Areas */}
        {forecastCoords.map((pt, i) => {
          const isCurrentSelected = pt.key === selectedDay;
          const isBreached = pt.data.isBreach;
          return (
            <g
              key={`fc-${i}`}
              className="cursor-pointer"
              onClick={() => onSelectDay(pt.key)}
              onMouseEnter={() => setHoverIndex(histCount - 1 + i)}
            >
              <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />

              {/* Point Indicator Ring */}
              {isCurrentSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={8}
                  fill="none"
                  stroke={isBreached ? '#EF4444' : '#60A5FA'}
                  strokeWidth={1.5}
                />
              )}

              <circle
                cx={pt.x}
                cy={pt.y}
                r={isCurrentSelected ? 4 : 3}
                fill={isBreached ? '#EF4444' : i === 0 ? '#D3FD50' : '#60A5FA'}
                stroke="#07090C"
                strokeWidth={1.5}
              />
            </g>
          );
        })}

        {/* Selected Day Vertical Marker */}
        <line
          x1={selectedX}
          y1={padding.top - 5}
          x2={selectedX}
          y2={height - padding.bottom}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />

        {/* Capacity Breach Marker on Friday */}
        {breachPoint && (
          <g className="cursor-pointer" onClick={() => onSelectDay('FRI')}>
            <circle
              cx={breachPoint.x}
              cy={thresholdY}
              r={12}
              fill="#EF4444"
              fillOpacity={0.2}
            />
            <circle
              cx={breachPoint.x}
              cy={thresholdY}
              r={4.5}
              fill="#EF4444"
              stroke="#ffffff"
              strokeWidth={1.5}
            />

            <line
              x1={breachPoint.x}
              y1={thresholdY}
              x2={breachPoint.x}
              y2={thresholdY - 45}
              stroke="#EF4444"
              strokeWidth={1.2}
            />

            <g transform={`translate(${breachPoint.x - 70}, ${thresholdY - 72})`}>
              <rect
                x="0"
                y="0"
                width="140"
                height="32"
                rx="6"
                fill="#151B23"
                stroke="#EF4444"
                strokeWidth="1.2"
              />
              <text
                x="70"
                y="13"
                textAnchor="middle"
                className="text-[9px] font-mono font-black fill-[#EF4444] uppercase tracking-wider"
              >
                CAPACITY BREACH
              </text>
              <text
                x="70"
                y="24"
                textAnchor="middle"
                className="text-[8px] font-mono font-bold fill-[#F4F3EF] uppercase"
              >
                4 DAYS • +9 ICU SHORTAGE
              </text>
            </g>
          </g>
        )}

        {/* X-Axis Labels */}
        {historicalCoords.map((pt, i) => {
          if (i % 3 !== 0) return null;
          return (
            <text
              key={`x-hist-${i}`}
              x={pt.x}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              className="text-[9px] font-mono fill-[#66707C]"
            >
              {pt.date}
            </text>
          );
        })}

        {forecastCoords.map((pt) => {
          const isSelected = pt.key === selectedDay;
          const isBreachDay = pt.data.isBreach;
          return (
            <g
              key={`x-fc-${pt.key}`}
              className="cursor-pointer"
              onClick={() => onSelectDay(pt.key)}
            >
              <text
                x={pt.x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isSelected
                    ? isBreachDay
                      ? 'fill-[#EF4444]'
                      : 'fill-[#F4F3EF]'
                    : isBreachDay
                    ? 'fill-[#EF4444]/70'
                    : 'fill-[#A7ADB5]'
                }`}
              >
                {pt.key}
              </text>
              <text
                x={pt.x}
                y={height - padding.bottom + 30}
                textAnchor="middle"
                className="text-[8px] font-mono fill-[#66707C] uppercase"
              >
                {pt.key === 'NOW' ? 'Today' : `T+${pt.data.dayOffset}`}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Card */}
      {activePoint && (
        <div
          className="absolute pointer-events-none z-30 p-3 rounded-xl bg-[#151B23] border border-white/20 shadow-2xl text-xs font-mono"
          style={{
            left: `${Math.min(85, Math.max(10, (activePoint.x / width) * 100))}%`,
            top: '12%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-white/[0.08] mb-1.5">
            <span className="text-[#F4F3EF] font-bold">{activePoint.data.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                activePoint.data.isBreach
                  ? 'bg-[#EF4444]/20 text-[#EF4444]'
                  : 'bg-[#16434A] text-[#9DF0DA]'
              }`}
            >
              {activePoint.data.isBreach ? 'BREACH PREDICTED' : 'NOMINAL'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div className="text-[#A7ADB5]">Demand:</div>
            <div className="text-right text-[#F4F3EF] font-bold tabular-nums">
              {activePoint.data.totalAdmittedPatients} / 500
            </div>
            <div className="text-[#A7ADB5]">95% CI:</div>
            <div className="text-right text-[#60A5FA] tabular-nums">
              [{activePoint.data.confidenceInterval.lowerBound} – {activePoint.data.confidenceInterval.upperBound}]
            </div>
            <div className="text-[#A7ADB5]">ICU Burden:</div>
            <div
              className={`text-right font-bold tabular-nums ${
                activePoint.data.resources.icu.shortageDelta > 0
                  ? 'text-[#EF4444]'
                  : 'text-[#F4F3EF]'
              }`}
            >
              {activePoint.data.resources.icu.projectedDemand} / 50 Beds
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
