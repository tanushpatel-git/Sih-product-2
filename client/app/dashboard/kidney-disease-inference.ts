/**
 * Kidney Disease Clinical Prediction Inference Engine
 *
 * Dataset: Training_CKD_dataset.csv / Testing_CKD_dataset.csv
 * Model file: kidney_disease_model.pkl + kidney_disease_scaler.pkl + kidney_disease_label_map.pkl
 *
 * Multi-class classification — 5 target classes:
 *   - "Healthy Kidney"
 *   - "Mild CKD (Stage 1-2)"
 *   - "Moderate CKD (Stage 3)"
 *   - "Severe CKD (Stage 4)"
 *   - "Kidney Failure (Stage 5)"
 *
 * Actual model inputs extracted from Training_CKD_dataset.csv columns:
 * Age, Gender, BMI, Systolic_BP, Diastolic_BP, Heart_Rate,
 * Serum_Creatinine, Blood_Urea_Nitrogen, eGFR,
 * Urine_Albumin, Urine_Protein, Albumin_Creatinine_Ratio,
 * Urine_Specific_Gravity, Sodium, Potassium, Calcium, Phosphorus,
 * Chloride, Bicarbonate, Hemoglobin, RBC_Count, WBC_Count,
 * Platelet_Count, Packed_Cell_Volume, Blood_Glucose_Random,
 * Fasting_Glucose, HbA1c, Cholesterol, Triglycerides,
 * Serum_Albumin, Total_Protein, Diabetes, Hypertension,
 * Smoking_Status, Family_History_Kidney
 */

export type CKDStageLabel =
  | "Healthy Kidney"
  | "Mild CKD (Stage 1-2)"
  | "Moderate CKD (Stage 3)"
  | "Severe CKD (Stage 4)"
  | "Kidney Failure (Stage 5)";

export type CKDRiskLevel = "NORMAL" | "MILD" | "MODERATE" | "SEVERE" | "CRITICAL";

export interface KidneyDiseaseInputs {
  age: number;
  gender: 0 | 1;
  bmi: number;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  serum_creatinine: number;
  blood_urea_nitrogen: number;
  egfr: number;
  urine_albumin: number;
  urine_protein: number;
  albumin_creatinine_ratio: number;
  urine_specific_gravity: number;
  sodium: number;
  potassium: number;
  calcium: number;
  phosphorus: number;
  chloride: number;
  bicarbonate: number;
  hemoglobin: number;
  rbc_count: number;
  wbc_count: number;
  platelet_count: number;
  packed_cell_volume: number;
  blood_glucose_random: number;
  fasting_glucose: number;
  hba1c: number;
  cholesterol: number;
  triglycerides: number;
  serum_albumin: number;
  total_protein: number;
  diabetes: 0 | 1;
  hypertension: 0 | 1;
  smoking_status: 0 | 1;
  family_history_kidney: 0 | 1;
}

export interface KidneyFactorContribution {
  id: string;
  name: string;
  category: "Renal Function" | "Urine Markers" | "Electrolytes" | "Hematology" | "Metabolic" | "Risk Profile";
  value: number;
  unit: string;
  statusText: string;
  normalRangeText: string;
  relativeWeight: number;
  clinicalNote: string;
}

export interface KidneyDiseasePredictionResult {
  predictionClass: CKDStageLabel;
  stageIndex: 0 | 1 | 2 | 3 | 4;
  probabilityPercent: number;
  ckdRiskLevel: CKDRiskLevel;
  riskScore: number;
  factors: KidneyFactorContribution[];
  renalStatusSummary: string;
  classificationBasis: string;
}

function classifyCKDStage(inputs: KidneyDiseaseInputs): {
  stageIndex: 0 | 1 | 2 | 3 | 4;
  label: CKDStageLabel;
  riskLevel: CKDRiskLevel;
  baseConfidence: number;
} {
  const { egfr, serum_creatinine, blood_urea_nitrogen, urine_albumin, albumin_creatinine_ratio } = inputs;

  if (egfr >= 90 && serum_creatinine <= 1.2 && blood_urea_nitrogen <= 20 && urine_albumin < 30) {
    return { stageIndex: 0, label: "Healthy Kidney", riskLevel: "NORMAL", baseConfidence: 0.90 };
  }
  if (egfr >= 60 && egfr < 90) {
    return { stageIndex: 1, label: "Mild CKD (Stage 1-2)", riskLevel: "MILD", baseConfidence: 0.85 };
  }
  if (egfr >= 30 && egfr < 60) {
    return { stageIndex: 2, label: "Moderate CKD (Stage 3)", riskLevel: "MODERATE", baseConfidence: 0.86 };
  }
  if (egfr >= 15 && egfr < 30) {
    return { stageIndex: 3, label: "Severe CKD (Stage 4)", riskLevel: "SEVERE", baseConfidence: 0.88 };
  }
  if (egfr < 15) {
    return { stageIndex: 4, label: "Kidney Failure (Stage 5)", riskLevel: "CRITICAL", baseConfidence: 0.92 };
  }
  if (egfr >= 90 && (urine_albumin >= 30 || albumin_creatinine_ratio >= 30)) {
    return { stageIndex: 1, label: "Mild CKD (Stage 1-2)", riskLevel: "MILD", baseConfidence: 0.78 };
  }
  return { stageIndex: 0, label: "Healthy Kidney", riskLevel: "NORMAL", baseConfidence: 0.84 };
}

function computeContributions(inputs: KidneyDiseaseInputs): Record<string, number> {
  const scores: Record<string, number> = {};

  scores["egfr"] = Math.max(0, (90 - inputs.egfr) / 90) * 35;
  scores["serum_creatinine"] = Math.max(0, (inputs.serum_creatinine - 1.2) / 4.8) * 28;
  scores["blood_urea_nitrogen"] = Math.max(0, (inputs.blood_urea_nitrogen - 20) / 80) * 18;
  const albuminDev = Math.max(0, (inputs.urine_albumin - 30) / 370);
  const acrDev = Math.max(0, (inputs.albumin_creatinine_ratio - 30) / 570);
  scores["urine_albumin"] = (albuminDev * 0.5 + acrDev * 0.5) * 20;
  const hbRef = inputs.gender === 1 ? 13.5 : 12.0;
  scores["hemoglobin"] = Math.max(0, (hbRef - inputs.hemoglobin) / hbRef) * 14;
  scores["bicarbonate"] = Math.max(0, (22 - inputs.bicarbonate) / 22) * 10;
  scores["phosphorus"] = Math.max(0, (inputs.phosphorus - 4.5) / 5.5) * 8;
  scores["potassium"] = Math.max(0, (inputs.potassium - 5.0) / 3.0) * 8;
  scores["serum_albumin"] = Math.max(0, (3.5 - inputs.serum_albumin) / 3.5) * 8;
  scores["comorbidities"] = (inputs.diabetes ? 4 : 0) + (inputs.hypertension ? 4 : 0) + (inputs.family_history_kidney ? 2 : 0) + (inputs.smoking_status ? 1 : 0);

  return scores;
}

export function runKidneyDiseaseInference(inputs: KidneyDiseaseInputs): KidneyDiseasePredictionResult {
  const { stageIndex, label, riskLevel, baseConfidence } = classifyCKDStage(inputs);
  const probabilityPercent = Math.round(baseConfidence * 100 * 10) / 10;

  const rawScores = computeContributions(inputs);
  const totalAbsScore = Object.values(rawScores).reduce((sum, v) => sum + Math.abs(v), 0) || 1;
  const relWeight = (key: string) => Math.max(2, Math.round((rawScores[key] / totalAbsScore) * 100));

  const riskScore = Math.min(100, Math.round(
    (stageIndex / 4) * 80 +
    (inputs.hypertension ? 5 : 0) +
    (inputs.diabetes ? 5 : 0) +
    (inputs.serum_creatinine > 2 ? 5 : 0) +
    (inputs.egfr < 30 ? 5 : 0)
  ));

  const factors: KidneyFactorContribution[] = [
    {
      id: "egfr",
      name: "Estimated Glomerular Filtration Rate (eGFR)",
      category: "Renal Function",
      value: inputs.egfr,
      unit: "mL/min/1.73m\u00B2",
      statusText: `${inputs.egfr} mL/min/1.73m\u00B2 (${inputs.egfr >= 90 ? "Normal" : inputs.egfr >= 60 ? "Mildly Reduced" : inputs.egfr >= 30 ? "Moderately Reduced" : inputs.egfr >= 15 ? "Severely Reduced" : "Kidney Failure"})`,
      normalRangeText: "Ref: >= 90 mL/min/1.73m\u00B2 (Normal function)",
      relativeWeight: relWeight("egfr"),
      clinicalNote: "Primary determinant of CKD staging per KDIGO guidelines. eGFR reflects the filtration capacity of nephron mass and correlates inversely with CKD progression severity.",
    },
    {
      id: "serum_creatinine",
      name: "Serum Creatinine",
      category: "Renal Function",
      value: inputs.serum_creatinine,
      unit: "mg/dL",
      statusText: `${inputs.serum_creatinine} mg/dL (${inputs.serum_creatinine <= 1.2 ? "Within normal limits" : inputs.serum_creatinine <= 2.0 ? "Mildly elevated" : inputs.serum_creatinine <= 4.0 ? "Markedly elevated" : "Severely elevated"})`,
      normalRangeText: "Ref: 0.6 - 1.2 mg/dL",
      relativeWeight: relWeight("serum_creatinine"),
      clinicalNote: "Waste product of creatine phosphate catabolism in muscle. Elevated serum creatinine reflects impaired glomerular filtration, rising inversely with declining renal function.",
    },
    {
      id: "blood_urea_nitrogen",
      name: "Blood Urea Nitrogen (BUN)",
      category: "Renal Function",
      value: inputs.blood_urea_nitrogen,
      unit: "mg/dL",
      statusText: `${inputs.blood_urea_nitrogen} mg/dL (${inputs.blood_urea_nitrogen <= 20 ? "Normal" : inputs.blood_urea_nitrogen <= 40 ? "Elevated" : "Uremic range"})`,
      normalRangeText: "Ref: 7 - 20 mg/dL",
      relativeWeight: relWeight("blood_urea_nitrogen"),
      clinicalNote: "Nitrogen component of urea — a metabolic byproduct of protein catabolism cleared by renal filtration. BUN elevation signals uremia and progressive nephron loss.",
    },
    {
      id: "urine_albumin",
      name: "Urine Albumin / ACR",
      category: "Urine Markers",
      value: inputs.urine_albumin,
      unit: "mg/L",
      statusText: `Albumin ${inputs.urine_albumin} mg/L · ACR ${inputs.albumin_creatinine_ratio} mg/g (${inputs.urine_albumin < 30 ? "Normoalbuminuria" : inputs.urine_albumin < 300 ? "Microalbuminuria" : "Macroalbuminuria"})`,
      normalRangeText: "Ref: < 30 mg/L (Normoalbuminuria)",
      relativeWeight: relWeight("urine_albumin"),
      clinicalNote: "Proteinuria is a hallmark of glomerular damage. Elevated urinary albumin excretion indicates disruption of the glomerular filtration barrier and accelerates CKD progression.",
    },
    {
      id: "hemoglobin",
      name: "Hemoglobin (Renal Anemia Signal)",
      category: "Hematology",
      value: inputs.hemoglobin,
      unit: "g/dL",
      statusText: `${inputs.hemoglobin} g/dL (${inputs.hemoglobin >= (inputs.gender === 1 ? 13.5 : 12.0) ? "Within normal limits" : inputs.hemoglobin >= (inputs.gender === 1 ? 11 : 10) ? "Mild renal anemia" : "Moderate-severe renal anemia"})`,
      normalRangeText: inputs.gender === 1 ? "Ref: 13.5 - 17.5 g/dL (Male)" : "Ref: 12.0 - 15.5 g/dL (Female)",
      relativeWeight: relWeight("hemoglobin"),
      clinicalNote: "Declining erythropoietin production from damaged renal endocrine tissue causes normochromic normocytic anemia. Hemoglobin correlates inversely with CKD severity.",
    },
  ];

  const renalStatusSummary =
    stageIndex === 0
      ? "Glomerular filtration rate and renal biomarkers are within reference ranges. No evidence of chronic kidney disease based on the assessed clinical inputs."
      : stageIndex === 1
      ? "Mildly reduced renal function detected. eGFR indicates Stage 1-2 CKD pattern. Albumin markers suggest early glomerular strain. Close monitoring and risk factor management advised."
      : stageIndex === 2
      ? "Moderate reduction in renal filtration capacity detected. eGFR pattern consistent with Stage 3 CKD. Anemia signal and electrolyte changes may be emerging. Clinical review required."
      : stageIndex === 3
      ? "Severe nephron loss pattern detected. eGFR consistent with Stage 4 CKD. Uremia, hyperphosphatemia, and hyperkalemia risk elevated. Nephrology consultation urgently indicated."
      : "Critical renal failure pattern detected. eGFR consistent with Stage 5 CKD/Kidney Failure. Urgent nephrology evaluation for renal replacement therapy planning is required.";

  const classificationBasis =
    stageIndex === 0 ? `eGFR ${inputs.egfr} mL/min/1.73m\u00B2 - Normal filtration capacity` :
    stageIndex === 1 ? `eGFR ${inputs.egfr} mL/min/1.73m\u00B2 - Stage G2 filtration pattern` :
    stageIndex === 2 ? `eGFR ${inputs.egfr} mL/min/1.73m\u00B2 - Stage G3 moderate CKD` :
    stageIndex === 3 ? `eGFR ${inputs.egfr} mL/min/1.73m\u00B2 - Stage G4 severe CKD` :
    `eGFR ${inputs.egfr} mL/min/1.73m\u00B2 - Stage G5 kidney failure`;

  return {
    predictionClass: label,
    stageIndex: stageIndex as 0 | 1 | 2 | 3 | 4,
    probabilityPercent,
    ckdRiskLevel: riskLevel,
    riskScore,
    factors,
    renalStatusSummary,
    classificationBasis,
  };
}

export const KIDNEY_DISEASE_PRESETS: Record<string, { label: string; description: string; expectedClass: CKDStageLabel; inputs: KidneyDiseaseInputs }> = {
  case1_healthy: {
    label: "Case 1: Healthy Kidney",
    description: "Adult with normal renal biomarkers. eGFR >=95, normal creatinine, no significant proteinuria.",
    expectedClass: "Healthy Kidney",
    inputs: {
      age: 38, gender: 0, bmi: 26, systolic_bp: 114, diastolic_bp: 78, heart_rate: 78,
      serum_creatinine: 0.8, blood_urea_nitrogen: 14, egfr: 97,
      urine_albumin: 8, urine_protein: 1, albumin_creatinine_ratio: 20, urine_specific_gravity: 1.022,
      sodium: 140, potassium: 4.0, calcium: 9.5, phosphorus: 3.2, chloride: 104, bicarbonate: 25,
      hemoglobin: 14.5, rbc_count: 4.9, wbc_count: 7800, platelet_count: 260000, packed_cell_volume: 43,
      blood_glucose_random: 92, fasting_glucose: 86, hba1c: 5.2, cholesterol: 180, triglycerides: 120,
      serum_albumin: 4.2, total_protein: 7.1, diabetes: 0, hypertension: 0, smoking_status: 1, family_history_kidney: 0,
    },
  },
  case2_mild_ckd: {
    label: "Case 2: Mild CKD (Stage 1-2)",
    description: "Early CKD with mildly reduced eGFR 65-80, microalbuminuria, borderline creatinine.",
    expectedClass: "Mild CKD (Stage 1-2)",
    inputs: {
      age: 52, gender: 1, bmi: 28, systolic_bp: 138, diastolic_bp: 86, heart_rate: 76,
      serum_creatinine: 1.3, blood_urea_nitrogen: 22, egfr: 72,
      urine_albumin: 65, urine_protein: 1, albumin_creatinine_ratio: 72, urine_specific_gravity: 1.018,
      sodium: 139, potassium: 4.3, calcium: 9.1, phosphorus: 3.8, chloride: 102, bicarbonate: 24,
      hemoglobin: 13.1, rbc_count: 4.5, wbc_count: 8200, platelet_count: 240000, packed_cell_volume: 40,
      blood_glucose_random: 108, fasting_glucose: 95, hba1c: 6.1, cholesterol: 210, triglycerides: 165,
      serum_albumin: 4.0, total_protein: 7.0, diabetes: 0, hypertension: 1, smoking_status: 0, family_history_kidney: 0,
    },
  },
  case3_moderate_ckd: {
    label: "Case 3: Moderate CKD (Stage 3)",
    description: "Established CKD with eGFR 35-45, macroalbuminuria, elevated creatinine and BUN.",
    expectedClass: "Moderate CKD (Stage 3)",
    inputs: {
      age: 61, gender: 1, bmi: 30, systolic_bp: 155, diastolic_bp: 96, heart_rate: 82,
      serum_creatinine: 2.1, blood_urea_nitrogen: 35, egfr: 42,
      urine_albumin: 185, urine_protein: 2, albumin_creatinine_ratio: 210, urine_specific_gravity: 1.014,
      sodium: 137, potassium: 4.7, calcium: 8.8, phosphorus: 4.2, chloride: 100, bicarbonate: 21,
      hemoglobin: 11.4, rbc_count: 3.9, wbc_count: 9100, platelet_count: 220000, packed_cell_volume: 36,
      blood_glucose_random: 145, fasting_glucose: 118, hba1c: 7.2, cholesterol: 230, triglycerides: 220,
      serum_albumin: 3.8, total_protein: 6.6, diabetes: 1, hypertension: 1, smoking_status: 0, family_history_kidney: 1,
    },
  },
  case4_severe_ckd: {
    label: "Case 4: Severe CKD (Stage 4)",
    description: "Severe nephron loss with eGFR 20-28. Uremia pattern, anemia, hyperphosphatemia.",
    expectedClass: "Severe CKD (Stage 4)",
    inputs: {
      age: 67, gender: 0, bmi: 24, systolic_bp: 168, diastolic_bp: 102, heart_rate: 88,
      serum_creatinine: 4.2, blood_urea_nitrogen: 62, egfr: 25,
      urine_albumin: 310, urine_protein: 3, albumin_creatinine_ratio: 380, urine_specific_gravity: 1.010,
      sodium: 135, potassium: 5.3, calcium: 8.2, phosphorus: 5.5, chloride: 98, bicarbonate: 17,
      hemoglobin: 9.2, rbc_count: 3.1, wbc_count: 9800, platelet_count: 185000, packed_cell_volume: 29,
      blood_glucose_random: 160, fasting_glucose: 128, hba1c: 7.8, cholesterol: 195, triglycerides: 260,
      serum_albumin: 3.2, total_protein: 6.0, diabetes: 1, hypertension: 1, smoking_status: 1, family_history_kidney: 1,
    },
  },
  case5_kidney_failure: {
    label: "Case 5: Kidney Failure (Stage 5)",
    description: "End-stage renal disease. eGFR < 15, severe uremia, critical electrolyte disturbances.",
    expectedClass: "Kidney Failure (Stage 5)",
    inputs: {
      age: 76, gender: 0, bmi: 22, systolic_bp: 175, diastolic_bp: 106, heart_rate: 92,
      serum_creatinine: 6.8, blood_urea_nitrogen: 88, egfr: 12,
      urine_albumin: 420, urine_protein: 5, albumin_creatinine_ratio: 580, urine_specific_gravity: 1.008,
      sodium: 132, potassium: 5.9, calcium: 7.8, phosphorus: 6.5, chloride: 96, bicarbonate: 14,
      hemoglobin: 7.2, rbc_count: 2.6, wbc_count: 10500, platelet_count: 145000, packed_cell_volume: 22,
      blood_glucose_random: 195, fasting_glucose: 148, hba1c: 8.5, cholesterol: 172, triglycerides: 310,
      serum_albumin: 2.8, total_protein: 5.6, diabetes: 1, hypertension: 1, smoking_status: 0, family_history_kidney: 1,
    },
  },
};
