"use client";

import React from "react";
import {
  KidneyDiseaseInputs,
  KidneyDiseasePredictionResult,
  KIDNEY_DISEASE_PRESETS,
} from "./kidney-disease-inference";

interface KidneyInputFormProps {
  inputs: KidneyDiseaseInputs;
  onChange: (inputs: KidneyDiseaseInputs) => void;
  selectedPresetKey: string;
  onPresetSelect: (key: string) => void;
  liveResult: KidneyDiseasePredictionResult;
  onRunAssessment: () => void;
  onClose: () => void;
}

function NumericField({
  label,
  unit,
  value,
  step,
  onChange,
}: {
  label: string;
  unit?: string;
  value: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1 gap-2">
        <label className="text-[10px] font-semibold text-slate-700">{label}</label>
        <span className="text-[11px] font-mono font-bold text-slate-800 shrink-0">
          {value}
          {unit ? <span className="text-[9px] text-slate-400 font-normal ml-0.5">{unit}</span> : null}
        </span>
      </div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-2 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-500"
      />
    </div>
  );
}

function BinaryToggle({
  label,
  hint,
  value,
  offLabel,
  onLabel,
  onChange,
}: {
  label: string;
  hint?: string;
  value: 0 | 1;
  offLabel: string;
  onLabel: string;
  onChange: (v: 0 | 1) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <div className="min-w-0">
        <label className="text-[10px] font-semibold text-slate-700 block">{label}</label>
        {hint ? <span className="text-[9px] text-slate-400">{hint}</span> : null}
      </div>
      <div className="flex rounded border border-slate-200 overflow-hidden shrink-0">
        <button
          type="button"
          onClick={() => onChange(0)}
          className={`px-2 py-0.5 text-[10px] font-medium cursor-pointer ${
            value === 0 ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {offLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(1)}
          className={`px-2 py-0.5 text-[10px] font-medium cursor-pointer ${
            value === 1 ? "bg-teal-700 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {onLabel}
        </button>
      </div>
    </div>
  );
}

export default function KidneyInputForm({
  inputs,
  onChange,
  selectedPresetKey,
  onPresetSelect,
  liveResult,
  onRunAssessment,
  onClose,
}: KidneyInputFormProps) {
  const patch = (partial: Partial<KidneyDiseaseInputs>) => onChange({ ...inputs, ...partial });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-800">
              Kidney Disease Assessment — Clinical Inputs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Clinical Input Telemetry</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 bg-slate-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter the renal and systemic biomarkers used by the existing kidney assessment. Values stay on this
                device during input.
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
              {Object.entries(KIDNEY_DISEASE_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => onPresetSelect(key)}
                  className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                    selectedPresetKey === key
                      ? "bg-slate-900 text-white font-medium"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {preset.label.split(":")[0]}
                </button>
              ))}
            </div>
          </div>

          {selectedPresetKey && KIDNEY_DISEASE_PRESETS[selectedPresetKey] && (
          <div className="mb-4 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">
              {KIDNEY_DISEASE_PRESETS[selectedPresetKey].label}
            </span>
            <span className="ml-2 text-slate-500">
              — {KIDNEY_DISEASE_PRESETS[selectedPresetKey].description}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-100 pb-2">
              Demographics & Vitals
            </h4>
            <NumericField label="Age" unit="years" value={inputs.age} step={1} onChange={(n) => patch({ age: n })} />
            <BinaryToggle
              label="Gender"
              hint="0 = Male, 1 = Female"
              value={inputs.gender}
              offLabel="Male (0)"
              onLabel="Female (1)"
              onChange={(v) => patch({ gender: v })}
            />
            <NumericField label="BMI" unit="kg/m²" value={inputs.bmi} step={0.1} onChange={(n) => patch({ bmi: n })} />
            <NumericField label="Systolic BP" unit="mmHg" value={inputs.systolic_bp} step={1} onChange={(n) => patch({ systolic_bp: n })} />
            <NumericField label="Diastolic BP" unit="mmHg" value={inputs.diastolic_bp} step={1} onChange={(n) => patch({ diastolic_bp: n })} />
            <NumericField label="Heart Rate" unit="bpm" value={inputs.heart_rate} step={1} onChange={(n) => patch({ heart_rate: n })} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-teal-200/70 shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-800 border-b border-slate-100 pb-2">
              Renal Function
            </h4>
            <NumericField label="eGFR" unit="mL/min/1.73m²" value={inputs.egfr} step={1} onChange={(n) => patch({ egfr: n })} />
            <NumericField label="Serum Creatinine" unit="mg/dL" value={inputs.serum_creatinine} step={0.1} onChange={(n) => patch({ serum_creatinine: n })} />
            <NumericField label="Blood Urea Nitrogen" unit="mg/dL" value={inputs.blood_urea_nitrogen} step={1} onChange={(n) => patch({ blood_urea_nitrogen: n })} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-100 pb-2">
              Urine Markers
            </h4>
            <NumericField label="Urine Albumin" unit="mg/L" value={inputs.urine_albumin} step={1} onChange={(n) => patch({ urine_albumin: n })} />
            <NumericField label="Urine Protein" unit="mg/dL" value={inputs.urine_protein} step={0.1} onChange={(n) => patch({ urine_protein: n })} />
            <NumericField label="Albumin-Creatinine Ratio" unit="mg/g" value={inputs.albumin_creatinine_ratio} step={1} onChange={(n) => patch({ albumin_creatinine_ratio: n })} />
            <NumericField label="Urine Specific Gravity" value={inputs.urine_specific_gravity} step={0.001} onChange={(n) => patch({ urine_specific_gravity: n })} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-100 pb-2">
              Electrolytes
            </h4>
            <NumericField label="Sodium" unit="mEq/L" value={inputs.sodium} step={1} onChange={(n) => patch({ sodium: n })} />
            <NumericField label="Potassium" unit="mEq/L" value={inputs.potassium} step={0.1} onChange={(n) => patch({ potassium: n })} />
            <NumericField label="Calcium" unit="mg/dL" value={inputs.calcium} step={0.1} onChange={(n) => patch({ calcium: n })} />
            <NumericField label="Phosphorus" unit="mg/dL" value={inputs.phosphorus} step={0.1} onChange={(n) => patch({ phosphorus: n })} />
            <NumericField label="Chloride" unit="mEq/L" value={inputs.chloride} step={1} onChange={(n) => patch({ chloride: n })} />
            <NumericField label="Bicarbonate" unit="mEq/L" value={inputs.bicarbonate} step={1} onChange={(n) => patch({ bicarbonate: n })} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-100 pb-2">
              Hematology
            </h4>
            <NumericField label="Hemoglobin" unit="g/dL" value={inputs.hemoglobin} step={0.1} onChange={(n) => patch({ hemoglobin: n })} />
            <NumericField label="RBC Count" unit="M/µL" value={inputs.rbc_count} step={0.1} onChange={(n) => patch({ rbc_count: n })} />
            <NumericField label="WBC Count" unit="/µL" value={inputs.wbc_count} step={100} onChange={(n) => patch({ wbc_count: n })} />
            <NumericField label="Platelet Count" unit="/µL" value={inputs.platelet_count} step={1000} onChange={(n) => patch({ platelet_count: n })} />
            <NumericField label="Packed Cell Volume" unit="%" value={inputs.packed_cell_volume} step={1} onChange={(n) => patch({ packed_cell_volume: n })} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-100 pb-2">
              Metabolic
            </h4>
            <NumericField label="Random Blood Glucose" unit="mg/dL" value={inputs.blood_glucose_random} step={1} onChange={(n) => patch({ blood_glucose_random: n })} />
            <NumericField label="Fasting Glucose" unit="mg/dL" value={inputs.fasting_glucose} step={1} onChange={(n) => patch({ fasting_glucose: n })} />
            <NumericField label="HbA1c" unit="%" value={inputs.hba1c} step={0.1} onChange={(n) => patch({ hba1c: n })} />
            <NumericField label="Cholesterol" unit="mg/dL" value={inputs.cholesterol} step={1} onChange={(n) => patch({ cholesterol: n })} />
            <NumericField label="Triglycerides" unit="mg/dL" value={inputs.triglycerides} step={1} onChange={(n) => patch({ triglycerides: n })} />
            <NumericField label="Serum Albumin" unit="g/dL" value={inputs.serum_albumin} step={0.1} onChange={(n) => patch({ serum_albumin: n })} />
            <NumericField label="Total Protein" unit="g/dL" value={inputs.total_protein} step={0.1} onChange={(n) => patch({ total_protein: n })} />
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3 lg:col-span-2 xl:col-span-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 border-b border-slate-100 pb-2">
              Risk Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <BinaryToggle
                label="Diabetes"
                value={inputs.diabetes}
                offLabel="No (0)"
                onLabel="Yes (1)"
                onChange={(v) => patch({ diabetes: v })}
              />
              <BinaryToggle
                label="Hypertension"
                value={inputs.hypertension}
                offLabel="No (0)"
                onLabel="Yes (1)"
                onChange={(v) => patch({ hypertension: v })}
              />
              <BinaryToggle
                label="Smoking Status"
                value={inputs.smoking_status}
                offLabel="No (0)"
                onLabel="Yes (1)"
                onChange={(v) => patch({ smoking_status: v })}
              />
              <BinaryToggle
                label="Family History of Kidney Disease"
                value={inputs.family_history_kidney}
                offLabel="No (0)"
                onLabel="Yes (1)"
                onChange={(v) => patch({ family_history_kidney: v })}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${
                liveResult.stageIndex >= 2 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
              }`}
            >
              Live: {liveResult.predictionClass}
            </span>
            <span className="text-xs font-mono text-slate-700 font-semibold">
              {liveResult.probabilityPercent}% output probability
            </span>
            <span className="text-[11px] text-slate-500">
              Risk score {liveResult.riskScore} · {liveResult.ckdRiskLevel}
            </span>
          </div>
          <button
            onClick={onRunAssessment}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>↻ Run Kidney Assessment</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
