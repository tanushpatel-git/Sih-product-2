'use client';

import React, { useState } from 'react';
import { REGIONAL_HOSPITAL_NODES } from '@/lib/mockData';
import { X, Check, CheckCircle2, Shield, Building2, ArrowRight } from 'lucide-react';

interface CoordinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultShortageBeds?: number;
}

export const CoordinationModal: React.FC<CoordinationModalProps> = ({
  isOpen,
  onClose,
  defaultShortageBeds = 13,
}) => {
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([
    'hosp-a-aiims',
    'hosp-b-hamidia',
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
    }, 900);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#1D4ED8] mb-2">
                <Shield className="w-3.5 h-3.5" />
                <span>REGIONAL CAPACITY LOAD-SHEDDING</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-sans text-[#0F172A] tracking-tight">
                Coordinate Patient Transfers
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                Projected Day 4 ICU deficit:{' '}
                <strong className="text-[#EF4444] font-bold">+{defaultShortageBeds} beds required</strong>.
                Select partner facilities to initiate real-time EHR transfer protocol.
              </p>
            </div>

            {/* Candidate Facilities Grid */}
            <div className="space-y-2.5 mb-6">
              {candidateHospitals.map((hosp) => {
                const isSelected = selectedHospitalIds.includes(hosp.id);
                const isAiims = hosp.id === 'hosp-a-aiims';

                return (
                  <div
                    key={hosp.id}
                    onClick={() => toggleHospital(hosp.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EFF6FF] border-[#3B82F6] shadow-xs'
                        : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#2563EB] border-[#2563EB] text-white'
                            : 'border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0F172A]">
                            {hosp.name}
                          </span>
                          {isAiims && (
                            <span className="text-[10px] font-bold bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded-full">
                              PRIMARY TARGET
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#64748B] mt-0.5">
                          {hosp.distanceKm} km • {hosp.transitTimeMinutes} min ambulance transit
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-[#2563EB] tabular-nums">
                        {hosp.availableIcuBeds} ICU Free
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {hosp.availableGeneralBeds} Ward Beds
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <div className="text-xs text-[#64748B]">
                Selected target buffer:{' '}
                <strong className="text-[#0F172A] font-bold">
                  {selectedHospitalIds.length === 2 ? '42 ICU Beds Available' : '24 ICU Beds Available'}
                </strong>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSendCoordination}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>DISPATCHING PROTOCOL...</span>
                  ) : (
                    <>
                      <span>CONFIRM & DISPATCH TRANSFER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-[#0F172A]">
                Regional Transfer Protocol Dispatched
              </h4>
              <p className="text-xs text-[#64748B] mt-1.5 max-w-md mx-auto leading-relaxed">
                Automated patient surge notice transmitted to AIIMS Bhopal (24 ICU Beds Reserved) & Civil Hospital Bhopal. Protocol active at {protocolTimestamp}.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
