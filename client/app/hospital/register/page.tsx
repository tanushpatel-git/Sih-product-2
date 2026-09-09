"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Hospital,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

export function HospitalRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [hospitalName, setHospitalName] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [beds, setBeds] = useState("");
  const [icuBeds, setIcuBeds] = useState("");
  const [administrator, setAdministrator] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!terms) {
      alert("Please accept the terms and authorization.");
      return;
    }

    console.log({
      hospitalName,
      hospitalType,
      email,
      phone,
      registrationNumber,
      address,
      city,
      state,
      pincode,
      beds,
      icuBeds,
      administrator,
      password,
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9f8] text-[#17201d]">
      <div className="relative min-h-screen">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-blue-100/50 blur-[120px]" />

          <div className="absolute -bottom-48 -right-32 h-[580px] w-[580px] rounded-full bg-emerald-100/40 blur-[130px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#17201d 1px, transparent 1px), linear-gradient(90deg, #17201d 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Navigation */}
        <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
          <div className="flex items-center gap-3">
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
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#dfe5e2] bg-white/70 px-3 py-2 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#6d7773]">
              Systems Operational
            </span>
          </div>
        </header>

        {/* Main */}
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-90px)] max-w-[1500px] items-center px-6 pb-16 pt-4 sm:px-10 lg:px-14">
          <div className="grid w-full grid-cols-1 items-start gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            {/* Left editorial */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative pt-8 lg:sticky lg:top-20"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px w-10 bg-[#94a09b]" />

                <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#737e79]">
                  Hospital Intelligence Network
                </span>
              </div>

              <h1 className="max-w-[680px] text-[clamp(3.3rem,6.5vw,6.8rem)] font-medium leading-[0.88] tracking-[-0.075em] text-[#17201d]">
                Connect your
                <br />
                <span className="text-[#68736f]">hospital.</span>
                <br />
                See further.
              </h1>

              <p className="mt-8 max-w-[530px] text-base leading-7 text-[#69736f] sm:text-lg">
                Bring your hospital&apos;s capacity, demand, and clinical
                signals into one intelligent operational workspace.
              </p>

              {/* Intelligence flow */}
              <div className="mt-12 max-w-[590px]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#89928e]">
                    Hospital intelligence
                  </span>

                  <span className="font-mono text-[9px] text-[#a0aaa6]">
                    NXS / 02
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    "CAPACITY",
                    "DEMAND",
                    "RESOURCES",
                    "FORECAST",
                    "NETWORK",
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="rounded-full border border-[#d9e0dd] bg-white/75 px-3 py-2 text-[9px] font-medium tracking-[0.12em] text-[#56615d] shadow-[0_4px_18px_rgba(23,32,29,0.035)] backdrop-blur-sm">
                        {item}
                      </div>

                      {index < 4 && (
                        <ArrowRight
                          size={11}
                          strokeWidth={1.5}
                          className="text-[#a6afab]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospital capabilities */}
              <div className="mt-14 grid max-w-[590px] grid-cols-3 border-t border-[#dfe5e2] pt-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#9aa39f]">
                    Capacity
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#35403c]">
                    <Hospital size={14} strokeWidth={1.6} />
                    Live
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#9aa39f]">
                    Forecast
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#35403c]">
                    <Activity size={14} strokeWidth={1.6} />
                    7 Days
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#9aa39f]">
                    Network
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#35403c]">
                    <Users size={14} strokeWidth={1.6} />
                    Regional
                  </p>
                </div>
              </div>

              {/* Registration steps */}
              <div className="mt-12 max-w-[590px] space-y-3">
                {[
                  ["01", "Register organization"],
                  ["02", "Verify hospital identity"],
                  ["03", "Activate intelligence workspace"],
                ].map(([number, label], index) => (
                  <div
                    key={number}
                    className="flex items-center gap-4 text-xs text-[#7c8682]"
                  >
                    <span className="font-mono text-[9px] text-[#a2aba7]">
                      {number}
                    </span>

                    <div className="h-px w-6 bg-[#d7deda]" />

                    <span className={index === 0 ? "text-[#35403c]" : ""}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Registration form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative mx-auto w-full max-w-[650px]"
            >
              {/* Coordinates */}
              <div className="absolute -right-2 -top-8 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#a0aaa6] sm:block">
                ORGANIZATION
                <br />
                NXS / REG / 02
              </div>

              <div className="rounded-[30px] border border-[#dfe5e2] bg-white/80 p-7 shadow-[0_30px_100px_rgba(23,32,29,0.08)] backdrop-blur-2xl sm:p-9">
                {/* Heading */}
                <div className="mb-9">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f4f2] text-[#27332f]">
                    <Building2 size={18} strokeWidth={1.8} />
                  </div>

                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8a9590]">
                    Organization onboarding
                  </p>

                  <h2 className="text-3xl font-medium tracking-[-0.045em] text-[#17201d]">
                    Register your hospital.
                  </h2>

                  <p className="mt-2 max-w-[500px] text-sm leading-6 text-[#7b8581]">
                    Create your organization profile to connect hospital
                    operations with VITAWEAVE intelligence.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  {/* Organization */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#a0aaa6]">
                        01
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#69736f]">
                        Organization
                      </span>

                      <div className="h-px flex-1 bg-[#e7ebe9]" />
                    </div>

                    <div className="space-y-4">
                      {/* Hospital name */}
                      <div>
                        <label
                          htmlFor="hospitalName"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Hospital / Organization name
                        </label>

                        <div className="group relative">
                          <Building2
                            size={16}
                            strokeWidth={1.7}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                          />

                          <input
                            id="hospitalName"
                            type="text"
                            value={hospitalName}
                            onChange={(event) =>
                              setHospitalName(event.target.value)
                            }
                            placeholder="Enter hospital name"
                            required
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />
                        </div>
                      </div>

                      {/* Hospital type */}
                      <div>
                        <label
                          htmlFor="hospitalType"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Hospital type
                        </label>

                        <div className="relative">
                          <Hospital
                            size={16}
                            strokeWidth={1.7}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                          />

                          <select
                            id="hospitalType"
                            value={hospitalType}
                            onChange={(event) =>
                              setHospitalType(event.target.value)
                            }
                            required
                            className="h-14 w-full appearance-none rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-12 text-sm text-[#17201d] outline-none transition-all focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          >
                            <option value="">Select hospital type</option>
                            <option value="government">Government</option>
                            <option value="private">Private</option>
                            <option value="trust">Trust / NGO</option>
                            <option value="teaching">Teaching Hospital</option>
                            <option value="specialty">
                              Specialty Hospital
                            </option>
                          </select>

                          <ChevronDown
                            size={16}
                            strokeWidth={1.6}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                          />
                        </div>
                      </div>

                      {/* Registration */}
                      <div>
                        <label
                          htmlFor="registrationNumber"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Hospital registration number
                        </label>

                        <input
                          id="registrationNumber"
                          type="text"
                          value={registrationNumber}
                          onChange={(event) =>
                            setRegistrationNumber(event.target.value)
                          }
                          placeholder="Official registration / license number"
                          required
                          className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#a0aaa6]">
                        02
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#69736f]">
                        Contact & location
                      </span>

                      <div className="h-px flex-1 bg-[#e7ebe9]" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Email */}
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Official email
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
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="admin@hospital.org"
                            autoComplete="email"
                            required
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Phone number
                        </label>

                        <div className="relative">
                          <Phone
                            size={16}
                            strokeWidth={1.7}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                          />

                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="+91 00000 00000"
                            autoComplete="tel"
                            required
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="address"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Hospital address
                        </label>

                        <div className="relative">
                          <MapPin
                            size={16}
                            strokeWidth={1.7}
                            className="pointer-events-none absolute left-4 top-4 text-[#9aa49f]"
                          />

                          <textarea
                            id="address"
                            value={address}
                            onChange={(event) =>
                              setAddress(event.target.value)
                            }
                            placeholder="Street address, locality"
                            required
                            rows={3}
                            className="w-full resize-none rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-12 py-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          City
                        </label>

                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          placeholder="Bhopal"
                          required
                          className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label
                          htmlFor="state"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          State
                        </label>

                        <input
                          id="state"
                          type="text"
                          value={state}
                          onChange={(event) => setState(event.target.value)}
                          placeholder="Madhya Pradesh"
                          required
                          className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                        />
                      </div>

                      {/* Pincode */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="pincode"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Pincode
                        </label>

                        <input
                          id="pincode"
                          type="text"
                          inputMode="numeric"
                          value={pincode}
                          onChange={(event) => setPincode(event.target.value)}
                          placeholder="462001"
                          required
                          className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#a0aaa6]">
                        03
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#69736f]">
                        Hospital capacity
                      </span>

                      <div className="h-px flex-1 bg-[#e7ebe9]" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="beds"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Total beds
                        </label>

                        <div className="relative">
                          <Hospital
                            size={16}
                            strokeWidth={1.7}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                          />

                          <input
                            id="beds"
                            type="number"
                            min="0"
                            value={beds}
                            onChange={(event) => setBeds(event.target.value)}
                            placeholder="250"
                            required
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="icuBeds"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          ICU beds
                        </label>

                        <div className="relative">
                          <Activity
                            size={16}
                            strokeWidth={1.7}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                          />

                          <input
                            id="icuBeds"
                            type="number"
                            min="0"
                            value={icuBeds}
                            onChange={(event) =>
                              setIcuBeds(event.target.value)
                            }
                            placeholder="40"
                            required
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Administrator */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#a0aaa6]">
                        04
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#69736f]">
                        Authorized administrator
                      </span>

                      <div className="h-px flex-1 bg-[#e7ebe9]" />
                    </div>

                    <div>
                      <label
                        htmlFor="administrator"
                        className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                      >
                        Administrator / authorized person
                      </label>

                      <div className="relative">
                        <Users
                          size={16}
                          strokeWidth={1.7}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa49f]"
                        />

                        <input
                          id="administrator"
                          type="text"
                          value={administrator}
                          onChange={(event) =>
                            setAdministrator(event.target.value)
                          }
                          placeholder="Full name of authorized administrator"
                          required
                          className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] pl-12 pr-4 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="font-mono text-[9px] text-[#a0aaa6]">
                        05
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#69736f]">
                        Secure workspace
                      </span>

                      <div className="h-px flex-1 bg-[#e7ebe9]" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Password */}
                      <div>
                        <label
                          htmlFor="password"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Password
                        </label>

                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            placeholder="Create password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 pr-12 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((value) => !value)
                            }
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f] transition-colors hover:text-[#35413d]"
                          >
                            {showPassword ? (
                              <EyeOff size={17} strokeWidth={1.7} />
                            ) : (
                              <Eye size={17} strokeWidth={1.7} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm */}
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="mb-2.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#69736f]"
                        >
                          Confirm password
                        </label>

                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) =>
                              setConfirmPassword(event.target.value)
                            }
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            className="h-14 w-full rounded-2xl border border-[#dfe5e2] bg-[#f9faf9] px-4 pr-12 text-sm text-[#17201d] outline-none transition-all placeholder:text-[#a4aca8] focus:border-[#aab5b0] focus:bg-white focus:ring-4 focus:ring-[#17201d]/[0.035]"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((value) => !value)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa49f] transition-colors hover:text-[#35413d]"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={17} strokeWidth={1.7} />
                            ) : (
                              <Eye size={17} strokeWidth={1.7} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Authorization */}
                  <label
                    htmlFor="terms"
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#e2e7e4] bg-[#fafbfa] p-4"
                  >
                    <input
                      id="terms"
                      type="checkbox"
                      checked={terms}
                      onChange={(event) => setTerms(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#ccd5d1] accent-[#17201d]"
                    />

                    <span className="text-xs leading-5 text-[#7a8580]">
                      I confirm that I am authorized to register this
                      healthcare organization and agree to the VITAWEAVE
                      organization terms and security requirements.
                    </span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#17201d] text-sm font-medium text-white shadow-[0_12px_30px_rgba(23,32,29,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#26332e] hover:shadow-[0_18px_40px_rgba(23,32,29,0.2)] active:translate-y-0"
                  >
                    <span>Create hospital workspace</span>

                    <ArrowRight
                      size={16}
                      strokeWidth={1.8}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>
                </form>

                {/* Security */}
                <div className="mt-7 flex items-center justify-center gap-2 text-center">
                  <ShieldCheck
                    size={14}
                    strokeWidth={1.7}
                    className="text-emerald-600"
                  />

                  <span className="text-[9px] leading-4 text-[#89938f]">
                    Organization data protected · Secure VITAWEAVE onboarding
                  </span>
                </div>
              </div>

              {/* Login */}
              <p className="mt-6 text-center text-xs text-[#89938f]">
                Already registered?
                {" "}
                <Link
                  href="/hospital/login"
                  className="font-medium text-[#35403d] underline decoration-[#c5ceca] underline-offset-4 transition-colors hover:text-[#17201d]"
                >
                  Sign in to your hospital
                </Link>
              </p>
            </motion.div>
          </div>
        </section>

        {/* Footer coordinates */}
        <div className="pointer-events-none absolute bottom-6 left-6 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#a0aaa6] sm:left-10 lg:left-14 lg:block">
          VITAWEAVE / HOSPITAL INTELLIGENCE / ORGANIZATION
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 hidden font-mono text-[8px] uppercase tracking-[0.18em] text-[#a0aaa6] sm:right-10 lg:right-14 lg:block">
          SYSTEM 02 · ORGANIZATION
        </div>
      </div>
    </main>
  );
}

export default HospitalRegisterPage;