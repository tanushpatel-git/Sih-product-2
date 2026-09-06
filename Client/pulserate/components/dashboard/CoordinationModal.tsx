'use client';

import React, { useState } from 'react';
import { REGIONAL_HOSPITAL_NODES } from '@/lib/mockData';
import { X, Check, CheckCircle2 } from 'lucide-react';

interface CoordinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultShortageBeds?: number;
}

export const CoordinationModal: React.FC<CoordinationModalProps> = ({
  isOpen,
  onClose,
  defaultShortageBeds = 9,
}) => {
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([
    'hosp-a-aiims',
    'hosp-b-hamidia',
    'hosp-c-bmhrc',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [protocolTimestamp, setProtocolTimestamp] = useState<string>('');

  if (!isOpen) return null;

  const candidateHospitals = REGIONAL_HOSPITAL_NODES.filter((h) => !h.isCurrent);

  const toggleHospital = (id: string) => {
    if (selectedHospitalIds.includes(id)) {
      if (selectedHospitalIds.length > 1) {
        setSelectedHospitalIds(selectedHospitalIds.filter((item) => item !== id));
      }
    } else {
      setSelectedHospitalIds([...selectedHospitalIds, id]);
    }
  };

  const handleSendCoordination = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      const now = new Date();
      setProtocolTimestamp(now.toLocaleTimeString() + ' IST');
    }, 1000);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.14] bg-[#0D1117] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#151B23] border border-white/[0.08] text-[#A7ADB5] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
                <span className="text-xs font-mono font-bold tracking-widest text-[#A7ADB5] uppercase">
                  INTER-HOSPITAL CAPACITY COORDINATION
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase">
                COORDINATE SURGE RESPONSE
              </h2>
              <p className="text-xs font-mono text-[#A7ADB5] mt-1">
                Dispatch regional patient diversion protocols before physical ICU exhaustion occurs.
              </p>
            </div>

            {/* Core Requirement Banner */}
            <div className="p-4 rounded-xl bg-[#181112] border border-[#EF4444]/40 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#EF4444] tracking-wider block">
                  RESOURCE REQUIRED
                </span>
                <span className="text-2xl font-black font-mono text-[#F4F3EF] tracking-tight tabular-nums">
                  {defaultShortageBeds} ICU BEDS
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#66707C] uppercase block">
                  Forecast Failure Window
                </span>
                <span className="text-xs font-mono font-bold text-[#F4F3EF] uppercase">
                  4 Days (Friday Surge)
                </span>
              </div>
            </div>

            {/* Recommended Hospitals List */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-mono text-[#A7ADB5] uppercase mb-3">
                <span>RECOMMENDED HOSPITALS</span>
                <span>SELECT RECIPIENT NODES ({selectedHospitalIds.length} SELECTED)</span>
              </div>

              <div className="space-y-2.5">
                {candidateHospitals.map((hosp) => {
                  const isSelected = selectedHospitalIds.includes(hosp.id);
                  return (
                    <div
                      key={hosp.id}
                      onClick={() => toggleHospital(hosp.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#151B23] border-[#155EEF] ring-1 ring-[#155EEF]/30'
                          : 'bg-[#11161D] border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#155EEF] border-[#155EEF] text-white'
                              : 'bg-transparent border-white/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-[#F4F3EF] uppercase">
                              {hosp.name}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#11161D] text-[#60A5FA] border border-white/[0.08]">
                              {hosp.badge}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-[#66707C] mt-0.5">
                            {hosp.distanceKm} km • ~{hosp.transitTimeMinutes} min transit
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-[#60A5FA] tabular-nums">
                          {hosp.availableIcuBeds} ICU beds available
                        </div>
                        <div className="text-[10px] font-mono text-[#66707C]">
                          {hosp.compatibilityScore}% Compatibility
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Protocol Action Footer */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              <div className="text-xs font-mono text-[#66707C]">
                Encrypted via MP State Health Data Mesh
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-xs font-mono text-[#A7ADB5] hover:text-white transition-colors"
                >
                  CANCEL
                </button>

                <button
                  onClick={handleSendCoordination}
                  disabled={isSubmitting || selectedHospitalIds.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#155EEF] text-white font-mono font-bold text-xs hover:bg-[#1148b8] transition-all flex items-center gap-2 shadow-lg shadow-[#155EEF]/15 disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      DISPATCHING ALERT...
                    </>
                  ) : (
                    <>
                      SEND COORDINATION ALERT →
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Realistic Success State */
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#16434A]/50 border border-[#16434A] text-[#9DF0DA] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#9DF0DA]" />
            </div>

            <span className="text-[11px] font-mono font-bold tracking-widest text-[#60A5FA] uppercase">
              TRANSMISSION CONFIRMED
            </span>

            <h3 className="text-2xl font-black font-mono tracking-tight text-[#F4F3EF] uppercase mt-1 mb-2">
              COORDINATION REQUEST SENT
            </h3>

            <p className="text-sm font-mono text-[#A7ADB5] max-w-md mx-auto mb-6">
              <strong className="text-[#F4F3EF]">{selectedHospitalIds.length} hospitals notified</strong>. Receiving facilities have placed ICU intake wings on pre-admission standby.
            </p>

            {/* Protocol Receipt Details */}
            <div className="p-4 rounded-xl bg-[#151B23] border border-white/[0.08] text-left max-w-md mx-auto space-y-2 font-mono text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-[#66707C]">Protocol Dispatch ID:</span>
                <span className="text-[#F4F3EF] font-bold">#MP-SURGE-2026-9042</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66707C]">Timestamp:</span>
                <span className="text-[#A7ADB5]">{protocolTimestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66707C]">Notified Hospitals:</span>
                <span className="text-[#60A5FA] font-semibold">
                  AIIMS Bhopal, Hamidia Hospital, BMHRC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66707C]">Triage Reservation:</span>
                <span className="text-[#F4F3EF] font-bold">{defaultShortageBeds} ICU Overflow Beds</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-xl bg-[#151B23] hover:bg-[#11161D] border border-white/[0.14] text-[#F4F3EF] font-mono text-xs font-bold transition-all"
            >
              RETURN TO COMMAND CENTER
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
