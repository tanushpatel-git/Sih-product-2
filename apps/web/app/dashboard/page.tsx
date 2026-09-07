"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Shell from "@/components/Shell";
import DashboardPatient from "@/components/DashboardPatient";
import DashboardDoctor from "@/components/DashboardDoctor";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return <Shell><div /></Shell>;

  return (
    <Shell>
      {user.role === "DOCTOR" ? <DashboardDoctor /> : <DashboardPatient />}
    </Shell>
  );
}