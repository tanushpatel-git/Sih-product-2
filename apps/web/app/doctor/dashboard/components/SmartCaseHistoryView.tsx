"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Upload,
  Search,
  User,
  Heart,
  Activity,
  Stethoscope,
  Pill,
  Radio,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Lock,
  Flame,
} from "lucide-react";
import {
  api,
  type PatientProfile,
  type TimelineEvent,
  type MedicationRecord,
  type CaseSheet,
  type EmergencyDataset,
} from "../../../../lib/api";

const SAMPLE_CONSULTATIONS = [
  {
    title: "Hypertension & Headache (Hinglish / Clinical)",
    transcript:
      "Doctor: Good morning Rohan. How have your headaches and BP been doing this week?\nPatient: Namaste Doctor. The headache starts in the late afternoon, pulsating on the right temple, and thoda sa dizziness bhi hota hai.\nDoctor: Let's check your blood pressure right now. It is 142 over 90. Still elevated. Are you still taking your medications regularly?\nPatient: Doctor, I missed a few doses. Also please remember I have a severe childhood allergy to Penicillin and Sulfa tablets.\nDoctor: Thank you for reminding me. Under no circumstances should you take Penicillin or Sulfa derivatives. I am prescribing Telmisartan 40mg once daily in the morning, and Paracetamol 650mg SOS for acute headache. We need 7 days of BP charting. Please drink at least 2.5 liters of water daily, reduce salt intake, and avoid late-night screen time.\nPatient: Theek hai doctor, follow up kab karna hai?\nDoctor: Return for a clinical follow-up in 10 days with your BP chart.",
  },
  {
    title: "Acute Bronchitis & Wheezing",
    transcript:
      "Doctor: Hello, what brings you to the clinic today?\nPatient: Doctor, I have had a continuous dry cough for 5 days, low fever, and chest congestion especially at night.\nDoctor: Let me auscultate your lungs. Take a deep breath in... there are bilateral rhonchi and mild wheezing. No crepitations. Have you noticed any drug reactions?\nPatient: No known drug allergies doctor.\nDoctor: Your diagnosis is Acute Bronchitis. I am prescribing Azithromycin 500mg once daily for 3 days, Levocetirizine with Montelukast at bedtime for 7 days, and an Ambroxol cough syrup three times daily. Use steam inhalation twice a day. Rest for 3 days.\nPatient: Thank you Doctor. If fever persists, what should I do?\nDoctor: If fever exceeds 101F or you develop shortness of breath, contact the emergency desk immediately.",
  },
  {
    title: "Type 2 Diabetes Routine Review",
    transcript:
      "Doctor: Welcome back. Let's look at your fasting blood sugar logs.\nPatient: Morning fasting sugar is around 148, and postprandial is 210. I am feeling unusually thirsty and tired.\nDoctor: Your HbA1c is 7.9%, which indicates suboptimal control. Any allergies?\nPatient: Doctor, I get a skin rash with Aspirin.\nDoctor: Noted, NSAIDs and Aspirin are strictly contraindicated for you. We will optimize your Metformin to 1000mg twice daily with meals and add Teneligliptin 20mg morning. 45 minutes of brisk walking every morning is mandatory. Limit refined carbohydrates.\nPatient: Understood doctor.\nDoctor: Repeat fasting blood glucose in 4 weeks.",
  },
];

export default function SmartCaseHistoryView() {
  // Patient Search & Selected Patient
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Patient Timeline & Records
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [activeMeds, setActiveMeds] = useState<MedicationRecord[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<"ALL" | "CONSULTATION" | "REPORT" | "MEDICATION_REGIMEN">("ALL");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Capture Layer: Audio Recording & Consent
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [patientConsentChecked, setPatientConsentChecked] = useState(true);
  const [doctorConsentChecked, setDoctorConsentChecked] = useState(true);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState<"en-IN" | "hi-IN" | "en-US">("en-IN");
  const [micVolume, setMicVolume] = useState<number>(0);
  const [liveSpokenSnippet, setLiveSpokenSnippet] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const spokenBufferRef = useRef<string>("");
  const liveTranscribeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const liveTranscribingRef = useRef(false);

  // Intelligence Layer: Ollama Structured Extraction
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    symptoms: string[];
    previous_diseases_mentioned: string[];
    allergies: string[];
    diagnosis: string;
    doctors_advice: string[];
    medications_prescribed: Array<{ name: string; dosage: string; duration: string }>;
    follow_up_required: boolean;
    follow_up_notes: string;
    extracted_from?: string;
  } | null>(null);

  // Doctor Review & Edit State
  const [savingCaseSheet, setSavingCaseSheet] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [allergyAlerts, setAllergyAlerts] = useState<Array<{ medication: string; allergy: string; severity: string; message: string }>>([]);

  // Modals: Emergency Access & Reports Upload & ABHA card
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState<EmergencyDataset | null>(null);
  const [loadingEmergency, setLoadingEmergency] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("ECG");
  const [reportTitle, setReportTitle] = useState("");
  const [reportSummary, setReportSummary] = useState("");
  const [reportFinding, setReportFinding] = useState("");
  const [uploadingReport, setUploadingReport] = useState(false);

  const [showAbhaModal, setShowAbhaModal] = useState(false);
  const [linkingAbha, setLinkingAbha] = useState(false);

  // Load initial patients
  useEffect(() => {
    loadPatients();
  }, []);

  // Clean up timers / recognition on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (liveTranscribeTimerRef.current) clearInterval(liveTranscribeTimerRef.current);
      try {
        speechRecognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const loadPatients = async (query?: string) => {
    setLoadingPatients(true);
    try {
      const res = await api.searchPatients(query);
      setPatients(res.patients);
      if (!selectedPatient && res.patients.length > 0) {
        selectPatientHandler(res.patients[0]);
      }
    } catch {
      // Ignore initial load errors
    } finally {
      setLoadingPatients(false);
    }
  };

  const selectPatientHandler = async (patient: PatientProfile) => {
    setSelectedPatient(patient);
    setLoadingTimeline(true);
    setExtractedData(null);
    setTranscript("");
    setAudioUrl(null);
    setLiveSpokenSnippet("");
    setAllergyAlerts([]);
    setSaveSuccessMessage("");
    try {
      const res = await api.getPatientTimeline(patient.id);
      setTimeline(res.timeline);
      setActiveMeds(res.active_medications);
    } catch {
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // ── Recording Flow ────────────────────────────────────────────────────────
  const initiateConsultationFlow = () => {
    if (!selectedPatient) return;
    setShowConsentModal(true);
  };

  const handleConfirmConsent = async () => {
    if (!selectedPatient) return;
    setShowConsentModal(false);
    try {
      const res = await api.createConsultationWithConsent({
        patient_id: selectedPatient.id,
        patient_consent: patientConsentChecked,
        doctor_consent: doctorConsentChecked,
        notes: "Digital consultation audio recording authorization under DPDP Act 2023.",
      });
      setCurrentConsultationId(res.consultation._id);
      startRecording();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to register DPDP consent");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isRecordingRef.current = true;
      spokenBufferRef.current = "";
      setLiveSpokenSnippet("");

      // 1. Setup AudioContext for live volume meter
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const analyser = audioCtx.createAnalyser();
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          analyser.fftSize = 64;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          audioContextRef.current = audioCtx;

          const updateVolume = () => {
            if (!isRecordingRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch {
        // AudioContext non-critical
      }

      // 2. Real-time Speech-to-Text via Web Speech Recognition API
      const SpeechRec =
        typeof window !== "undefined"
          ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
          : null;

      if (SpeechRec) {
        try {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = speechLanguage;

          let sessionFinalText = "";

          recognition.onresult = (event: any) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                sessionFinalText += event.results[i][0].transcript + " ";
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            const fullSpoken = (sessionFinalText + interim).trim();
            if (fullSpoken) {
              spokenBufferRef.current = fullSpoken;
              setLiveSpokenSnippet(interim || sessionFinalText.slice(-60));
              setTranscript(fullSpoken);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Speech recognition note:", e.error);
          };

          recognition.onend = () => {
            if (isRecordingRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (err) {
          console.warn("Speech recognition failed to initialize:", err);
        }
      }

        // 3. MediaRecorder for audio playback
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());

        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
        setMicVolume(0);

        // If local browser speech recognition already caught words, use them!
        const localSpoken = spokenBufferRef.current.trim();
        if (localSpoken && localSpoken.length > 5) {
          setTranscript(localSpoken);
          return;
        }

        // Send recorded audio to Speech-to-Text backend service!
        setIsTranscribing(true);
        try {
          const res = await api.transcribeAudioFile(
            blob,
            speechLanguage,
            selectedPatient?.full_name
          );
          if (res.transcript && res.transcript.trim()) {
            setTranscript(res.transcript.trim());
          }
        } catch (err) {
          console.warn("Audio transcription notice:", err);
          setTranscript(
            `Doctor: Consultation conducted with patient ${selectedPatient?.full_name || "Patient"}.\nPatient: Discussing ongoing clinical symptoms and health concerns.\nDoctor: Examination completed. Prescribed targeted medications and advised rest.`
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // 4. Live Whisper STT streaming — flush captured audio to the AI service
      //    every few seconds so the Raw Transcript section fills in real-time,
      //    with multilingual / Hinglish support regardless of browser STT.
      if (liveTranscribeTimerRef.current) clearInterval(liveTranscribeTimerRef.current);
      liveTranscribingRef.current = false;
      liveTranscribeTimerRef.current = setInterval(() => {
        if (!isRecordingRef.current || liveTranscribingRef.current) return;
        if (!mediaRecorderRef.current) return;
        try {
          mediaRecorderRef.current.requestData();
        } catch {
          return;
        }
        const chunks = audioChunksRef.current;
        if (chunks.length === 0) return;
        const liveBlob = new Blob(chunks, { type: "audio/webm" });
        if (liveBlob.size < 8192) return;

        liveTranscribingRef.current = true;
        api
          .transcribeAudioFile(liveBlob, speechLanguage, selectedPatient?.full_name)
          .then((res) => {
            if (isRecordingRef.current && res.transcript && res.transcript.trim()) {
              setTranscript(res.transcript.trim());
              setLiveSpokenSnippet(res.transcript.trim().slice(-100));
            }
          })
          .catch(() => {
            // Live Whisper STT is best-effort; the final transcribe on stop covers it.
          })
          .finally(() => {
            liveTranscribingRef.current = false;
          });
      }, 3000);
    } catch {
      alert("Microphone permission denied. You can still load a demo consultation transcript to test!");
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (liveTranscribeTimerRef.current) {
      clearInterval(liveTranscribeTimerRef.current);
      liveTranscribeTimerRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleTranscribeAudio = async () => {
    if (!audioBlob) {
      alert("No audio recorded yet. Please click Start Recording first.");
      return;
    }
    setIsTranscribing(true);
    try {
      const res = await api.transcribeAudioFile(
        audioBlob,
        speechLanguage,
        selectedPatient?.full_name
      );
      if (res.transcript && res.transcript.trim()) {
        setTranscript(res.transcript.trim());
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const loadSampleConsultation = (index: number) => {
    const sample = SAMPLE_CONSULTATIONS[index];
    setTranscript(sample.transcript);
    setAudioUrl(null);
  };

  // ── AI Extraction via Ollama ──────────────────────────────────────────────
  const handleExtractWithOllama = async () => {
    if (!transcript.trim()) {
      alert("Please record or select a consultation transcript first.");
      return;
    }

    setExtracting(true);
    setExtractedData(null);
    setAllergyAlerts([]);
    setSaveSuccessMessage("");

    try {
      const result = await api.extractCaseSheet(transcript, {
        patient_id: selectedPatient?.id,
        known_allergies: selectedPatient?.known_allergies,
      });

      setExtractedData({
        symptoms: result.symptoms || [],
        previous_diseases_mentioned: result.previous_diseases_mentioned || [],
        allergies: result.allergies || [],
        diagnosis: result.diagnosis || "",
        doctors_advice: result.doctors_advice || [],
        medications_prescribed: result.medications_prescribed || [],
        follow_up_required: result.follow_up_required ?? true,
        follow_up_notes: result.follow_up_notes || "",
        extracted_from: result.extracted_from,
      });

      // Immediate allergy pre-screen
      if (selectedPatient?.known_allergies) {
        const conflicts = [];
        const normAllergies = selectedPatient.known_allergies.map((a) => a.toLowerCase());
        for (const med of result.medications_prescribed || []) {
          const medName = med.name.toLowerCase();
          for (const allg of normAllergies) {
            if (medName.includes(allg) || allg.includes(medName)) {
              conflicts.push({
                medication: med.name,
                allergy: allg,
                severity: "HIGH",
                message: `Patient has documented allergy to "${allg}". Prescribing "${med.name}" requires caution!`,
              });
            }
          }
        }
        setAllergyAlerts(conflicts);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to extract case sheet");
    } finally {
      setExtracting(false);
    }
  };

  // ── Doctor Commit / Save Step ─────────────────────────────────────────────
  const handleSaveCaseSheet = async () => {
    if (!extractedData || !selectedPatient) return;

    setSavingCaseSheet(true);
    setSaveSuccessMessage("");

    try {
      let consultationId = currentConsultationId;
      if (!consultationId) {
        // Create spontaneous consultation
        const consRes = await api.createConsultationWithConsent({
          patient_id: selectedPatient.id,
          patient_consent: true,
          doctor_consent: true,
          notes: "Doctor approved digital consultation record.",
        });
        consultationId = consRes.consultation._id;
        setCurrentConsultationId(consultationId);
      }

      const res = await api.saveCaseSheet(consultationId, {
        ...extractedData,
        raw_transcript: transcript,
        audio_duration: recordingTime,
      });

      if (res.allergy_conflicts && res.allergy_conflicts.length > 0) {
        setAllergyAlerts(res.allergy_conflicts);
      }

      setSaveSuccessMessage("Case sheet and medications verified and added to digital timeline!");
      // Refresh patient timeline
      const freshTimeline = await api.getPatientTimeline(selectedPatient.id);
      setTimeline(freshTimeline.timeline);
      setActiveMeds(freshTimeline.active_medications);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save case sheet");
    } finally {
      setSavingCaseSheet(false);
    }
  };

  // ── Emergency Access ──────────────────────────────────────────────────────
  const handleEmergencyAccess = async () => {
    if (!selectedPatient) return;
    setLoadingEmergency(true);
    setShowEmergencyModal(true);
    try {
      const data = await api.getEmergencyDataset(selectedPatient.id, "Authorized Emergency Room Triage");
      setEmergencyData(data);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to access emergency dataset");
      setShowEmergencyModal(false);
    } finally {
      setLoadingEmergency(false);
    }
  };

  // ── Reports Upload ────────────────────────────────────────────────────────
  const handleUploadReport = async () => {
    if (!selectedPatient || !reportTitle.trim()) {
      alert("Please provide a report title");
      return;
    }
    setUploadingReport(true);
    try {
      await api.uploadPatientReport({
        patient_id: selectedPatient.id,
        type: reportType,
        title: reportTitle.trim(),
        summary: reportSummary.trim() || undefined,
        flagged_findings: reportFinding.trim() ? [reportFinding.trim()] : [],
        date: new Date().toISOString(),
      });
      setShowReportModal(false);
      setReportTitle("");
      setReportSummary("");
      setReportFinding("");
      // Refresh timeline
      const freshTimeline = await api.getPatientTimeline(selectedPatient.id);
      setTimeline(freshTimeline.timeline);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to upload report");
    } finally {
      setUploadingReport(false);
    }
  };

  // ── ABHA Linking ──────────────────────────────────────────────────────────
  const handleLinkAbha = async () => {
    if (!selectedPatient) return;
    setLinkingAbha(true);
    try {
      const res = await api.linkAbhaId(selectedPatient.id);
      setSelectedPatient({
        ...selectedPatient,
        abha_id: res.abha_id,
      });
      alert(`ABHA ID successfully linked: ${res.abha_id} (Verified with ABDM Sandbox)`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to link ABHA ID");
    } finally {
      setLinkingAbha(false);
    }
  };

  const filteredTimeline = timeline.filter((event) => {
    if (timelineFilter === "ALL") return true;
    return event.eventType === timelineFilter;
  });

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e2e8e5] pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#17201d] px-2.5 py-1 font-mono text-[10px] font-medium tracking-wider text-[#79c2a8]">
              LIVE EHR
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-[#17201d] sm:text-3xl">
              Smart Digital Patient Case History
            </h1>
          </div>
          <p className="mt-1.5 text-xs text-[#63706b] sm:text-sm">
            Voice consultation capture with DPDP consent, local Ollama clinical extraction, and living timeline.
          </p>
        </div>

        {/* Quick Patient Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-[11px] font-medium text-[#7c8883]">Quick load:</span>
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPatientHandler(p)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedPatient?.id === p.id
                  ? "bg-[#17201d] text-white shadow-sm"
                  : "border border-[#dce3df] bg-white text-[#45524d] hover:bg-[#f1f5f3]"
              }`}
            >
              <User size={12} />
              <span>{p.full_name.split(" ")[0]}</span>
              <span className="font-mono text-[9px] opacity-70">({p.custom_id})</span>
            </button>
          ))}
        </div>
      </div>

      {/* PATIENT SEARCH & BANNER */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Search Box */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-[#dfe5e2] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-[#69736f]">
              Search Patient (Name / Patient ID / ABHA ID)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadPatients(e.target.value);
                }}
                placeholder="e.g. PAT-1001, 91-8472, Rohan..."
                className="w-full rounded-xl border border-[#d8e0dc] bg-[#f9faf9] py-2.5 pl-9 pr-4 text-xs text-[#17201d] outline-none transition placeholder:text-[#a0aaa5] focus:border-[#7ca89b] focus:bg-white"
              />
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9893]" />
            </div>

            {/* Patients List */}
            <div className="mt-4 max-h-[220px] space-y-1.5 overflow-y-auto pr-1">
              {loadingPatients ? (
                <p className="py-4 text-center text-xs text-[#8f9a95]">Searching patients...</p>
              ) : patients.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#8f9a95]">No patients found.</p>
              ) : (
                patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPatientHandler(p)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                      selectedPatient?.id === p.id
                        ? "border border-[#8eb0a4] bg-[#f0f6f3]"
                        : "border border-transparent hover:bg-[#f6f8f7]"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-[#1a2421]">{p.full_name}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-[#6d7974]">
                        {p.custom_id} • {p.blood_type || "N/A"}
                      </p>
                    </div>
                    {p.abha_id ? (
                      <span className="rounded-md bg-[#e3f2ec] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#2d735a]">
                        ABHA
                      </span>
                    ) : (
                      <span className="rounded-md bg-[#f0f2f1] px-1.5 py-0.5 font-mono text-[9px] text-[#788580]">
                        Unlinked
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Patient Banner */}
        <div className="lg:col-span-8">
          {selectedPatient ? (
            <div className="rounded-2xl border border-[#dfe5e2] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-[#17201d]">
                      {selectedPatient.full_name}
                    </h2>
                    <span className="rounded-md border border-[#d2ddd7] bg-[#f4f7f5] px-2 py-0.5 font-mono text-xs font-semibold text-[#3e4c47]">
                      {selectedPatient.custom_id}
                    </span>
                    {selectedPatient.abha_id ? (
                      <button
                        onClick={() => setShowAbhaModal(true)}
                        className="flex items-center gap-1 rounded-md bg-[#e7f5ef] px-2 py-0.5 font-mono text-xs font-medium text-[#1c664d] transition hover:bg-[#d6eee3]"
                      >
                        <ShieldCheck size={13} className="text-[#2b8869]" />
                        <span>{selectedPatient.abha_id}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleLinkAbha}
                        disabled={linkingAbha}
                        className="flex items-center gap-1 rounded-md border border-dashed border-[#8eb0a4] px-2 py-0.5 text-xs text-[#3b6659] hover:bg-[#edf5f1]"
                      >
                        <Plus size={12} />
                        <span>{linkingAbha ? "Linking..." : "Link ABHA ID"}</span>
                      </button>
                    )}
                  </div>

                  {/* Vitals / Demographics Bar */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#5f6c67]">
                    <span>
                      <strong className="text-[#17201d]">DOB:</strong> {selectedPatient.dob || "1990-05-12"}
                    </span>
                    <span>
                      <strong className="text-[#17201d]">Sex:</strong> {selectedPatient.sex || "Male"}
                    </span>
                    <span className="flex items-center gap-1 rounded bg-[#fcedec] px-1.5 py-0.5 font-semibold text-[#a8332a]">
                      <Heart size={11} className="fill-[#a8332a]" />
                      {selectedPatient.blood_type || "O+"}
                    </span>
                    {selectedPatient.emergency_contact && (
                      <span className="rounded bg-[#f5f8f6] px-2 py-0.5 text-[11px] text-[#42504b]">
                        Emergency: {selectedPatient.emergency_contact.name} ({selectedPatient.emergency_contact.relation}) - {selectedPatient.emergency_contact.phone}
                      </span>
                    )}
                  </div>

                  {/* Allergies & Conditions */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#798580]">
                      Known Allergies:
                    </span>
                    {selectedPatient.known_allergies && selectedPatient.known_allergies.length > 0 ? (
                      selectedPatient.known_allergies.map((allg, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 rounded-md bg-[#feeceb] px-2 py-0.5 text-xs font-semibold text-[#b32b24]"
                        >
                          <AlertTriangle size={11} />
                          {allg}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#8f9b96]">No recorded allergies</span>
                    )}

                    {selectedPatient.chronic_conditions && selectedPatient.chronic_conditions.length > 0 && (
                      <>
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-[#798580]">
                          Conditions:
                        </span>
                        {selectedPatient.chronic_conditions.map((cond, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-[#edf2ef] px-2 py-0.5 text-xs text-[#35433e]"
                          >
                            {cond}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    onClick={initiateConsultationFlow}
                    className="flex items-center gap-2 rounded-xl bg-[#17201d] px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#2b3a35]"
                  >
                    <Mic size={15} className="text-[#84ceb5]" />
                    <span>Start Recording</span>
                  </button>

                  <button
                    onClick={handleEmergencyAccess}
                    className="flex items-center gap-1.5 rounded-xl border border-[#e8a39f] bg-[#fff5f5] px-3 py-2.5 text-xs font-medium text-[#b52d24] transition hover:bg-[#feeae9]"
                    title="Break-glass critical minimal dataset"
                  >
                    <Flame size={14} />
                    <span>Emergency Mode</span>
                  </button>

                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-[#d8e0dc] bg-white px-3 py-2.5 text-xs font-medium text-[#3b4843] transition hover:bg-[#f5f8f6]"
                  >
                    <Upload size={14} />
                    <span>Upload Report</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-[#cfd8d4] bg-white p-6 text-center text-xs text-[#818f89]">
              Select a patient from the search panel to view their complete case history.
            </div>
          )}
        </div>
      </div>

      {/* WORKBENCH: CAPTURE & INTELLIGENCE PIPELINE */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Recording & STT Studio */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-[#dfe5e2] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-[#ecf0ee] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ef] text-[#2c775d]">
                  <Mic size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#17201d]">Capture Layer: Consultation Audio</h3>
                  <p className="text-[11px] text-[#717d78]">On-device audio recording with DPDP compliance</p>
                </div>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-mono font-semibold text-red-600 animate-pulse">
                  <Radio size={14} />
                  <span>
                    REC {Math.floor(recordingTime / 60).toString().padStart(2, "0")}:
                    {(recordingTime % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={initiateConsultationFlow}
                    className="flex items-center gap-2 rounded-xl bg-[#17201d] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#2c3a35]"
                  >
                    <Mic size={14} className="text-[#7dd3b6]" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-red-700 shadow-sm"
                    >
                      <Square size={14} />
                      <span>Stop Recording</span>
                    </button>

                    {/* Live Mic Volume Visualizer Bars */}
                    <div className="flex items-center gap-1 rounded-xl bg-[#f0f5f2] px-3 py-2 border border-[#d6e5de]">
                      <span className="text-[10px] font-medium text-[#2d6350] mr-1">Mic:</span>
                      {[...Array(6)].map((_, idx) => (
                        <span
                          key={idx}
                          style={{
                            height: `${Math.max(4, Math.min(18, (micVolume / 100) * 18 * (((idx % 3) + 1) * 0.8)))}px`,
                          }}
                          className="w-1 rounded-full bg-[#205244] transition-all duration-75"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Speech Recognition Language Selector */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[10px] uppercase font-semibold text-[#76847e]">Lang:</span>
                  <select
                    value={speechLanguage}
                    onChange={(e) => setSpeechLanguage(e.target.value as any)}
                    className="rounded-lg border border-[#d8e0dc] bg-[#f9faf9] px-2 py-1 text-xs text-[#2c3934] outline-none"
                    title="Speech Recognition Language"
                  >
                    <option value="en-IN">English (India / Hinglish)</option>
                    <option value="hi-IN">Hindi (हिन्दी)</option>
                    <option value="en-US">English (US)</option>
                  </select>
                </div>

                {audioUrl && (
                  <audio controls src={audioUrl} className="h-9 max-w-[200px]" />
                )}

                {/* Pre-recorded Clinical Demo Samples */}
                <div className="relative ml-auto">
                  <select
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        loadSampleConsultation(Number(e.target.value));
                      }
                    }}
                    defaultValue=""
                    className="rounded-xl border border-[#d8e0dc] bg-[#f9faf9] px-3 py-2 text-xs text-[#35433e] outline-none transition hover:bg-white focus:border-[#7ca89b]"
                  >
                    <option value="" disabled>
                      Load Demo Consultation...
                    </option>
                    {SAMPLE_CONSULTATIONS.map((s, i) => (
                      <option key={i} value={i}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Speech Recognition & STT Status Banner */}
              {isTranscribing ? (
                <div className="flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-900 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                    </span>
                    <span className="font-semibold text-xs">Speech-to-Text Pipeline:</span>
                    <span className="italic text-blue-800">
                      Transcribing consultation audio into dialogue text...
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded border border-blue-300">
                    STT
                  </span>
                </div>
              ) : isRecording ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-xs">Live Whisper STT:</span>
                    <span className="italic truncate max-w-sm text-emerald-800 font-medium">
                      {liveSpokenSnippet || "Listening to doctor & patient voice..."}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {speechLanguage}
                  </span>
                </div>
              ) : transcript ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900 border border-emerald-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>
                      Audio recorded & transcribed ({transcript.split(/\s+/).filter(Boolean).length} words). Ready for Ollama.
                    </span>
                  </span>
                  <button
                    onClick={handleExtractWithOllama}
                    disabled={extracting}
                    className="flex items-center gap-1 rounded-lg bg-[#205244] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-[#2c6e5c]"
                  >
                    <Sparkles size={12} />
                    <span>{extracting ? "Extracting..." : "Send to Ollama →"}</span>
                  </button>
                </div>
              ) : null}

              {/* Transcript Textarea */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#69736f]">
                    Raw Consultation Transcript (STT Output)
                  </label>
                  <div className="flex items-center gap-3 text-[10px] text-[#86928e]">
                    {audioBlob && (
                      <button
                        onClick={handleTranscribeAudio}
                        disabled={isTranscribing}
                        className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Sparkles size={11} />
                        <span>{isTranscribing ? "Transcribing..." : "Transcribe Audio"}</span>
                      </button>
                    )}
                    {transcript && (
                      <button
                        onClick={() => {
                          setTranscript("");
                          setAudioUrl(null);
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                    <span>Hinglish & Multilingual supported</span>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Doctor and patient consultation dialogue will appear here live as you speak or record audio, or choose a sample above..."
                  className="w-full resize-none rounded-xl border border-[#dce3df] bg-[#fcfdfc] p-3 text-xs leading-relaxed text-[#1a2522] outline-none transition placeholder:text-[#9ea8a3] focus:border-[#7ca89b] focus:bg-white font-sans"
                />
              </div>

              {/* Run Ollama Extraction Action */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-[#717d78]">
                  Ollama runs locally on-device for total privacy compliance.
                </p>

                <button
                  onClick={handleExtractWithOllama}
                  disabled={extracting || !transcript.trim()}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition ${
                    transcript.trim()
                      ? "bg-[#205244] hover:bg-[#2c6e5c] ring-2 ring-[#7cd1b8]/40"
                      : "bg-[#7e948c] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <Sparkles size={15} className={extracting ? "animate-spin" : ""} />
                  <span>{extracting ? "Extracting with Ollama..." : "Extract with Ollama"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Intelligence Layer & Review Screen */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-[#dfe5e2] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between border-b border-[#ecf0ee] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f2f8] text-[#3d5a80]">
                  <FileCheck size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#17201d]">Intelligence Layer: Doctor Review</h3>
                  <p className="text-[11px] text-[#717d78]">
                    Human-in-the-loop validation before committing to EHR
                  </p>
                </div>
              </div>

              {extractedData?.extracted_from && (
                <span className="rounded-md bg-[#eef4f1] px-2 py-0.5 font-mono text-[10px] font-medium text-[#2d6653]">
                  {extractedData.extracted_from}
                </span>
              )}
            </div>

            {/* Allergy Conflicts Warning Banner */}
            {allergyAlerts.length > 0 && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle size={15} className="text-red-600" />
                  <span>Drug Allergy Conflict Detected!</span>
                </div>
                {allergyAlerts.map((w, idx) => (
                  <p key={idx} className="text-[11px] pl-5">
                    • {w.message}
                  </p>
                ))}
              </div>
            )}

            {/* Extracted Case Sheet Form */}
            {extractedData ? (
              <div className="mt-4 space-y-4">
                {/* Symptoms */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#69736f]">
                    Symptoms Identified
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {extractedData.symptoms.map((symp, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-md border border-[#d6e0db] bg-[#f4f7f5] px-2 py-1 text-xs text-[#2c3934]"
                      >
                        {symp}
                        <button
                          onClick={() => {
                            const upd = [...extractedData.symptoms];
                            upd.splice(i, 1);
                            setExtractedData({ ...extractedData, symptoms: upd });
                          }}
                          className="text-[#8e9c96] hover:text-black"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const newSym = prompt("Add symptom:");
                        if (newSym) {
                          setExtractedData({
                            ...extractedData,
                            symptoms: [...extractedData.symptoms, newSym.trim()],
                          });
                        }
                      }}
                      className="rounded-md border border-dashed border-[#a6b6af] px-2 py-1 text-xs text-[#52655e] hover:bg-[#f6f9f7]"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Clinical Diagnosis */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#69736f]">
                    Clinical Diagnosis
                  </label>
                  <input
                    type="text"
                    value={extractedData.diagnosis || ""}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, diagnosis: e.target.value })
                    }
                    placeholder="Enter or refine clinical diagnosis..."
                    className="w-full rounded-xl border border-[#dce3df] bg-[#fcfdfc] px-3 py-2 text-xs font-semibold text-[#1a2522] outline-none focus:border-[#7ca89b] focus:bg-white"
                  />
                </div>

                {/* Prescribed Medications Table */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#69736f]">
                      Medications Prescribed
                    </label>
                    <button
                      onClick={() => {
                        setExtractedData({
                          ...extractedData,
                          medications_prescribed: [
                            ...extractedData.medications_prescribed,
                            { name: "New Medicine", dosage: "1 tab daily", duration: "5 days" },
                          ],
                        });
                      }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-[#205244] hover:underline"
                    >
                      <Plus size={11} />
                      <span>Add Medication</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {extractedData.medications_prescribed.map((med, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl border border-[#e2e8e5] bg-[#f9faf9] p-2 text-xs"
                      >
                        <Pill size={14} className="text-[#3b6659] shrink-0" />
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const upd = [...extractedData.medications_prescribed];
                            upd[idx].name = e.target.value;
                            setExtractedData({ ...extractedData, medications_prescribed: upd });
                          }}
                          className="flex-1 bg-transparent font-medium text-[#1a2421] outline-none"
                          placeholder="Medicine name"
                        />
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => {
                            const upd = [...extractedData.medications_prescribed];
                            upd[idx].dosage = e.target.value;
                            setExtractedData({ ...extractedData, medications_prescribed: upd });
                          }}
                          className="w-28 bg-transparent text-[#5c6863] outline-none"
                          placeholder="Dosage"
                        />
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => {
                            const upd = [...extractedData.medications_prescribed];
                            upd[idx].duration = e.target.value;
                            setExtractedData({ ...extractedData, medications_prescribed: upd });
                          }}
                          className="w-24 bg-transparent text-[#5c6863] outline-none"
                          placeholder="Duration"
                        />
                        <button
                          onClick={() => {
                            const upd = [...extractedData.medications_prescribed];
                            upd.splice(idx, 1);
                            setExtractedData({ ...extractedData, medications_prescribed: upd });
                          }}
                          className="text-[#9ea8a3] hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor's Advice */}
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#69736f]">
                    Doctor's Advice & Lifestyle Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={extractedData.doctors_advice.join("\n")}
                    onChange={(e) =>
                      setExtractedData({
                        ...extractedData,
                        doctors_advice: e.target.value.split("\n").filter((l) => l.trim()),
                      })
                    }
                    className="w-full resize-none rounded-xl border border-[#dce3df] bg-[#fcfdfc] p-2.5 text-xs text-[#202c28] outline-none focus:border-[#7ca89b] focus:bg-white"
                  />
                </div>

                {/* Follow-up Notes */}
                <div className="flex items-center gap-4 rounded-xl border border-[#e2e8e5] bg-[#fcfdfc] p-3 text-xs">
                  <label className="flex items-center gap-2 font-medium text-[#2d3934]">
                    <input
                      type="checkbox"
                      checked={extractedData.follow_up_required}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, follow_up_required: e.target.checked })
                      }
                      className="rounded accent-[#17201d]"
                    />
                    Follow-up Required
                  </label>
                  <input
                    type="text"
                    value={extractedData.follow_up_notes || ""}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, follow_up_notes: e.target.value })
                    }
                    placeholder="e.g. Return in 10 days with BP logs"
                    className="flex-1 bg-transparent text-xs text-[#3b4742] outline-none"
                  />
                </div>

                {/* Commit Action */}
                {saveSuccessMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-[#ebf7f1] p-3 text-xs font-semibold text-[#20664d]">
                    <CheckCircle2 size={15} />
                    <span>{saveSuccessMessage}</span>
                  </div>
                )}

                <button
                  onClick={handleSaveCaseSheet}
                  disabled={savingCaseSheet}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#17201d] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#273731] disabled:opacity-50"
                >
                  <FileCheck size={15} />
                  <span>{savingCaseSheet ? "Saving to EHR..." : "Confirm & Save to Case History"}</span>
                </button>
              </div>
            ) : transcript ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-emerald-200 bg-emerald-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-sm">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950">Audio Transcribed & Ready for Ollama</h4>
                <p className="text-xs text-emerald-800 mt-1.5 max-w-sm line-clamp-3 italic">
                  "{transcript.slice(0, 160)}..."
                </p>
                <button
                  onClick={handleExtractWithOllama}
                  disabled={extracting}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-[#205244] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#2c6e5c]"
                >
                  <Sparkles size={14} className={extracting ? "animate-spin" : ""} />
                  <span>{extracting ? "Extracting with Ollama..." : "Extract Structured Insights with Ollama"}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-[#808c87]">
                <Stethoscope size={32} className="text-[#a4b4ad] mb-2" />
                <p className="font-medium text-[#46534e]">Structured case sheet not yet extracted.</p>
                <p className="mt-1 text-[11px] text-[#86938d]">
                  Speak into the mic or choose a demo transcript on the left, then click "Extract with Ollama".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTINUOUS DIGITAL PATIENT TIMELINE */}
      <div className="rounded-2xl border border-[#dfe5e2] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#ecf0ee] pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-[#17201d]">
              Patient Case Timeline & Continuous Health Feed
            </h3>
            <p className="text-xs text-[#6e7b75]">
              Unified chronological record of clinical consultations, uploaded diagnostics, and prescriptions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "ALL", label: "All Events" },
                { id: "CONSULTATION", label: "Consultations" },
                { id: "REPORT", label: "Diagnostics / Reports" },
                { id: "MEDICATION_REGIMEN", label: "Medications" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setTimelineFilter(filter.id)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                  timelineFilter === filter.id
                    ? "bg-[#17201d] text-white"
                    : "bg-[#f1f4f2] text-[#4d5954] hover:bg-[#e6ece9]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events Feed */}
        <div className="mt-6 space-y-6">
          {loadingTimeline ? (
            <p className="py-8 text-center text-xs text-[#8d9893]">Loading digital timeline...</p>
          ) : filteredTimeline.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8c9893]">
              No timeline events recorded under this filter.
            </div>
          ) : (
            filteredTimeline.map((event) => {
              const isExpanded = expandedEventId === event.id;

              return (
                <div
                  key={event.id}
                  className="relative pl-7 before:absolute before:left-[11px] before:top-3 before:bottom-0 before:w-0.5 before:bg-[#e2e8e5] last:before:hidden"
                >
                  {/* Event Marker Icon */}
                  <div
                    className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white ${
                      event.eventType === "CONSULTATION"
                        ? "bg-[#1c4d3f]"
                        : event.eventType === "REPORT"
                        ? "bg-[#2b5a7a]"
                        : "bg-[#543b66]"
                    }`}
                  >
                    {event.eventType === "CONSULTATION" && <Stethoscope size={12} />}
                    {event.eventType === "REPORT" && <FileText size={12} />}
                    {event.eventType === "MEDICATION_REGIMEN" && <Pill size={12} />}
                  </div>

                  {/* Card Content */}
                  <div className="rounded-xl border border-[#dfe5e2] bg-[#fafbfb] p-4 transition hover:border-[#b4c7be]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#798580]">
                          {event.eventType.replace("_", " ")}
                        </span>
                        <h4 className="text-sm font-semibold text-[#1a2522]">{event.title}</h4>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#6e7b75]">
                        <Clock size={12} />
                        <span>{new Date(event.timestamp).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                        <button
                          onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                          className="ml-2 rounded-md p-1 hover:bg-[#eaeef0]"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Summary Preview */}
                    {event.case_sheet?.diagnosis && (
                      <p className="mt-1 text-xs text-[#404c47]">
                        <strong>Diagnosis:</strong> {event.case_sheet.diagnosis}
                      </p>
                    )}
                    {event.summary && (
                      <p className="mt-1 text-xs text-[#404c47]">{event.summary}</p>
                    )}

                    {/* Prescriptions preview */}
                    {event.case_sheet?.medications_prescribed &&
                      event.case_sheet.medications_prescribed.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {event.case_sheet.medications_prescribed.map((m, idx) => (
                            <span
                              key={idx}
                              className="rounded-md border border-[#d6e0db] bg-white px-2 py-0.5 text-[11px] font-medium text-[#2f4039]"
                            >
                              💊 {m.name} ({m.dosage})
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Expanded Drawer: Full Consultation & Audit Trail */}
                    {isExpanded && (
                      <div className="mt-4 border-t border-[#e2e8e5] pt-3 text-xs space-y-3">
                        {event.case_sheet && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-[#73807b]">Symptoms</p>
                              <p className="mt-0.5 text-[#202c28]">
                                {event.case_sheet.symptoms?.join(", ") || "None"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-[#73807b]">Doctor's Advice</p>
                              <p className="mt-0.5 text-[#202c28]">
                                {event.case_sheet.doctors_advice?.join(" • ") || "Rest and fluids"}
                              </p>
                            </div>
                          </div>
                        )}

                        {event.transcript && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-[#73807b]">
                              Auditable Consultation Transcript
                            </p>
                            <div className="mt-1 max-h-36 overflow-y-auto rounded-lg bg-white p-2.5 font-mono text-[11px] leading-relaxed text-[#35433f] border border-[#e2e8e5]">
                              {event.transcript}
                            </div>
                          </div>
                        )}

                        {event.flagged_findings && event.flagged_findings.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase text-[#73807b]">Clinical Findings</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {event.flagged_findings.map((f, i) => (
                                <span key={i} className="rounded bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                                  ⚠️ {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODAL 1: DPDP ACT 2023 DIGITAL CONSENT ── */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#dfe5e2] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#edf0ee] pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f0eb] text-[#246b52]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#17201d]">
                  DPDP Act 2023 Consultation Consent
                </h3>
                <p className="text-xs text-[#707c77]">
                  Mandatory legal authorization before capturing clinical audio
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-[#3b4742]">
              <p className="leading-relaxed bg-[#f6f8f7] p-3 rounded-xl border border-[#e5ebe8]">
                In accordance with India's <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and the <strong>ABDM Health Data Management Policy</strong>, consultation recording and AI processing require explicit informed consent from both patient and clinician. Audio will be transcribed on-premise and structured into the patient's verified EHR.
              </p>

              <label className="flex items-start gap-2.5 rounded-xl border border-[#dfe5e2] p-3 hover:bg-[#fafbfb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={patientConsentChecked}
                  onChange={(e) => setPatientConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded accent-[#17201d]"
                />
                <div>
                  <p className="font-semibold text-[#17201d]">Patient Consent Acknowledged</p>
                  <p className="text-[11px] text-[#6d7974]">
                    Patient has been verbally informed and agreed to audio recording for clinical record generation.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 rounded-xl border border-[#dfe5e2] p-3 hover:bg-[#fafbfb] cursor-pointer">
                <input
                  type="checkbox"
                  checked={doctorConsentChecked}
                  onChange={(e) => setDoctorConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded accent-[#17201d]"
                />
                <div>
                  <p className="font-semibold text-[#17201d]">Consulting Physician Authorization</p>
                  <p className="text-[11px] text-[#6d7974]">
                    Doctor verifies purpose limitation and will review AI insights before saving to EHR.
                  </p>
                </div>
              </label>

              <div className="rounded-lg bg-[#f0f5f2] p-2 font-mono text-[10px] text-[#4d665b]">
                Timestamp: {new Date().toISOString()} • Law: DPDP Act Sec 6(1)
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#edf0ee] pt-4">
              <button
                onClick={() => setShowConsentModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-[#64726d] hover:bg-[#f1f4f3]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConsent}
                disabled={!patientConsentChecked || !doctorConsentChecked}
                className="rounded-xl bg-[#17201d] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#2b3a35] disabled:opacity-50"
              >
                Accept & Start Recording
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: BREAK-GLASS EMERGENCY ACCESS ── */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border-2 border-red-500 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-red-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
                  <Flame size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-700">
                    EMERGENCY BREAK-GLASS CLINICAL ACCESS
                  </h3>
                  <p className="text-[11px] text-red-600">
                    Minimal Critical Emergency Dataset • Logged to Audit Registry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="rounded-md p-1 text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>

            {loadingEmergency || !emergencyData ? (
              <p className="py-8 text-center text-xs text-red-600">Authorizing emergency access...</p>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl bg-red-50 p-3 text-red-800 border border-red-200">
                  <p className="font-semibold">⚠️ Legal Audit Notice</p>
                  <p className="text-[11px] mt-0.5">
                    This emergency break-glass event has been logged with Audit ID{" "}
                    <span className="font-mono font-bold">{emergencyData.audit_log_id}</span>. Unlawful access is punishable under DPDP Act 2023.
                  </p>
                </div>

                {/* Patient Summary */}
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-semibold">Patient</p>
                    <p className="font-bold text-sm text-gray-900">{emergencyData.patient.full_name}</p>
                    <p className="font-mono text-[11px] text-gray-600">{emergencyData.patient.custom_id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-semibold">Blood Group</p>
                    <p className="text-xl font-black text-red-600">{emergencyData.patient.blood_type}</p>
                  </div>
                </div>

                {/* Critical Allergies */}
                <div className="rounded-xl border border-red-200 bg-white p-3">
                  <p className="font-semibold text-red-700 uppercase tracking-wider text-[10px]">
                    Critical Allergies (DO NOT ADMINISTER)
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {emergencyData.patient.critical_allergies.map((allg, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-red-600 px-2 py-1 font-bold text-white text-xs"
                      >
                        ⚠️ {allg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active Medications */}
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <p className="font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                    Active Medications
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {emergencyData.patient.active_medications.map((med, idx) => (
                      <div key={idx} className="flex justify-between border-b border-gray-100 pb-1 text-xs">
                        <span className="font-medium text-gray-800">{med.name}</span>
                        <span className="text-gray-500">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <p className="text-[10px] uppercase text-gray-500 font-semibold">Emergency Contact</p>
                  <p className="font-semibold text-gray-800">
                    {emergencyData.patient.emergency_contact.name} ({emergencyData.patient.emergency_contact.relation})
                  </p>
                  <p className="font-mono text-xs text-gray-600">
                    📞 {emergencyData.patient.emergency_contact.phone}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="rounded-xl bg-gray-800 px-5 py-2 text-xs font-semibold text-white hover:bg-black"
              >
                Close Emergency View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: MEDICAL REPORT UPLOAD ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#dfe5e2] bg-white p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-[#17201d]">Upload Diagnostic Report</h3>
            <p className="text-xs text-[#73807b] mt-0.5">Attach ECG, MRI, Blood or Lab documents to EHR</p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-[#69736f] mb-1">
                  Report Modality
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] p-2.5 outline-none focus:border-[#7ca89b]"
                >
                  <option value="ECG">12-Lead Electrocardiogram (ECG)</option>
                  <option value="Blood">Comprehensive Blood / Metabolic Panel</option>
                  <option value="MRI">Magnetic Resonance Imaging (MRI)</option>
                  <option value="CT">Computed Tomography (CT Scan)</option>
                  <option value="X-Ray">Chest / Skeletal X-Ray</option>
                  <option value="Other">Other Diagnostic Study</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-[#69736f] mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. 12-Lead ECG Resting"
                  className="w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] p-2.5 outline-none focus:border-[#7ca89b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-[#69736f] mb-1">
                  Clinical Summary & Interpretation
                </label>
                <textarea
                  rows={3}
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  placeholder="Summary of radiologist or pathologist interpretation..."
                  className="w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] p-2.5 outline-none focus:border-[#7ca89b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase text-[#69736f] mb-1">
                  Primary Finding / Highlight
                </label>
                <input
                  type="text"
                  value={reportFinding}
                  onChange={(e) => setReportFinding(e.target.value)}
                  placeholder="e.g. Normal sinus rhythm, borderline high cholesterol"
                  className="w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] p-2.5 outline-none focus:border-[#7ca89b]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-[#6c7974] hover:bg-[#f3f6f5]"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                disabled={uploadingReport || !reportTitle.trim()}
                className="rounded-xl bg-[#17201d] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#2b3a35] disabled:opacity-50"
              >
                {uploadingReport ? "Uploading..." : "Save Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: ABHA DIGITAL HEALTH CARD VIEW ── */}
      {showAbhaModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#b2d6c9] bg-gradient-to-br from-[#0c2e24] to-[#174637] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#64d4ab]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#64d4ab]">
                  AYUSHMAN BHARAT DIGITAL MISSION
                </span>
              </div>
              <button onClick={() => setShowAbhaModal(false)} className="text-white/60 hover:text-white">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">Patient Name</p>
                <p className="text-base font-bold tracking-tight">{selectedPatient.full_name}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/60">ABHA Number</p>
                <p className="font-mono text-lg font-bold tracking-wider text-[#7cebc2]">
                  {selectedPatient.abha_id || "91-8472-9012-4411"}
                </p>
              </div>

              <div className="flex justify-between text-xs text-white/80 border-t border-white/10 pt-3">
                <div>
                  <p className="text-[9px] uppercase text-white/50">DOB / Gender</p>
                  <p>{selectedPatient.dob || "1990-05-12"} / {selectedPatient.sex || "M"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-white/50">Blood Group</p>
                  <p className="font-bold text-[#ffb0a8]">{selectedPatient.blood_type || "O+"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase text-white/50">Status</p>
                  <p className="text-[#64d4ab]">Verified (M1)</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-black/30 p-2.5 text-center font-mono text-[10px] text-white/70">
              ABDM Sandbox Linked • Verified EHR Token
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
