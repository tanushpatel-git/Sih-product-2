'use client';

import React, { useState } from 'react';
import { REGIONAL_HOSPITAL_NODES } from '../../../../lib/mockData';
import { X, Check, CheckCircle2, ShieldCheck, Send, AlertTriangle, Building2, Clock } from 'lucide-react';

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
    }, 1200);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.15] bg-[#0c0e11] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D3FD50]" />
                <span className="text-xs font-mono font-bold tracking-widest text-[#D3FD50] uppercase">
                  INTER-HOSPITAL CAPACITY COORDINATION
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white uppercase">
                COORDINATE SURGE RESPONSE
              </h2>
              <p className="text-xs font-mono text-white/50 mt-1">
                Dispatch regional patient diversion protocols before physical ICU exhaustion occurs.
              </p>
            </div>

            {/* Core Requirement Banner */}
            <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#EF4444] tracking-wider block">
                  RESOURCE REQUIRED
                </span>
                <span className="text-2xl font-black font-mono text-white tracking-tight tabular-nums">
                  {defaultShortageBeds} ICU BEDS
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-white/40 uppercase block">
                  Failure Forecast
                </span>
                <span className="text-xs font-mono font-bold text-white uppercase">
                  4 Days (Friday Surge)
                </span>
              </div>
            </div>

            {/* Recommended Hospitals List */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-mono text-white/50 uppercase mb-3">
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
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isSelected
                          ? 'bg-[#15181b] border-[#D3FD50] ring-1 ring-[#D3FD50]/30'
                          : 'bg-[#0f1114] border-white/[0.08] hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected
                              ? 'bg-[#D3FD50] border-[#D3FD50] text-[#080909]'
                              : 'bg-transparent border-white/20'
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-white uppercase">
                              {hosp.name}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.05] text-[#D3FD50] border border-white/[0.08]">
                              {hosp.badge}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-white/40 mt-0.5">
                            {hosp.distanceKm} km • ~{hosp.transitTimeMinutes} min transit
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-[#D3FD50] tabular-nums">
                          {hosp.availableIcuBeds} ICU beds available
                        </div>
                        <div className="text-[10px] font-mono text-white/40">
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
              <div className="text-xs font-mono text-white/40">
                Encrypted via MP State Health Data Mesh
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-xs font-mono text-white/60 hover:text-white transition-colors"
                >
                  CANCEL
                </button>

                <button
                  onClick={handleSendCoordination}
                  disabled={isSubmitting || selectedHospitalIds.length === 0}
                  className="px-6 py-2.5 rounded-lg bg-[#D3FD50] text-[#080909] font-mono font-bold text-xs hover:bg-[#bce433] transition-all flex items-center gap-2 shadow-lg shadow-[#D3FD50]/10 disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
            <div className="w-14 h-14 rounded-2xl bg-[#D3FD50]/15 border border-[#D3FD50]/40 text-[#D3FD50] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[11px] font-mono font-bold tracking-widest text-[#D3FD50] uppercase">
              TRANSMISSION CONFIRMED
            </span>

            <h3 className="text-2xl font-black font-mono tracking-tight text-white uppercase mt-1 mb-2">
              COORDINATION REQUEST SENT
            </h3>

            <p className="text-sm font-mono text-white/80 max-w-md mx-auto mb-6">
              <strong className="text-[#D3FD50]">{selectedHospitalIds.length} hospitals notified</strong>. Receiving facilities have placed ICU intake wings on pre-admission standby.
            </p>

            {/* Protocol Receipt Details */}
            <div className="p-4 rounded-xl bg-[#15181b] border border-white/[0.08] text-left max-w-md mx-auto space-y-2 font-mono text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-white/40">Protocol Dispatch ID:</span>
                <span className="text-white font-bold">#MP-SURGE-2026-9042</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Timestamp:</span>
                <span className="text-white">{protocolTimestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Notified Hospitals:</span>
                <span className="text-[#D3FD50] font-semibold">
                  AIIMS Bhopal, Hamidia Hospital, BMHRC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Triage Reservation:</span>
                <span className="text-white font-bold">{defaultShortageBeds} ICU Overflow Beds</span>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="px-6 py-2.5 rounded-lg bg-white/[0.1] hover:bg-white/[0.15] border border-white/[0.15] text-white font-mono text-xs font-bold transition-all"
            >
              RETURN TO COMMAND CENTER
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
