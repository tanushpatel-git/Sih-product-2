"use client";

import { CalendarDays, ChevronRight } from "lucide-react";

const appointments = [
  {
    doctor: "Dr. Ananya Mehta",
    specialty: "General Medicine",
    date: "12 Sep",
    time: "10:30 AM",
    type: "Follow-up",
  },
  {
    doctor: "Dr. Rahul Sharma",
    specialty: "Cardiology",
    date: "18 Sep",
    time: "04:00 PM",
    type: "Consultation",
  },
];

export default function PatientAppointments() {
  return (
    <div className="rounded-[25px] border border-[#e0e7e3] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-[#9ca7a3]">
            Upcoming care
          </p>

          <h3 className="mt-2 text-[19px] font-medium tracking-[-0.04em]">
            Appointments
          </h3>
        </div>

        <button className="text-[9px] text-[#63857b]">
          View all
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {appointments.map((appointment) => (
          <div
            key={`${appointment.doctor}-${appointment.date}`}
            className="group flex items-center gap-4 rounded-[16px] border border-[#e8edeb] p-4 transition hover:border-[#d5e3de] hover:bg-[#fafcfb]"
          >
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[12px] bg-[#edf5f2]">
              <CalendarDays
                size={13}
                className="text-[#608e81]"
              />

              <span className="mt-1 text-[7px] text-[#769088]">
                {appointment.date}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium">
                {appointment.doctor}
              </p>

              <p className="mt-1 text-[8px] text-[#8a9691]">
                {appointment.specialty}
              </p>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-[9px] font-medium">
                {appointment.time}
              </p>

              <p className="mt-1 text-[7px] text-[#8d9894]">
                {appointment.type}
              </p>
            </div>

            <ChevronRight
              size={14}
              className="text-[#aab4b0] transition group-hover:translate-x-0.5"
            />
          </div>
        ))}
      </div>
    </div>
  );
}