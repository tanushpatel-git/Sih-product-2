export interface ClinicalFactor {
  id: string;
  label: string;
  contribution: number; // e.g. 21 (for +21%)
  x: number; // normalized coordinate 0.0 - 1.0
  y: number; // normalized coordinate 0.0 - 1.0
  category: string;
  valueDisplay: string;
  baselineDisplay: string;
  description: string;
}

export interface DownstreamMetric {
  label: string;
  change: string; // e.g. "↑ 14%"
  trend: "up" | "down" | "neutral";
  impact: string;
}

export interface ClinicalConsiderations {
  priority: string;
  priorityLevel: "NORMAL" | "ELEVATED" | "HIGH" | "CRITICAL";
  factorsToReview: string[];
  followUpConsiderations: string[];
  discussionPoints: string[];
  disclaimer: string;
}

export interface ClinicalModelConfig {
  id: string;
  name: string;
  category: string;
  asset: string;
  risk: number; // 0 - 100
  riskLevel: "NORMAL" | "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
  predictionStatus: string; // e.g. "MALIGNANT" | "BENIGN" | "ANEMIA DETECTED" | "HIGH RISK"
  probabilityLabel: string; // "Prediction Probability" | "Risk Probability"
  confidence: number; // e.g. 91
  anatomy: "brain" | "heart" | "blood" | "breast" | "metabolic" | "cardiacFailure";
  scanLabel: string;
  patient: {
    id: string;
    age: number;
    gender: string;
    date: string;
    vitals: string;
  };
  primarySignal: {
    label: string;
    x: number;
    y: number;
  };
  factors: ClinicalFactor[];
  aiReasoning: string;
  clinicalConsiderations: ClinicalConsiderations;
  downstreamSignal: {
    title: string;
    subtitle: string;
    metrics: DownstreamMetric[];
    actionLabel: string;
  };
}

export const clinicalModels: Record<string, ClinicalModelConfig> = {
  stroke: {
    id: "stroke",
    name: "Stroke Risk",
    category: "Neurology",
    asset: "/clinical-brain-twin.jpg",
    risk: 82,
    riskLevel: "HIGH",
    predictionStatus: "HIGH RISK",
    probabilityLabel: "Risk Probability",
    confidence: 91,
    anatomy: "brain",
    scanLabel: "NEUROLOGICAL FEATURES",
    patient: {
      id: "PATIENT 1042",
      age: 67,
      gender: "MALE",
      date: "07 SEP 2026",
      vitals: "BP 158/94 · HbA1c 7.4% · LDL 142",
    },
    primarySignal: {
      label: "Cerebrovascular signal",
      x: 0.44,
      y: 0.47,
    },
    factors: [
      {
        id: "vascular",
        label: "Cerebrovascular Signal",
        contribution: 18,
        x: 0.44,
        y: 0.47,
        category: "Neuro-Vasculature",
        valueDisplay: "MCA Flow Velocity 142 cm/s",
        baselineDisplay: "Ref: < 100 cm/s",
        description:
          "Focal hyperintensity and impaired flow velocity in middle cerebral artery branches, indicating localized hemodynamic vulnerability.",
      },
      {
        id: "hypertension",
        label: "Hypertension (Stage II)",
        contribution: 21,
        x: 0.35,
        y: 0.34,
        category: "Hemodynamics",
        valueDisplay: "158/94 mmHg (Chronic)",
        baselineDisplay: "Ref: < 120/80 mmHg",
        description:
          "Sustained systolic elevation exerting shearing stress on cerebral micro-vessels and accelerated arterial stiffening.",
      },
      {
        id: "age",
        label: "Age Risk Multiplier",
        contribution: 17,
        x: 0.65,
        y: 0.38,
        category: "Demographics",
        valueDisplay: "67 Years",
        baselineDisplay: "Threshold: > 60 Yrs",
        description:
          "Age-associated vascular elasticity decline compounding ischemic risk profile and collateral circulation degradation.",
      },
      {
        id: "glucose",
        label: "Glycemic Impairment",
        contribution: 12,
        x: 0.52,
        y: 0.64,
        category: "Metabolic",
        valueDisplay: "HbA1c 7.4% · Fasting 138 mg/dL",
        baselineDisplay: "Ref: < 5.7%",
        description:
          "Chronic hyperglycemia promoting endothelial inflammation and capillary basement membrane thickening.",
      },
      {
        id: "frontal",
        label: "Frontal Region Perfusion",
        contribution: 14,
        x: 0.28,
        y: 0.46,
        category: "Perfusion",
        valueDisplay: "rCBF -16% Deficit",
        baselineDisplay: "Ref: Symmetric Flow",
        description:
          "Mild hypoperfusion detected in the prefrontal microvascular bed matching early ischemic vulnerability patterns.",
      },
    ],
    aiReasoning:
      "Patient exhibits acute cerebrovascular strain characterized by MCA velocity elevation (+18%) coupled with chronic uncontrolled Stage II systolic hypertension (+21%). Together with age-stratified microvascular stiffness (+17%), the neural digital twin projects an 82% 30-day ischemic stroke probability. Immediate antihypertensive titration and neurovascular ultrasound review recommended.",
    clinicalConsiderations: {
      priority: "Urgent Outpatient Neurovascular Triage",
      priorityLevel: "HIGH",
      factorsToReview: ["Transcranial Doppler (MCA velocities)", "24-Hour Ambulatory Blood Pressure", "Glycemic Stability (HbA1c)"],
      followUpConsiderations: ["Evaluate tolerance for secondary prevention ACE-i/ARB titration", "Carotid duplex imaging to exclude extracranial stenosis", "Patient lifestyle counseling on sodium intake"],
      discussionPoints: ["Is antiplatelet monotherapy or dual therapy appropriate given the MCA velocities?", "Target systolic goal < 130 mmHg over 14 days?"],
      disclaimer: "REQUIRES CLINICIAN REVIEW · DECISION SUPPORT ONLY",
    },
    downstreamSignal: {
      title: "Elevated stroke-risk population detected",
      subtitle: "Regional cohort pattern matched across 43 active cases in Ward 4 & Outpatient Clinic B",
      metrics: [
        { label: "Neurology admissions", change: "↑ 14%", trend: "up", impact: "+6 acute beds required" },
        { label: "ICU demand", change: "↑ 8%", trend: "up", impact: "2 neuro-critical beds projected" },
        { label: "Bed demand", change: "↑ 11%", trend: "up", impact: "Estimated 4.2 day avg stay" },
      ],
      actionLabel: "VIEW IN HOSPITAL INTELLIGENCE →",
    },
  },

  heartDisease: {
    id: "heart-disease",
    name: "Coronary Heart Disease",
    category: "Cardiology",
    asset: "/clinical-heart-twin.jpg",
    risk: 71,
    riskLevel: "ELEVATED",
    predictionStatus: "ELEVATED RISK",
    probabilityLabel: "Risk Probability",
    confidence: 88,
    anatomy: "heart",
    scanLabel: "CARDIAC FEATURES",
    patient: {
      id: "PATIENT 1042",
      age: 67,
      gender: "MALE",
      date: "07 SEP 2026",
      vitals: "HR 78 bpm · LDL 168 mg/dL · hs-CRP 3.4 mg/L",
    },
    primarySignal: {
      label: "Coronary arterial hotspot",
      x: 0.58,
      y: 0.52,
    },
    factors: [
      {
        id: "coronary",
        label: "LAD Arterial Bifurcation",
        contribution: 26,
        x: 0.58,
        y: 0.52,
        category: "Arterial Morphology",
        valueDisplay: "LAD Agatston Score 284",
        baselineDisplay: "Ref: < 100",
        description:
          "Significant calcium burden and wall shear stress at proximal left anterior descending coronary bifurcation.",
      },
      {
        id: "cholesterol",
        label: "Atherogenic Lipid Burden",
        contribution: 20,
        x: 0.42,
        y: 0.38,
        category: "Lipid Panel",
        valueDisplay: "LDL 168 mg/dL · Non-HDL 194",
        baselineDisplay: "Ref: < 100 mg/dL",
        description:
          "Sustained elevated apolipoprotein-B particle retention driving progressive intimomedial plaque formation.",
      },
      {
        id: "age_cardio",
        label: "Cardiovascular Age Factor",
        contribution: 15,
        x: 0.62,
        y: 0.32,
        category: "Demographics",
        valueDisplay: "67 Years",
        baselineDisplay: "Threshold: > 55 Yrs",
        description:
          "Arterial compliance degradation and left ventricular diastolic stiffness baseline commensurate with aging.",
      },
      {
        id: "crp",
        label: "Systemic Vascular Inflammation",
        contribution: 10,
        x: 0.46,
        y: 0.68,
        category: "Biomarkers",
        valueDisplay: "hs-CRP 3.4 mg/L",
        baselineDisplay: "Ref: < 1.0 mg/L",
        description:
          "Sub-acute systemic inflammatory cascade heightening plaque instability and microthrombus risk.",
      },
    ],
    aiReasoning:
      "Cardiac digital twin demonstrates elevated coronary artery calcium accumulation along the LAD junction (+26%) aggravated by high atherogenic LDL burden (+20%) and systemic inflammatory markers (+10%). Overall coronary event risk calculated at 71% (Elevated). Recommended for coronary CT angiography and intensive lipid-lowering optimization.",
    clinicalConsiderations: {
      priority: "Cardiology Consultation & Lipid Intensification",
      priorityLevel: "ELEVATED",
      factorsToReview: ["Coronary CT Angiography (CCTA)", "High-Sensitivity Troponin / hs-CRP", "Statin Monotherapy Response"],
      followUpConsiderations: ["Initiate high-intensity statin + ezetimibe to achieve LDL < 55 mg/dL", "Stress myocardial perfusion assessment", "Aspirin 81 mg primary/secondary prophylaxis review"],
      discussionPoints: ["Is anatomical invasive coronary catheterization warranted based on symptoms?", "Baseline ECG ischemia monitoring"],
      disclaimer: "REQUIRES CLINICIAN REVIEW · DECISION SUPPORT ONLY",
    },
    downstreamSignal: {
      title: "Coronary event risk cluster detected",
      subtitle: "Telemetry monitoring surge correlated across cardiology service line",
      metrics: [
        { label: "Cath lab utilization", change: "↑ 18%", trend: "up", impact: "+3 emergency slots" },
        { label: "Cardiac telemetry", change: "↑ 12%", trend: "up", impact: "94% unit capacity reached" },
        { label: "Statin intervention protocol", change: "↑ 22%", trend: "up", impact: "Outpatient pharmacy sync" },
      ],
      actionLabel: "VIEW IN HOSPITAL INTELLIGENCE →",
    },
  },

  anemia: {
    id: "anemia",
    name: "Anemia Risk",
    category: "Hematology",
    asset: "/clinical-blood-twin.jpg",
    risk: 96,
    riskLevel: "HIGH",
    predictionStatus: "ANEMIA DETECTED",
    probabilityLabel: "Prediction Probability",
    confidence: 96,
    anatomy: "blood",
    scanLabel: "HEMATOLOGICAL FEATURES",
    patient: {
      id: "PATIENT 1042",
      age: 67,
      gender: "FEMALE",
      date: "08 SEP 2026",
      vitals: "Hb 8.2 g/dL · MCV 71.8 fL · MCH 19.5 pg · MCHC 28.5 g/dL",
    },
    primarySignal: {
      label: "Erythrocyte hemoglobin depletion",
      x: 0.50,
      y: 0.50,
    },
    factors: [
      {
        id: "hemoglobin",
        label: "Hemoglobin (Hb)",
        contribution: 68,
        x: 0.50,
        y: 0.50,
        category: "Oxygen Transport",
        valueDisplay: "8.2 g/dL (Profound Deficit)",
        baselineDisplay: "Ref: 12.0 – 15.5 g/dL (Female)",
        description:
          "Circulating hemoglobin concentration is severely reduced (z-score -2.43). In the trained Logistic Regression model, Hemoglobin is the dominant predictor with a massive negative weight (-25.38), driving 68% of the risk attribution.",
      },
      {
        id: "gender",
        label: "Sex-Specific Physiological Reference",
        contribution: 18,
        x: 0.65,
        y: 0.66,
        category: "Demographics",
        valueDisplay: "Female Cohort (Sex = 1)",
        baselineDisplay: "Model Covariate (beta = +9.34)",
        description:
          "Biological sex modulates diagnostic thresholds. Female baseline ranges (12.0-15.5 g/dL) reflect physiological hemodilution and menstrual/iron dynamics captured by the model's positive gender coefficient.",
      },
      {
        id: "mcv",
        label: "Mean Corpuscular Volume (MCV)",
        contribution: 7,
        x: 0.32,
        y: 0.34,
        category: "Cell Morphology",
        valueDisplay: "71.8 fL (Microcytic Shift)",
        baselineDisplay: "Ref: 80.0 – 100.0 fL",
        description:
          "Average erythrocyte volume is below 80 fL, indicating microcytosis. Coupled with low Hb, this pattern strongly points toward iron deficiency anemia or thalassemia trait requiring iron profile corroboration.",
      },
      {
        id: "mch",
        label: "Mean Corpuscular Hemoglobin (MCH)",
        contribution: 4,
        x: 0.68,
        y: 0.38,
        category: "Cell Hemoglobin",
        valueDisplay: "19.5 pg (Hypochromia)",
        baselineDisplay: "Ref: 27.0 – 33.0 pg",
        description:
          "Average weight of hemoglobin per individual red blood cell is subnormal (< 27 pg), producing pale (hypochromic) erythrocyte morphology under peripheral smear review.",
      },
      {
        id: "mchc",
        label: "MCHC (Hb Concentration)",
        contribution: 3,
        x: 0.44,
        y: 0.72,
        category: "Cell Concentration",
        valueDisplay: "28.5 g/dL (Sub-physiologic)",
        baselineDisplay: "Ref: 32.0 – 36.0 g/dL",
        description:
          "Concentration of hemoglobin inside packed red cell volume (Hb ÷ Hct) confirms depleted chromic reserve Commensurate with microcytic hypochromic erythrocyte kinetics.",
      },
    ],
    aiReasoning:
      "Trained on 534 validated clinical hematology records, the Logistic Regression pipeline classifies this patient with ANEMIA DETECTED at 96.4% Prediction Probability (logit +42.8). The primary driver is marked hemoglobin depletion to 8.2 g/dL (attributing 68% of predictive weight), compounded by microcytic volume (MCV 71.8 fL) and hypochromic index (MCH 19.5 pg). Pattern consistent with severe microcytic hypochromic anemia.",
    clinicalConsiderations: {
      priority: "High Priority — Severe Microcytic Hypochromic Anemia",
      priorityLevel: "HIGH",
      factorsToReview: [
        "Serum Ferritin, Total Iron Binding Capacity (TIBC), and Transferrin Saturation",
        "Peripheral Blood Smear (evaluate poikilocytosis, target cells, pencil cells)",
        "Reticulocyte Count and Production Index (RPI) to assess marrow response",
        "Fecal Occult Blood Test (FOBT) or endoscopy to rule out gastrointestinal blood loss",
      ],
      followUpConsiderations: [
        "Investigate underlying etiology (nutritional, malabsorption, occult GI hemorrhage)",
        "Consider oral vs. intravenous iron repletion protocol based on gastrointestinal tolerance",
        "Monitor for cardiopulmonary compensatory symptoms (dyspnea, tachycardia, orthostasis)",
      ],
      discussionPoints: [
        "Is the patient symptomatic with tachycardia, postural hypotension, or exertional dyspnea?",
        "Should dietary/medication review exclude concurrent antiplatelet, NSAID, or anticoagulant therapy?",
        "What is the target reticulocyte surge window following iron repletion therapy (typically 7-10 days)?",
      ],
      disclaimer: "REQUIRES CLINICIAN REVIEW · CLINICAL DECISION SUPPORT ONLY",
    },
    downstreamSignal: {
      title: "Hematology Service Demand & Infusion Signal",
      subtitle: "Aggregated regional hematology cases in Outpatient Infusion Center & Women's Health Clinic",
      metrics: [
        { label: "Hematology referrals", change: "↑ 16%", trend: "up", impact: "+5 consultation slots" },
        { label: "Iron infusion suite", change: "↑ 11%", trend: "up", impact: "IV ferric carboxymaltose prep" },
        { label: "Critical low Hb alerts", change: "3 cases", trend: "neutral", impact: "Threshold < 7.0 g/dL protocol" },
      ],
      actionLabel: "VIEW IN HOSPITAL INTELLIGENCE →",
    },
  },

  breastCancer: {
    id: "breast-cancer",
    name: "Breast Cancer Assessment",
    category: "Oncology",
    asset: "/clinical-breast-twin.jpg",
    risk: 99,
    riskLevel: "CRITICAL",
    predictionStatus: "MALIGNANT",
    probabilityLabel: "Prediction Probability",
    confidence: 99,
    anatomy: "breast",
    scanLabel: "CELLULAR & CYTOLOGICAL FEATURES",
    patient: {
      id: "PATIENT 1042",
      age: 54,
      gender: "FEMALE",
      date: "08 SEP 2026",
      vitals: "FNA Biopsy · Area (Worst) 2019 µm² · Texture (Worst) 17.3 · Concave Pts 0.265",
    },
    primarySignal: {
      label: "Ductal epithelial atypia",
      x: 0.54,
      y: 0.48,
    },
    factors: [
      {
        id: "texture_worst",
        label: "Worst Nuclear Chromatin Texture",
        contribution: 34,
        x: 0.38,
        y: 0.62,
        category: "Texture & Atypia",
        valueDisplay: "17.33 gray-scale std (+1.42 beta)",
        baselineDisplay: "Ref: < 20.0 (Benign Baseline)",
        description:
          "Marked chromatin condensation and nuclear envelope granularity. Extreme texture variance in cell populations correlates strongly with loss of differentiation in high-grade carcinoma.",
      },
      {
        id: "radius_se",
        label: "Nuclear Radius Heterogeneity (SE)",
        contribution: 26,
        x: 0.45,
        y: 0.22,
        category: "Cellular Morphology",
        valueDisplay: "1.095 std error (+1.24 beta)",
        baselineDisplay: "Ref: < 0.35 SE",
        description:
          "High standard error in nuclear radial boundary distance reflects pronounced anisokaryosis (cell-to-cell nuclear size disparity) typical of malignant proliferation.",
      },
      {
        id: "symmetry_worst",
        label: "Extreme Nuclear Asymmetry",
        contribution: 18,
        x: 0.54,
        y: 0.48,
        category: "Nuclear Margins",
        valueDisplay: "0.460 symmetry ratio (+1.06 beta)",
        baselineDisplay: "Ref: < 0.26 ratio",
        description:
          "Severe distortion in bipolar nuclear axes indicates dysplastic mitotic division and architectural disorganization along glandular epithelial linings.",
      },
      {
        id: "concave_points_mean",
        label: "Mean Contour Concavity Points",
        contribution: 12,
        x: 0.62,
        y: 0.44,
        category: "Margin Infiltration",
        valueDisplay: "0.147 indentations (+0.95 beta)",
        baselineDisplay: "Ref: < 0.035 points",
        description:
          "High frequency of sharp inward indentations along nuclear membranes indicative of invasive structural loss and chromatin margin instability.",
      },
      {
        id: "area_worst",
        label: "Largest Nuclear Area (Worst)",
        contribution: 10,
        x: 0.48,
        y: 0.36,
        category: "Cellular Morphology",
        valueDisplay: "2019 sq microns (+0.92 beta)",
        baselineDisplay: "Ref: < 700 sq microns",
        description:
          "Extreme nuclear enlargement in the upper quartile of aspirated cells exceeds standard benign limits by more than 3 standard deviations, confirming significant hypertrophy.",
      },
    ],
    aiReasoning:
      "Trained on 569 validated clinical FNA records (WDBC), the Logistic Regression pipeline classifies this cytological aspirate as MALIGNANT at >99.9% Prediction Probability (logit +18.0). Major risk contributors are elevated chromatin texture heterogeneity (+34%), high nuclear radius variance (+26%), and extreme contour concavity points (+12%). Cellular indices indicate invasive high-atypia carcinoma.",
    clinicalConsiderations: {
      priority: "High Priority — Invasive Carcinoma Morphologic Pattern",
      priorityLevel: "CRITICAL",
      factorsToReview: [
        "Core Needle Biopsy (CNB) with histological tumor architecture & Nottingham grading",
        "Receptor Status Panel: Estrogen Receptor (ER), Progesterone Receptor (PR), HER2/neu",
        "Ki-67 Proliferation Index to assess mitotic cellular turnover rate",
        "Diagnostic Bilateral Digital Mammography & High-Resolution Targeted Ultrasound",
      ],
      followUpConsiderations: [
        "Expedite Multidisciplinary Breast Tumor Board surgical oncology review",
        "Targeted axillary nodal staging ultrasound to assess sentinel lymph node status",
        "Assess candidacy for neoadjuvant systemic therapy prior to definitive surgical resection",
      ],
      discussionPoints: [
        "Is there a palpable discrete mass or skin/nipple retraction on physical examination?",
        "Does patient history warrant hereditary cancer risk assessment (e.g. BRCA1/2 panel)?",
        "Is contrast-enhanced Breast MRI indicated to evaluate multifocal or contralateral disease?",
      ],
      disclaimer: "REQUIRES CLINICIAN REVIEW · CLINICAL DECISION SUPPORT ONLY",
    },
    downstreamSignal: {
      title: "Breast Oncology Surgical & Diagnostic Service Demand",
      subtitle: "Aggregated regional oncology cases across Breast Health Center & Surgical Suites",
      metrics: [
        { label: "Breast surgery suite", change: "↑ 15%", trend: "up", impact: "+4 operative blocks" },
        { label: "Pathology IHC workload", change: "↑ 20%", trend: "up", impact: "HER2/ER/PR reflex testing" },
        { label: "Clinical nurse navigation", change: "↑ 12%", trend: "up", impact: "Pre-biopsy consultation sync" },
      ],
      actionLabel: "VIEW IN HOSPITAL INTELLIGENCE →",
    },
  },
  diabetes: {
    id: "diabetes",
    name: "Diabetes Risk",
    category: "Endocrinology",
    asset: "/clinical-diabetes-twin.jpg",
    risk: 65,
    riskLevel: "HIGH",
    predictionStatus: "DIABETES DETECTED",
    probabilityLabel: "Prediction Probability",
    confidence: 84,
    anatomy: "metabolic",
    scanLabel: "METABOLIC & GLYCEMIC FEATURES",
    patient: {
      id: "PATIENT 1042",
      age: 36,
      gender: "FEMALE",
      date: "08 SEP 2026",
      vitals: "Glucose 179 mg/dL · BMI 32.7 · Insulin 130 µU/mL · BP 72 mmHg",
    },
    primarySignal: {
      label: "GLYCEMIC DYSREGULATION",
      x: 0.58,
      y: 0.34,
    },
    factors: [
      {
        id: "glucose",
        label: "Plasma Blood Glucose",
        contribution: 49,
        x: 0.58,
        y: 0.34,
        category: "Glycemic Regulation",
        valueDisplay: "179 mg/dL (Peak Gain)",
        baselineDisplay: "Ref: 70 – 139 mg/dL",
        description:
          "Primary diagnostic driver in the 100-tree XGBoost ensemble, reflecting post-challenge systemic glycemic overload.",
      },
      {
        id: "bmi",
        label: "Body Mass Index (BMI)",
        contribution: 19,
        x: 0.40,
        y: 0.68,
        category: "Metabolic Adiposity",
        valueDisplay: "32.7 kg/m² (+19% gain)",
        baselineDisplay: "Ref: 18.5 – 24.9 kg/m²",
        description:
          "Elevated somatic adiposity exacerbates peripheral insulin receptor downregulation and secondary beta-cell stress.",
      },
      {
        id: "age",
        label: "Patient Age & Beta-Cell Reserve",
        contribution: 12,
        x: 0.72,
        y: 0.38,
        category: "Demographic Dynamics",
        valueDisplay: "36 yrs (+12% gain)",
        baselineDisplay: "Ref: 21 – 81 yrs",
        description:
          "Chronological age interacts with duration of metabolic exposure and declining pancreatic endocrine reserve.",
      },
      {
        id: "insulin",
        label: "Serum Insulin (2-Hour Post-Load)",
        contribution: 8,
        x: 0.48,
        y: 0.48,
        category: "Endocrine Secretion",
        valueDisplay: "130 µU/mL (+8% gain)",
        baselineDisplay: "Ref: 16 – 166 µU/mL",
        description:
          "Reflects compensatory hyperinsulinemia in pancreatic islets attempting to overcome peripheral glycemic resistance.",
      },
      {
        id: "pedigree",
        label: "Diabetes Pedigree Function",
        contribution: 6,
        x: 0.32,
        y: 0.58,
        category: "Genetic Susceptibility",
        valueDisplay: "0.719 score (+6% gain)",
        baselineDisplay: "Ref: < 0.500",
        description:
          "Familial genetic inheritance modeling multigenic predisposition and family history risk burden.",
      },
    ],
    aiReasoning:
      "Trained on 768 validated clinical records from the Pima Indians cohort, the tuned XGBoost ensemble (100 depth-3 trees) classifies this patient with DIABETES DETECTED at 65.3% Prediction Probability. The primary driver is marked plasma glucose elevation (179 mg/dL, 48.7% model gain), compounded by Class I obesity (BMI 32.7 kg/m²) and an elevated familial pedigree coefficient (0.719).",
    clinicalConsiderations: {
      priority: "High Priority — Glycemic Dysregulation Pattern",
      priorityLevel: "HIGH",
      factorsToReview: [
        "Confirmatory Fasting Plasma Glucose (FPG) and Glycated Hemoglobin (HbA1c) testing",
        "Comprehensive Metabolic Panel (CMP) including renal function (eGFR, serum creatinine)",
        "Lipid panel (Total cholesterol, LDL-C, HDL-C, Triglycerides) for metabolic syndrome screening",
        "Baseline urine albumin-to-creatinine ratio (uACR) to rule out early diabetic microalbuminuria",
      ],
      followUpConsiderations: [
        "Referral to Certified Diabetes Care and Education Specialist (CDCES) for medical nutrition therapy",
        "Structured cardiovascular risk evaluation and lifestyle modification program",
        "Screening for microvascular endpoints (baseline dilated retinal exam and peripheral monofilament test)",
      ],
      discussionPoints: [
        "Does the patient report osmotic symptoms such as polyuria, polydipsia, or unexplained weight loss?",
        "Is there a personal history of gestational diabetes during prior pregnancies or macrosomia?",
        "Should first-line insulin-sensitizing pharmacotherapy (e.g. metformin) be considered upon lab confirmation?",
      ],
      disclaimer: "REQUIRES CLINICIAN REVIEW · CLINICAL DECISION SUPPORT ONLY",
    },
    downstreamSignal: {
      title: "Endocrinology & Diabetic Complications Service Demand",
      subtitle: "Aggregated metabolic case volume across Outpatient Clinics & Clinical Laboratory",
      metrics: [
        { label: "Endocrine clinic referrals", change: "↑ 18%", trend: "up", impact: "+5 consultation slots" },
        { label: "HbA1c & CMP lab orders", change: "↑ 22%", trend: "up", impact: "Routine reflex panels" },
        { label: "Diabetes education consults", change: "↑ 14%", trend: "up", impact: "Nutrition & self-monitoring sync" },
      ],
      actionLabel: "VIEW IN HOSPITAL INTELLIGENCE →",
    },
  },
  heartFailure: {
    id: "heartFailure",
    name: "Heart Failure Risk",
    category: "Cardiology & Hemodynamics",
    asset: "/clinical-heart-failure-twin.jpg",
    risk: 93,
    riskLevel: "CRITICAL",
    predictionStatus: "HIGH RISK OF HEART FAILURE EVENT",
    probabilityLabel: "Mortality / Decompensation Risk",
    confidence: 93,
    anatomy: "cardiacFailure",
    scanLabel: "HEMODYNAMIC & CARDIAC FUNCTIONAL DIGITAL TWIN",
    patient: {
      id: "HF-299-001",
      age: 65,
      gender: "Male",
      date: "08 SEP 2026",
      vitals: "BP 138/86 · EF 20% · SCr 1.9 mg/dL · Na 130 · Day 10",
    },
    primarySignal: {
      label: "VENTRICULAR SYSTOLIC FUNCTIONAL SIGNAL",
      x: 0.52,
      y: 0.58,
    },
    factors: [
      {
        id: "ejection_fraction",
        label: "Left Ventricular Ejection Fraction (LVEF)",
        contribution: 28,
        x: 0.54,
        y: 0.62,
        category: "Systolic Function",
        valueDisplay: "20% LVEF (Severe HFrEF)",
        baselineDisplay: "Ref: 50% – 70%",
        description:
          "Marked reduction in left ventricular stroke volume and forward cardiac output, elevating pulmonary capillary wedge pressure.",
      },
      {
        id: "serum_creatinine",
        label: "Serum Creatinine (Cardiorenal Syndrome)",
        contribution: 26,
        x: 0.42,
        y: 0.70,
        category: "Cardiorenal Signal",
        valueDisplay: "1.9 mg/dL (+73% elevation)",
        baselineDisplay: "Ref: 0.7 – 1.2 mg/dL",
        description:
          "Cardiorenal failure: impaired renal perfusion leads to toxic metabolite retention and maladaptive neurohormonal volume expansion.",
      },
      {
        id: "time",
        label: "Follow-up Observation Window",
        contribution: 24,
        x: 0.68,
        y: 0.46,
        category: "Clinical Timeline",
        valueDisplay: "10 days (Acute Window)",
        baselineDisplay: "Ref: > 180 days longitudinal",
        description:
          "Immediate post-discharge interval where vulnerability to acute hemodynamic collapse and rehospitalization is highest.",
      },
      {
        id: "serum_sodium",
        label: "Serum Sodium (Neurohormonal Activation)",
        contribution: 12,
        x: 0.36,
        y: 0.48,
        category: "Neurohormonal Balance",
        valueDisplay: "130 mEq/L (Hyponatremic)",
        baselineDisplay: "Ref: 136 – 145 mEq/L",
        description:
          "Dilutional hyponatremia driven by intense compensatory arginine vasopressin and renin-angiotensin-aldosterone axis activation.",
      },
      {
        id: "creatinine_phosphokinase",
        label: "Creatinine Phosphokinase (CPK)",
        contribution: 10,
        x: 0.62,
        y: 0.32,
        category: "Myocardial Biomarkers",
        valueDisplay: "180 mcg/L",
        baselineDisplay: "Ref: 30 – 200 mcg/L",
        description:
          "Circulating enzyme reflecting cellular membrane permeability and baseline myocardial tissue metabolic turnover.",
      },
    ],
    aiReasoning:
      "Trained on 299 verified clinical cohorts (Chicco & Jurman) using a balanced-subsample Random Forest pipeline (800 depth-5 decision trees), the model predicts HIGH RISK OF HEART FAILURE EVENT with 92.6% probability. The primary drivers are severe left ventricular systolic failure (LVEF 20%) combined with cardiorenal syndrome (Serum Creatinine 1.9 mg/dL) within an acute 10-day post-decompensation timeline.",
    clinicalConsiderations: {
      priority: "Critical Priority — Acute Decompensation Signal",
      priorityLevel: "CRITICAL",
      factorsToReview: [
        "Urgent transthoracic echocardiogram (TTE) for updated left ventricular volumes, wall motion, and mitral regurgitation",
        "Serial serum creatinine, eGFR, and electrolytes (sodium, potassium) to guide diuretic titration",
        "B-type natriuretic peptide (BNP / NT-proBNP) levels for hemodynamic congestion monitoring",
        "Chest radiography and clinical volume status examination (JVP, pulmonary rales, peripheral edema)",
      ],
      followUpConsiderations: [
        "Guideline-directed medical therapy (GDMT) optimization for HFrEF (ARNI/ACEi, beta-blocker, MRA, SGLT2i)",
        "Inpatient heart failure service consultation / telemetry monitoring",
        "Strict sodium/fluid restriction and daily weight tracking protocol",
      ],
      discussionPoints: [
        "Does the patient demonstrate signs of low-perfusion (cool extremities, narrow pulse pressure) or congestion (orthopnea, PND)?",
        "Is there worsening cardiorenal syndrome requiring loop diuretic adjustment or inotropic support?",
        "Has advanced heart failure device therapy (ICD, CRT-D, or mechanical circulatory support) been evaluated?",
      ],
      disclaimer: "REQUIRES CLINICIAN REVIEW · CLINICAL DECISION SUPPORT ONLY",
    },
    downstreamSignal: {
      title: "Heart Failure Inpatient & Telemetry Service Demand",
      subtitle: "Aggregated cardiac failure case load across Cardiology Step-Down & CCU",
      metrics: [
        { label: "Heart failure-related admissions", change: "↑ 24%", trend: "up", impact: "+7 bed days in cardiology" },
        { label: "Cardiology consult demand", change: "↑ 19%", trend: "up", impact: "Urgent echo & GDMT rounds" },
        { label: "Telemetry & CCU resource pressure", change: "↑ 16%", trend: "up", impact: "Continuous rhythm & hemodynamic monitoring" },
      ],
      actionLabel: "VIEW IN HOSPITAL INTELLIGENCE →",
    },
  },
};
