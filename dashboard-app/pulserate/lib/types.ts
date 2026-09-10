export type RiskLevel = 'STABLE' | 'WATCH' | 'HIGH' | 'CRITICAL';

export type TimelineDayId = 'NOW' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface DayForecastPoint {
  dayId: TimelineDayId;
  label: string;
  dayOffset: number; // 0 for NOW, 1 for MON ... 7 for SUN
  dateString: string;
  isBreach: boolean;
  totalOccupancyPercent: number;
  totalAdmittedPatients: number;
  capacityThreshold: number; // e.g. 500 total hospital beds
  confidenceInterval: {
    lowerBound: number;
    upperBound: number;
  };
  resources: {
    icu: {
      currentCapacity: number;
      totalCapacity: number;
      projectedDemand: number;
      shortageDelta: number;
      risk: RiskLevel;
    };
    generalBeds: {
      currentCapacity: number;
      totalCapacity: number;
      projectedDemand: number;
      shortageDelta: number;
      risk: RiskLevel;
    };
    ventilators: {
      currentCapacity: number;
      totalCapacity: number;
      projectedDemand: number;
      shortageDelta: number;
      risk: RiskLevel;
    };
    oxygen: {
      currentPercentage: number;
      projectedPercentage: number;
      daysRemaining: number;
      burnRateLitersPerMin: number;
      risk: RiskLevel;
    };
  };
  hospitalState: {
    emergencyTriagePressure: number; // %
    staffOnDutyRatio: string; // e.g. "1:4"
    activeIsolationPatients: number;
  };
}

export interface HistoricalDataPoint {
  date: string;
  admissions: number;
  occupancyPercent: number;
}

export interface HospitalNode {
  id: string;
  name: string;
  code: string;
  facilityType: string;
  distanceKm: number;
  transitTimeMinutes: number;
  availableIcuBeds: number;
  totalIcuBeds: number;
  availableGeneralBeds: number;
  availableVentilators: number;
  compatibilityScore: number; // 0 - 100
  badge: 'Best Proximity' | 'High Compatibility' | 'Specialized Pulmonary' | 'Regional Reserve' | 'Origin Facility';
  isCurrent: boolean;
  status: 'OPTIMAL' | 'ACCEPTING' | 'CONSTRAINED' | 'CRITICAL_SOURCE';
  coordinates: {
    x: number; // relative SVG percentage (0-100)
    y: number; // relative SVG percentage (0-100)
  };
}

export interface DigitalTwinZoneData {
  id: string;
  name: string;
  floor: string;
  currentOccupancy: number;
  maxCapacity: number;
  utilizationRate: number; // %
  risk: RiskLevel;
  metricLabel: string;
  metricValue: string;
  telemetry: {
    temperature: string;
    staffRatio: string;
    flowState: string;
  };
}

export interface DiseaseModelConfig {
  id: string;
  name: string;
  strain: string;
  status: 'Active' | 'Calibrating' | 'Monitoring';
  rt: number; // effective reproduction number
  caseTrend7dPercent: number;
  transmissionTrend: 'Increasing' | 'Plateau' | 'Decreasing';
  hospitalAdmissionRate: number; // %
  icuAdmissionRate: number; // %
  forecastHorizonDays: number;
  description: string;
}

export interface CoordinationTransferRequest {
  targetHospitalId: string;
  icuBedsRequested: number;
  generalBedsRequested: number;
  transferUrgency: 'IMMEDIATE' | 'SCHEDULED_48H' | 'CONTINGENCY';
  notes: string;
}
