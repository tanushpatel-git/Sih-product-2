"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email,
        password,
        fullName,
        role,
        specialty: specialty || undefined,
        licenseNo: licenseNo || undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Create an account
        </h1>
        {error && (
          <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          {(["PATIENT", "DOCTOR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {r === "PATIENT" ? "Patient" : "Doctor"}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Full name
          <input
            className={inputCls}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email
          <input
            type="email"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Password
          <input
            type="password"
            className={inputCls}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {role === "DOCTOR" && (
          <>
            <label className="mt-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Specialty
              <input
                className={inputCls}
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              License number
              <input
                className={inputCls}
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
              />
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}