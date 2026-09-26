export type WaterStatus = 'SAFE' | 'RE-TREAT' | 'REJECT';
export type ParameterStatus = 'SAFE' | 'WARNING' | 'UNSAFE' | 'NORMAL';
export type StageStatus = 'ACTIVE' | 'STANDBY' | 'WARNING' | 'FAULT';
export type ActuatorState = 'ON' | 'OFF' | 'OPEN' | 'CLOSED';
export type RecirculationState = 'NOT REQUIRED' | 'IN PROGRESS' | 'COMPLETED' | 'FAILED';

export interface SensorData {
  ph: number;
  tds: number; // mg/L
  turbidity: number; // NTU
  temperature: number; // °C
  flowRate: number; // L/min
  pressure?: number; // bar
}

export interface ParameterThresholds {
  ph: {
    acceptableMin: number; // 6.5
    acceptableMax: number; // 8.5
    unit: string;
  };
  tds: {
    acceptableLimit: number; // 500
    permissibleLimit: number; // 2000
    unit: string;
  };
  turbidity: {
    acceptableLimit: number; // 1.0
    permissibleLimit: number; // 5.0
    unit: string;
  };
  temperature: {
    operationalMin: number; // 15
    operationalMax: number; // 35
    unit: string;
  };
  flowRate: {
    targetMin: number; // 3.0
    targetMax: number; // 6.0
    unit: string;
  };
}

export interface PurificationStageInfo {
  id: string;
  code: string;
  name: string;
  fullName: string;
  category: 'intake' | 'pretreatment' | 'pressure' | 'membrane' | 'posttreatment' | 'disinfection' | 'storage';
  targetContaminant: string;
  status: StageStatus;
  pressureInBar: number;
  pressureOutBar: number;
  flowLpm: number;
  healthPercent: number;
  operatingHours: number;
  isFlowing: boolean;
  notes: string;
}

export interface ActuatorControl {
  id: string;
  name: string;
  type: 'pump' | 'valve' | 'uv';
  state: ActuatorState;
  isDestructive: boolean;
  powerWatts?: number;
  dutyCyclePercent?: number;
  lastToggled: string;
}

export interface IoTStatus {
  esp32: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
  wifi: 'CONNECTED' | 'DISCONNECTED';
  cloudMqtt: 'ONLINE' | 'OFFLINE';
  sensorBus: 'NORMAL' | 'ERROR';
  signalRssi: number; // e.g. -62 dBm
  lastDataPacketTime: Date;
  secondsSinceLastUpdate: number;
  firmwareVersion: string;
  ipAddress: string;
  brokerEndpoint: string;
  packetsReceived: number;
  packetLossPercent: number;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  type: 'WATER_QUALITY' | 'EQUIPMENT_TREATMENT' | 'IOT_SYSTEM';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  parameter?: string;
  currentValue?: string;
  threshold?: string;
  title: string;
  message: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  message: string;
  type: 'quality' | 'recirculation' | 'uv' | 'filter' | 'iot' | 'system';
  severity: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
}

export interface TreatmentHistoryRecord {
  id: string;
  date: string;
  time: string;
  rawWaterStatus: 'Safe' | 'Warning' | 'Unsafe';
  finalWaterStatus: 'Safe' | 'Warning' | 'Unsafe';
  treatmentDecision: 'Completed' | 'Recirculated' | 'Rejected';
  tdsReductionPercent: number;
  turbidityReductionPercent: number;
  durationMinutes: number;
  waterVolumeLitres: number;
  actionTaken: string;
  operator: string;
}

export interface DecisionResult {
  decision: WaterStatus;
  score: number; // 0-100 Water Safety Index
  statusColor: string;
  reasons: string[];
  recommendedAction: string;
  recirculateNeeded: boolean;
  isCriticalReject: boolean;
  parametersEvaluation: {
    ph: { status: ParameterStatus; message: string; safe: boolean };
    tds: { status: ParameterStatus; message: string; safe: boolean };
    turbidity: { status: ParameterStatus; message: string; safe: boolean };
    temperature: { status: ParameterStatus; message: string; safe: boolean };
    flowRate: { status: ParameterStatus; message: string; safe: boolean };
  };
}

export interface VolumeStatistics {
  currentFlowRate: number; // L/min
  totalWaterProcessed: number; // Litres
  totalCleanWaterDelivered: number; // Litres
  rejectedWater: number; // Litres
  recirculatedWater: number; // Litres
  dailyProcessingVolume: number; // Litres
}

export interface FilterHealthItem {
  id: string;
  name: string;
  fullName: string;
  type: 'PSF' | 'ACF' | 'IRF' | 'MF' | 'RO' | 'UV';
  status: 'HEALTHY' | 'MAINTENANCE SOON' | 'REPLACE';
  operatingHours: number;
  maxRecommendedHours: number;
  inletPressureBar: number;
  differentialPressureBar: number;
  replacementDate: string;
}

export interface TrendDataPoint {
  timestamp: string;
  timeLabel: string;
  rawPh: number;
  finalPh: number;
  rawTds: number;
  finalTds: number;
  rawTurbidity: number;
  finalTurbidity: number;
  rawTemperature: number;
  finalTemperature: number;
  flowRate: number;
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

export type DemoScenario =
  | 'SAFE_WATER'
  | 'RETREAT_REQUIRED'
  | 'UNSAFE_REJECT'
  | 'HIGH_TURBIDITY'
  | 'HIGH_TDS'
  | 'ABNORMAL_PH'
  | 'PUMP_FAULT'
  | 'UV_FAILURE'
  | 'IOT_DISCONNECTED'
  | 'FULL_CYCLE';

export type ActiveNavTab =
  | 'overview'
  | 'live'
  | 'quality'
  | 'purification'
  | 'decision'
  | 'alerts'
  | 'analytics'
  | 'history'
  | 'health'
  | 'settings';
