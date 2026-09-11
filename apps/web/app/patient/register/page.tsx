"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../../lib/auth";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    abhaId: "",
    dob: "",
    sex: "",
    bloodType: "",
    contactPhone: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    knownAllergies: "",
    chronicConditions: "",
  });

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: "PATIENT",
        abha_id: form.abhaId,
        dob: form.dob,
        sex: form.sex,
        blood_type: form.bloodType,
        contact_phone: form.contactPhone,
        emergency_contact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation,
        },
        known_allergies: form.knownAllergies.split(",").map((item) => item.trim()).filter(Boolean),
        chronic_conditions: form.chronicConditions.split(",").map((item) => item.trim()).filter(Boolean),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9f8] text-[#17201d]">
      <div className="relative min-h-screen">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-blue-100/50 blur-[120px]" />

          <div className="absolute -bottom-40 -right-32 h-[520px] w-[520px] rounded-full bg-emerald-100/40 blur-[120px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#17201d 1px, transparent 1px), linear-gradient(90deg, #17201d 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dfe5e2] bg-white text-[#69726e] hover:bg-[#f0f2f1]"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17201d] text-white shadow-sm">
                <Activity size={18} strokeWidth={2.2} />
              </div>

              <div>
                <div className="text-[15px] font-semibold tracking-[-0.02em]">
                  VITAWEAVE
                </div>

                <div className="hidden text-[8px] font-medium uppercase tracking-[0.22em] text-[#7a8581] sm:block">
                  Healthcare Intelligence
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#dfe5e2] bg-white/70 px-3 py-2 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#6d7773]">
              Patient Access
            </span>
          </div>
        </header>

        {/* Main */}
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-[1400px] items-center px-6 pb-12 pt-4 sm:px-10 lg:px-14">
          <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            {/* Left editorial content */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px w-10 bg-[#94a09b]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#737e79]">
                  Patient onboarding
                </span>
              </div>

              <h1 className="max-w-[650px] text-[clamp(3.5rem,7vw,6.8rem)] font-medium leading-[0.88] tracking-[-0.075em]">
                Your health.
                <br />
                <span className="text-[#68736f]">
                  Understood.
                </span>
              </h1>

              <p className="mt-8 max-w-[500px] text-base leading-7 text-[#69736f] sm:text-lg">
                Create your VITAWEAVE patient profile to access personalized
                clinical intelligence, health insights, and connected
                healthcare services.
              </p>

              {/* Patient flow */}
              <div className="mt-12 max-w-[520px]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#89928e]">
                    Getting started
                  </span>

                  <span className="font-mono text-[9px] text-[#a0aaa6]">
                    PATIENT / 01
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      number: "01",
                      title: "Create your profile",
                      description: "Basic information and secure access",
                    },
                    {
                      number: "02",
                      title: "Build your health profile",
                      description: "Clinical information when you're ready",
                    },
                    {
                      number: "03",
                      title: "Access your insights",
                      description: "Understand your health signals",
                    },
                  ].map((item) => (
                    <div
                      key={item.number}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dce3df] bg-white/70 font-mono text-[9px] text-[#7c8782]">
                        {item.number}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#35403c]">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-xs text-[#929b97]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security statement */}
              <div className="mt-12 flex items-center gap-2">
                <ShieldCheck
                  size={15}
                  strokeWidth={1.7}
                  className="text-emerald-600"
                />

                <span className="text-[9px] uppercase tracking-[0.14em] text-[#89938f]">
                  Secure patient workspace
                </span>
              </div>
            </motion.div>

            {/* Registration panel */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative mx-auto w-full max-w-[560px]"
            >
              {/* Technical coordinates */}
              <div className="absolute -right-1 -top-8 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#a0aaa6] sm:block">
                PATIENT REGISTRATION
                <br />
                NXS / 001
              </div>

              <div className="rounded-[30px] border border-[#dfe5e2] bg-white/80 p-7 shadow-[0_30px_100px_rgba(23,32,29,0.08)] backdrop-blur-2xl sm:p-9">
                {/* Heading */}
                <div className="mb-8">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f4f2] text-[#27332f]">
                    <UserRound size={19} strokeWidth={1.8} />
                  </div>

                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8a9590]">
                    Patient account
                  </p>

                  <h2 className="text-3xl font-medium tracking-[-0.045em]">
                    Create your account.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#7b8581]">
                    Complete your profile once so your care team has the
                    right information from day one.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                    >
                      Full name
                    </label>

                    <div className="relative">
                      <UserRound
                        size={16}
                        strokeWidth={1.7}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                      />

                      <input
                        id="fullName"
                        type="text"
                        value={form.fullName}
                        onChange={(event) =>
                          updateField(
                            "fullName",
                            event.target.value
                          )
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        className="
                          h-13 w-full rounded-2xl
                          border border-[#dfe5e2]
                          bg-[#f9faf9]
                          pl-12 pr-4
                          text-sm
                          outline-none
                          transition-all
                          placeholder:text-[#a4aca8]
                          focus:border-[#aab5b0]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#17201d]/[0.035]
                        "
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                    >
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        strokeWidth={1.7}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                      />

                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField(
                            "email",
                            event.target.value
                          )
                        }
                        placeholder="you@email.com"
                        autoComplete="email"
                        required
                        className="
                          h-13 w-full rounded-2xl
                          border border-[#dfe5e2]
                          bg-[#f9faf9]
                          pl-12 pr-3
                          text-sm
                          outline-none
                          transition-all
                          placeholder:text-[#a4aca8]
                          focus:border-[#aab5b0]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#17201d]/[0.035]
                        "
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#e8ecea] pt-5">
                    <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Health identity</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="abhaId" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">ABHA ID <span className="normal-case text-[#9aa49f]">(optional)</span></label>
                        <input id="abhaId" value={form.abhaId} onChange={(event) => updateField("abhaId", event.target.value)} placeholder="91-8472-9012-4411" className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" />
                      </div>
                      <div>
                        <label htmlFor="dob" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Date of birth</label>
                        <input id="dob" type="date" value={form.dob} onChange={(event) => updateField("dob", event.target.value)} required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" />
                      </div>
                      <div>
                        <label htmlFor="sex" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Sex</label>
                        <select id="sex" value={form.sex} onChange={(event) => updateField("sex", event.target.value)} required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white"><option value="">Select</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option></select>
                      </div>
                      <div>
                        <label htmlFor="bloodType" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Blood type</label>
                        <select id="bloodType" value={form.bloodType} onChange={(event) => updateField("bloodType", event.target.value)} required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white"><option value="">Select</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => <option key={type} value={type}>{type}</option>)}</select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#e8ecea] pt-5">
                    <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Contact & emergency contact</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2"><label htmlFor="contactPhone" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Phone number</label><input id="contactPhone" type="tel" value={form.contactPhone} onChange={(event) => updateField("contactPhone", event.target.value)} placeholder="+91 98201 44521" required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" /></div>
                      <div><label htmlFor="emergencyName" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Emergency contact name</label><input id="emergencyName" value={form.emergencyName} onChange={(event) => updateField("emergencyName", event.target.value)} required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" /></div>
                      <div><label htmlFor="emergencyPhone" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Emergency phone</label><input id="emergencyPhone" type="tel" value={form.emergencyPhone} onChange={(event) => updateField("emergencyPhone", event.target.value)} required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" /></div>
                      <div className="sm:col-span-2"><label htmlFor="emergencyRelation" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Relationship</label><input id="emergencyRelation" value={form.emergencyRelation} onChange={(event) => updateField("emergencyRelation", event.target.value)} placeholder="Parent, spouse, sibling…" required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" /></div>
                    </div>
                  </div>

                  <div className="border-t border-[#e8ecea] pt-5">
                    <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Medical information</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><label htmlFor="knownAllergies" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Known allergies</label><input id="knownAllergies" value={form.knownAllergies} onChange={(event) => updateField("knownAllergies", event.target.value)} placeholder="Penicillin, pollen, or None" required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" /></div>
                      <div><label htmlFor="chronicConditions" className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]">Chronic conditions</label><input id="chronicConditions" value={form.chronicConditions} onChange={(event) => updateField("chronicConditions", event.target.value)} placeholder="Diabetes, asthma, or None" required className="h-12 w-full rounded-xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm outline-none focus:border-[#aab5b0] focus:bg-white" /></div>
                    </div>
                    <p className="mt-2 text-[10px] text-[#8a9590]">Separate multiple items with commas.</p>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                    >
                      Password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={16}
                        strokeWidth={1.7}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(event) =>
                          updateField(
                            "password",
                            event.target.value
                          )
                        }
                        placeholder="Create a secure password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        className="
                          h-13 w-full rounded-2xl
                          border border-[#dfe5e2]
                          bg-[#f9faf9]
                          pl-12 pr-12
                          text-sm
                          outline-none
                          transition-all
                          placeholder:text-[#a4aca8]
                          focus:border-[#aab5b0]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#17201d]/[0.035]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f] hover:text-[#35413d]"
                      >
                        {showPassword ? (
                          <EyeOff size={17} strokeWidth={1.7} />
                        ) : (
                          <Eye size={17} strokeWidth={1.7} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                    >
                      Confirm password
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={16}
                        strokeWidth={1.7}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={form.confirmPassword}
                        onChange={(event) =>
                          updateField(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        required
                        className="
                          h-13 w-full rounded-2xl
                          border border-[#dfe5e2]
                          bg-[#f9faf9]
                          pl-12 pr-12
                          text-sm
                          outline-none
                          transition-all
                          placeholder:text-[#a4aca8]
                          focus:border-[#aab5b0]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#17201d]/[0.035]
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (value) => !value
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f] hover:text-[#35413d]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} strokeWidth={1.7} />
                        ) : (
                          <Eye size={17} strokeWidth={1.7} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group flex h-14 w-full
                      items-center justify-center gap-3
                      rounded-2xl
                      bg-[#17201d]
                      text-sm font-medium text-white
                      shadow-[0_12px_30px_rgba(23,32,29,0.16)]
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:bg-[#26332e]
                      hover:shadow-[0_18px_40px_rgba(23,32,29,0.2)]
                      active:translate-y-0
                      disabled:opacity-50 disabled:pointer-events-none
                    "
                  >
                    <span>{loading ? "Creating account..." : "Create patient account"}</span>

                    <ArrowRight
                      size={16}
                      strokeWidth={1.8}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </form>

                {/* Security */}
                <div className="mt-7 flex items-center justify-center gap-2">
                  <ShieldCheck
                    size={14}
                    strokeWidth={1.7}
                    className="text-emerald-600"
                  />

                  <span className="text-[9px] text-[#89938f]">
                    Your account is protected with secure authentication
                  </span>
                </div>
              </div>

              {/* Login */}
              <p className="mt-6 text-center text-xs text-[#89938f]">
                Already have an account?{" "}
                <Link
                  href="/patient/login"
                  className="font-medium text-[#35413d] underline decoration-[#c5ceca] underline-offset-4 transition-colors hover:text-[#17201d]"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <div className="pointer-events-none absolute bottom-6 left-6 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#a0aaa6] sm:left-10 lg:left-14 lg:block">
          VITAWEAVE / PATIENT / REGISTRATION
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#a0aaa6] sm:right-10 lg:right-14 lg:block">
          SECURE ACCESS · 01
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
