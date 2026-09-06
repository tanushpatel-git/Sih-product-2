'use client';

import React, { useState } from 'react';
import { DISEASE_MODELS } from '@/lib/mockData';
import { Network } from 'lucide-react';

export const DiseaseIntelligence: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('covid-19');

  const activeModel =
    DISEASE_MODELS.find((m) => m.id === selectedModelId) || DISEASE_MODELS[0];

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#07090C] p-6 lg:p-10">
      <div className="max-w-[1720px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              <span className="text-xs font-mono tracking-widest text-[#A7ADB5] uppercase font-bold">
                EPIDEMIOLOGICAL SURVEILLANCE & PATHOGEN AGNOSTIC ML
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
              DISEASE INTELLIGENCE ARCHITECTURE
            </h2>
            <p className="text-xs font-mono text-[#A7ADB5] mt-1">
              The forecasting engine abstracts clinical pathogen profiles into mathematical transmission and hospital admission burden vectors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-[#0D1117] text-[#60A5FA] border border-white/[0.08] font-bold uppercase">
              DISEASE-AGNOSTIC ENGINE
            </span>
          </div>
        </div>

        {/* Pathogen Model Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-6">
          {DISEASE_MODELS.map((model) => {
            const isSelected = selectedModelId === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#151B23] border-[#155EEF]/50 text-white ring-1 ring-[#155EEF]/30'
                    : 'bg-[#0D1117] border-white/[0.08] text-[#A7ADB5] hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase ${
                      isSelected ? 'text-[#60A5FA]' : 'text-[#66707C]'
                    }`}
                  >
                    {model.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#A7ADB5]">
                    Rt: {model.rt}
                  </span>
                </div>
                <div className="text-xs font-mono font-black uppercase text-[#F4F3EF] truncate">
                  {model.name}
                </div>
                <div className="text-[10px] font-mono text-[#66707C] truncate mt-0.5">
                  {model.strain}
                </div>
              </button>
            );
          })}

          {/* Custom Outbreak Pipeline Slot */}
          <button
            onClick={() => alert('Custom Pathogen Pipeline: Upload wastewater qPCR or clinical sequencing feed to train custom Bayesian LSTM.')}
            className="p-3.5 rounded-xl border border-dashed border-white/20 bg-[#0D1117]/50 text-left hover:border-white/40 hover:bg-[#11161D] transition-all group"
          >
            <div className="text-[10px] font-mono text-[#66707C] uppercase mb-1">
              PLUG-IN ARCHITECTURE
            </div>
            <div className="text-xs font-mono font-bold text-[#F4F3EF] uppercase">
              + CUSTOM OUTBREAK
            </div>
            <div className="text-[10px] font-mono text-[#66707C] mt-0.5">
              SEIR-LSTM API Import
            </div>
          </button>
        </div>

        {/* Selected Model Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#0D1117] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-[#66707C] uppercase block mb-1">
                  ACTIVE MODEL
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-[#F4F3EF] uppercase truncate block">
                  {activeModel.name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono text-[#60A5FA] font-semibold mt-1 block">
                  STATUS: {activeModel.status.toUpperCase()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0D1117] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-[#66707C] uppercase block mb-1">
                  REGIONAL CASE TREND
                </span>
                <span className="text-2xl font-black font-mono text-[#F97316] tabular-nums block">
                  +{activeModel.caseTrend7dPercent}%
                </span>
                <span className="text-[10px] font-mono text-[#66707C] mt-1 block">
                  7-Day Velocity
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0D1117] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-[#66707C] uppercase block mb-1">
                  TRANSMISSION TREND
                </span>
                <span className="text-xl font-black font-mono text-[#F4F3EF] uppercase block">
                  {activeModel.transmissionTrend}
                </span>
                <span className="text-[10px] font-mono text-[#60A5FA] font-semibold mt-1 block">
                  Rt = {activeModel.rt}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0D1117] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-[#66707C] uppercase block mb-1">
                  FORECAST HORIZON
                </span>
                <span className="text-2xl font-black font-mono text-[#F4F3EF] tabular-nums block">
                  {activeModel.forecastHorizonDays} DAYS
                </span>
                <span className="text-[10px] font-mono text-[#66707C] mt-1 block">
                  Autoregressive
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1117] border border-white/[0.08]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#66707C] font-bold mb-1">
                EPIDEMIOLOGICAL INFERENCE MECHANISM
              </div>
              <p className="text-xs font-mono text-[#A7ADB5] leading-relaxed">
                {activeModel.description}
              </p>
            </div>
          </div>

          {/* Right: Pipeline Architecture */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-[#0D1117] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4F3EF] mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-[#60A5FA]" />
                FORECASTING PIPELINE
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-[#07090C] border border-white/[0.06] flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151B23] flex items-center justify-center text-[10px] font-bold text-[#60A5FA]">
                    1
                  </div>
                  <div>
                    <div className="text-[#F4F3EF] font-bold">Surveillance Intake</div>
                    <div className="text-[10px] text-[#66707C]">Wastewater & Outpatient Clinics</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#07090C] border border-white/[0.06] flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151B23] flex items-center justify-center text-[10px] font-bold text-[#60A5FA]">
                    2
                  </div>
                  <div>
                    <div className="text-[#F4F3EF] font-bold">Bayesian Neural Network</div>
                    <div className="text-[10px] text-[#66707C]">Monte Carlo 95% Confidence Bounds</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#07090C] border border-white/[0.06] flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#151B23] flex items-center justify-center text-[10px] font-bold text-[#60A5FA]">
                    3
                  </div>
                  <div>
                    <div className="text-[#F4F3EF] font-bold">Bed Conversion Matrix</div>
                    <div className="text-[10px] text-[#66707C]">
                      Admission Rate: {activeModel.hospitalAdmissionRate}% | ICU: {activeModel.icuAdmissionRate}%
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#181112] border border-[#EF4444]/30 flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#EF4444] text-white flex items-center justify-center text-[10px] font-bold">
                    4
                  </div>
                  <div>
                    <div className="text-[#EF4444] font-bold">Early Breach Warning</div>
                    <div className="text-[10px] text-[#66707C]">4-Day Advance Alert Trigger</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] mt-4 text-[10px] font-mono text-[#66707C] flex justify-between">
              <span>Calibration State: Real-Time</span>
              <span className="text-[#60A5FA]">v2.8 Model Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
