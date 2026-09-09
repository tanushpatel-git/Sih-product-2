"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import ClinicalCore, { ClinicalState, AssessingPhase } from "./ClinicalCore";
import KidneyInputForm from "./KidneyInputForm";
import { clinicalModels, ClinicalModelConfig } from "./clinical-models";
import {
  AnemiaInputs,
  runAnemiaInference,
  ANEMIA_PRESETS,
} from "./anemia-inference";
import {
  BreastCancerInputs,
  runBreastCancerInference,
  BREAST_CANCER_PRESETS,
} from "./breast-cancer-inference";
import {
  DiabetesInputs,
  runDiabetesInference,
  DIABETES_PRESETS,
} from "./diabetes-inference";
import {
  HeartFailureInputs,
  predictHeartFailure,
  HEART_FAILURE_PRESETS,
} from "./heart-failure-inference";
import {
  KidneyDiseaseInputs,
  runKidneyDiseaseInference,
  KIDNEY_DISEASE_PRESETS,
} from "./kidney-disease-inference";
import {
  StrokeInputs,
  runStrokeInference,
  STROKE_PRESETS,
} from "./stroke-inference";
import {
  HeartDiseaseInputs,
  runHeartDiseaseInference,
  HEART_DISEASE_PRESETS,
} from "./heart-disease-inference";
import {
  LiverDiseaseInputs,
  runLiverDiseaseInference,
  LIVER_DISEASE_PRESETS,
} from "./liver-disease-inference";

type ActiveModelKey =
  | "stroke"
  | "heartDisease"
  | "anemia"
  | "breastCancer"
  | "diabetes"
  | "heartFailure"
  | "kidneyDisease"
  | "liverDisease";

export default function ClinicalDashboardPage() {
  const [activeModelKey, setActiveModelKey] = useState<ActiveModelKey>("heartFailure");

  // ── Anemia live inputs ──────────────────────────────────────────────────────
  const [anemiaInputs, setAnemiaInputs] = useState<AnemiaInputs>(
    ANEMIA_PRESETS.case1_severe.inputs
  );
  const [selectedAnemiaPresetKey, setSelectedAnemiaPresetKey] = useState<string>("case1_severe");

  // ── Breast Cancer live inputs ────────────────────────────────────────────────
  const [bcInputs, setBcInputs] = useState<BreastCancerInputs>(
    BREAST_CANCER_PRESETS.case1_malignant_severe.inputs
  );
  const [selectedBcPresetKey, setSelectedBcPresetKey] = useState<string>(
    "case1_malignant_severe"
  );

  // ── Diabetes live inputs ────────────────────────────────────────────────────
  const [diabetesInputs, setDiabetesInputs] = useState<DiabetesInputs>(
    DIABETES_PRESETS.case1_severe.inputs
  );
  const [selectedDiabetesPresetKey, setSelectedDiabetesPresetKey] = useState<string>(
    "case1_severe"
  );

  // ── Heart Failure live inputs ────────────────────────────────────────────────
  const [hfInputs, setHfInputs] = useState<HeartFailureInputs>(
    HEART_FAILURE_PRESETS.case1_acute_decomp.inputs
  );
  const [selectedHfPresetKey, setSelectedHfPresetKey] = useState<string>(
    "case1_acute_decomp"
  );

  // ── Kidney Disease live inputs ────────────────────────────────────────────────
  const [kidneyInputs, setKidneyInputs] = useState<KidneyDiseaseInputs>(
    KIDNEY_DISEASE_PRESETS.case4_severe_ckd.inputs
  );
  const [selectedKidneyPresetKey, setSelectedKidneyPresetKey] = useState<string>(
    "case4_severe_ckd"
  );

  // ── Stroke live inputs ────────────────────────────────────────────────────────
  const [strokeInputs, setStrokeInputs] = useState<StrokeInputs>(
    STROKE_PRESETS.case1_severe_stroke.inputs
  );
  const [selectedStrokePresetKey, setSelectedStrokePresetKey] = useState<string>("case1_severe_stroke");

  // ── Heart Disease (Coronary) live inputs ─────────────────────────────────────
  const [hdInputs, setHdInputs] = useState<HeartDiseaseInputs>(
    HEART_DISEASE_PRESETS.case1_severe_cad.inputs
  );
  const [selectedHdPresetKey, setSelectedHdPresetKey] = useState<string>("case1_severe_cad");

  // ── Liver Disease live inputs ─────────────────────────────────────────────────
  const [liverInputs, setLiverInputs] = useState<LiverDiseaseInputs>(
    LIVER_DISEASE_PRESETS.case1_acute_hepatitis.inputs
  );
  const [selectedLiverPresetKey, setSelectedLiverPresetKey] = useState<string>("case1_acute_hepatitis");

  // ── Navbar model dropdown (mobile) ───────────────────────────────────────────
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // ── Shared UI state ──────────────────────────────────────────────────────────
  const [showInputModal, setShowInputModal] = useState<boolean>(false);
  const [showCopilot, setShowCopilot] = useState<boolean>(false);
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string }>
  >([
    {
      sender: "ai",
      text: "I've reviewed this patient's clinical profile. Select a quick inquiry below or ask a specific question regarding the model's findings.",
    },
  ]);
  const [copilotInputText, setCopilotInputText] = useState("");
  const [clinicalState, setClinicalState] = useState<ClinicalState>("RESULT");
  const [assessingPhase, setAssessingPhase] = useState<AssessingPhase>("INGESTING");
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);

  // ── Inference engines ────────────────────────────────────────────────────────
  const liveAnemiaResult = useMemo(() => runAnemiaInference(anemiaInputs), [anemiaInputs]);
  const liveBcResult = useMemo(() => runBreastCancerInference(bcInputs), [bcInputs]);
  const liveDiabetesResult = useMemo(() => runDiabetesInference(diabetesInputs), [diabetesInputs]);
  const liveHfResult = useMemo(() => predictHeartFailure(hfInputs), [hfInputs]);
  const liveKidneyResult = useMemo(() => runKidneyDiseaseInference(kidneyInputs), [kidneyInputs]);
  const liveStrokeResult = useMemo(() => runStrokeInference(strokeInputs), [strokeInputs]);
  const liveHdResult = useMemo(() => runHeartDiseaseInference(hdInputs), [hdInputs]);
  const liveLiverResult = useMemo(() => runLiverDiseaseInference(liverInputs), [liverInputs]);

  // ── Merge dynamic results into model config ──────────────────────────────────
  const modelConfig: ClinicalModelConfig = useMemo(() => {
    const baseConfig = clinicalModels[activeModelKey];

    // ── Anemia live merge ──────────────────────────────────────────────────────
    if (activeModelKey === "anemia") {
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = liveAnemiaResult.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.relativeWeight,
          valueDisplay: liveFactor.statusText,
          baselineDisplay: liveFactor.normalRangeText,
        };
      });
      const sexText = anemiaInputs.gender === 1 ? "FEMALE" : "MALE";
      return {
        ...baseConfig,
        risk: Math.round(liveAnemiaResult.probabilityPercent),
        riskLevel:
          liveAnemiaResult.predictionClass === 1
            ? liveAnemiaResult.severityLevel === "SEVERE"
              ? "CRITICAL"
              : "HIGH"
            : "NORMAL",
        predictionStatus: liveAnemiaResult.statusLabel,
        patient: {
          ...baseConfig.patient,
          gender: sexText,
          vitals: `Hb ${anemiaInputs.hemoglobin} g/dL · MCV ${anemiaInputs.mcv} fL · MCH ${anemiaInputs.mch} pg · MCHC ${anemiaInputs.mchc} g/dL`,
        },
        factors,
        aiReasoning: `Trained on 534 validated clinical hematology records, the Logistic Regression pipeline classifies this patient with ${liveAnemiaResult.statusLabel} at ${liveAnemiaResult.probabilityPercent}% Prediction Probability (logit ${liveAnemiaResult.logit > 0 ? "+" : ""}${liveAnemiaResult.logit.toFixed(1)}). The predominant contributor is ${anemiaInputs.hemoglobin < 12 ? `marked hemoglobin depletion to ${anemiaInputs.hemoglobin} g/dL (${factors[0]?.contribution ?? "—"}% relative weight)` : `adequate hemoglobin of ${anemiaInputs.hemoglobin} g/dL`}, compounded by ${liveAnemiaResult.anemiaMorphology.toLowerCase()} erythrocyte index.`,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority:
            liveAnemiaResult.predictionClass === 1
              ? `High Priority — ${liveAnemiaResult.anemiaMorphology} Anemia Pattern`
              : "Routine Observation — No Anemia Detected",
          priorityLevel: liveAnemiaResult.predictionClass === 1 ? "HIGH" : "NORMAL",
        },
      };
    }

    // ── Breast Cancer live merge ───────────────────────────────────────────────
    if (activeModelKey === "breastCancer") {
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = liveBcResult.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.relativeWeight,
          valueDisplay: liveFactor.statusText,
          baselineDisplay: liveFactor.normalRangeText,
        };
      });

      const prob = liveBcResult.probabilityPercent;
      const isMalignant = liveBcResult.predictionClass === 1;

      return {
        ...baseConfig,
        risk: Math.round(prob),
        riskLevel: isMalignant
          ? liveBcResult.riskClassification === "CRITICAL MALIGNANCY"
            ? "CRITICAL"
            : "HIGH"
          : prob > 25
            ? "ELEVATED"
            : "NORMAL",
        predictionStatus: liveBcResult.statusLabel,
        patient: {
          ...baseConfig.patient,
          vitals: `Area (Worst) ${bcInputs.area_worst} µm² · Texture (Worst) ${bcInputs.texture_worst.toFixed(2)} · Concave Pts ${bcInputs.concave_points_mean.toFixed(3)} · Radius SE ${bcInputs.radius_se.toFixed(3)}`,
        },
        factors,
        aiReasoning: `Trained on 569 validated WDBC FNA records, the Logistic Regression pipeline classifies this cytological aspirate as ${liveBcResult.statusLabel} at ${prob.toFixed(1)}% Prediction Probability (logit ${liveBcResult.logit > 0 ? "+" : ""}${liveBcResult.logit.toFixed(2)}). Morphologic pattern: ${liveBcResult.histologicPattern}. Top contributors: ${liveBcResult.factors.slice(0, 3).map((f) => f.name).join(", ")}.`,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority: isMalignant
            ? `High Priority — ${liveBcResult.histologicPattern} Pattern`
            : "Routine Review — Benign Cellular Architecture",
          priorityLevel: isMalignant ? "CRITICAL" : "NORMAL",
        },
      };
    }

    // ── Diabetes live merge ──────────────────────────────────────────────────
    if (activeModelKey === "diabetes") {
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = liveDiabetesResult.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.relativeWeight,
          valueDisplay: liveFactor.statusText,
          baselineDisplay: liveFactor.normalRangeText,
        };
      });

      const prob = liveDiabetesResult.probabilityPercent;
      const isDiabetic = liveDiabetesResult.predictionClass === 1;

      return {
        ...baseConfig,
        risk: Math.round(prob),
        riskLevel: isDiabetic
          ? liveDiabetesResult.riskClassification === "HIGH RISK"
            ? "HIGH"
            : "ELEVATED"
          : prob > 25
            ? "MODERATE"
            : "LOW",
        predictionStatus: liveDiabetesResult.statusLabel,
        patient: {
          ...baseConfig.patient,
          age: diabetesInputs.age,
          gender: diabetesInputs.pregnancies > 0 ? "FEMALE" : "FEMALE",
          vitals: `Glucose ${diabetesInputs.glucose} mg/dL · BMI ${diabetesInputs.bmi.toFixed(1)} · Insulin ${diabetesInputs.insulin} µU/mL · BP ${diabetesInputs.bloodPressure} mmHg`,
        },
        factors,
        aiReasoning: `Trained on 768 validated clinical records from the Pima Indians cohort, the tuned XGBoost ensemble (100 depth-3 trees) classifies this patient with ${liveDiabetesResult.statusLabel} at ${prob.toFixed(1)}% Prediction Probability (margin ${liveDiabetesResult.margin > 0 ? "+" : ""}${liveDiabetesResult.margin.toFixed(2)}). Metabolic classification: ${liveDiabetesResult.metabolicStatus}. Primary clinical contributors: ${liveDiabetesResult.factors.slice(0, 3).map((f) => `${f.name} (${f.relativeWeight}% weight)`).join(", ")}.`,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority: isDiabetic
            ? `High Priority — ${liveDiabetesResult.metabolicStatus}`
            : "Routine Clinical Observation — Euglycemic Profile",
          priorityLevel: isDiabetic ? "HIGH" : "NORMAL",
        },
      };
    }

    // ── Heart Failure live merge ─────────────────────────────────────────────
    if (activeModelKey === "heartFailure") {
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = liveHfResult.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.relativeContribution,
          valueDisplay: `${liveFactor.value} ${liveFactor.unit} · ${liveFactor.statusText}`,
          baselineDisplay: liveFactor.normalRangeText,
          description: liveFactor.clinicalInterpretation,
        };
      });

      const prob = liveHfResult.probabilityPercent;
      const isHighRisk = liveHfResult.predictionClass === 1;

      return {
        ...baseConfig,
        risk: Math.round(prob),
        riskLevel: isHighRisk
          ? liveHfResult.riskClassification === "CRITICAL RISK"
            ? "CRITICAL"
            : "HIGH"
          : prob > 25
            ? "MODERATE"
            : "LOW",
        predictionStatus: liveHfResult.statusLabel,
        patient: {
          ...baseConfig.patient,
          age: hfInputs.age,
          gender: hfInputs.sex === 1 ? "Male" : "Female",
          vitals: `LVEF ${hfInputs.ejection_fraction}% · SCr ${hfInputs.serum_creatinine} mg/dL · Na ${hfInputs.serum_sodium} mEq/L · Day ${hfInputs.time} · CPK ${hfInputs.creatinine_phosphokinase} mcg/L`,
        },
        factors,
        aiReasoning: `Trained on 299 validated clinical records (Chicco & Jurman) using a balanced-subsample Random Forest pipeline (800 depth-5 decision trees), the model predicts ${liveHfResult.statusLabel} with ${prob.toFixed(1)}% event probability. Hemodynamic state: ${liveHfResult.hemodynamicStatus}. Primary clinical drivers: ${liveHfResult.factors.slice(0, 3).map((f) => `${f.name} (${f.relativeContribution}% weight)`).join(", ")}.`,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority: isHighRisk
            ? `Critical Priority — ${liveHfResult.hemodynamicStatus}`
            : "Compensated Status — Longitudinal Monitoring",
          priorityLevel: isHighRisk ? "CRITICAL" : "NORMAL",
        },
      };
    }

    // ── Kidney Disease live merge ─────────────────────────────────────────────
    if (activeModelKey === "kidneyDisease") {
      const res = liveKidneyResult;
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = res.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.relativeWeight,
          valueDisplay: liveFactor.statusText,
          baselineDisplay: liveFactor.normalRangeText,
          description: liveFactor.clinicalNote,
        };
      });

      const ckdRiskMap: Record<string, "NORMAL" | "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL"> = {
        NORMAL: "NORMAL",
        MILD: "MODERATE",
        MODERATE: "ELEVATED",
        SEVERE: "HIGH",
        CRITICAL: "CRITICAL",
      };

      return {
        ...baseConfig,
        risk: Math.round(res.probabilityPercent),
        riskLevel: ckdRiskMap[res.ckdRiskLevel] || "MODERATE",
        predictionStatus: res.predictionClass.toUpperCase(),
        patient: {
          ...baseConfig.patient,
          id: "ASSESSMENT",
          age: 0,
          gender: "",
          date: "",
          vitals: res.classificationBasis,
        },
        factors,
        aiReasoning: `${res.renalStatusSummary} ${res.classificationBasis}. Output class: ${res.predictionClass}. Output probability: ${res.probabilityPercent}%. Clinical risk score: ${res.riskScore}. This is decision support only — not a diagnosis and not a prescription.`,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority:
            res.stageIndex === 0
              ? "Routine Monitoring — Healthy Renal Function"
              : res.stageIndex === 1
                ? "Elevated Monitoring — Mild CKD Stage 1-2"
                : res.stageIndex === 2
                  ? "Moderate Priority — CKD Stage 3 Management"
                  : res.stageIndex === 3
                    ? "High Priority — Severe CKD Stage 4 Signal"
                    : "Critical Priority — Kidney Failure Stage 5",
          priorityLevel: ckdRiskMap[res.ckdRiskLevel] === "CRITICAL" ? "CRITICAL" : ckdRiskMap[res.ckdRiskLevel] === "HIGH" ? "HIGH" : ckdRiskMap[res.ckdRiskLevel] === "ELEVATED" ? "ELEVATED" : "NORMAL",
        },
      };
    }

    // ── Stroke live merge ──────────────────────────────────────────────────────
    if (activeModelKey === "stroke") {
      const res = liveStrokeResult;
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = res.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.contribution,
          valueDisplay: liveFactor.valueDisplay,
          baselineDisplay: liveFactor.baselineDisplay,
          description: liveFactor.description,
        };
      });
      const riskLevelMap: Record<string, "NORMAL" | "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL"> = {
        LOW: "NORMAL",
        ELEVATED: "ELEVATED",
        HIGH: "HIGH",
        CRITICAL: "CRITICAL",
      };
      return {
        ...baseConfig,
        risk: Math.round(res.probabilityPercent),
        riskLevel: riskLevelMap[res.riskBand] || "ELEVATED",
        predictionStatus: res.statusLabel,
        patient: {
          ...baseConfig.patient,
          age: strokeInputs.age,
          vitals: `BP ${strokeInputs.highBloodPressure ? "158/94" : "118/76"} · HBP ${strokeInputs.highBloodPressure ? "Yes" : "No"} · Arrhythmia ${strokeInputs.irregularHeartbeat ? "Yes" : "No"} · Age ${strokeInputs.age}`,
        },
        factors,
        aiReasoning: res.clinicalSummary,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority: res.predictionClass === 1
            ? `Urgent — ${res.riskBand} Stroke Risk (${res.probabilityPercent.toFixed(1)}%)`
            : "Routine Monitoring — Low Stroke Risk",
          priorityLevel: res.predictionClass === 1 ? (res.riskBand === "CRITICAL" ? "CRITICAL" : "HIGH") : "NORMAL",
        },
      };
    }

    // ── Heart Disease (Coronary) live merge ───────────────────────────────────
    if (activeModelKey === "heartDisease") {
      const res = liveHdResult;
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = res.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.contribution,
          valueDisplay: liveFactor.valueDisplay,
          baselineDisplay: liveFactor.baselineDisplay,
          description: liveFactor.description,
        };
      });
      const hdRiskMap: Record<string, "NORMAL" | "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL"> = {
        LOW: "NORMAL",
        ELEVATED: "ELEVATED",
        HIGH: "HIGH",
        CRITICAL: "CRITICAL",
      };
      return {
        ...baseConfig,
        risk: Math.round(res.probabilityPercent),
        riskLevel: hdRiskMap[res.riskBand] || "ELEVATED",
        predictionStatus: res.statusLabel,
        patient: {
          ...baseConfig.patient,
          age: hdInputs.age,
          gender: hdInputs.sex === 1 ? "Male" : "Female",
          vitals: `Age ${hdInputs.age} · BP ${hdInputs.trestbps} mmHg · Chol ${hdInputs.chol} mg/dL · HR ${hdInputs.thalach} bpm · ST-dep ${hdInputs.oldpeak}`,
        },
        factors,
        aiReasoning: res.clinicalSummary,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority: res.predictionClass === 1
            ? `High Priority — ${res.riskBand} Coronary Risk (${res.probabilityPercent.toFixed(1)}%)`
            : "Routine Monitoring — Low Coronary Risk",
          priorityLevel: res.predictionClass === 1 ? (res.riskBand === "CRITICAL" ? "CRITICAL" : "HIGH") : "NORMAL",
        },
      };
    }

    // ── Liver Disease live merge ──────────────────────────────────────────────
    if (activeModelKey === "liverDisease") {
      const res = liveLiverResult;
      const factors = baseConfig.factors.map((factor) => {
        const liveFactor = res.factors.find((f) => f.id === factor.id);
        if (!liveFactor) return factor;
        return {
          ...factor,
          contribution: liveFactor.contribution,
          valueDisplay: liveFactor.valueDisplay,
          baselineDisplay: liveFactor.baselineDisplay,
          description: liveFactor.description,
        };
      });
      const lvrRiskMap: Record<string, "NORMAL" | "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL"> = {
        LOW: "NORMAL",
        ELEVATED: "ELEVATED",
        HIGH: "HIGH",
        CRITICAL: "CRITICAL",
      };
      return {
        ...baseConfig,
        risk: Math.round(res.probabilityPercent),
        riskLevel: lvrRiskMap[res.riskBand] || "ELEVATED",
        predictionStatus: res.statusLabel,
        patient: {
          ...baseConfig.patient,
          age: liverInputs.age,
          gender: liverInputs.gender === 0 ? "Male" : "Female",
          vitals: `Bilirubin ${liverInputs.totalBilirubin} mg/dL · ALT ${liverInputs.alamineAminotransferase} · AST ${liverInputs.aspartateAminotransferase} IU/L · Albumin ${liverInputs.albumin} g/dL`,
        },
        factors,
        aiReasoning: res.clinicalSummary,
        clinicalConsiderations: {
          ...baseConfig.clinicalConsiderations,
          priority: res.predictionClass === 1
            ? `High Priority — ${res.riskBand} Hepatic Risk (${res.probabilityPercent.toFixed(1)}%)`
            : "Routine Monitoring — Healthy Hepatic Function",
          priorityLevel: res.predictionClass === 1 ? (res.riskBand === "CRITICAL" ? "CRITICAL" : "HIGH") : "NORMAL",
        },
      };
    }

    return baseConfig;
  }, [activeModelKey, liveAnemiaResult, liveBcResult, liveDiabetesResult, liveHfResult, liveKidneyResult, liveStrokeResult, liveHdResult, liveLiverResult, anemiaInputs, bcInputs, diabetesInputs, hfInputs, kidneyInputs, strokeInputs, hdInputs, liverInputs]);

  // ── Animated risk counter ────────────────────────────────────────────────────
  const [displayRisk, setDisplayRisk] = useState<number>(modelConfig.risk);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Assessment sequence ──────────────────────────────────────────────────────
  const triggerAssessment = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setClinicalState("ASSESSING");
    setAssessingPhase("INGESTING");
    setDisplayRisk(0);
    setSelectedFactorId(null);

    timerRef.current = setTimeout(() => {
      setAssessingPhase("SCANNING");
      timerRef.current = setTimeout(() => {
        setAssessingPhase("CALCULATING");
        timerRef.current = setTimeout(() => {
          setClinicalState("RESULT");
          let current = 0;
          const target = modelConfig.risk;
          const step = Math.max(1, Math.floor(target / 25));
          const countInterval = setInterval(() => {
            current += step;
            if (current >= target) {
              setDisplayRisk(target);
              clearInterval(countInterval);
            } else {
              setDisplayRisk(current);
            }
          }, 24);
        }, 1200);
      }, 1600);
    }, 1200);
  };

  // ── Model switching ──────────────────────────────────────────────────────────
  const handleModelChange = (key: ActiveModelKey) => {
    setActiveModelKey(key);
    setSelectedFactorId(null);
    setShowInputModal(key === "kidneyDisease");

    let targetRisk: number;
    if (key === "anemia") targetRisk = Math.round(liveAnemiaResult.probabilityPercent);
    else if (key === "breastCancer") targetRisk = Math.round(liveBcResult.probabilityPercent);
    else if (key === "diabetes") targetRisk = Math.round(liveDiabetesResult.probabilityPercent);
    else if (key === "heartFailure") targetRisk = Math.round(liveHfResult.probabilityPercent);
    else if (key === "kidneyDisease") targetRisk = Math.round(liveKidneyResult.probabilityPercent);
    else if (key === "stroke") targetRisk = Math.round(liveStrokeResult.probabilityPercent);
    else if (key === "heartDisease") targetRisk = Math.round(liveHdResult.probabilityPercent);
    else if (key === "liverDisease") targetRisk = Math.round(liveLiverResult.probabilityPercent);
    else targetRisk = clinicalModels[key]?.risk ?? 50;

    setDisplayRisk(targetRisk);
    setClinicalState("RESULT");

    const greetings: Record<ActiveModelKey, string> = {
      stroke:
        "I've reviewed this neurovascular stroke risk assessment. Ask about the predicted stroke probability, symptom contributors, or clinician follow-up. I cannot diagnose or prescribe.",
      heartDisease:
        "I've reviewed this coronary heart disease screening. Ask about the CAD risk prediction, clinical biomarkers (cholesterol, ST depression, angina type), or what a cardiologist might review. I cannot diagnose or prescribe.",
      anemia:
        "I've reviewed this hematology assessment. Ask about the model output, contributing factors, or what a clinician might review. I cannot diagnose or prescribe.",
      breastCancer:
        "I've reviewed this breast cancer model assessment. Ask about the prediction, cytological contributors, or clinician review. I cannot diagnose or prescribe.",
      diabetes:
        "I've reviewed this diabetes risk assessment. Ask about the prediction, metabolic contributors, or clinician review. I cannot diagnose or prescribe.",
      heartFailure:
        "I've reviewed this heart failure assessment. Ask about the event prediction, contributing factors, or clinician review. I cannot diagnose or prescribe.",
      kidneyDisease:
        "Context: Kidney Disease Prediction. I can explain the assessment class, output probability, risk score, and contributing factors. I cannot diagnose, prescribe medication, or replace a licensed clinician.",
      liverDisease:
        "I've reviewed this hepatic function assessment. Ask about liver disease probability, bilirubin levels, transaminase elevation, albumin synthesis, or what a hepatologist might review. I cannot diagnose or prescribe.",
    };
    setCopilotMessages([{ sender: "ai", text: greetings[key] }]);
  };

  // ── Preset handlers ──────────────────────────────────────────────────────────
  const handleAnemiaPresetSelect = (presetKey: string) => {
    const preset = ANEMIA_PRESETS[presetKey];
    if (preset) {
      setSelectedAnemiaPresetKey(presetKey);
      setAnemiaInputs(preset.inputs);
    }
  };

  const handleBcPresetSelect = (presetKey: string) => {
    const preset = BREAST_CANCER_PRESETS[presetKey];
    if (preset) {
      setSelectedBcPresetKey(presetKey);
      setBcInputs(preset.inputs);
    }
  };

  const handleDiabetesPresetSelect = (presetKey: string) => {
    const preset = DIABETES_PRESETS[presetKey];
    if (preset) {
      setSelectedDiabetesPresetKey(presetKey);
      setDiabetesInputs(preset.inputs);
    }
  };

  const handleHfPresetSelect = (presetKey: string) => {
    const preset = HEART_FAILURE_PRESETS[presetKey];
    if (preset) {
      setSelectedHfPresetKey(presetKey);
      setHfInputs(preset.inputs);
    }
  };

  const handleKidneyPresetSelect = (presetKey: string) => {
    const preset = KIDNEY_DISEASE_PRESETS[presetKey];
    if (preset) {
      setSelectedKidneyPresetKey(presetKey);
      setKidneyInputs(preset.inputs);
    }
  };

  const handleStrokePresetSelect = (presetKey: string) => {
    const preset = STROKE_PRESETS[presetKey];
    if (preset) {
      setSelectedStrokePresetKey(presetKey);
      setStrokeInputs(preset.inputs);
    }
  };

  const handleHdPresetSelect = (presetKey: string) => {
    const preset = HEART_DISEASE_PRESETS[presetKey];
    if (preset) {
      setSelectedHdPresetKey(presetKey);
      setHdInputs(preset.inputs);
    }
  };

  const handleLiverPresetSelect = (presetKey: string) => {
    const preset = LIVER_DISEASE_PRESETS[presetKey];
    if (preset) {
      setSelectedLiverPresetKey(presetKey);
      setLiverInputs(preset.inputs);
    }
  };

  // ── Copilot contextual quick-question handlers ───────────────────────────────
  const handleQuickQuestion = (actionType: string) => {
    let answer = "";

    if (activeModelKey === "heartFailure") {
      const res = liveHfResult;
      switch (actionType) {
        case "explain":
          answer = `The balanced-subsample Random Forest ensemble evaluated 12 clinical and hemodynamic features across 800 decision trees. The calculated ensemble probability is ${res.probabilityPercent.toFixed(1)}%, classifying the patient as ${res.statusLabel} (${res.riskClassification}). Hemodynamic state: ${res.hemodynamicStatus}.`;
          break;
        case "factors":
          answer = `Top clinical contributors ranked by dynamic random forest attribution: (1) ${res.factors[0]?.name ?? "LVEF"} (${res.factors[0]?.relativeContribution ?? 28}% weight), (2) ${res.factors[1]?.name ?? "Serum Creatinine"} (${res.factors[1]?.relativeContribution ?? 26}% weight), (3) ${res.factors[2]?.name ?? "Timeline"} (${res.factors[2]?.relativeContribution ?? 24}% weight), and (4) ${res.factors[3]?.name ?? "Serum Sodium"} (${res.factors[3]?.relativeContribution ?? 12}% weight). In the global model, follow-up window (42.1%), serum creatinine (18.0%), and LVEF (14.4%) account for over 74% of all decision splits.`;
          break;
        case "measurements":
          answer = `Current clinical inputs: LVEF ${hfInputs.ejection_fraction}% (Ref 50%–70%), Serum Creatinine ${hfInputs.serum_creatinine} mg/dL (Ref 0.7–1.2), Serum Sodium ${hfInputs.serum_sodium} mEq/L (Ref 136–145), CPK ${hfInputs.creatinine_phosphokinase} mcg/L (Ref 30–200), Platelets ${hfInputs.platelets.toLocaleString()}/µL, Observation Day ${hfInputs.time}, Age ${hfInputs.age} yrs, BP History: ${hfInputs.high_blood_pressure ? "Yes" : "No"}, Diabetes: ${hfInputs.diabetes ? "Yes" : "No"}.`;
          break;
        case "review":
          answer = `Recommended clinical review: (1) Urgent echocardiogram (TTE) for updated ejection fraction, chamber dimensions, and valvular regurgitation, (2) Serial serum creatinine, eGFR, and electrolytes for cardiorenal monitoring, (3) Serum BNP / NT-proBNP for volume status, (4) Inpatient heart failure consultation and telemetry monitoring.`;
          break;
        case "questions":
          answer = `Suggested questions for the attending cardiologist: 1) Is there clinical evidence of congestion (orthopnea, elevated JVP, bilateral rales) or poor forward perfusion? 2) Should guideline-directed medical therapy (GDMT: ARNI/ACEi, beta-blocker, MRA, SGLT2i) be titrated or adjusted? 3) Does the worsening cardiorenal index warrant loop diuretic optimization, inotropic support, or evaluation for advanced mechanical circulatory support?`;
          break;
        default:
          answer = `Based on the hemodynamic assessment, the model predicts ${res.statusLabel} at ${res.probabilityPercent.toFixed(1)}% probability. Immediate clinical correlation with echocardiography is recommended.`;
      }
    } else if (activeModelKey === "diabetes") {
      const res = liveDiabetesResult;
      switch (actionType) {
        case "explain":
          answer = `The tuned XGBoost ensemble evaluated 8 metabolic features across 100 decision trees. The calculated log-odds margin is ${res.margin > 0 ? "+" : ""}${res.margin.toFixed(2)}, yielding a calibrated Sigmoid probability of ${res.probabilityPercent.toFixed(1)}%. The model classifies the patient with ${res.statusLabel} (${res.riskClassification}). Metabolic pattern: ${res.metabolicStatus}.`;
          break;
        case "factors":
          answer = `Top clinical contributors ranked by tree-path attribution: (1) ${res.factors[0]?.name ?? "Plasma Glucose"} (${res.factors[0]?.relativeWeight ?? 49}% weight), (2) ${res.factors[1]?.name ?? "BMI"} (${res.factors[1]?.relativeWeight ?? 19}% weight), (3) ${res.factors[2]?.name ?? "Age"} (${res.factors[2]?.relativeWeight ?? 12}% weight), and (4) ${res.factors[3]?.name ?? "Serum Insulin"} (${res.factors[3]?.relativeWeight ?? 8}% weight). Across the entire 100-tree model, plasma glucose drives 48.7% of all decision splits.`;
          break;
        case "measurements":
          answer = `Current clinical inputs: Blood Glucose ${diabetesInputs.glucose} mg/dL (Ref < 140), BMI ${diabetesInputs.bmi.toFixed(1)} kg/m² (Ref 18.5 – 24.9), 2-Hr Serum Insulin ${diabetesInputs.insulin} µU/mL (Ref 16 – 166), Diastolic BP ${diabetesInputs.bloodPressure} mmHg (Ref < 80), Age ${diabetesInputs.age} yrs, Pedigree score ${diabetesInputs.diabetesPedigree.toFixed(3)} (Ref < 0.500).`;
          break;
        case "review":
          answer = `Recommended clinical review: (1) Confirmatory Fasting Plasma Glucose & Glycated Hemoglobin (HbA1c), (2) Comprehensive Metabolic Panel with eGFR and serum creatinine, (3) Fasting lipid panel to evaluate secondary metabolic syndrome, (4) Urine albumin-to-creatinine ratio (uACR) for early nephropathy screening.`;
          break;
        case "questions":
          answer = `Suggested questions for the attending physician: 1) Are there osmotic symptoms such as polyuria, polydipsia, or unexplained weight loss? 2) Is there a history of gestational diabetes during prior pregnancies or macrosomia? 3) Should first-line insulin-sensitizing pharmacotherapy (e.g. metformin) or medical nutrition therapy be initiated?`;
          break;
        default:
          answer = `Based on the metabolic assessment, the model predicts ${res.statusLabel} at ${res.probabilityPercent.toFixed(1)}% probability. Clinical correlation with laboratory HbA1c is required.`;
      }
    } else if (activeModelKey === "breastCancer") {
      const res = liveBcResult;
      switch (actionType) {
        case "explain":
          answer = `The WDBC Logistic Regression model evaluated 30 cytological features from this FNA aspirate. The computed logit is ${res.logit > 0 ? "+" : ""}${res.logit.toFixed(2)}, yielding a Sigmoid probability of ${res.probabilityPercent.toFixed(1)}%. The model classifies this aspirate as ${res.statusLabel}. Morphologic pattern: ${res.histologicPattern}.`;
          break;
        case "factors":
          answer = `The top contributing cytological features are: (1) ${res.factors[0]?.name ?? "—"} (${res.factors[0]?.relativeWeight ?? 0}% weight), (2) ${res.factors[1]?.name ?? "—"} (${res.factors[1]?.relativeWeight ?? 0}% weight), and (3) ${res.factors[2]?.name ?? "—"} (${res.factors[2]?.relativeWeight ?? 0}% weight). These are ranked by their absolute logistic regression coefficient × standardized feature contribution.`;
          break;
        case "measurements":
          answer = `Key cytological measurements: Area (Worst) ${bcInputs.area_worst} µm² (Ref <700), Texture (Worst) ${bcInputs.texture_worst.toFixed(2)} (Ref <20), Radius SE ${bcInputs.radius_se.toFixed(3)} (Ref <0.35), Concave Points (Mean) ${bcInputs.concave_points_mean.toFixed(4)} (Ref <0.035), Symmetry (Worst) ${bcInputs.symmetry_worst.toFixed(3)} (Ref <0.26).`;
          break;
        case "review":
          answer = `Recommended clinical review: (1) Core Needle Biopsy (CNB) for histological Nottingham grading, (2) Receptor status panel — ER, PR, HER2/neu, (3) Ki-67 proliferation index, (4) Bilateral digital mammography + targeted ultrasound. This model output is for decision support only and requires licensed clinician review.`;
          break;
        case "questions":
          answer = `Suggested questions for the attending physician: 1) Is there a palpable discrete mass or skin/nipple retraction on physical examination? 2) Does the patient's family history warrant hereditary BRCA1/2 genetic risk assessment? 3) Is contrast-enhanced breast MRI indicated to evaluate multifocal or contralateral disease?`;
          break;
        default:
          answer = `Based on the cytological FNA assessment, the model predicts ${res.statusLabel} at ${res.probabilityPercent.toFixed(1)}% probability. Clinical correlation with histopathology is required.`;
      }
    } else if (activeModelKey === "anemia") {
      const res = liveAnemiaResult;
      switch (actionType) {
        case "explain":
          answer = `The model evaluated this patient's complete blood indices. With Hemoglobin at ${anemiaInputs.hemoglobin} g/dL, the Logistic Regression logit evaluates to ${res.logit.toFixed(2)}, yielding a ${res.probabilityPercent}% probability of ${res.statusLabel}.`;
          break;
        case "factors":
          answer = `Hemoglobin is the overwhelming contributor (coefficient -25.38), accounting for ~68% of the risk attribution. Sex-specific physiological weighting accounts for ~18%, followed by MCV (${anemiaInputs.mcv} fL) contributing ~7% to cell sizing classification.`;
          break;
        case "results":
          answer = `Patient exhibits a ${res.anemiaMorphology} erythrocyte pattern with ${res.severityLevel.toLowerCase()} severity. The low MCH (${anemiaInputs.mch} pg) reflects hypochromia (diminished intracellular hemoglobin concentration).`;
          break;
        case "review":
          answer = `Recommended clinical review: Serum Ferritin, Total Iron Binding Capacity (TIBC), Reticulocyte Count to assess marrow regeneration, and peripheral smear morphology to rule out occult gastrointestinal blood loss.`;
          break;
        case "questions":
          answer = `Suggested questions for the attending physician: 1) Has the patient reported fatigue, exertional dyspnea, or postural dizziness? 2) Is there dietary deficiency or occult GI bleeding? 3) Is oral iron repletion or IV ferric carboxymaltose preferred?`;
          break;
        default:
          answer = `Based on the patient's hematological findings, ${res.statusLabel} is indicated. Clinical correlation with iron stores and reticulocyte production index is strongly advised.`;
      }
    } else if (activeModelKey === "kidneyDisease") {
      const res = liveKidneyResult;
      switch (actionType) {
        case "explain":
          answer = `Kidney Disease Prediction output class: ${res.predictionClass}. Output probability: ${res.probabilityPercent}%. Clinical risk score: ${res.riskScore}. Risk band: ${res.ckdRiskLevel}. Basis: ${res.classificationBasis}. This is decision support only and is not a diagnosis.`;
          break;
        case "factors":
          answer = `Contributing factors returned by the assessment: ${res.factors.map((f) => `${f.name} (${f.relativeWeight}%)`).join("; ")}.`;
          break;
        case "measurements":
          answer = `Classification basis from the current run: ${res.classificationBasis}. ${res.renalStatusSummary}`;
          break;
        case "review":
          answer = `Items a licensed clinician may review: confirmatory eGFR, urine albumin quantification, metabolic panel, and blood count. This assistant cannot prescribe treatment.`;
          break;
        case "questions":
          answer = `Questions for a clinician: What is the trend in kidney function over time? Are blood pressure and diabetes being managed? Is specialist referral appropriate? This is not medical advice.`;
          break;
        default:
          answer = `Output class: ${res.predictionClass}. Output probability: ${res.probabilityPercent}%. Risk score: ${res.riskScore}. Requires licensed clinician review.`;
      }
    } else if (activeModelKey === "stroke") {
      const res = liveStrokeResult;
      switch (actionType) {
        case "explain":
          answer = `The StandardScaler + Logistic Regression model evaluated 15 binary neurological/cardiovascular symptoms + Age across 70,000 records. The probability of ${res.statusLabel} is ${res.probabilityPercent.toFixed(1)}% (${res.riskBand} band). Logit: ${res.logit.toFixed(2)}.`;
          break;
        case "factors":
          answer = `Top stroke risk contributors: ${res.factors.slice(0, 4).map((f, i) => `(${i + 1}) ${f.name} [${f.contribution}%]`).join(", ")}. The model uses coefficient-weighted symptom attribution.`;
          break;
        case "measurements":
          answer = `Active symptoms: ${["chestPain", "shortnessOfBreath", "irregularHeartbeat", "highBloodPressure", "dizziness", "fatigueWeakness"].filter((k) => (strokeInputs as unknown as Record<string, number>)[k] === 1).join(", ") || "None active"}. Age: ${strokeInputs.age} years.`;
          break;
        case "review":
          answer = `Recommended clinical review: (1) Transcranial Doppler for MCA velocities, (2) 24-hour ambulatory blood pressure monitoring, (3) Carotid duplex imaging, (4) HbA1c and lipid panel. This is decision support only.`;
          break;
        case "questions":
          answer = `Suggested questions: 1) Is antiplatelet monotherapy or dual therapy appropriate? 2) Target systolic goal < 130 mmHg over 14 days? 3) History of TIA or prior cerebrovascular events?`;
          break;
        default:
          answer = `Stroke risk assessment: ${res.statusLabel} at ${res.probabilityPercent.toFixed(1)}% probability. ${res.riskBand} risk band. Requires clinician review.`;
      }
    } else if (activeModelKey === "heartDisease") {
      const res = liveHdResult;
      switch (actionType) {
        case "explain":
          answer = `The Logistic Regression model (Cleveland dataset, ROC-AUC 0.923) evaluated 13 cardiac features with StandardScaler + OneHotEncoding. Coronary risk probability: ${res.probabilityPercent.toFixed(1)}% (${res.riskBand} band). Classification: ${res.statusLabel}.`;
          break;
        case "factors":
          answer = `Top coronary risk contributors: ${res.factors.slice(0, 4).map((f, i) => `(${i + 1}) ${f.name} [${f.contribution}%]`).join(", ")}. These are ranked by absolute logistic regression coefficient contribution.`;
          break;
        case "measurements":
          answer = `Key cardiac inputs: Age ${hdInputs.age}, BP ${hdInputs.trestbps} mmHg, Chol ${hdInputs.chol} mg/dL, Max HR ${hdInputs.thalach} bpm, ST Depression ${hdInputs.oldpeak}, Vessels ${hdInputs.ca}, CP Type ${hdInputs.cp}, Exercise Angina: ${hdInputs.exang ? "Yes" : "No"}.`;
          break;
        case "review":
          answer = `Recommended clinical review: (1) Stress echocardiography or nuclear perfusion imaging, (2) Coronary CT angiography, (3) Lipid panel with LDL particle number, (4) hs-CRP for inflammatory risk stratification. Decision support only.`;
          break;
        case "questions":
          answer = `Suggested questions: 1) Is invasive coronary angiography indicated based on non-invasive findings? 2) Should high-intensity statin therapy be initiated? 3) Is cardiac rehabilitation appropriate for this risk profile?`;
          break;
        default:
          answer = `Coronary heart disease assessment: ${res.statusLabel} at ${res.probabilityPercent.toFixed(1)}% probability. Requires cardiologist review.`;
      }
    } else if (activeModelKey === "liverDisease") {
      const res = liveLiverResult;
      switch (actionType) {
        case "explain":
          answer = `The ILPD Logistic Regression model evaluated 10 hepatic biomarkers across 583 records (ROC-AUC 0.749). Liver disease probability: ${res.probabilityPercent.toFixed(1)}% (${res.riskBand} band). Classification: ${res.statusLabel}.`;
          break;
        case "factors":
          answer = `Top hepatic risk contributors: ${res.factors.slice(0, 4).map((f, i) => `(${i + 1}) ${f.name} [${f.contribution}%]`).join(", ")}. Bilirubin and transaminase elevations are the dominant signals.`;
          break;
        case "measurements":
          answer = `Key liver panel values: Total Bilirubin ${liverInputs.totalBilirubin} mg/dL, Direct Bilirubin ${liverInputs.directBilirubin} mg/dL, ALT ${liverInputs.alamineAminotransferase} IU/L, AST ${liverInputs.aspartateAminotransferase} IU/L, ALP ${liverInputs.alkalinePhosphotase} IU/L, Albumin ${liverInputs.albumin} g/dL, A/G Ratio ${liverInputs.albuminAndGlobulinRatio}.`;
          break;
        case "review":
          answer = `Recommended clinical review: (1) Fractionated bilirubin and serial LFT trending, (2) RUQ ultrasound for parenchymal assessment, (3) PT/INR for synthetic function, (4) Viral hepatitis serologies and autoimmune panel. Decision support only.`;
          break;
        case "questions":
          answer = `Suggested questions: 1) History of chronic alcohol use or viral hepatitis risk factors? 2) Recent exposure to hepatotoxic medications or supplements? 3) Baseline liver imaging for steatosis vs nodularity assessment?`;
          break;
        default:
          answer = `Liver disease assessment: ${res.statusLabel} at ${res.probabilityPercent.toFixed(1)}% probability. Requires hepatology review.`;
      }
    } else {
      answer = `Model result: ${modelConfig.predictionStatus} at ${displayRisk}% prediction probability. Please review the contributing factors and consult the clinical considerations section.`;
    }

    setCopilotMessages((prev) => [
      ...prev,
      { sender: "user", text: actionType.replace(/_/g, " ").toUpperCase() },
      { sender: "ai", text: answer },
    ]);
  };

  const handleSendCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInputText.trim()) return;
    const userQ = copilotInputText;
    setCopilotInputText("");

    let reply = "";
    if (activeModelKey === "diabetes") {
      reply = `Based on the diabetes risk assessment (${liveDiabetesResult.statusLabel} at ${liveDiabetesResult.probabilityPercent.toFixed(1)}%), with primary contributors including ${liveDiabetesResult.factors[0]?.name ?? "plasma glucose"} (${diabetesInputs.glucose} mg/dL), this assessment provides clinical decision support. Laboratory confirmation via FPG or HbA1c is recommended.`;
    } else if (activeModelKey === "breastCancer") {
      reply = `Based on the FNA cytological findings (${liveBcResult.statusLabel} at ${liveBcResult.probabilityPercent.toFixed(1)}%), with top contributors including ${liveBcResult.factors[0]?.name ?? "nuclear morphology"}, this assessment warrants urgent clinician review. The NEXUS model provides decision support — histopathological confirmation is required before clinical action.`;
    } else if (activeModelKey === "anemia") {
      reply = `Based on the patient's hematological findings (${anemiaInputs.hemoglobin} g/dL Hb, ${anemiaInputs.mcv} fL MCV), ${liveAnemiaResult.statusLabel.toLowerCase()} is indicated. Clinical correlation with iron stores and reticulocyte production index is strongly advised.`;
    } else if (activeModelKey === "kidneyDisease") {
      reply = `Kidney Disease Prediction: class ${liveKidneyResult.predictionClass}, output probability ${liveKidneyResult.probabilityPercent}%, risk score ${liveKidneyResult.riskScore}. ${liveKidneyResult.renalStatusSummary} Decision support only — not a diagnosis or prescription.`;
    } else if (activeModelKey === "stroke") {
      reply = `Stroke Risk Assessment: ${liveStrokeResult.statusLabel} at ${liveStrokeResult.probabilityPercent.toFixed(1)}% probability (${liveStrokeResult.riskBand} band). ${liveStrokeResult.clinicalSummary} Clinical decision support — requires neurologist review.`;
    } else if (activeModelKey === "heartDisease") {
      reply = `Coronary Heart Disease Screening: ${liveHdResult.statusLabel} at ${liveHdResult.probabilityPercent.toFixed(1)}% probability (${liveHdResult.riskBand} band). ${liveHdResult.clinicalSummary} Clinical decision support — requires cardiologist review.`;
    } else if (activeModelKey === "liverDisease") {
      reply = `Liver Disease Assessment: ${liveLiverResult.statusLabel} at ${liveLiverResult.probabilityPercent.toFixed(1)}% probability (${liveLiverResult.riskBand} band). ${liveLiverResult.clinicalSummary} Clinical decision support — requires hepatologist review.`;
    } else {
      reply = `The NEXUS ${modelConfig.name} assessment shows ${modelConfig.predictionStatus}. Please review the contributing factors panel for the primary risk drivers. Clinical decision support — requires licensed physician review.`;
    }

    setCopilotMessages((prev) => [
      ...prev,
      { sender: "user", text: userQ },
      { sender: "ai", text: reply },
    ]);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Close model dropdown on outside click
  useEffect(() => {
    if (!modelDropdownOpen) return;
    const handler = () => setModelDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [modelDropdownOpen]);

  useEffect(() => {
    if (clinicalState === "RESULT") {
      setDisplayRisk(modelConfig.risk);
    }
  }, [modelConfig.risk, clinicalState]);

  const activeFactor =
    modelConfig.factors.find((f) => f.id === selectedFactorId) ||
    modelConfig.factors[0];

  // ── Prediction status color logic ────────────────────────────────────────────
  const isPredictionHighRisk =
    modelConfig.risk >= 80 ||
    modelConfig.predictionStatus === "ANEMIA DETECTED" ||
    modelConfig.predictionStatus === "MALIGNANT" ||
    modelConfig.predictionStatus === "DIABETES DETECTED" ||
    modelConfig.predictionStatus === "HIGH STROKE RISK DETECTED" ||
    modelConfig.predictionStatus === "CORONARY HEART DISEASE DETECTED" ||
    modelConfig.predictionStatus === "LIVER DISEASE DETECTED" ||
    modelConfig.predictionStatus === "HEPATIC IMPAIRMENT DETECTED" ||
    (activeModelKey === "kidneyDisease" && liveKidneyResult.stageIndex >= 2);

  return (
    <div className="min-h-screen bg-[#fafafb] text-slate-900 font-sans antialiased selection:bg-slate-200">
      {/* ======================================================================= */}
      {/* 1. TOP EDITORIAL BAR: NEXUS CLINICAL INTELLIGENCE                        */}
      {/* ======================================================================= */}
      {/* ======================================================================= */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between gap-3">

          {/* ── Brand ──────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-semibold text-base tracking-[-0.03em] text-slate-950 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              VITAWEAVE
            </span>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-slate-500 hidden md:inline">
              Clinical Intelligence
            </span>
          </div>

          {/* ── Model switcher: DROPDOWN on <lg, PILL TABS on lg+ ──────── */}

          {/* Mobile / Tablet dropdown */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setModelDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0" />
              {([
                { key: "stroke", label: "Stroke" },
                { key: "heartDisease", label: "Coronary" },
                { key: "anemia", label: "Anemia" },
                { key: "breastCancer", label: "Breast Cancer" },
                { key: "diabetes", label: "Diabetes" },
                { key: "heartFailure", label: "Heart Failure" },
                { key: "kidneyDisease", label: "Kidney" },
                { key: "liverDisease", label: "Liver" },
              ] as { key: ActiveModelKey; label: string }[]).find((m) => m.key === activeModelKey)?.label ?? "Select Model"}
              <svg className={`w-3 h-3 text-slate-500 transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {modelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                {([
                  { key: "stroke", label: "Stroke", sub: "Neurology" },
                  { key: "heartDisease", label: "Coronary", sub: "Cardiology" },
                  { key: "anemia", label: "Anemia", sub: "Hematology" },
                  { key: "breastCancer", label: "Breast Cancer", sub: "Oncology" },
                  { key: "diabetes", label: "Diabetes", sub: "Metabolic" },
                  { key: "heartFailure", label: "Heart Failure", sub: "Hemodynamics" },
                  { key: "kidneyDisease", label: "Kidney Disease", sub: "Nephrology" },
                  { key: "liverDisease", label: "Liver Disease", sub: "Hepatology" },
                ] as { key: ActiveModelKey; label: string; sub: string }[]).map(({ key, label, sub }) => (
                  <button
                    key={key}
                    onClick={() => { handleModelChange(key); setModelDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${activeModelKey === key
                        ? "bg-slate-900 text-white font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] ${activeModelKey === key ? "text-slate-300" : "text-slate-400"}`}>{sub}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop pill tabs */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-1 rounded-full border border-slate-200/60 overflow-hidden">
            {([
              { key: "stroke", label: "Stroke" },
              { key: "heartDisease", label: "Coronary" },
              { key: "anemia", label: "Anemia" },
              { key: "breastCancer", label: "Cancer" },
              { key: "diabetes", label: "Diabetes" },
              { key: "heartFailure", label: "Heart Failure" },
              { key: "kidneyDisease", label: "Kidney" },
              { key: "liverDisease", label: "Liver" },
            ] as { key: ActiveModelKey; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleModelChange(key)}
                className={`px-2.5 xl:px-3 py-1 text-[11px] font-medium rounded-full transition-all duration-150 cursor-pointer whitespace-nowrap ${activeModelKey === key
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* ======================================================================= */}
      {/* 2. CONTEXT BANNER                                                         */}
      {/* ======================================================================= */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            {activeModelKey === "kidneyDisease" ? (
              <div>
                <span className="font-semibold tracking-wider text-slate-900">Kidney Disease Assessment</span>
                <span className="text-slate-500 ml-2 font-medium">Nephrology · Private input</span>
              </div>
            ) : activeModelKey === "stroke" ? (
              <div>
                <span className="font-semibold tracking-wider text-slate-900">Stroke Risk Assessment</span>
                <span className="text-slate-500 ml-2 font-medium">Neurology · Symptom Profile</span>
              </div>
            ) : activeModelKey === "heartDisease" ? (
              <div>
                <span className="font-semibold tracking-wider text-slate-900">Coronary Heart Disease Screening</span>
                <span className="text-slate-500 ml-2 font-medium">Cardiology · Cleveland Protocol</span>
              </div>
            ) : activeModelKey === "liverDisease" ? (
              <div>
                <span className="font-semibold tracking-wider text-slate-900">Liver Disease Screening</span>
                <span className="text-slate-500 ml-2 font-medium">Hepatology · ILPD Protocol</span>
              </div>
            ) : (
              <div>
                <span className="font-mono font-semibold tracking-wider text-slate-900">
                  {modelConfig.patient.id}
                </span>
                <span className="text-slate-600 ml-2 font-medium">
                  {modelConfig.patient.age} · {modelConfig.patient.gender}
                </span>
              </div>
            )}
            {activeModelKey !== "kidneyDisease" && activeModelKey !== "stroke" && activeModelKey !== "heartDisease" && activeModelKey !== "liverDisease" && (
              <>
                <div className="h-3 w-px bg-slate-200 hidden sm:block" />
                <div className="text-slate-600 hidden md:block">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                    Clinical Data:{" "}
                  </span>
                  <span className="font-mono">{modelConfig.patient.vitals}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Lab Input button — shown for all interactive models */}
            <button
              onClick={() => setShowInputModal(!showInputModal)}
              className="px-2.5 sm:px-3 py-1 rounded border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {activeModelKey === "heartFailure"
                  ? "🫀 Hemodynamic Inputs"
                  : activeModelKey === "diabetes"
                    ? "🩺 Metabolic Lab Inputs"
                    : activeModelKey === "breastCancer"
                      ? "🔬 Cytological Inputs"
                      : activeModelKey === "kidneyDisease"
                        ? "🫘 Renal Biomarker Inputs"
                        : activeModelKey === "stroke"
                          ? "🧠 Neuro Symptom Inputs"
                          : activeModelKey === "heartDisease"
                            ? "🫀 Coronary Biomarker Inputs"
                            : activeModelKey === "liverDisease"
                              ? "🫀 Hepatic Panel Inputs"
                              : "🧪 Lab Inputs"}
              </span>
              <span className="text-[10px] text-slate-400">
                ({showInputModal ? "Hide" : "Edit"})
              </span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                Active:
              </span>
              <span className="font-semibold text-slate-800">{modelConfig.name}</span>
            </div>
            <div className="h-3 w-px bg-slate-200 hidden sm:block" />
            <div className="font-mono text-slate-500 text-[11px] hidden sm:block">
              {(activeModelKey === "kidneyDisease" || activeModelKey === "stroke" || activeModelKey === "heartDisease" || activeModelKey === "liverDisease") ? "" : modelConfig.patient.date}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3A. ANEMIA INTERACTIVE LAB INPUT FORM                                    */}
      {/* ======================================================================= */}
      {activeModelKey === "anemia" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Anemia Assessment — Actual ML Inputs (anemia.csv)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct numerical inputs fed into the Scikit-Learn StandardScaler + Logistic
                  Regression pipeline.
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
                {Object.entries(ANEMIA_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleAnemiaPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedAnemiaPresetKey === key
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {/* Gender */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Sex / Gender
                </label>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setAnemiaInputs({ ...anemiaInputs, gender: 0 })}
                    className={`py-1 text-xs rounded font-medium text-center ${anemiaInputs.gender === 0
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    Male (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnemiaInputs({ ...anemiaInputs, gender: 1 })}
                    className={`py-1 text-xs rounded font-medium text-center ${anemiaInputs.gender === 1
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                  >
                    Female (1)
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  WHO Threshold Modulator
                </span>
              </div>

              {/* Hemoglobin */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Hemoglobin (Hb)
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {anemiaInputs.hemoglobin} g/dL
                  </span>
                </div>
                <input
                  type="range"
                  min="6.6"
                  max="16.9"
                  step="0.1"
                  value={anemiaInputs.hemoglobin}
                  onChange={(e) =>
                    setAnemiaInputs({ ...anemiaInputs, hemoglobin: parseFloat(e.target.value) })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>6.6 (Severe)</span>
                  <span>16.9 (Normal)</span>
                </div>
              </div>

              {/* MCV */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    MCV (Volume)
                  </label>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {anemiaInputs.mcv} fL
                  </span>
                </div>
                <input
                  type="range"
                  min="69.4"
                  max="101.6"
                  step="0.2"
                  value={anemiaInputs.mcv}
                  onChange={(e) =>
                    setAnemiaInputs({ ...anemiaInputs, mcv: parseFloat(e.target.value) })
                  }
                  className="w-full accent-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>&lt;80 Microcytic</span>
                  <span>&gt;100 Macrocytic</span>
                </div>
              </div>

              {/* MCH */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    MCH (Weight)
                  </label>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {anemiaInputs.mch} pg
                  </span>
                </div>
                <input
                  type="range"
                  min="16.0"
                  max="30.0"
                  step="0.1"
                  value={anemiaInputs.mch}
                  onChange={(e) =>
                    setAnemiaInputs({ ...anemiaInputs, mch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>&lt;27 Hypochromic</span>
                  <span>30.0 Normal</span>
                </div>
              </div>

              {/* MCHC */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    MCHC (Concentration)
                  </label>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {anemiaInputs.mchc} g/dL
                  </span>
                </div>
                <input
                  type="range"
                  min="27.8"
                  max="32.5"
                  step="0.1"
                  value={anemiaInputs.mchc}
                  onChange={(e) =>
                    setAnemiaInputs({ ...anemiaInputs, mchc: parseFloat(e.target.value) })
                  }
                  className="w-full accent-slate-800 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>27.8 Low</span>
                  <span>32.5 Normal</span>
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex justify-stretch sm:justify-end">
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Re-Run Anemia Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3B. BREAST CANCER CYTOLOGICAL INPUT FORM                                 */}
      {/* ======================================================================= */}
      {activeModelKey === "breastCancer" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-600" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Breast Cancer Assessment — WDBC FNA Cytological Inputs (30 features)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Features extracted from Fine Needle Aspirate digitized images. Inputs fed directly
                  into StandardScaler + Logistic Regression pipeline (best_breast_cancer_model.pkl).
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Clinical Presets:</span>
                {Object.entries(BREAST_CANCER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleBcPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedBcPresetKey === key
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset description */}
            {selectedBcPresetKey && BREAST_CANCER_PRESETS[selectedBcPresetKey] && (
              <div className="mb-4 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">
                  {BREAST_CANCER_PRESETS[selectedBcPresetKey].label}
                </span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mr-2 bg-rose-50 text-rose-700 border border-rose-200">
                  {BREAST_CANCER_PRESETS[selectedBcPresetKey].diagnosis === "M"
                    ? "MALIGNANT"
                    : "BENIGN"}
                </span>
                — {BREAST_CANCER_PRESETS[selectedBcPresetKey].description}
              </div>
            )}

            {/* Mean Features Group */}
            <div className="mb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Mean Cytological Measurements (10 features)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {(
                  [
                    ["radius_mean", "Radius Mean", "mm", 6, 30, 0.1],
                    ["texture_mean", "Texture Mean", "", 9, 40, 0.1],
                    ["perimeter_mean", "Perimeter Mean", "mm", 40, 200, 0.5],
                    ["area_mean", "Area Mean", "µm²", 140, 2600, 5],
                    ["smoothness_mean", "Smoothness", "", 0.05, 0.17, 0.001],
                    ["compactness_mean", "Compactness", "", 0.01, 0.35, 0.005],
                    ["concavity_mean", "Concavity", "", 0, 0.43, 0.005],
                    ["concave_points_mean", "Concave Pts", "", 0, 0.22, 0.002],
                    ["symmetry_mean", "Symmetry", "", 0.1, 0.31, 0.002],
                    ["fractal_dimension_mean", "Fractal Dim.", "", 0.05, 0.1, 0.001],
                  ] as [keyof BreastCancerInputs, string, string, number, number, number][]
                ).map(([key, label, unit, min, max, step]) => (
                  <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate">
                        {label}
                      </label>
                      <span className="text-[10px] font-mono font-bold text-slate-800 ml-1 shrink-0">
                        {typeof bcInputs[key] === "number" ? (bcInputs[key] as number).toFixed(step < 1 ? (step < 0.01 ? 4 : 3) : 1) : bcInputs[key]}
                        {unit && <span className="text-slate-400 ml-0.5 text-[9px]">{unit}</span>}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={bcInputs[key] as number}
                      onChange={(e) =>
                        setBcInputs({ ...bcInputs, [key]: parseFloat(e.target.value) })
                      }
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* SE Features Group */}
            <div className="mb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Standard Error Measurements (10 features)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {(
                  [
                    ["radius_se", "Radius SE", "", 0.1, 3, 0.01],
                    ["texture_se", "Texture SE", "", 0.3, 5, 0.05],
                    ["perimeter_se", "Perimeter SE", "", 0.5, 22, 0.1],
                    ["area_se", "Area SE", "", 6, 550, 2],
                    ["smoothness_se", "Smoothness SE", "", 0.001, 0.03, 0.0005],
                    ["compactness_se", "Compact. SE", "", 0.002, 0.14, 0.002],
                    ["concavity_se", "Concavity SE", "", 0, 0.4, 0.005],
                    ["concave_points_se", "Concave Pts SE", "", 0, 0.054, 0.001],
                    ["symmetry_se", "Symmetry SE", "", 0.007, 0.08, 0.001],
                    ["fractal_dimension_se", "Fractal Dim SE", "", 0.0008, 0.03, 0.0005],
                  ] as [keyof BreastCancerInputs, string, string, number, number, number][]
                ).map(([key, label, unit, min, max, step]) => (
                  <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate">
                        {label}
                      </label>
                      <span className="text-[10px] font-mono font-bold text-slate-800 ml-1 shrink-0">
                        {(bcInputs[key] as number).toFixed(step < 0.001 ? 4 : step < 0.01 ? 3 : step < 1 ? 3 : 1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={bcInputs[key] as number}
                      onChange={(e) =>
                        setBcInputs({ ...bcInputs, [key]: parseFloat(e.target.value) })
                      }
                      className="w-full accent-slate-700 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Features Group */}
            <div className="mb-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                Worst (Largest 3 Values) Measurements (10 features)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {(
                  [
                    ["radius_worst", "Radius Worst", "mm", 7, 37, 0.1],
                    ["texture_worst", "Texture Worst", "", 12, 50, 0.1],
                    ["perimeter_worst", "Perimeter Worst", "mm", 50, 260, 1],
                    ["area_worst", "Area Worst", "µm²", 180, 4300, 10],
                    ["smoothness_worst", "Smoothness Worst", "", 0.07, 0.23, 0.001],
                    ["compactness_worst", "Compact. Worst", "", 0.02, 1.1, 0.01],
                    ["concavity_worst", "Concavity Worst", "", 0, 1.3, 0.01],
                    ["concave_points_worst", "Concave Pts Worst", "", 0, 0.3, 0.002],
                    ["symmetry_worst", "Symmetry Worst", "", 0.15, 0.7, 0.005],
                    ["fractal_dimension_worst", "Fractal Dim Worst", "", 0.05, 0.21, 0.001],
                  ] as [keyof BreastCancerInputs, string, string, number, number, number][]
                ).map(([key, label, unit, min, max, step]) => (
                  <div key={key} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 truncate">
                        {label}
                      </label>
                      <span className="text-[10px] font-mono font-bold text-rose-700 ml-1 shrink-0">
                        {(bcInputs[key] as number).toFixed(step < 0.001 ? 4 : step < 0.1 ? 3 : step < 1 ? 1 : 0)}
                        {unit && <span className="text-slate-400 ml-0.5 text-[9px]">{unit}</span>}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={bcInputs[key] as number}
                      onChange={(e) =>
                        setBcInputs({ ...bcInputs, [key]: parseFloat(e.target.value) })
                      }
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Live result preview + run button */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${liveBcResult.predictionClass === 1
                      ? "bg-rose-600 text-white"
                      : "bg-emerald-600 text-white"
                    }`}
                >
                  Live: {liveBcResult.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  {liveBcResult.probabilityPercent.toFixed(1)}% Prediction Probability
                </span>
                <span className="text-[11px] text-slate-500">
                  Logit {liveBcResult.logit > 0 ? "+" : ""}{liveBcResult.logit.toFixed(2)} · {liveBcResult.histologicPattern}
                </span>
              </div>
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Run Breast Cancer Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3C. DIABETES INTERACTIVE METABOLIC INPUT FORM                            */}
      {/* ======================================================================= */}
      {activeModelKey === "diabetes" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Diabetes Assessment — Actual ML Inputs (diabetes.csv)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct numerical features evaluated by the 100-tree tuned XGBoost ensemble and StandardScaler pipeline.
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Verified Patient Presets:</span>
                {Object.entries(DIABETES_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleDiabetesPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedDiabetesPresetKey === key
                        ? "bg-slate-900 text-white font-medium shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Group 1: Glycemic & Endocrine Secretion */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 flex items-center gap-1.5">
                    <span>🩸</span> Glycemic & Endocrine
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">48.7% Gain</span>
                </div>

                {/* Glucose */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Plasma Blood Glucose
                    </label>
                    <span className="text-[11px] font-mono font-bold text-amber-800">
                      {diabetesInputs.glucose} <span className="text-[9px] text-slate-400 font-normal">mg/dL</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={250}
                    step={1}
                    value={diabetesInputs.glucose}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, glucose: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>50</span>
                    <span className="text-emerald-600 font-medium">Ref: 70–139</span>
                    <span>250</span>
                  </div>
                </div>

                {/* Insulin */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      2-Hr Serum Insulin
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.insulin} <span className="text-[9px] text-slate-400 font-normal">µU/mL</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={600}
                    step={5}
                    value={diabetesInputs.insulin}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, insulin: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>0 (imputed)</span>
                    <span className="text-emerald-600 font-medium">Ref: 16–166</span>
                    <span>600</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Metabolic Adiposity */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>⚖️</span> Metabolic Adiposity
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">19.4% Gain</span>
                </div>

                {/* BMI */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Body Mass Index (BMI)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.bmi.toFixed(1)} <span className="text-[9px] text-slate-400 font-normal">kg/m²</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15.0}
                    max={60.0}
                    step={0.1}
                    value={diabetesInputs.bmi}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, bmi: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>15.0</span>
                    <span className="text-emerald-600 font-medium">Ref: 18.5–24.9</span>
                    <span>60.0</span>
                  </div>
                </div>

                {/* SkinThickness */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Triceps Skinfold Caliper
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.skinThickness} <span className="text-[9px] text-slate-400 font-normal">mm</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={99}
                    step={1}
                    value={diabetesInputs.skinThickness}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, skinThickness: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>0 (imputed)</span>
                    <span className="text-emerald-600 font-medium">Ref: 10–30</span>
                    <span>99</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Hemodynamics & Vitals */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🫀</span> Hemodynamics
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">1.3% Gain</span>
                </div>

                {/* Blood Pressure */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Diastolic Blood Pressure
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.bloodPressure} <span className="text-[9px] text-slate-400 font-normal">mmHg</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={130}
                    step={1}
                    value={diabetesInputs.bloodPressure}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, bloodPressure: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>40</span>
                    <span className="text-emerald-600 font-medium">Ref: 60–80</span>
                    <span>130</span>
                  </div>
                </div>

                {/* Pregnancies */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Gestational Pregnancies
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.pregnancies} <span className="text-[9px] text-slate-400 font-normal">terms</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={17}
                    step={1}
                    value={diabetesInputs.pregnancies}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, pregnancies: parseInt(e.target.value) || 0 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>0</span>
                    <span className="text-slate-400 font-normal">Nulliparous to Multi</span>
                    <span>17</span>
                  </div>
                </div>
              </div>

              {/* Group 4: Demographics & Genetics */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🧬</span> Demographic & Genetic
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">18.2% Gain</span>
                </div>

                {/* Age */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Patient Age
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.age} <span className="text-[9px] text-slate-400 font-normal">years</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={21}
                    max={85}
                    step={1}
                    value={diabetesInputs.age}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, age: parseInt(e.target.value) || 21 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>21</span>
                    <span className="text-slate-400 font-normal">Cohort: 21–81</span>
                    <span>85</span>
                  </div>
                </div>

                {/* Pedigree Function */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Diabetes Pedigree Function
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {diabetesInputs.diabetesPedigree.toFixed(3)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.078}
                    max={2.42}
                    step={0.01}
                    value={diabetesInputs.diabetesPedigree}
                    onChange={(e) =>
                      setDiabetesInputs({ ...diabetesInputs, diabetesPedigree: parseFloat(e.target.value) || 0.1 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>0.078</span>
                    <span className="text-emerald-600 font-medium">Ref: &lt; 0.500</span>
                    <span>2.420</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live result preview + run button */}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${liveDiabetesResult.predictionClass === 1
                      ? "bg-amber-600 text-white"
                      : "bg-emerald-600 text-white"
                    }`}
                >
                  Live: {liveDiabetesResult.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  {liveDiabetesResult.probabilityPercent.toFixed(1)}% Prediction Probability
                </span>
                <span className="text-[11px] text-slate-500">
                  Margin {liveDiabetesResult.margin > 0 ? "+" : ""}{liveDiabetesResult.margin.toFixed(2)} · {liveDiabetesResult.metabolicStatus}
                </span>
              </div>
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Run Diabetes Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3D. HEART FAILURE INTERACTIVE CLINICAL INPUT FORM                         */}
      {/* ======================================================================= */}
      {activeModelKey === "heartFailure" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-600" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Heart Failure Assessment — Actual ML Inputs (heart_failure_clinical_records_dataset.csv)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct clinical features evaluated by the RobustScaler + RandomForestClassifier (800 depth-5 decision trees) pipeline.
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Verified Presets:</span>
                {Object.entries(HEART_FAILURE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleHfPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedHfPresetKey === key
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Description Banner */}
            <div className="mb-4 bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">
                  {HEART_FAILURE_PRESETS[selectedHfPresetKey]?.label}:
                </span>{" "}
                {HEART_FAILURE_PRESETS[selectedHfPresetKey]?.description}
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Row {HEART_FAILURE_PRESETS[selectedHfPresetKey]?.rowNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Group 1: Systolic Function & Cardiorenal */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🫀</span> Systolic & Cardiorenal
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">32.4% RF Gain</span>
                </div>

                {/* Ejection Fraction */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Left Ventricular EF (LVEF)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-rose-700">
                      {hfInputs.ejection_fraction} <span className="text-[9px] text-slate-400 font-normal">%</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={14}
                    max={80}
                    step={1}
                    value={hfInputs.ejection_fraction}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, ejection_fraction: parseInt(e.target.value) || 14 })
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>14% (HFrEF)</span>
                    <span className="text-emerald-600 font-medium">Ref: 50–70%</span>
                    <span>80%</span>
                  </div>
                </div>

                {/* Serum Creatinine */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Serum Creatinine (Cardiorenal)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {hfInputs.serum_creatinine.toFixed(1)} <span className="text-[9px] text-slate-400 font-normal">mg/dL</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={9.4}
                    step={0.1}
                    value={hfInputs.serum_creatinine}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, serum_creatinine: parseFloat(e.target.value) || 0.5 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>0.5</span>
                    <span className="text-emerald-600 font-medium">Ref: 0.7–1.2</span>
                    <span>9.4</span>
                  </div>
                </div>
              </div>

              {/* Group 2: Biomarkers & Enzymes */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🧪</span> Biomarkers & Enzymes
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">15.4% RF Gain</span>
                </div>

                {/* CPK */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Creatinine Phosphokinase (CPK)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {hfInputs.creatinine_phosphokinase} <span className="text-[9px] text-slate-400 font-normal">mcg/L</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={23}
                    max={3000}
                    step={10}
                    value={hfInputs.creatinine_phosphokinase}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, creatinine_phosphokinase: parseInt(e.target.value) || 23 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>23</span>
                    <span className="text-emerald-600 font-medium">Ref: 30–200</span>
                    <span>3000+</span>
                  </div>
                </div>

                {/* Serum Sodium */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Serum Sodium (RAAS Signal)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {hfInputs.serum_sodium} <span className="text-[9px] text-slate-400 font-normal">mEq/L</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={113}
                    max={148}
                    step={1}
                    value={hfInputs.serum_sodium}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, serum_sodium: parseInt(e.target.value) || 113 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>113 (Hyponatremic)</span>
                    <span className="text-emerald-600 font-medium">Ref: 136–145</span>
                    <span>148</span>
                  </div>
                </div>

                {/* Platelets */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Platelet Count
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {Math.round(hfInputs.platelets / 1000)}k <span className="text-[9px] text-slate-400 font-normal">/µL</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={25000}
                    max={750000}
                    step={5000}
                    value={hfInputs.platelets}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, platelets: parseInt(e.target.value) || 25000 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>25k</span>
                    <span className="text-emerald-600 font-medium">Ref: 150k–450k</span>
                    <span>750k</span>
                  </div>
                </div>
              </div>

              {/* Group 3: Clinical History & Comorbidities */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>📋</span> Comorbidities & History
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">Binary Flags</span>
                </div>

                {/* High Blood Pressure */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">
                      Hypertension (Afterload)
                    </label>
                    <span className="text-[9px] text-slate-400">High blood pressure history</span>
                  </div>
                  <div className="flex rounded border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, high_blood_pressure: 0 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.high_blood_pressure === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, high_blood_pressure: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.high_blood_pressure === 1
                          ? "bg-rose-600 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      Yes (1)
                    </button>
                  </div>
                </div>

                {/* Diabetes */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">
                      Diabetes Comorbidity
                    </label>
                    <span className="text-[9px] text-slate-400">Microvascular burden</span>
                  </div>
                  <div className="flex rounded border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, diabetes: 0 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.diabetes === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, diabetes: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.diabetes === 1
                          ? "bg-amber-600 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      Yes (1)
                    </button>
                  </div>
                </div>

                {/* Anaemia */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">
                      Anaemia (Low RBC/Hb)
                    </label>
                    <span className="text-[9px] text-slate-400">Tissue oxygen delivery deficit</span>
                  </div>
                  <div className="flex rounded border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, anaemia: 0 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.anaemia === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, anaemia: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.anaemia === 1
                          ? "bg-rose-600 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      Yes (1)
                    </button>
                  </div>
                </div>

                {/* Smoking */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block">
                      Tobacco Smoking
                    </label>
                    <span className="text-[9px] text-slate-400">Endothelial oxidant stress</span>
                  </div>
                  <div className="flex rounded border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, smoking: 0 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.smoking === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, smoking: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${hfInputs.smoking === 1
                          ? "bg-slate-700 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      Yes (1)
                    </button>
                  </div>
                </div>
              </div>

              {/* Group 4: Demographics & Timeline */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>⏱️</span> Demographics & Timeline
                  </h4>
                  <span className="text-[9px] text-slate-400 font-mono">48.9% RF Gain</span>
                </div>

                {/* Age */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Patient Age
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">
                      {hfInputs.age} <span className="text-[9px] text-slate-400 font-normal">years</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={95}
                    step={1}
                    value={hfInputs.age}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, age: parseInt(e.target.value) || 40 })
                    }
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>40</span>
                    <span className="text-slate-400 font-normal">Cohort: 40–95</span>
                    <span>95</span>
                  </div>
                </div>

                {/* Follow-up Timeline (Days) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">
                      Follow-up Window (Time)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-indigo-700">
                      {hfInputs.time} <span className="text-[9px] text-slate-400 font-normal">days</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={285}
                    step={1}
                    value={hfInputs.time}
                    onChange={(e) =>
                      setHfInputs({ ...hfInputs, time: parseInt(e.target.value) || 4 })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>4 (Acute)</span>
                    <span className="text-emerald-600 font-medium">Ref: &gt; 180 d</span>
                    <span>285</span>
                  </div>
                </div>

                {/* Sex */}
                <div className="pt-1">
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, sex: 0 })}
                      className={`py-1 text-xs rounded font-medium text-center ${hfInputs.sex === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      Female (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, sex: 1 })}
                      className={`py-1 text-xs rounded font-medium text-center ${hfInputs.sex === 1
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                      Male (1)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live result preview + run button */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${liveHfResult.predictionClass === 1
                      ? "bg-rose-600 text-white"
                      : "bg-emerald-600 text-white"
                    }`}
                >
                  Live: {liveHfResult.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  {liveHfResult.probabilityPercent.toFixed(1)}% Mortality Event Probability
                </span>
                <span className="text-[11px] text-slate-500">
                  {liveHfResult.riskClassification} · {liveHfResult.hemodynamicStatus}
                </span>
              </div>
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Run Heart Failure Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModelKey === "kidneyDisease" && showInputModal && (
        <KidneyInputForm
          inputs={kidneyInputs}
          onChange={setKidneyInputs}
          selectedPresetKey={selectedKidneyPresetKey}
          onPresetSelect={handleKidneyPresetSelect}
          liveResult={liveKidneyResult}
          onRunAssessment={triggerAssessment}
          onClose={() => setShowInputModal(false)}
        />
      )}

      {/* ======================================================================= */}
      {/* 3F. STROKE INTERACTIVE LAB INPUT FORM                                    */}
      {/* ======================================================================= */}
      {activeModelKey === "stroke" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Stroke Risk — Neurological Symptom Inputs (stroke_risk_dataset.csv)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  15 binary neurological/cardiovascular symptoms + Age fed into StandardScaler + Logistic Regression (70,000 records, ROC-AUC 1.0).
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
                {Object.entries(STROKE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleStrokePresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedStrokePresetKey === key
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{STROKE_PRESETS[selectedStrokePresetKey]?.label}:</span>{" "}
              {STROKE_PRESETS[selectedStrokePresetKey]?.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cardiovascular Symptoms */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🫀</span> Cardiovascular / Chest Symptoms
                  </h4>
                </div>
                <div className="space-y-2">
                  {(
                    [
                      ["chestPain", "Chest Pain"],
                      ["shortnessOfBreath", "Shortness of Breath"],
                      ["irregularHeartbeat", "Irregular Heartbeat"],
                      ["highBloodPressure", "High Blood Pressure"],
                      ["chestDiscomfortActivity", "Chest Discomfort on Activity"],
                      ["excessiveSweating", "Excessive Sweating"],
                      ["neckJawShoulderBackPain", "Neck / Jaw / Shoulder Pain"],
                      ["edema", "Swelling / Edema"],
                    ] as [keyof StrokeInputs, string][]
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-700">{label}</label>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setStrokeInputs({ ...strokeInputs, [key]: 0 })}
                          className={`px-2 py-0.5 text-[10px] rounded border transition-all cursor-pointer ${strokeInputs[key] === 0 ? "bg-slate-700 text-white border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                        >No</button>
                        <button
                          onClick={() => setStrokeInputs({ ...strokeInputs, [key]: 1 })}
                          className={`px-2 py-0.5 text-[10px] rounded border transition-all cursor-pointer ${strokeInputs[key] === 1 ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                        >Yes</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neurological Symptoms + Age */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🧠</span> Neurological / Systemic Symptoms
                  </h4>
                </div>
                <div className="space-y-2">
                  {(
                    [
                      ["fatigueWeakness", "Fatigue & Weakness"],
                      ["dizziness", "Dizziness / Vertigo"],
                      ["coldHandsFeet", "Cold Hands / Feet"],
                      ["sleepApnea", "Snoring / Sleep Apnea"],
                      ["persistentCough", "Persistent Cough"],
                      ["nauseaVomiting", "Nausea / Vomiting"],
                      ["anxietyDoom", "Anxiety / Feeling of Doom"],
                    ] as [keyof StrokeInputs, string][]
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-700">{label}</label>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setStrokeInputs({ ...strokeInputs, [key]: 0 })}
                          className={`px-2 py-0.5 text-[10px] rounded border transition-all cursor-pointer ${strokeInputs[key] === 0 ? "bg-slate-700 text-white border-slate-700" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                        >No</button>
                        <button
                          onClick={() => setStrokeInputs({ ...strokeInputs, [key]: 1 })}
                          className={`px-2 py-0.5 text-[10px] rounded border transition-all cursor-pointer ${strokeInputs[key] === 1 ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                        >Yes</button>
                      </div>
                    </div>
                  ))}

                  {/* Age Slider */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-medium text-slate-700">Patient Age</label>
                      <span className="text-[11px] font-mono font-bold text-slate-800">{strokeInputs.age} <span className="text-[9px] text-slate-400 font-normal">years</span></span>
                    </div>
                    <input
                      type="range" min={18} max={90} step={1}
                      value={strokeInputs.age}
                      onChange={(e) => setStrokeInputs({ ...strokeInputs, age: parseInt(e.target.value) || 18 })}
                      className="w-full accent-violet-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                      <span>18</span><span className="text-slate-400">Cohort: 18–90</span><span>90</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live result preview */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${liveStrokeResult.predictionClass === 1 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                  }`}>
                  Live: {liveStrokeResult.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  {liveStrokeResult.probabilityPercent.toFixed(1)}% Stroke Risk Probability
                </span>
                <span className="text-[11px] text-slate-500">{liveStrokeResult.riskBand} Band</span>
              </div>
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Run Stroke Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3G. CORONARY HEART DISEASE INTERACTIVE LAB INPUT FORM                    */}
      {/* ======================================================================= */}
      {activeModelKey === "heartDisease" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Coronary Heart Disease — Clinical Biomarker Inputs (Cleveland Dataset)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  13 cardiac features with StandardScaler + OneHotEncoder + Logistic Regression (1,025 records, ROC-AUC 0.923, Accuracy 86.7%).
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
                {Object.entries(HEART_DISEASE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleHdPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedHdPresetKey === key
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{HEART_DISEASE_PRESETS[selectedHdPresetKey]?.label}:</span>{" "}
              {HEART_DISEASE_PRESETS[selectedHdPresetKey]?.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Group 1: Demographics & Vitals */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>👤</span> Demographics & Vitals
                  </h4>
                </div>
                {/* Age */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Age</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{hdInputs.age} <span className="text-[9px] text-slate-400">yrs</span></span>
                  </div>
                  <input type="range" min={29} max={77} step={1} value={hdInputs.age}
                    onChange={(e) => setHdInputs({ ...hdInputs, age: parseInt(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>29</span><span className="text-emerald-600">Cohort: 29–77</span><span>77</span></div>
                </div>
                {/* Sex */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Sex</label>
                  <div className="flex gap-1">
                    {([0, 1] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, sex: v })}
                        className={`flex-1 py-1 text-[10px] rounded border transition-all cursor-pointer ${hdInputs.sex === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{v === 0 ? "Female" : "Male"}</button>
                    ))}
                  </div>
                </div>
                {/* Resting BP */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Resting BP</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{hdInputs.trestbps} <span className="text-[9px] text-slate-400">mmHg</span></span>
                  </div>
                  <input type="range" min={94} max={200} step={1} value={hdInputs.trestbps}
                    onChange={(e) => setHdInputs({ ...hdInputs, trestbps: parseInt(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>94</span><span className="text-emerald-600">Ref: &lt;120</span><span>200</span></div>
                </div>
                {/* Cholesterol */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Serum Cholesterol</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{hdInputs.chol} <span className="text-[9px] text-slate-400">mg/dL</span></span>
                  </div>
                  <input type="range" min={126} max={564} step={1} value={hdInputs.chol}
                    onChange={(e) => setHdInputs({ ...hdInputs, chol: parseInt(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>126</span><span className="text-emerald-600">Ref: &lt;200</span><span>564</span></div>
                </div>
              </div>

              {/* Group 2: Exercise ECG & Angina */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>📈</span> Exercise ECG & Angina
                  </h4>
                </div>
                {/* Max HR */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Max Heart Rate (Thalach)</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{hdInputs.thalach} <span className="text-[9px] text-slate-400">bpm</span></span>
                  </div>
                  <input type="range" min={71} max={202} step={1} value={hdInputs.thalach}
                    onChange={(e) => setHdInputs({ ...hdInputs, thalach: parseInt(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>71</span><span className="text-emerald-600">Ref: &gt;150</span><span>202</span></div>
                </div>
                {/* ST Depression */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">ST Depression (Oldpeak)</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{hdInputs.oldpeak.toFixed(1)} <span className="text-[9px] text-slate-400">mm</span></span>
                  </div>
                  <input type="range" min={0} max={6.2} step={0.1} value={hdInputs.oldpeak}
                    onChange={(e) => setHdInputs({ ...hdInputs, oldpeak: parseFloat(e.target.value) })}
                    className="w-full accent-red-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>0</span><span className="text-emerald-600">Ref: &lt;1.0</span><span>6.2</span></div>
                </div>
                {/* Exercise Angina */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Exercise-Induced Angina</label>
                  <div className="flex gap-1">
                    {([0, 1] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, exang: v })}
                        className={`flex-1 py-1 text-[10px] rounded border transition-all cursor-pointer ${hdInputs.exang === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{v === 0 ? "No" : "Yes"}</button>
                    ))}
                  </div>
                </div>
                {/* Fasting Blood Sugar */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Fasting Blood Sugar &gt;120</label>
                  <div className="flex gap-1">
                    {([0, 1] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, fbs: v })}
                        className={`flex-1 py-1 text-[10px] rounded border transition-all cursor-pointer ${hdInputs.fbs === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{v === 0 ? "No" : "Yes"}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group 3: Chest Pain & Slope */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🩺</span> Chest Pain & ST Slope
                  </h4>
                </div>
                {/* Chest Pain Type */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Chest Pain Type (CP)</label>
                  <div className="grid grid-cols-2 gap-1">
                    {([0, 1, 2, 3] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, cp: v })}
                        className={`py-1 text-[9px] rounded border transition-all cursor-pointer ${hdInputs.cp === v ? "bg-red-600 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{["Typical", "Atypical", "Non-Anginal", "Asymp"][v]}</button>
                    ))}
                  </div>
                </div>
                {/* ST Slope */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Peak Exercise ST Slope</label>
                  <div className="flex gap-1">
                    {([0, 1, 2] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, slope: v })}
                        className={`flex-1 py-1 text-[9px] rounded border transition-all cursor-pointer ${hdInputs.slope === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{["Up", "Flat", "Down"][v]}</button>
                    ))}
                  </div>
                </div>
                {/* RestECG */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Resting ECG</label>
                  <div className="flex gap-1">
                    {([0, 1, 2] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, restecg: v })}
                        className={`flex-1 py-1 text-[9px] rounded border transition-all cursor-pointer ${hdInputs.restecg === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{["Normal", "ST-T Abn", "LVH"][v]}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group 4: Vessels & Thalassemia */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🔬</span> Vessels & Thalassemia
                  </h4>
                </div>
                {/* CA — major vessels */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Major Vessels (Fluoroscopy)</label>
                  <div className="flex gap-1">
                    {([0, 1, 2, 3] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, ca: v })}
                        className={`flex-1 py-1 text-[10px] rounded border transition-all cursor-pointer ${hdInputs.ca === v ? "bg-red-600 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{v}</button>
                    ))}
                  </div>
                </div>
                {/* Thal */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Thalassemia</label>
                  <div className="grid grid-cols-2 gap-1">
                    {([0, 1, 2, 3] as const).map((v) => (
                      <button key={v} onClick={() => setHdInputs({ ...hdInputs, thal: v })}
                        className={`py-1 text-[9px] rounded border transition-all cursor-pointer ${hdInputs.thal === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{["Normal", "Fixed Def", "Reversible", "Other"][v]}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live result preview */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${liveHdResult.predictionClass === 1 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                  }`}>
                  Live: {liveHdResult.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  {liveHdResult.probabilityPercent.toFixed(1)}% Coronary Risk Probability
                </span>
                <span className="text-[11px] text-slate-500">{liveHdResult.riskBand} Band</span>
              </div>
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Run Coronary Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3H. LIVER DISEASE INTERACTIVE LAB INPUT FORM                             */}
      {/* ======================================================================= */}
      {activeModelKey === "liverDisease" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    Liver Disease — Hepatic Panel Inputs (ILPD Dataset)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  10 standardized clinical biomarkers from the Indian Liver Patient Dataset fed into a Logistic Regression pipeline (583 records, ROC-AUC 0.749).
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
                {Object.entries(LIVER_DISEASE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleLiverPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${selectedLiverPresetKey === key
                        ? "bg-slate-900 text-white font-medium"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {preset.label.split(":")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3 bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{LIVER_DISEASE_PRESETS[selectedLiverPresetKey]?.label}:</span>{" "}
              {LIVER_DISEASE_PRESETS[selectedLiverPresetKey]?.description}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Group 1: Demographics */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>👤</span> Demographics
                  </h4>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Age</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.age} <span className="text-[9px] text-slate-400">yrs</span></span>
                  </div>
                  <input type="range" min={4} max={90} step={1} value={liverInputs.age}
                    onChange={(e) => setLiverInputs({ ...liverInputs, age: parseInt(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>4</span><span>Cohort: 4–90</span><span>90</span></div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-700 block mb-1">Gender</label>
                  <div className="flex gap-1">
                    {([0, 1] as const).map((v) => (
                      <button key={v} onClick={() => setLiverInputs({ ...liverInputs, gender: v })}
                        className={`flex-1 py-1 text-[10px] rounded border transition-all cursor-pointer ${liverInputs.gender === v ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}>{v === 0 ? "Male" : "Female"}</button>
                    ))}
                  </div>
                </div>
                {/* Total Protein */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Total Proteins</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.totalProteins.toFixed(1)} <span className="text-[9px] text-slate-400">g/dL</span></span>
                  </div>
                  <input type="range" min={2.7} max={9.6} step={0.1} value={liverInputs.totalProteins}
                    onChange={(e) => setLiverInputs({ ...liverInputs, totalProteins: parseFloat(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>2.7</span><span className="text-emerald-600">Ref: 6.0–8.3</span><span>9.6</span></div>
                </div>
              </div>

              {/* Group 2: Bilirubin */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🟡</span> Bilirubin & Liver Enzymes
                  </h4>
                </div>
                {/* Total Bilirubin */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Total Bilirubin</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.totalBilirubin.toFixed(1)} <span className="text-[9px] text-slate-400">mg/dL</span></span>
                  </div>
                  <input type="range" min={0.4} max={75} step={0.1} value={liverInputs.totalBilirubin}
                    onChange={(e) => setLiverInputs({ ...liverInputs, totalBilirubin: parseFloat(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>0.4</span><span className="text-emerald-600">Ref: 0.2–1.2</span><span>75</span></div>
                </div>
                {/* Direct Bilirubin */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Direct Bilirubin</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.directBilirubin.toFixed(1)} <span className="text-[9px] text-slate-400">mg/dL</span></span>
                  </div>
                  <input type="range" min={0.1} max={19.7} step={0.1} value={liverInputs.directBilirubin}
                    onChange={(e) => setLiverInputs({ ...liverInputs, directBilirubin: parseFloat(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>0.1</span><span className="text-emerald-600">Ref: &lt;0.4</span><span>19.7</span></div>
                </div>
                {/* Alkaline Phosphatase */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Alkaline Phosphatase (ALP)</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.alkalinePhosphotase} <span className="text-[9px] text-slate-400">IU/L</span></span>
                  </div>
                  <input type="range" min={63} max={2110} step={1} value={liverInputs.alkalinePhosphotase}
                    onChange={(e) => setLiverInputs({ ...liverInputs, alkalinePhosphotase: parseInt(e.target.value) })}
                    className="w-full accent-amber-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>63</span><span className="text-emerald-600">Ref: 44–147</span><span>2110</span></div>
                </div>
              </div>

              {/* Group 3: Transaminases & Albumin */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700 flex items-center gap-1.5">
                    <span>🔴</span> Transaminases & Albumin
                  </h4>
                </div>
                {/* ALT */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">ALT (SGPT)</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.alamineAminotransferase} <span className="text-[9px] text-slate-400">IU/L</span></span>
                  </div>
                  <input type="range" min={10} max={2000} step={1} value={liverInputs.alamineAminotransferase}
                    onChange={(e) => setLiverInputs({ ...liverInputs, alamineAminotransferase: parseInt(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>10</span><span className="text-emerald-600">Ref: &lt;45</span><span>2000</span></div>
                </div>
                {/* AST */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">AST (SGOT)</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.aspartateAminotransferase} <span className="text-[9px] text-slate-400">IU/L</span></span>
                  </div>
                  <input type="range" min={10} max={4929} step={1} value={liverInputs.aspartateAminotransferase}
                    onChange={(e) => setLiverInputs({ ...liverInputs, aspartateAminotransferase: parseInt(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>10</span><span className="text-emerald-600">Ref: &lt;40</span><span>4929</span></div>
                </div>
                {/* Albumin */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Albumin</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.albumin.toFixed(1)} <span className="text-[9px] text-slate-400">g/dL</span></span>
                  </div>
                  <input type="range" min={0.9} max={5.5} step={0.1} value={liverInputs.albumin}
                    onChange={(e) => setLiverInputs({ ...liverInputs, albumin: parseFloat(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>0.9</span><span className="text-emerald-600">Ref: 3.5–5.0</span><span>5.5</span></div>
                </div>
                {/* A/G Ratio */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-slate-700">Albumin/Globulin Ratio</label>
                    <span className="text-[11px] font-mono font-bold text-slate-800">{liverInputs.albuminAndGlobulinRatio.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0.3} max={2.8} step={0.01} value={liverInputs.albuminAndGlobulinRatio}
                    onChange={(e) => setLiverInputs({ ...liverInputs, albuminAndGlobulinRatio: parseFloat(e.target.value) })}
                    className="w-full accent-rose-600 cursor-pointer" />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-0.5"><span>0.30</span><span className="text-emerald-600">Ref: &gt;1.0</span><span>2.80</span></div>
                </div>
              </div>
            </div>

            {/* Live result preview */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 ${liveLiverResult.predictionClass === 1 ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"
                  }`}>
                  Live: {liveLiverResult.statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-700 font-semibold">
                  {liveLiverResult.probabilityPercent.toFixed(1)}% Liver Disease Probability
                </span>
                <span className="text-[11px] text-slate-500">{liveLiverResult.riskBand} Band</span>
              </div>
              <button
                onClick={triggerAssessment}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>↻ Run Liver Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. HERO ANATOMICAL WORKSPACE                                              */}
      {/* ======================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT/CENTER: 2.5D Anatomical Digital Twin */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
            <ClinicalCore
              config={modelConfig}
              state={clinicalState}
              assessingPhase={assessingPhase}
              selectedFactorId={selectedFactorId}
              onSelectFactor={setSelectedFactorId}
              onTriggerAssess={triggerAssessment}
            />
            <p className="mt-1 text-[11px] text-slate-500 tracking-wide text-center">
              {activeModelKey === "breastCancer"
                ? "Move cursor over tissue visualization for 2.5D perspective · Click hotspots to inspect cytological factors"
                : activeModelKey === "anemia"
                  ? "Move cursor over erythrocytes for 2.5D perspective · Click hotspots to inspect hematological factors"
                  : activeModelKey === "kidneyDisease"
                    ? "Domain visualization only — not a medical scan · Click hotspots to inspect contributing factors"
                    : "Move cursor over organ for 2.5D perspective · Click hotspots to inspect clinical factors"}
            </p>
          </div>

          {/* RIGHT: Clinical Prediction & Factor Breakdown */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            {/* Prediction Telemetry Block */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-slate-600">
                  Clinical Prediction
                </span>
                {clinicalState === "RESULT" && (
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {modelConfig.probabilityLabel} {displayRisk}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-3 sm:gap-4 pt-1">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.05em] text-slate-950 font-mono shrink-0">
                  {clinicalState === "ASSESSING" ? "--%" : `${displayRisk}%`}
                </span>

                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold tracking-wider uppercase ${isPredictionHighRisk ? "text-rose-600" : "text-emerald-600"
                      }`}
                  >
                    {clinicalState === "ASSESSING" ? "CALCULATING..." : modelConfig.predictionStatus}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {modelConfig.name} · {modelConfig.category} Screener
                  </span>
                  {activeModelKey === "breastCancer" && clinicalState === "RESULT" && (
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {liveBcResult.histologicPattern} · {liveBcResult.riskClassification}
                    </span>
                  )}
                  {activeModelKey === "kidneyDisease" && clinicalState === "RESULT" && (
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {liveKidneyResult.predictionClass} · {liveKidneyResult.ckdRiskLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Model Classification note for Breast Cancer */}
              {activeModelKey === "breastCancer" && clinicalState === "RESULT" && (
                <div className="pt-1 flex flex-wrap gap-2 sm:gap-4 text-[10px] font-mono text-slate-500">
                  <span>
                    MODEL CLASSIFICATION:{" "}
                    <strong className={liveBcResult.predictionClass === 1 ? "text-rose-600" : "text-emerald-600"}>
                      {liveBcResult.statusLabel}
                    </strong>
                  </span>
                  <span>
                    LOGIT:{" "}
                    <strong className="text-slate-700">
                      {liveBcResult.logit > 0 ? "+" : ""}
                      {liveBcResult.logit.toFixed(2)}
                    </strong>
                  </span>
                </div>
              )}
              {activeModelKey === "kidneyDisease" && clinicalState === "RESULT" && (
                <div className="pt-1 flex flex-wrap gap-2 sm:gap-4 text-[10px] font-mono text-slate-500">
                  <span>
                    CLASS:{" "}
                    <strong className={liveKidneyResult.stageIndex >= 2 ? "text-rose-600" : "text-emerald-600"}>
                      {liveKidneyResult.predictionClass}
                    </strong>
                  </span>
                  <span>
                    OUTPUT PROBABILITY:{" "}
                    <strong className="text-slate-700">{liveKidneyResult.probabilityPercent}%</strong>
                  </span>
                  <span>
                    RISK SCORE:{" "}
                    <strong className="text-slate-700">{liveKidneyResult.riskScore}</strong>
                  </span>
                  <span>
                    BAND:{" "}
                    <strong className="text-slate-700">{liveKidneyResult.ckdRiskLevel}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="h-px w-full bg-slate-200/80" />

            {/* Contributing Factors Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-600">
                  Contributing Factors
                </h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {activeModelKey === "breastCancer" ? "Logistic Regression Weight" : "Relative Model Weight"}
                </span>
              </div>

              <div className="space-y-2">
                {modelConfig.factors.map((factor) => {
                  const isSelected = selectedFactorId === factor.id;
                  return (
                    <div
                      key={factor.id}
                      onClick={() => setSelectedFactorId(isSelected ? null : factor.id)}
                      className={`group flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                          ? "bg-rose-50/70 border-rose-300 shadow-sm"
                          : "bg-white hover:bg-slate-50 border-slate-200/70"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${isSelected
                              ? "bg-rose-500"
                              : "bg-slate-300 group-hover:bg-rose-400"
                            }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                            <span className="truncate">{factor.label}</span>
                            <span className="text-[10px] font-normal text-slate-500 truncate">
                              · {factor.category}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 mt-0.5 truncate">
                            {factor.valueDisplay}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded whitespace-nowrap">
                          +{factor.contribution}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* EXPLAIN WITH NEXUS BUTTON */}
              <div className="mt-4 pt-1">
                <button
                  onClick={() => setShowCopilot(true)}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span>EXPLAIN WITH NEXUS →</span>
                </button>
              </div>
            </div>

            {/* Active Factor Drilldown */}
            {activeFactor && (
              <div className="p-3.5 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                  <span className="font-semibold uppercase tracking-wider">
                    {activeFactor.label}
                  </span>
                  <span className="font-mono text-[10px]">{activeFactor.baselineDisplay}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeFactor.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 5. NEXUS AI CLINICAL REASONING                                           */}
        {/* ======================================================================= */}
        <section className="mt-12 pt-8 border-t border-slate-200/80">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">

                Vitaweave Clinical AI Reasoning
              </h2>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-2">
              {activeModelKey === "kidneyDisease"
                ? `Why did the assessment return ${modelConfig.predictionStatus}?`
                : `Why did the model classify this patient as ${modelConfig.predictionStatus}?`}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{modelConfig.aiReasoning}</p>

            {/* Breast Cancer explainability note */}
            {activeModelKey === "breastCancer" && clinicalState === "RESULT" && (
              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Patient Signal
                    </div>
                    <div className="font-mono text-slate-700">30 FNA Features</div>
                    <div className="text-[10px] text-slate-400">StandardScaler normalization</div>
                  </div>
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <span className="text-lg">↓</span>
                    <span className="text-[10px] uppercase tracking-wider">LR Pipeline</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Model Output
                    </div>
                    <div className={`font-mono font-bold ${liveBcResult.predictionClass === 1 ? "text-rose-600" : "text-emerald-600"}`}>
                      {liveBcResult.statusLabel}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Sigmoid({liveBcResult.logit > 0 ? "+" : ""}{liveBcResult.logit.toFixed(2)}) = {liveBcResult.probabilityPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 6. CLINICAL CONSIDERATIONS                                               */}
        {/* ======================================================================= */}
        <section className="mt-10 p-4 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-800">
                Clinical Considerations & Review Guidelines
              </h3>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
              {modelConfig.clinicalConsiderations.priority}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {activeModelKey === "breastCancer"
                  ? "Diagnostic Confirmation"
                  : "Factors to Review (Diagnostic Confirmation)"}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {modelConfig.clinicalConsiderations.factorsToReview.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {activeModelKey === "breastCancer"
                  ? "Follow-Up Considerations"
                  : "Care & Follow-Up Considerations"}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {modelConfig.clinicalConsiderations.followUpConsiderations.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-400 font-bold">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Attending Physician Discussion Points
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {modelConfig.clinicalConsiderations.discussionPoints.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-sky-600 font-bold">?</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            <span>{modelConfig.clinicalConsiderations.disclaimer}</span>
            <span>NEXUS Clinical Safety Protocol v2.4</span>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 7. DOWNSTREAM HOSPITAL SIGNAL                                            */}
        {/* ======================================================================= */}
        <section className="mt-8 p-4 sm:p-6 rounded-xl bg-slate-900 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
                  Downstream Hospital Signal
                </span>
              </div>
              <h3 className="text-base font-semibold tracking-tight text-white">
                {modelConfig.downstreamSignal.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {modelConfig.downstreamSignal.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {modelConfig.downstreamSignal.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-3.5"
                >
                  <div className="text-[11px] text-slate-400 font-medium">{metric.label}</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-amber-400">{metric.change}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">{metric.impact}</div>
                </div>
              ))}
            </div>

            <div className="shrink-0 flex items-center">
              <button
                onClick={() =>
                  alert(
                    `Navigating to NEXUS Service Line Intelligence: ${modelConfig.category} Operations...`
                  )
                }
                className="w-full lg:w-auto px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{modelConfig.downstreamSignal.actionLabel}</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ======================================================================= */}
      {/* 8. CONTEXTUAL NEXUS AI CLINICAL COPILOT SLIDE-OVER                       */}
      {/* ======================================================================= */}
      {showCopilot && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full sm:max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Copilot Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900">
                    NEXUS AI · Clinical Copilot
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    {activeModelKey === "kidneyDisease"
                      ? "Context: Kidney Disease Prediction"
                      : `Context: ${modelConfig.name} (${modelConfig.patient.id})`}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCopilot(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Copilot Chat Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Context Summary Card */}
              <div className="p-3.5 bg-slate-100/80 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500 font-mono text-[10px]">
                  <span>PREDICTION: {modelConfig.predictionStatus}</span>
                  <span>PROBABILITY: {displayRisk}%</span>
                </div>
                <div className="font-mono text-slate-800 text-[11px] truncate">
                  {modelConfig.patient.vitals}
                </div>
                {activeModelKey === "breastCancer" && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    MODEL: WDBC Logistic Regression · 30 FNA Features ·{" "}
                    {liveBcResult.histologicPattern}
                  </div>
                )}
                {activeModelKey === "diabetes" && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    MODEL: Tuned XGBoost Ensemble · 100 Trees ·{" "}
                    {liveDiabetesResult.metabolicStatus}
                  </div>
                )}
                {activeModelKey === "heartFailure" && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    MODEL: Random Forest Ensemble · 800 Trees ·{" "}
                    {liveHfResult.hemodynamicStatus}
                  </div>
                )}
              </div>

              {/* Messages */}
              {copilotMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-xl text-xs leading-relaxed ${msg.sender === "user"
                        ? "bg-slate-900 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/70"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Input Footer */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Quick Clinical Inquiries:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleQuickQuestion("explain")}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  Explain this prediction
                </button>
                <button
                  onClick={() => handleQuickQuestion("factors")}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  Which factors contributed most?
                </button>
                {activeModelKey === "heartFailure" ? (
                  <button
                    onClick={() => handleQuickQuestion("measurements")}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Explain hemodynamic values
                  </button>
                ) : activeModelKey === "diabetes" ? (
                  <button
                    onClick={() => handleQuickQuestion("measurements")}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Explain metabolic values
                  </button>
                ) : activeModelKey === "breastCancer" ? (
                  <button
                    onClick={() => handleQuickQuestion("measurements")}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Explain cytological measurements
                  </button>
                ) : (
                  <button
                    onClick={() => handleQuickQuestion("results")}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    Explain patient results
                  </button>
                )}
                <button
                  onClick={() => handleQuickQuestion("review")}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  What should be reviewed?
                </button>
                <button
                  onClick={() => handleQuickQuestion("questions")}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  Prepare questions for clinician
                </button>
              </div>

              <form onSubmit={handleSendCopilot} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder={
                    activeModelKey === "heartFailure"
                      ? "Ask NEXUS about this heart failure assessment..."
                      : activeModelKey === "diabetes"
                        ? "Ask NEXUS about this diabetes assessment..."
                        : activeModelKey === "breastCancer"
                          ? "Ask NEXUS about this breast cancer assessment..."
                          : "Ask NEXUS about this patient..."
                  }
                  value={copilotInputText}
                  onChange={(e) => setCopilotInputText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Send
                </button>
              </form>

              <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider">
                Decision Support Only · Requires licensed clinician review
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
