/**
 * Exact mathematical inference engine for Wisconsin Breast Cancer (WDBC) Model
 * Extracted directly from best_breast_cancer_model.pkl (Scikit-Learn Pipeline: StandardScaler + LogisticRegression)
 * Dataset: breast-cancer.csv (569 patients, 30 features, binary classification M / B)
 */

export interface BreastCancerInputs {
  radius_mean: number;
  texture_mean: number;
  perimeter_mean: number;
  area_mean: number;
  smoothness_mean: number;
  compactness_mean: number;
  concavity_mean: number;
  concave_points_mean: number;
  symmetry_mean: number;
  fractal_dimension_mean: number;
  radius_se: number;
  texture_se: number;
  perimeter_se: number;
  area_se: number;
  smoothness_se: number;
  compactness_se: number;
  concavity_se: number;
  concave_points_se: number;
  symmetry_se: number;
  fractal_dimension_se: number;
  radius_worst: number;
  texture_worst: number;
  perimeter_worst: number;
  area_worst: number;
  smoothness_worst: number;
  compactness_worst: number;
  concavity_worst: number;
  concave_points_worst: number;
  symmetry_worst: number;
  fractal_dimension_worst: number;
}

export interface BreastCancerFactorAttribution {
  id: string;
  name: string;
  category: "Cellular Morphology" | "Nuclear Margins" | "Texture & Atypia" | "Tissue Dynamics";
  value: number;
  unit: string;
  zScore: number;
  coefficient: number;
  logitContribution: number;
  relativeWeight: number; // proportional percentage (0 - 100)
  statusText: string;
  normalRangeText: string;
  description: string;
}

export interface BreastCancerPredictionResult {
  predictionClass: 0 | 1;
  statusLabel: "BENIGN" | "MALIGNANT";
  probabilityPercent: number; // 0.0 - 100.0%
  logit: number;
  factors: BreastCancerFactorAttribution[];
  histologicPattern: "Invasive High-Atypia" | "Intermediate Suspicion" | "Benign Cellular Architecture";
  riskClassification: "NOMINAL" | "MODERATE" | "HIGH SUSPICION" | "CRITICAL MALIGNANCY";
}

export const BREAST_CANCER_FEATURE_KEYS: Array<keyof BreastCancerInputs> = [
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

// Exact StandardScaler parameters extracted from best_breast_cancer_model.pkl
export const BC_SCALER_PARAMS = {
  means: [
    14.1660769230769, 19.4176923076923, 92.2158681318681, 659.578241758242, 0.095992945054945,
    0.103834857142857, 0.0891842828571429, 0.0490145978021978, 0.181497142857143, 0.0627148131868132,
    0.411187252747253, 1.21788197802198, 2.91156879120879, 41.2791032967033, 0.00689525274725275,
    0.025323432967033, 0.0320175507692308, 0.0116906175824176, 0.0204266989010989, 0.00376603802197802,
    16.3515142857143, 25.9048791208791, 107.860483516484, 890.569230769231, 0.132083032967033,
    0.255529472527473, 0.275166367032967, 0.115490705494505, 0.291363736263736, 0.0841236923076923,
  ],
  scales: [
    3.57514584296619, 4.28593536200716, 24.6899414867669, 360.022403254659, 0.0142939574456663,
    0.0538509591895904, 0.0816081745789685, 0.0396423374879228, 0.0276158525220217, 0.00696293457761408,
    0.289863734435345, 0.551704870522932, 2.12078456427827, 48.3309757005975, 0.00285147075523965,
    0.0176046647039929, 0.0316943985137901, 0.0062823507239402, 0.00830145215891184, 0.00262910285024563,
    4.89564847631466, 6.07284725450896, 34.1384425214184, 581.7058880535, 0.0234553735081219,
    0.158225863585616, 0.211833143682743, 0.0667703567240114, 0.0629740747572748, 0.0181486758998092,
  ],
};

// Exact LogisticRegression parameters extracted from best_breast_cancer_model.pkl (C=1, liblinear)
export const BC_MODEL_PARAMS = {
  coefficients: [
    0.350461353217123, 0.483944601767186, 0.344488978101924, 0.448719207747679, 0.34100026461427,
    -0.448548432295066, 0.790535371283132, 0.954813689268623, -0.16507747052901, -0.0682272927619802,
    1.24363234851771, -0.407024833407424, 0.759177574111342, 0.93340571055829, 0.252020043393086,
    -0.915840348637468, -0.0991740198279512, 0.468080469330792, -0.32174876843441, -0.581290338525526,
    0.896585086870237, 1.42380581002245, 0.726071790797484, 0.92409206106042, 0.426599149580353,
    -0.167723950425891, 0.910626881666036, 0.697882345975113, 1.0591019174562, 0.059075248510345,
  ],
  intercept: -0.195907577755518,
};

/**
 * Runs exact Scikit-Learn Logistic Regression prediction
 */
export function runBreastCancerInference(inputs: BreastCancerInputs): BreastCancerPredictionResult {
  let logit = BC_MODEL_PARAMS.intercept;
  const rawContributions: Array<{ key: keyof BreastCancerInputs; logitContribution: number; z: number }> = [];

  for (let i = 0; i < 30; i++) {
    const key = BREAST_CANCER_FEATURE_KEYS[i];
    const val = inputs[key];
    const z = (val - BC_SCALER_PARAMS.means[i]) / BC_SCALER_PARAMS.scales[i];
    const contrib = BC_MODEL_PARAMS.coefficients[i] * z;
    logit += contrib;
    rawContributions.push({ key, logitContribution: contrib, z });
  }

  // Sigmoid probability
  const proba = 1 / (1 + Math.exp(-Math.max(-50, Math.min(50, logit))));
  const probabilityPercent = Math.round(proba * 1000) / 10;
  const predictionClass: 0 | 1 = proba >= 0.5 ? 1 : 0;
  const statusLabel = predictionClass === 1 ? "MALIGNANT" : "BENIGN";

  // Top clinically diagnostic factors selected for explainability
  // Calculate relative proportional weights among the top influential predictors
  const topFactorKeys: Array<{ key: keyof BreastCancerInputs; name: string; category: "Cellular Morphology" | "Nuclear Margins" | "Texture & Atypia" | "Tissue Dynamics"; unit: string; desc: string; normal: string }> = [
    {
      key: "texture_worst",
      name: "Worst Nuclear Chromatin Texture",
      category: "Texture & Atypia",
      unit: "gray-scale std",
      desc: "Extreme texture variance indicating coarse, irregular chromatin condensation in high-grade nuclear atypia.",
      normal: "Ref: < 20.0 (Benign average)",
    },
    {
      key: "radius_se",
      name: "Nuclear Radius Heterogeneity (SE)",
      category: "Cellular Morphology",
      unit: "std error",
      desc: "Variance in cell nuclear boundary distance indicating high anisokaryosis (pleomorphism) among aspirated cells.",
      normal: "Ref: < 0.35 SE",
    },
    {
      key: "symmetry_worst",
      name: "Extreme Nuclear Asymmetry",
      category: "Cellular Morphology",
      unit: "symmetry ratio",
      desc: "Loss of round/oval nuclear symmetry reflecting dysplastic mitotic division and architectural distortion.",
      normal: "Ref: < 0.26 ratio",
    },
    {
      key: "concave_points_mean",
      name: "Mean Contour Concavity Points",
      category: "Nuclear Margins",
      unit: "indentations",
      desc: "Prevalence of sharp clefts and irregular indentations along the nuclear perimeter, indicative of aggressive invasion.",
      normal: "Ref: < 0.035 points",
    },
    {
      key: "area_worst",
      name: "Largest Nuclear Area (Worst)",
      category: "Cellular Morphology",
      unit: "sq microns",
      desc: "Severe nuclear hypertrophy where largest cell populations exceed benign sizing limits.",
      normal: "Ref: < 700 sq microns",
    },
  ];

  const factorSum = topFactorKeys.reduce((acc, item) => {
    const found = rawContributions.find((r) => r.key === item.key);
    return acc + Math.abs(found?.logitContribution || 1);
  }, 0) || 1;

  const factors: BreastCancerFactorAttribution[] = topFactorKeys.map((item) => {
    const found = rawContributions.find((r) => r.key === item.key)!;
    const weight = Math.max(4, Math.round((Math.abs(found.logitContribution) / factorSum) * 100));

    return {
      id: item.key,
      name: item.name,
      category: item.category,
      value: inputs[item.key],
      unit: item.unit,
      zScore: found.z,
      coefficient: BC_MODEL_PARAMS.coefficients[BREAST_CANCER_FEATURE_KEYS.indexOf(item.key)],
      logitContribution: found.logitContribution,
      relativeWeight: weight,
      statusText: `${inputs[item.key]} ${item.unit} (${found.z > 0 ? `+${found.z.toFixed(1)} SD` : `${found.z.toFixed(1)} SD`})`,
      normalRangeText: item.normal,
      description: item.desc,
    };
  });

  // Clinical morphology classification
  let morphology: "Invasive High-Atypia" | "Intermediate Suspicion" | "Benign Cellular Architecture" = "Benign Cellular Architecture";
  let riskClass: "NOMINAL" | "MODERATE" | "HIGH SUSPICION" | "CRITICAL MALIGNANCY" = "NOMINAL";

  if (predictionClass === 1) {
    if (inputs.area_worst > 1200 || inputs.concave_points_worst > 0.18) {
      morphology = "Invasive High-Atypia";
      riskClass = "CRITICAL MALIGNANCY";
    } else {
      morphology = "Intermediate Suspicion";
      riskClass = "HIGH SUSPICION";
    }
  } else {
    riskClass = proba > 0.25 ? "MODERATE" : "NOMINAL";
  }

  return {
    predictionClass,
    statusLabel,
    probabilityPercent,
    logit,
    factors,
    histologicPattern: morphology,
    riskClassification: riskClass,
  };
}

// Clinically authentic presets extracted directly from breast-cancer.csv
export const BREAST_CANCER_PRESETS: Record<string, { label: string; diagnosis: "M" | "B"; description: string; inputs: BreastCancerInputs }> = {
  case1_malignant_severe: {
    label: "Case 1: Invasive High-Atypia Carcinoma (Malignant)",
    diagnosis: "M",
    description: "FNA aspirate exhibiting marked nuclear pleomorphism, large nuclear area (area_worst 2019), and dense irregular chromatin.",
    inputs: {
      radius_mean: 17.99,
      texture_mean: 10.38,
      perimeter_mean: 122.8,
      area_mean: 1001.0,
      smoothness_mean: 0.1184,
      compactness_mean: 0.2776,
      concavity_mean: 0.3001,
      concave_points_mean: 0.1471,
      symmetry_mean: 0.2419,
      fractal_dimension_mean: 0.07871,
      radius_se: 1.095,
      texture_se: 0.9053,
      perimeter_se: 8.589,
      area_se: 153.4,
      smoothness_se: 0.006399,
      compactness_se: 0.04904,
      concavity_se: 0.05373,
      concave_points_se: 0.01587,
      symmetry_se: 0.03003,
      fractal_dimension_se: 0.006193,
      radius_worst: 25.38,
      texture_worst: 17.33,
      perimeter_worst: 184.6,
      area_worst: 2019.0,
      smoothness_worst: 0.1622,
      compactness_worst: 0.6656,
      concavity_worst: 0.7119,
      concave_points_worst: 0.2654,
      symmetry_worst: 0.4601,
      fractal_dimension_worst: 0.1189,
    },
  },
  case2_benign_fibroadenoma: {
    label: "Case 2: Uniform Cell Morphology (Benign Fibroadenoma)",
    diagnosis: "B",
    description: "Aspirate demonstrating uniform, cohesive cell clusters with smooth contours, low concavity, and normal nuclear sizing.",
    inputs: {
      radius_mean: 13.54,
      texture_mean: 14.36,
      perimeter_mean: 87.46,
      area_mean: 566.3,
      smoothness_mean: 0.09779,
      compactness_mean: 0.08129,
      concavity_mean: 0.06664,
      concave_points_mean: 0.04781,
      symmetry_mean: 0.1885,
      fractal_dimension_mean: 0.05766,
      radius_se: 0.2699,
      texture_se: 0.7886,
      perimeter_se: 2.058,
      area_se: 23.56,
      smoothness_se: 0.008462,
      compactness_se: 0.0146,
      concavity_se: 0.02387,
      concave_points_se: 0.01315,
      symmetry_se: 0.0198,
      fractal_dimension_se: 0.0023,
      radius_worst: 15.11,
      texture_worst: 19.26,
      perimeter_worst: 99.7,
      area_worst: 711.2,
      smoothness_worst: 0.144,
      compactness_worst: 0.1773,
      concavity_worst: 0.239,
      concave_points_worst: 0.1288,
      symmetry_worst: 0.2977,
      fractal_dimension_worst: 0.07259,
    },
  },
  case3_malignant_grade2: {
    label: "Case 3: Infiltrating Ductal Lesion (Malignant)",
    diagnosis: "M",
    description: "Elevated chromatin texture (texture_worst 25.53), prominent indentations, and enlarged perimeter (perimeter_worst 152.5).",
    inputs: {
      radius_mean: 19.69,
      texture_mean: 21.25,
      perimeter_mean: 130.0,
      area_mean: 1203.0,
      smoothness_mean: 0.1096,
      compactness_mean: 0.1599,
      concavity_mean: 0.1974,
      concave_points_mean: 0.1279,
      symmetry_mean: 0.2069,
      fractal_dimension_mean: 0.05999,
      radius_se: 0.7456,
      texture_se: 0.7869,
      perimeter_se: 4.585,
      area_se: 94.03,
      smoothness_se: 0.00615,
      compactness_se: 0.04006,
      concavity_se: 0.03832,
      concave_points_se: 0.02058,
      symmetry_se: 0.0225,
      fractal_dimension_se: 0.004571,
      radius_worst: 23.57,
      texture_worst: 25.53,
      perimeter_worst: 152.5,
      area_worst: 1709.0,
      smoothness_worst: 0.1444,
      compactness_worst: 0.4245,
      concavity_worst: 0.4504,
      concave_points_worst: 0.243,
      symmetry_worst: 0.3613,
      fractal_dimension_worst: 0.08758,
    },
  },
  case4_benign_quiescent: {
    label: "Case 4: Quiescent Benign Nodular Pattern",
    diagnosis: "B",
    description: "Low cellularity, minimal margin irregularity (concavity_mean 0.01), and small nuclear dimensions across all 30 metrics.",
    inputs: {
      radius_mean: 11.51,
      texture_mean: 18.63,
      perimeter_mean: 73.34,
      area_mean: 409.0,
      smoothness_mean: 0.09524,
      compactness_mean: 0.05473,
      concavity_mean: 0.01215,
      concave_points_mean: 0.01315,
      symmetry_mean: 0.1693,
      fractal_dimension_mean: 0.05866,
      radius_se: 0.166,
      texture_se: 1.156,
      perimeter_se: 1.407,
      area_se: 12.44,
      smoothness_se: 0.006598,
      compactness_se: 0.01006,
      concavity_se: 0.007389,
      concave_points_se: 0.006487,
      symmetry_se: 0.01977,
      fractal_dimension_se: 0.002333,
      radius_worst: 13.07,
      texture_worst: 22.46,
      perimeter_worst: 83.12,
      area_worst: 521.6,
      smoothness_worst: 0.1292,
      compactness_worst: 0.1232,
      concavity_worst: 0.04791,
      concave_points_worst: 0.04139,
      symmetry_worst: 0.2827,
      fractal_dimension_worst: 0.06771,
    },
  },
};
