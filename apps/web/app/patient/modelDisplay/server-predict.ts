"use client";

import { useEffect, useState } from "react";
import { api, MLPrediction } from "../../../lib/api";
import type { AnemiaInputs } from "./anemia-inference";
import type { BreastCancerInputs } from "./breast-cancer-inference";
import type { DiabetesInputs } from "./diabetes-inference";
import type { HeartDiseaseInputs } from "./heart-disease-inference";
import type { HeartFailureInputs } from "./heart-failure-inference";
import type { KidneyDiseaseInputs } from "./kidney-disease-inference";
import type { LiverDiseaseInputs } from "./liver-disease-inference";
import type { StrokeInputs } from "./stroke-inference";

/**
 * Raw feature extractors.
 *
 * These mirror exactly the feature ORDER the trained .pkl models expect
 * (verified against each artifact's `feature_names_in_`). The web page sends
 * this ordered array to the Next.js proxy (`/api/ml/[model]`), which forwards
 * it to the services/ml FastAPI service that executes the ACTUAL model —
 * including the pipeline/scaler preprocessing. Scaling, one-hot encoding and
 * median imputation happen on the server, never here.
 */

export function buildStrokeFeatures(i: StrokeInputs): number[] {
  return [
    i.chestPain,
    i.shortnessOfBreath,
    i.irregularHeartbeat,
    i.fatigueWeakness,
    i.dizziness,
    i.edema,
    i.neckJawShoulderBackPain,
    i.excessiveSweating,
    i.persistentCough,
    i.nauseaVomiting,
    i.highBloodPressure,
    i.chestDiscomfortActivity,
    i.coldHandsFeet,
    i.sleepApnea,
    i.anxietyDoom,
    i.age,
  ];
}

export function buildAnemiaFeatures(i: AnemiaInputs): number[] {
  return [i.gender, i.hemoglobin, i.mch, i.mchc, i.mcv];
}

const BREAST_CANCER_ORDER: Array<keyof BreastCancerInputs> = [
  "radius_mean",
  "texture_mean",
  "perimeter_mean",
  "area_mean",
  "smoothness_mean",
  "compactness_mean",
  "concavity_mean",
  "concave_points_mean",
  "symmetry_mean",
  "fractal_dimension_mean",
  "radius_se",
  "texture_se",
  "perimeter_se",
  "area_se",
  "smoothness_se",
  "compactness_se",
  "concavity_se",
  "concave_points_se",
  "symmetry_se",
  "fractal_dimension_se",
  "radius_worst",
  "texture_worst",
  "perimeter_worst",
  "area_worst",
  "smoothness_worst",
  "compactness_worst",
  "concavity_worst",
  "concave_points_worst",
  "symmetry_worst",
  "fractal_dimension_worst",
];

export function buildBreastCancerFeatures(i: BreastCancerInputs): number[] {
  return BREAST_CANCER_ORDER.map((k) => i[k]);
}

export function buildDiabetesFeatures(i: DiabetesInputs): number[] {
  return [
    i.pregnancies,
    i.glucose,
    i.bloodPressure,
    i.skinThickness,
    i.insulin,
    i.bmi,
    i.diabetesPedigree,
    i.age,
  ];
}

export function buildHeartDiseaseFeatures(i: HeartDiseaseInputs): number[] {
  return [
    i.age,
    i.sex,
    i.cp,
    i.trestbps,
    i.chol,
    i.fbs,
    i.restecg,
    i.thalach,
    i.exang,
    i.oldpeak,
    i.slope,
    i.ca,
    i.thal,
  ];
}

export function buildHeartFailureFeatures(i: HeartFailureInputs): number[] {
  return [
    i.age,
    i.anaemia,
    i.creatinine_phosphokinase,
    i.diabetes,
    i.ejection_fraction,
    i.high_blood_pressure,
    i.platelets,
    i.serum_creatinine,
    i.serum_sodium,
    i.sex,
    i.smoking,
    i.time,
  ];
}

const KIDNEY_ORDER: Array<keyof KidneyDiseaseInputs> = [
  "age",
  "gender",
  "bmi",
  "systolic_bp",
  "diastolic_bp",
  "heart_rate",
  "serum_creatinine",
  "blood_urea_nitrogen",
  "egfr",
  "urine_albumin",
  "urine_protein",
  "albumin_creatinine_ratio",
  "urine_specific_gravity",
  "sodium",
  "potassium",
  "calcium",
  "phosphorus",
  "chloride",
  "bicarbonate",
  "hemoglobin",
  "rbc_count",
  "wbc_count",
  "platelet_count",
  "packed_cell_volume",
  "blood_glucose_random",
  "fasting_glucose",
  "hba1c",
  "cholesterol",
  "triglycerides",
  "serum_albumin",
  "total_protein",
  "diabetes",
  "hypertension",
  "smoking_status",
  "family_history_kidney",
];

export function buildKidneyFeatures(i: KidneyDiseaseInputs): number[] {
  return KIDNEY_ORDER.map((k) => i[k]);
}

export function buildLiverFeatures(i: LiverDiseaseInputs): number[] {
  return [
    i.age,
    i.gender,
    i.totalBilirubin,
    i.directBilirubin,
    i.alkalinePhosphotase,
    i.alamineAminotransferase,
    i.aspartateAminotransferase,
    i.totalProteins,
    i.albumin,
    i.albuminAndGlobulinRatio,
  ];
}

/**
 * Classification-bucket helpers. These re-derive the same clinical risk bands
 * the UI used to compute locally, but now feed on the server probability.
 */

export type RiskBand = "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export function riskBandFromProbability(prob: number): RiskBand {
  if (prob >= 80) return "CRITICAL";
  if (prob >= 65) return "HIGH";
  if (prob >= 45) return "ELEVATED";
  return "LOW";
}

export type HeartFailureRisk = "CRITICAL RISK" | "ELEVATED RISK" | "BORDERLINE RISK" | "LOW RISK";

export function heartFailureRiskFromProbability(
  prob: number
): { riskClassification: HeartFailureRisk; hemodynamicStatus: string } {
  if (prob >= 70) return { riskClassification: "CRITICAL RISK", hemodynamicStatus: "Severe Hemodynamic Decompensation" };
  if (prob >= 50) return { riskClassification: "ELEVATED RISK", hemodynamicStatus: "Severe Hemodynamic Decompensation" };
  if (prob >= 30) return { riskClassification: "BORDERLINE RISK", hemodynamicStatus: "Moderate Ventricular Strain" };
  return { riskClassification: "LOW RISK", hemodynamicStatus: "Compensated Cardiac Function" };
}

export type DiabetesRisk = "HIGH RISK" | "ELEVATED RISK" | "BORDERLINE / MODERATE" | "LOW RISK";

export function diabetesRiskFromProbability(prob: number): DiabetesRisk {
  if (prob >= 60) return "HIGH RISK";
  if (prob >= 50) return "ELEVATED RISK";
  if (prob >= 25) return "BORDERLINE / MODERATE";
  return "LOW RISK";
}

export type BreastRisk = "NOMINAL" | "MODERATE" | "HIGH SUSPICION" | "CRITICAL MALIGNANCY";

export function breastRiskFromProbability(cls: 0 | 1, prob: number, areaWorst: number, concavePointsWorst: number): BreastRisk {
  if (cls === 1) {
    return areaWorst > 1200 || concavePointsWorst > 0.18 ? "CRITICAL MALIGNANCY" : "HIGH SUSPICION";
  }
  return prob > 25 ? "MODERATE" : "NOMINAL";
}

export function kidneyRiskFromStage(stageIndex: number): "NORMAL" | "MILD" | "MODERATE" | "SEVERE" | "CRITICAL" {
  return (["NORMAL", "MILD", "MODERATE", "SEVERE", "CRITICAL"] as const)[stageIndex] ?? "MODERATE";
}

/** Debounced server-backed prediction for the ACTIVE model's current inputs. */
export function useModelPrediction(
  model: string,
  active: boolean,
  build: () => number[]
): { prediction: MLPrediction | null; loading: boolean } {
  const [state, setState] = useState<{ prediction: MLPrediction | null; loading: boolean }>({
    prediction: null,
    loading: true,
  });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, loading: true }));
      api
        .predictML(model, build())
        .then((prediction) => {
          if (!cancelled) setState({ prediction, loading: false });
        })
        .catch(() => {
          if (!cancelled) setState({ prediction: null, loading: false });
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [model, active, build]);

  return {
    prediction: active ? state.prediction : null,
    loading: active && state.loading,
  };
}

/** 0-100 probability rounded the way the UI displays it. */
export function roundProb(p: number): number {
  return Math.round(p * 10) / 10;
}