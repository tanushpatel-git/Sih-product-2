"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import ClinicalCore, { ClinicalState, AssessingPhase } from "./ClinicalCore";
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

type ActiveModelKey = "stroke" | "heartDisease" | "anemia" | "breastCancer" | "diabetes" | "heartFailure";

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

    return baseConfig;
  }, [activeModelKey, liveAnemiaResult, liveBcResult, liveDiabetesResult, liveHfResult, anemiaInputs, bcInputs, diabetesInputs, hfInputs]);

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
    setShowInputModal(false);

    let targetRisk: number;
    if (key === "anemia") targetRisk = Math.round(liveAnemiaResult.probabilityPercent);
    else if (key === "breastCancer") targetRisk = Math.round(liveBcResult.probabilityPercent);
    else if (key === "diabetes") targetRisk = Math.round(liveDiabetesResult.probabilityPercent);
    else if (key === "heartFailure") targetRisk = Math.round(liveHfResult.probabilityPercent);
    else targetRisk = clinicalModels[key].risk;

    setDisplayRisk(targetRisk);
    setClinicalState("RESULT");

    // Reset copilot context when switching models
    const greetings: Record<ActiveModelKey, string> = {
      stroke:
        "I've reviewed this patient's neurological stroke risk profile. Ask me about the model output, contributing vascular factors, or what to review.",
      heartDisease:
        "I've reviewed this patient's coronary risk indicators. Ask me about the cardiac model prediction, contributing factors, or clinical follow-up.",
      anemia:
        "I've reviewed this patient's clinical hematology profile. Select a quick inquiry below or ask a specific question regarding diagnostic findings.",
      breastCancer:
        "I've reviewed the current breast cancer model assessment for this FNA cytological aspirate. Ask me about the prediction, cytological contributors, or what the clinician should review.",
      diabetes:
        "I've reviewed the current diabetes risk assessment and metabolic profile for this patient. Ask me about the prediction, glycemic contributors, or clinical review considerations.",
      heartFailure:
        "I've reviewed the current heart failure risk assessment and hemodynamic profile for this patient. Ask me about the mortality event prediction, systolic/cardiorenal contributors, or clinical review considerations.",
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

  const activeFactor =
    modelConfig.factors.find((f) => f.id === selectedFactorId) ||
    modelConfig.factors[0];

  // ── Prediction status color logic ────────────────────────────────────────────
  const isPredictionHighRisk =
    modelConfig.risk >= 80 ||
    modelConfig.predictionStatus === "ANEMIA DETECTED" ||
    modelConfig.predictionStatus === "MALIGNANT" ||
    modelConfig.predictionStatus === "DIABETES DETECTED";

  return (
    <div className="min-h-screen bg-[#fafafb] text-slate-900 font-sans antialiased selection:bg-slate-200">
      {/* ======================================================================= */}
      {/* 1. TOP EDITORIAL BAR: NEXUS CLINICAL INTELLIGENCE                        */}
      {/* ======================================================================= */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-base tracking-[-0.03em] text-slate-950 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-900" />
              NEXUS
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-slate-500">
              Clinical Intelligence Workstation
            </span>
          </div>

          {/* Model Switcher Tabs — side by side in navbar */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/60">
            <button
              onClick={() => handleModelChange("stroke")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeModelKey === "stroke"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Stroke Model (Neuro)
            </button>
            <button
              onClick={() => handleModelChange("heartDisease")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeModelKey === "heartDisease"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Coronary Model (Cardio)
            </button>
            <button
              onClick={() => handleModelChange("anemia")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeModelKey === "anemia"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Anemia Model (Hematology)
            </button>
            <button
              onClick={() => handleModelChange("breastCancer")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeModelKey === "breastCancer"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Breast Cancer Model (Oncology)
            </button>
            <button
              onClick={() => handleModelChange("diabetes")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeModelKey === "diabetes"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Diabetes Model (Metabolic)
            </button>
            <button
              onClick={() => handleModelChange("heartFailure")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                activeModelKey === "heartFailure"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Heart Failure (Hemodynamics)
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* 2. PATIENT CONTEXT BANNER                                                 */}
      {/* ======================================================================= */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="font-mono font-semibold tracking-wider text-slate-900">
                {modelConfig.patient.id}
              </span>
              <span className="text-slate-600 ml-2 font-medium">
                {modelConfig.patient.age} · {modelConfig.patient.gender}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-200 hidden sm:block" />
            <div className="text-slate-600 hidden sm:block">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                Clinical Data:{" "}
              </span>
              <span className="font-mono">{modelConfig.patient.vitals}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Lab Input button — shown for interactive models */}
            {(activeModelKey === "anemia" || activeModelKey === "breastCancer" || activeModelKey === "diabetes" || activeModelKey === "heartFailure") && (
              <button
                onClick={() => setShowInputModal(!showInputModal)}
                className="px-3 py-1 rounded border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>
                  {activeModelKey === "heartFailure"
                    ? "🫀 Hemodynamic Inputs"
                    : activeModelKey === "diabetes"
                    ? "🩺 Metabolic Lab Inputs"
                    : activeModelKey === "breastCancer"
                    ? "🔬 Cytological Inputs"
                    : "🧪 Patient Lab Inputs"}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({showInputModal ? "Hide" : "Edit"})
                </span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                Active Model:
              </span>
              <span className="font-semibold text-slate-800">{modelConfig.name}</span>
            </div>
            <div className="h-3 w-px bg-slate-200 hidden sm:block" />
            <div className="font-mono text-slate-500 text-[11px]">{modelConfig.patient.date}</div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3A. ANEMIA INTERACTIVE LAB INPUT FORM                                    */}
      {/* ======================================================================= */}
      {activeModelKey === "anemia" && showInputModal && (
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 lg:px-10 py-5">
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
                {Object.entries(ANEMIA_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleAnemiaPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                      selectedAnemiaPresetKey === key
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
                    className={`py-1 text-xs rounded font-medium text-center ${
                      anemiaInputs.gender === 0
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Male (0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnemiaInputs({ ...anemiaInputs, gender: 1 })}
                    className={`py-1 text-xs rounded font-medium text-center ${
                      anemiaInputs.gender === 1
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

            <div className="mt-3.5 flex justify-end">
              <button
                onClick={triggerAssessment}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 lg:px-10 py-5">
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Clinical Presets:</span>
                {Object.entries(BREAST_CANCER_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleBcPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                      selectedBcPresetKey === key
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
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    liveBcResult.predictionClass === 1
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
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 lg:px-10 py-5">
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Verified Patient Presets:</span>
                {Object.entries(DIABETES_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleDiabetesPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                      selectedDiabetesPresetKey === key
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
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    liveDiabetesResult.predictionClass === 1
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
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 lg:px-10 py-5">
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Verified Presets:</span>
                {Object.entries(HEART_FAILURE_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleHfPresetSelect(key)}
                    className={`px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer ${
                      selectedHfPresetKey === key
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
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.high_blood_pressure === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, high_blood_pressure: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.high_blood_pressure === 1
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
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.diabetes === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, diabetes: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.diabetes === 1
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
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.anaemia === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, anaemia: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.anaemia === 1
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
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.smoking === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      No (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, smoking: 1 })}
                      className={`px-2 py-0.5 text-[10px] font-medium ${
                        hfInputs.smoking === 1
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
                      className={`py-1 text-xs rounded font-medium text-center ${
                        hfInputs.sex === 0
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Female (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHfInputs({ ...hfInputs, sex: 1 })}
                      className={`py-1 text-xs rounded font-medium text-center ${
                        hfInputs.sex === 1
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    liveHfResult.predictionClass === 1
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
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>↻ Run Heart Failure Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. HERO ANATOMICAL WORKSPACE                                              */}
      {/* ======================================================================= */}
      <main className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-16">
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

              <div className="flex items-baseline gap-4 pt-1">
                <span className="text-6xl lg:text-7xl font-semibold tracking-[-0.05em] text-slate-950 font-mono">
                  {clinicalState === "ASSESSING" ? "--%"  : `${displayRisk}%`}
                </span>

                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold tracking-wider uppercase ${
                      isPredictionHighRisk ? "text-rose-600" : "text-emerald-600"
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
                </div>
              </div>

              {/* Model Classification note for Breast Cancer */}
              {activeModelKey === "breastCancer" && clinicalState === "RESULT" && (
                <div className="pt-1 flex gap-4 text-[10px] font-mono text-slate-500">
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
                      className={`group flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-rose-50/70 border-rose-300 shadow-sm"
                          : "bg-white hover:bg-slate-50 border-slate-200/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2 h-2 rounded-full transition-colors ${
                            isSelected
                              ? "bg-rose-500"
                              : "bg-slate-300 group-hover:bg-rose-400"
                          }`}
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                            <span>{factor.label}</span>
                            <span className="text-[10px] font-normal text-slate-500">
                              · {factor.category}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                            {factor.valueDisplay}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
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
                NEXUS Clinical AI Reasoning
              </h2>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-2">
              Why did the model classify this patient as {modelConfig.predictionStatus}?
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
        <section className="mt-10 p-6 rounded-xl bg-white border border-slate-200 shadow-xs">
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

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider font-mono">
            <span>{modelConfig.clinicalConsiderations.disclaimer}</span>
            <span>NEXUS Clinical Safety Protocol v2.4</span>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 7. DOWNSTREAM HOSPITAL SIGNAL                                            */}
        {/* ======================================================================= */}
        <section className="mt-8 p-6 rounded-xl bg-slate-900 text-white shadow-xl">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
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
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Copilot Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-900">
                    NEXUS AI · Clinical Copilot
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">
                    Context: {modelConfig.name} ({modelConfig.patient.id})
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
                    className={`max-w-[88%] p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === "user"
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
