export interface DoctorProfile {
  name: string;
  email: string;
  specialty: string;
  licenseNumber: string;
}

export const DOCTOR_STORAGE_KEY = "vitaweave_current_doctor";
export const DOCTOR_ACCOUNTS_KEY = "vitaweave_doctor_accounts";

export const FALLBACK_DOCTOR: DoctorProfile = {
  name: "Dr. Ananya Sharma",
  email: "ananya.sharma@vitaweave.in",
  specialty: "General Medicine",
  licenseNumber: "MCI-2024-88419",
};

export function formatDoctorName(rawName?: string): string {
  if (!rawName || !rawName.trim()) return "Dr. Doctor";
  const trimmed = rawName.trim();
  if (/^dr\.?\s+/i.test(trimmed)) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
}

export function getCurrentDoctor(): DoctorProfile {
  if (typeof window === "undefined") {
    return FALLBACK_DOCTOR;
  }
  try {
    const raw = localStorage.getItem(DOCTOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          name: parsed.name || parsed.fullName || FALLBACK_DOCTOR.name,
          email: parsed.email || FALLBACK_DOCTOR.email,
          specialty: parsed.specialty || FALLBACK_DOCTOR.specialty,
          licenseNumber: parsed.licenseNumber || FALLBACK_DOCTOR.licenseNumber,
        };
      }
    }
  } catch {}
  return FALLBACK_DOCTOR;
}

export function getISTGreetingAndDate() {
  const now = new Date();

  // Format into Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const parts = formatter.formatToParts(now);
  const hourVal = parts.find((p) => p.type === "hour")?.value;
  const hour = hourVal ? parseInt(hourVal, 10) : now.getHours();

  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
  } else if (hour >= 17 || hour < 5) {
    greeting = "Good evening";
  }

  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const year = parts.find((p) => p.type === "year")?.value || "";
  const dateStr = `${weekday} / ${day} ${month} ${year}`;

  return { greeting, dateStr, hour };
}
