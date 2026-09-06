'use client';

import React, { useState } from 'react';
import { DISEASE_MODELS } from '../../../../lib/mockData';
import { DiseaseModelConfig } from '../../../../lib/types';
import { Dna, Activity, TrendingUp, Cpu, Network, CheckCircle2, ArrowRight } from 'lucide-react';

export const DiseaseIntelligence: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('covid-19');

  const activeModel =
    DISEASE_MODELS.find((m) => m.id === selectedModelId) || DISEASE_MODELS[0];

  return (
    <section className="w-full border-b border-white/[0.08] bg-[#080909] p-4 lg:p-8">
      <div className="max-w-[1720px] mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D3FD50]" />
              <span className="text-xs font-mono tracking-widest text-[#D3FD50] uppercase font-bold">
                EPIDEMIOLOGICAL SURVEILLANCE & PATHOGEN AGNOSTIC ML
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black font-mono tracking-tight text-white uppercase">
              DISEASE INTELLIGENCE ARCHITECTURE
            </h2>
            <p className="text-xs font-mono text-white/50">
              The forecasting engine abstracts clinical pathogen profiles into mathematical transmission and hospital admission burden vectors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-[#D3FD50]/15 text-[#D3FD50] border border-[#D3FD50]/30 font-bold uppercase">
              DISEASE-AGNOSTIC ENGINE
            </span>
          </div>
        </div>

        {/* Pathogen Model Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 mb-6">
          {DISEASE_MODELS.map((model) => {
            const isSelected = selectedModelId === model.id;
            return (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`p-3 rounded-xl border text-left transition-all ${isSelected
                    ? 'bg-[#15181b] border-[#D3FD50] text-white ring-1 ring-[#D3FD50]/30'
                    : 'bg-[#0c0e10] border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-[#D3FD50]' : 'text-white/40'
                      }`}
                  >
                    {model.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white/70">
                    Rt: {model.rt}
                  </span>
                </div>
                <div className="text-xs font-mono font-black uppercase text-white truncate">
                  {model.name}
                </div>
                <div className="text-[10px] font-mono text-white/40 truncate mt-0.5">
                  {model.strain}
                </div>
              </button>
            );
          })}

          {/* Custom Outbreak Pipeline Slot */}
          <button
            onClick={() => alert('Custom Pathogen Pipeline: Upload wastewater qPCR or clinical PCR sequencing feed to train custom Bayesian LSTM.')}
            className="p-3 rounded-xl border border-dashed border-white/20 bg-[#0c0e10]/40 text-left hover:border-[#D3FD50]/50 hover:bg-[#15181b] transition-all group"
          >
            <div className="text-[10px] font-mono text-white/40 uppercase mb-1">
              PLUG-IN ARCHITECTURE
            </div>
            <div className="text-xs font-mono font-bold text-white/80 group-hover:text-[#D3FD50] uppercase">
              + CUSTOM OUTBREAK
            </div>
            <div className="text-[10px] font-mono text-white/40 mt-0.5">
              SEIR-LSTM API Import
            </div>
          </button>
        </div>

        {/* Selected Model Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 4 Metric Cards for Active Disease */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-[#0c0e11] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                  ACTIVE MODEL
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-white uppercase truncate block">
                  {activeModel.name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono text-[#D3FD50] font-semibold mt-1 block">
                  STATUS: {activeModel.status.toUpperCase()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e11] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                  REGIONAL CASE TREND
                </span>
                <span className="text-2xl font-black font-mono text-[#F97316] tabular-nums block">
                  +{activeModel.caseTrend7dPercent}%
                </span>
                <span className="text-[10px] font-mono text-white/40 mt-1 block">
                  7-Day Velocity
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e11] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                  TRANSMISSION TREND
                </span>
                <span className="text-xl font-black font-mono text-white uppercase block">
                  {activeModel.transmissionTrend}
                </span>
                <span className="text-[10px] font-mono text-[#D3FD50] font-semibold mt-1 block">
                  Rt = {activeModel.rt}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0c0e11] border border-white/[0.08]">
                <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                  FORECAST HORIZON
                </span>
                <span className="text-2xl font-black font-mono text-[#D3FD50] tabular-nums block">
                  {activeModel.forecastHorizonDays} DAYS
                </span>
                <span className="text-[10px] font-mono text-white/40 mt-1 block">
                  Autoregressive
                </span>
              </div>
            </div>

            {/* Model Mathematical Description */}
            <div className="p-4 rounded-xl bg-[#0c0e11] border border-white/[0.08]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-bold mb-1">
                EPIDEMIOLOGICAL INFERENCE MECHANISM
              </div>
              <p className="text-xs font-mono text-white/80 leading-relaxed">
                {activeModel.description}
              </p>
            </div>
          </div>

          {/* Right: Pathogen-to-Hospital Pipeline Architecture Graphic */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-[#0c0e11] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                <Network className="w-4 h-4 text-[#D3FD50]" />
                FORECASTING PIPELINE
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-[#D3FD50]">
                    1
                  </div>
                  <div>
                    <div className="text-white font-bold">Surveillance Intake</div>
                    <div className="text-[10px] text-white/40">Wastewater & Outpatient Clinics</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-[#D3FD50]">
                    2
                  </div>
                  <div>
                    <div className="text-white font-bold">Bayesian Neural Network</div>
                    <div className="text-[10px] text-white/40">Monte Carlo 95% Confidence Bounds</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-[#D3FD50]">
                    3
                  </div>
                  <div>
                    <div className="text-white font-bold">Bed Conversion Matrix</div>
                    <div className="text-[10px] text-white/40">
                      Admission Rate: {activeModel.hospitalAdmissionRate}% | ICU: {activeModel.icuAdmissionRate}%
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-[#EF4444] text-black flex items-center justify-center text-[10px] font-bold">
                    4
                  </div>
                  <div>
                    <div className="text-[#EF4444] font-bold">Early Breach Mitigation</div>
                    <div className="text-[10px] text-white/50">4-Day Advance Alert Trigger</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] mt-4 text-[10px] font-mono text-white/40 flex justify-between">
              <span>Calibration State: Real-Time</span>
              <span className="text-[#D3FD50]">v2.8 Model Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
