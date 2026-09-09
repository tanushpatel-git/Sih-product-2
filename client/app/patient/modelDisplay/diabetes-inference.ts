/**
 * Exact mathematical inference engine for Pima Indians Diabetes Model
 * Extracted directly from diabetes_model.pkl (XGBoost Classifier, 100 depth-3 trees)
 * and diabetes_scaler.pkl (StandardScaler with median zero-imputation)
 * Dataset: diabetes.csv (768 patients, 8 clinical features, binary Outcome 0 / 1)
 */

import diabetesTreesData from "./diabetes-trees.json";

export interface DiabetesInputs {
  pregnancies: number; // Discrete count (0 - 17)
  glucose: number; // 2-hr oral glucose tolerance test (mg/dL, 50 - 250)
  bloodPressure: number; // Diastolic blood pressure (mm Hg, 40 - 130)
  skinThickness: number; // Triceps skin fold thickness (mm, 0 - 99)
  insulin: number; // 2-Hour serum insulin (µU/mL, 0 - 850)
  bmi: number; // Body mass index (weight in kg/(height in m)^2, 15 - 65)
  diabetesPedigree: number; // Diabetes pedigree genetic function (0.05 - 2.50)
  age: number; // Age in years (21 - 90)
}

export interface DiabetesFactorAttribution {
  id: string;
  name: string;
  category: "Glycemic Regulation" | "Metabolic Adiposity" | "Endocrine Secretion" | "Genetic & Demographic";
  value: number;
  unit: string;
  zScore: number;
  logitContribution: number;
  relativeWeight: number; // Proportional percentage (0 - 100)
  statusText: string;
  normalRangeText: string;
  description: string;
}

export interface DiabetesPredictionResult {
  predictionClass: 0 | 1;
  statusLabel: "DIABETES DETECTED" | "NO DIABETES DETECTED";
  probabilityPercent: number; // Calibrated sigmoid risk probability (0.0 - 100.0%)
  margin: number; // XGBoost log-odds margin
  factors: DiabetesFactorAttribution[];
  metabolicStatus: "Severe Glycemic Dysregulation" | "Impaired Glucose Tolerance" | "Optimal Glycemic Homeostasis";
  riskClassification: "HIGH RISK" | "ELEVATED RISK" | "BORDERLINE / MODERATE" | "LOW RISK";
}

export const DIABETES_FEATURE_KEYS: Array<keyof DiabetesInputs> = [
  "pregnancies",
  "glucose",
  "bloodPressure",
  "skinThickness",
  "insulin",
  "bmi",
  "diabetesPedigree",
  "age",
];

// Exact StandardScaler parameters extracted from diabetes_scaler.pkl
export const DIABETES_SCALER_PARAMS = {
  means: {
    pregnancies: 3.81921824104235,
    glucose: 121.671009771987,
    bloodPressure: 72.1400651465798,
    skinThickness: 29.042345276873,
    insulin: 137.705211726384,
    bmi: 32.4467426710098,
    diabetesPedigree: 0.477428338762215,
    age: 33.3664495114007,
  },
  scales: {
    pregnancies: 3.31144821658637,
    glucose: 29.9793507646557,
    bloodPressure: 12.2651192609104,
    skinThickness: 8.88461128168882,
    insulin: 78.7005999683524,
    bmi: 6.81858311594323,
    diabetesPedigree: 0.330031190774767,
    age: 11.8237979025474,
  },
  // Exact training median replacements for 0 values (from model.ipynb)
  medians: {
    glucose: 117.0,
    bloodPressure: 72.0,
    skinThickness: 29.0,
    insulin: 125.0,
    bmi: 32.3,
  },
};

// Base score log-odds margin: log(0.3485342 / (1 - 0.3485342))
export const DIABETES_BASE_MARGIN = -0.625488540693607;

// Global XGBoost Gain feature importances (derived from 100 boosted trees)
export const DIABETES_GLOBAL_IMPORTANCES = {
  glucose: 0.4865,
  bmi: 0.1944,
  age: 0.1208,
  insulin: 0.0755,
  diabetesPedigree: 0.0610,
  skinThickness: 0.0260,
  pregnancies: 0.0227,
  bloodPressure: 0.0132,
};

interface CompactTree {
  l: number[];
  r: number[];
  f: number[];
  c: number[];
}

const trees: CompactTree[] = diabetesTreesData as CompactTree[];

/**
 * Executes exact XGBoost ensemble inference matching Scikit-Learn / XGBClassifier
 */
export function runDiabetesInference(inputs: DiabetesInputs): DiabetesPredictionResult {
  // 1. Zero imputation for physiological metrics where 0 indicates missing measurement
  const effGlucose = inputs.glucose === 0 ? DIABETES_SCALER_PARAMS.medians.glucose : inputs.glucose;
  const effBP = inputs.bloodPressure === 0 ? DIABETES_SCALER_PARAMS.medians.bloodPressure : inputs.bloodPressure;
  const effSkin = inputs.skinThickness === 0 ? DIABETES_SCALER_PARAMS.medians.skinThickness : inputs.skinThickness;
  const effInsulin = inputs.insulin === 0 ? DIABETES_SCALER_PARAMS.medians.insulin : inputs.insulin;
  const effBMI = inputs.bmi === 0 ? DIABETES_SCALER_PARAMS.medians.bmi : inputs.bmi;

  // 2. Standardize features using exact StandardScaler parameters
  const zPreg = (inputs.pregnancies - DIABETES_SCALER_PARAMS.means.pregnancies) / DIABETES_SCALER_PARAMS.scales.pregnancies;
  const zGluc = (effGlucose - DIABETES_SCALER_PARAMS.means.glucose) / DIABETES_SCALER_PARAMS.scales.glucose;
  const zBP = (effBP - DIABETES_SCALER_PARAMS.means.bloodPressure) / DIABETES_SCALER_PARAMS.scales.bloodPressure;
  const zSkin = (effSkin - DIABETES_SCALER_PARAMS.means.skinThickness) / DIABETES_SCALER_PARAMS.scales.skinThickness;
  const zIns = (effInsulin - DIABETES_SCALER_PARAMS.means.insulin) / DIABETES_SCALER_PARAMS.scales.insulin;
  const zBMI = (effBMI - DIABETES_SCALER_PARAMS.means.bmi) / DIABETES_SCALER_PARAMS.scales.bmi;
  const zPed = (inputs.diabetesPedigree - DIABETES_SCALER_PARAMS.means.diabetesPedigree) / DIABETES_SCALER_PARAMS.scales.diabetesPedigree;
  const zAge = (inputs.age - DIABETES_SCALER_PARAMS.means.age) / DIABETES_SCALER_PARAMS.scales.age;

  const standardized = [zPreg, zGluc, zBP, zSkin, zIns, zBMI, zPed, zAge];

  // 3. Evaluate 100 XGBoost decision trees and calculate per-feature path attribution
  let margin = DIABETES_BASE_MARGIN;
  const attributions = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let t = 0; t < trees.length; t++) {
    const tree = trees[t];
    let node = 0;
    const visitedFeatures: number[] = [];

    while (tree.l[node] !== -1) {
      const featIdx = tree.f[node];
      visitedFeatures.push(featIdx);
      const threshold = tree.c[node];
      node = standardized[featIdx] < threshold ? tree.l[node] : tree.r[node];
    }

    const leafWeight = tree.c[node];
    margin += leafWeight;

    // Attribute leaf weight across unique features on decision path
    const unique = Array.from(new Set(visitedFeatures));
    if (unique.length > 0) {
      const splitVal = leafWeight / unique.length;
      for (const f of unique) {
        attributions[f] += splitVal;
      }
    }
  }

  // 4. Calibrated Sigmoid probability
  const proba = 1 / (1 + Math.exp(-margin));
  const probabilityPercent = Math.round(proba * 1000) / 10; // e.g. 65.3%

  const predictionClass: 0 | 1 = proba >= 0.5 ? 1 : 0;
  const statusLabel = predictionClass === 1 ? "DIABETES DETECTED" : "NO DIABETES DETECTED";

  let riskClassification: "HIGH RISK" | "ELEVATED RISK" | "BORDERLINE / MODERATE" | "LOW RISK";
  if (proba >= 0.60) {
    riskClassification = "HIGH RISK";
  } else if (proba >= 0.50) {
    riskClassification = "ELEVATED RISK";
  } else if (proba >= 0.25) {
    riskClassification = "BORDERLINE / MODERATE";
  } else {
    riskClassification = "LOW RISK";
  }

  let metabolicStatus: "Severe Glycemic Dysregulation" | "Impaired Glucose Tolerance" | "Optimal Glycemic Homeostasis";
  if (effGlucose >= 160 || proba >= 0.60) {
    metabolicStatus = "Severe Glycemic Dysregulation";
  } else if (effGlucose >= 120 || proba >= 0.40) {
    metabolicStatus = "Impaired Glucose Tolerance";
  } else {
    metabolicStatus = "Optimal Glycemic Homeostasis";
  }

  // 5. Compute relative weights for explainability
  // For positive risk: features driving margin > 0.
  // We use positive absolute contributions normalized to 100%.
  const absContribs = attributions.map((c) => Math.max(0.001, Math.abs(c)));
  const totalAbs = absContribs.reduce((a, b) => a + b, 0);

  const factorDefs: DiabetesFactorAttribution[] = [
    {
      id: "glucose",
      name: "Plasma Blood Glucose",
      category: "Glycemic Regulation",
      value: effGlucose,
      unit: "mg/dL",
      zScore: zGluc,
      logitContribution: attributions[1],
      relativeWeight: Math.round((absContribs[1] / totalAbs) * 100),
      statusText: `${effGlucose} mg/dL`,
      normalRangeText: "Ref: 70 – 139 mg/dL",
      description: "2-hour oral glucose challenge. Primary diagnostic driver in the 100-tree XGBoost ensemble.",
    },
    {
      id: "bmi",
      name: "Body Mass Index (BMI)",
      category: "Metabolic Adiposity",
      value: effBMI,
      unit: "kg/m²",
      zScore: zBMI,
      logitContribution: attributions[5],
      relativeWeight: Math.round((absContribs[5] / totalAbs) * 100),
      statusText: `${effBMI.toFixed(1)} kg/m²`,
      normalRangeText: "Ref: 18.5 – 24.9 kg/m²",
      description: "Adiposity marker strongly coupled with insulin resistance and secondary risk acceleration.",
    },
    {
      id: "age",
      name: "Patient Age",
      category: "Genetic & Demographic",
      value: inputs.age,
      unit: "years",
      zScore: zAge,
      logitContribution: attributions[7],
      relativeWeight: Math.round((absContribs[7] / totalAbs) * 100),
      statusText: `${inputs.age} yrs`,
      normalRangeText: "Ref: 21 – 81 yrs",
      description: "Chronological age reflecting gradual beta-cell reserve reduction and cumulative metabolic demand.",
    },
    {
      id: "insulin",
      name: "2-Hour Serum Insulin",
      category: "Endocrine Secretion",
      value: effInsulin,
      unit: "µU/mL",
      zScore: zIns,
      logitContribution: attributions[4],
      relativeWeight: Math.round((absContribs[4] / totalAbs) * 100),
      statusText: inputs.insulin === 0 ? `${effInsulin} µU/mL (imputed)` : `${effInsulin} µU/mL`,
      normalRangeText: "Ref: 16 – 166 µU/mL",
      description: "2-Hour post-load serum insulin signaling endocrine pancreatic islet secretory compensation.",
    },
    {
      id: "pedigree",
      name: "Diabetes Pedigree Function",
      category: "Genetic & Demographic",
      value: inputs.diabetesPedigree,
      unit: "score",
      zScore: zPed,
      logitContribution: attributions[6],
      relativeWeight: Math.round((absContribs[6] / totalAbs) * 100),
      statusText: `${inputs.diabetesPedigree.toFixed(3)}`,
      normalRangeText: "Ref: < 0.500",
      description: "Genetic score modeling familial diabetes history, inheritance patterns, and age of onset.",
    },
    {
      id: "bloodPressure",
      name: "Diastolic Blood Pressure",
      category: "Glycemic Regulation",
      value: effBP,
      unit: "mmHg",
      zScore: zBP,
      logitContribution: attributions[2],
      relativeWeight: Math.round((absContribs[2] / totalAbs) * 100),
      statusText: inputs.bloodPressure === 0 ? `${effBP} mmHg (imputed)` : `${effBP} mmHg`,
      normalRangeText: "Ref: 60 – 80 mmHg",
      description: "Resting diastolic arterial pressure reflecting microvascular metabolic peripheral resistance.",
    },
    {
      id: "pregnancies",
      name: "Pregnancy History",
      category: "Genetic & Demographic",
      value: inputs.pregnancies,
      unit: "count",
      zScore: zPreg,
      logitContribution: attributions[0],
      relativeWeight: Math.round((absContribs[0] / totalAbs) * 100),
      statusText: `${inputs.pregnancies} term`,
      normalRangeText: "Ref: 0 – 17",
      description: "Gestational metabolic episodes associated with transient insulin resistance and vascular strain.",
    },
    {
      id: "skinThickness",
      name: "Triceps Skinfold Caliper",
      category: "Metabolic Adiposity",
      value: effSkin,
      unit: "mm",
      zScore: zSkin,
      logitContribution: attributions[3],
      relativeWeight: Math.round((absContribs[3] / totalAbs) * 100),
      statusText: inputs.skinThickness === 0 ? `${effSkin} mm (imputed)` : `${effSkin} mm`,
      normalRangeText: "Ref: 10 – 30 mm",
      description: "Peripheral triceps subcutaneous adipose caliper reflecting somatic body fat distribution.",
    },
  ];

  // Sort factors descending by relative weight
  factorDefs.sort((a, b) => b.relativeWeight - a.relativeWeight);

  return {
    predictionClass,
    statusLabel,
    probabilityPercent,
    margin,
    factors: factorDefs,
    metabolicStatus,
    riskClassification,
  };
}

/**
 * 4 Real Patient Presets directly taken from verified rows of diabetes.csv
 */
export const DIABETES_PRESETS: Record<
  string,
  { label: string; description: string; rowNumber: number; inputs: DiabetesInputs }
> = {
  case1_severe: {
    label: "Case 1: Severe Hyperglycemia (Row 175)",
    description: "Peak ensemble risk (65.3% prob) — Marked glucose elevation (179 mg/dL), BMI 32.7, 8 pregnancies.",
    rowNumber: 175,
    inputs: {
      pregnancies: 8,
      glucose: 179,
      bloodPressure: 72,
      skinThickness: 42,
      insulin: 130,
      bmi: 32.7,
      diabetesPedigree: 0.719,
      age: 36,
    },
  },
  case2_elevated: {
    label: "Case 2: Confirmed Diabetic (Row 0)",
    description: "Ensemble positive (51.9% prob) — Glucose 148 mg/dL, BMI 33.6, elevated pedigree score 0.627, age 50.",
    rowNumber: 0,
    inputs: {
      pregnancies: 6,
      glucose: 148,
      bloodPressure: 72,
      skinThickness: 35,
      insulin: 0,
      bmi: 33.6,
      diabetesPedigree: 0.627,
      age: 50,
    },
  },
  case3_borderline: {
    label: "Case 3: Borderline Normal (Row 1)",
    description: "Ensemble negative (20.3% prob) — Normal glucose (85 mg/dL), mild BMI elevation (26.6), age 31.",
    rowNumber: 1,
    inputs: {
      pregnancies: 1,
      glucose: 85,
      bloodPressure: 66,
      skinThickness: 29,
      insulin: 0,
      bmi: 26.6,
      diabetesPedigree: 0.351,
      age: 31,
    },
  },
  case4_optimal: {
    label: "Case 4: Optimal Euglycemic (Row 617)",
    description: "Ensemble minimum risk (15.1% prob) — Fasting glucose 68 mg/dL, lean BMI 20.1, young age 23.",
    rowNumber: 617,
    inputs: {
      pregnancies: 2,
      glucose: 68,
      bloodPressure: 62,
      skinThickness: 13,
      insulin: 15,
      bmi: 20.1,
      diabetesPedigree: 0.257,
      age: 23,
    },
  },
};
