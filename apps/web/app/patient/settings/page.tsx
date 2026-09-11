"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Save, Settings } from "lucide-react";
import { api, getStoredUser, type PatientProfile } from "../../../lib/api";

type ProfileForm = {
  abha_id: string; dob: string; sex: string; blood_type: string; contact_phone: string;
  emergency_name: string; emergency_phone: string; emergency_relation: string;
  known_allergies: string; chronic_conditions: string;
};

const blankProfile: ProfileForm = {
  abha_id: "", dob: "", sex: "", blood_type: "", contact_phone: "",
  emergency_name: "", emergency_phone: "", emergency_relation: "", known_allergies: "", chronic_conditions: "",
};
const listText = (items?: string[]) => (items || []).join(", ");

export default function PatientSettingsPage() {
  const [form, setForm] = useState<ProfileForm>(blankProfile);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const user = getStoredUser();
    if (!user?.patient_id) { setError("Please sign in to manage your profile."); setLoading(false); return; }
    api.getPatientProfile(user.patient_id)
      .then(({ patient: profile }) => {
        setPatient(profile);
        setForm({
          abha_id: profile.abha_id || "", dob: profile.dob || "", sex: profile.sex || "", blood_type: profile.blood_type || "", contact_phone: profile.contact_phone || "",
          emergency_name: profile.emergency_contact?.name || "", emergency_phone: profile.emergency_contact?.phone || "", emergency_relation: profile.emergency_contact?.relation || "",
          known_allergies: listText(profile.known_allergies), chronic_conditions: listText(profile.chronic_conditions),
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load your profile."))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof ProfileForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const toList = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      await api.updateMyPatientProfile({
        abha_id: form.abha_id, dob: form.dob, sex: form.sex, blood_type: form.blood_type, contact_phone: form.contact_phone,
        emergency_contact: { name: form.emergency_name, phone: form.emergency_phone, relation: form.emergency_relation },
        known_allergies: toList(form.known_allergies), chronic_conditions: toList(form.chronic_conditions),
      });
      setMessage("Your patient profile has been updated.");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Could not save your profile."); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f7f9f8] text-sm text-[#69736f]">Loading your profile…</main>;

  return <main className="min-h-screen bg-[#f7f9f8] px-5 py-8 text-[#17201d] sm:px-10">
    <div className="mx-auto max-w-3xl">
      <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-sm text-[#63716b] hover:text-[#17201d]"><ArrowLeft size={16} /> Back to dashboard</Link>
      <div className="mt-7 rounded-[28px] border border-[#dfe5e2] bg-white p-6 shadow-[0_20px_70px_rgba(23,32,29,0.07)] sm:p-9">
        <div className="flex items-start gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf4f1] text-[#52786d]"><Settings size={21} /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b8581]">Patient settings</p><h1 className="mt-1 text-3xl font-medium tracking-[-0.04em]">Your health profile</h1><p className="mt-2 text-sm text-[#6d7773]">Keep this information current so care is safer and more personal.</p></div></div>
        {patient && <div className="mt-6 rounded-xl bg-[#f3f7f5] px-4 py-3 text-xs text-[#5c6d66]"><span className="font-semibold">Patient ID:</span> {patient.custom_id}</div>}
        {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
        {message && <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><CheckCircle2 size={17} />{message}</div>}
        <form onSubmit={save} className="mt-7 space-y-7">
          <section><h2 className="text-sm font-semibold">Identity & contact</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="ABHA ID (optional)"><input value={form.abha_id} onChange={(e) => update("abha_id", e.target.value)} placeholder="91-8472-9012-4411" /></Field>
            <Field label="Date of birth"><input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required /></Field>
            <Field label="Sex"><select value={form.sex} onChange={(e) => update("sex", e.target.value)} required><option value="">Select</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select></Field>
            <Field label="Blood type"><select value={form.blood_type} onChange={(e) => update("blood_type", e.target.value)} required><option value="">Select</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => <option key={type}>{type}</option>)}</select></Field>
            <Field label="Phone number"><input type="tel" value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} required /></Field>
          </div></section>
          <section className="border-t border-[#e8ecea] pt-6"><h2 className="text-sm font-semibold">Emergency contact</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Full name"><input value={form.emergency_name} onChange={(e) => update("emergency_name", e.target.value)} required /></Field><Field label="Phone number"><input type="tel" value={form.emergency_phone} onChange={(e) => update("emergency_phone", e.target.value)} required /></Field><Field label="Relationship"><input value={form.emergency_relation} onChange={(e) => update("emergency_relation", e.target.value)} placeholder="Parent, spouse, sibling…" required /></Field></div></section>
          <section className="border-t border-[#e8ecea] pt-6"><h2 className="text-sm font-semibold">Medical information</h2><p className="mt-1 text-xs text-[#7b8581]">Separate multiple items with commas. Use “None” if applicable.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Known allergies"><input value={form.known_allergies} onChange={(e) => update("known_allergies", e.target.value)} placeholder="Penicillin, pollen, or None" /></Field><Field label="Chronic conditions"><input value={form.chronic_conditions} onChange={(e) => update("chronic_conditions", e.target.value)} placeholder="Asthma, diabetes, or None" /></Field></div></section>
          <button disabled={saving} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#17201d] px-5 text-sm font-medium text-white transition hover:bg-[#293a34] disabled:opacity-50"><Save size={16} /> {saving ? "Saving…" : "Save changes"}</button>
        </form>
      </div>
    </div>
  </main>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#69736f]"><span className="mb-2 block">{label}</span><div className="[&_input]:h-12 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[#dfe5e2] [&_input]:bg-[#f9faf9] [&_input]:px-3 [&_input]:text-sm [&_input]:font-normal [&_input]:normal-case [&_input]:tracking-normal [&_select]:h-12 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[#dfe5e2] [&_select]:bg-[#f9faf9] [&_select]:px-3 [&_select]:text-sm [&_select]:font-normal [&_select]:normal-case [&_select]:tracking-normal">{children}</div></label>;
}
