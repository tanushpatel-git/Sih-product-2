"use client";

export default function PatientFooter() {
  return (
    <footer className="flex flex-col gap-3 py-6 text-[8px] text-[#a0aaa6] md:flex-row md:items-center md:justify-between">
      <p>
        VITAWEAVE Health Intelligence · Patient workspace
      </p>

      <div className="flex gap-5">
        <button className="hover:text-[#5f7770]">
          Privacy
        </button>

        <button className="hover:text-[#5f7770]">
          Security
        </button>

        <button className="hover:text-[#5f7770]">
          Help
        </button>
      </div>
    </footer>
  );
}