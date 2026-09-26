import type {
  SensorData,
  PurificationStageInfo,
  ActuatorControl,
  ActuatorState,
  IoTStatus,
  AlertNotification,
  SystemNotification,
  TreatmentHistoryRecord,
  VolumeStatistics,
  FilterHealthItem,
  TrendDataPoint,
  DemoScenario,
  RecirculationState,
  DecisionResult
} from '../types/aquorix';
import {
  DEFAULT_THRESHOLDS,
  evaluateWaterSafety
} from './waterEngine';

type StateListener = () => void;

class IoTSimulatorService {
  private listeners: Set<StateListener> = new Set();
  private tickTimer: any = null;
  private autoCycleTimer: any = null;

  // System States
  public isDemoMode: boolean = true;
  public activeScenario: DemoScenario = 'SAFE_WATER';
  public isPurificationRunning: boolean = true;
  public recirculationStatus: RecirculationState = 'NOT REQUIRED';
  public recirculationCycle: number = 0;
  public maxRecirculationCycles: number = 3;

  // Raw & Final Sensor Telemetry
  public rawWater: SensorData = {
    ph: 5.9,
    tds: 1180,
    turbidity: 18.0,
    temperature: 29.2,
    flowRate: 4.2
  };

  public finalWater: SensorData = {
    ph: 7.2,
    tds: 286,
    turbidity: 0.6,
    temperature: 27.1,
    flowRate: 4.8
  };

  public thresholds = { ...DEFAULT_THRESHOLDS };

  // Computed Decision
  public decision: DecisionResult;

  // Actuators
  public actuators: ActuatorControl[] = [
    { id: 'pump_raw', name: 'Raw Water Intake Pump', type: 'pump', state: 'ON', isDestructive: true, powerWatts: 350, dutyCyclePercent: 85, lastToggled: '10:00 AM' },
    { id: 'pump_hp', name: 'High Pressure RO Pump', type: 'pump', state: 'ON', isDestructive: true, powerWatts: 750, dutyCyclePercent: 92, lastToggled: '10:00 AM' },
    { id: 'pump_rec', name: 'Recirculation Pump', type: 'pump', state: 'OFF', isDestructive: true, powerWatts: 250, dutyCyclePercent: 0, lastToggled: '10:00 AM' },
    { id: 'valve_inlet', name: 'Raw Water Inlet Valve (V-IN)', type: 'valve', state: 'OPEN', isDestructive: false, lastToggled: '10:00 AM' },
    { id: 'valve_ro', name: 'RO Feed Solenoid Valve (V-RO)', type: 'valve', state: 'OPEN', isDestructive: false, lastToggled: '10:00 AM' },
    { id: 'valve_reject', name: 'Concentrate / Reject Drain Valve (V-REJ)', type: 'valve', state: 'CLOSED', isDestructive: true, lastToggled: '10:00 AM' },
    { id: 'valve_storage', name: 'Purified Water Storage Valve (V-STR)', type: 'valve', state: 'OPEN', isDestructive: false, lastToggled: '10:00 AM' },
    { id: 'uv_module', name: 'Germicidal UV-C Disinfection Lamp', type: 'uv', state: 'ON', isDestructive: true, powerWatts: 45, dutyCyclePercent: 100, lastToggled: '10:00 AM' }
  ];

  // 13 Detailed Stages (Engineering Architecture)
  public stages: PurificationStageInfo[] = [
    { id: 's1', code: 'RWT', name: 'Raw Water Tank', fullName: 'Raw Water Storage & Equalization', category: 'intake', targetContaminant: 'Untreated mine/well runoff', status: 'ACTIVE', pressureInBar: 1.0, pressureOutBar: 1.0, flowLpm: 4.2, healthPercent: 98, operatingHours: 1420, isFlowing: true, notes: 'Equalization reservoir operational' },
    { id: 's2', code: 'INM', name: 'Inlet Monitoring', fullName: 'Inlet Water Quality Telemetry Node', category: 'intake', targetContaminant: 'Raw water parameter profiling', status: 'ACTIVE', pressureInBar: 1.0, pressureOutBar: 1.2, flowLpm: 4.2, healthPercent: 99, operatingHours: 1420, isFlowing: true, notes: 'pH, TDS, Turbidity optical sensors active' },
    { id: 's3', code: 'PSF', name: 'Pre-Sediment Filter', fullName: '5-Micron Polypropylene Sediment Filter', category: 'pretreatment', targetContaminant: 'Coarse sand, silt, coal dust particles', status: 'ACTIVE', pressureInBar: 1.2, pressureOutBar: 1.1, flowLpm: 4.2, healthPercent: 92, operatingHours: 320, isFlowing: true, notes: 'Differential pressure within acceptable 0.1 bar' },
    { id: 's4', code: 'ACF', name: 'Activated Carbon Filter', fullName: 'Granular Activated Carbon Filter', category: 'pretreatment', targetContaminant: 'Chlorine, volatile organics, odor, phenol', status: 'ACTIVE', pressureInBar: 1.1, pressureOutBar: 1.0, flowLpm: 4.2, healthPercent: 88, operatingHours: 480, isFlowing: true, notes: 'Adsorption kinetics optimal' },
    { id: 's5', code: 'IRF', name: 'Iron Removal Filter', fullName: 'Birm / Manganese Dioxide Media Filter', category: 'pretreatment', targetContaminant: 'Dissolved iron (Fe2+) & Manganese (Mn)', status: 'ACTIVE', pressureInBar: 1.0, pressureOutBar: 0.9, flowLpm: 4.2, healthPercent: 91, operatingHours: 410, isFlowing: true, notes: 'Catalytic oxidation active' },
    { id: 's6', code: 'MF', name: 'Micro Filter', fullName: '1-Micron Spun Yarn Micro-Guard Filter', category: 'pretreatment', targetContaminant: 'Fine suspended particulates & carbon fines', status: 'ACTIVE', pressureInBar: 0.9, pressureOutBar: 0.8, flowLpm: 4.2, healthPercent: 94, operatingHours: 290, isFlowing: true, notes: 'Final protection for high-pressure pump' },
    { id: 's7', code: 'ASD', name: 'Anti-Scalant Dosing', fullName: 'Precision Phosphonate Dosing Pump', category: 'pressure', targetContaminant: 'Silica, calcium carbonate & sulfate scaling', status: 'ACTIVE', pressureInBar: 0.8, pressureOutBar: 0.8, flowLpm: 4.2, healthPercent: 96, operatingHours: 640, isFlowing: true, notes: 'Dosing 2.5 mg/L anti-scalant continuously' },
    { id: 's8', code: 'HPP', name: 'High Pressure Pump', fullName: 'Multistage Centrifugal Booster Pump', category: 'pressure', targetContaminant: 'Osmotic pressure override generator', status: 'ACTIVE', pressureInBar: 0.8, pressureOutBar: 8.4, flowLpm: 4.5, healthPercent: 95, operatingHours: 840, isFlowing: true, notes: 'Operating at 8.4 bar discharge pressure' },
    { id: 's9', code: 'RO/NF', name: 'RO/NF Membrane', fullName: 'Thin Film Composite RO/Nanofiltration Membrane', category: 'membrane', targetContaminant: 'Heavy metals, dissolved salts, fluorides, mining ions', status: 'ACTIVE', pressureInBar: 8.4, pressureOutBar: 1.6, flowLpm: 4.8, healthPercent: 90, operatingHours: 1120, isFlowing: true, notes: 'Salt rejection rate at 94.2%' },
    { id: 's10', code: 'PMC', name: 'pH / Mineral Correction', fullName: 'Calcite & Dolomite Remineralization Bed', category: 'posttreatment', targetContaminant: 'Low pH acidic permeate & mineral deficiency', status: 'ACTIVE', pressureInBar: 1.6, pressureOutBar: 1.4, flowLpm: 4.8, healthPercent: 97, operatingHours: 520, isFlowing: true, notes: 'Restoring Ca2+, Mg2+ and buffering pH to 7.2' },
    { id: 's11', code: 'UV-C', name: 'UV-C Disinfection', fullName: '254nm Germicidal Ultraviolet Disinfection Chamber', category: 'disinfection', targetContaminant: 'Bacteria, viruses, protozoan cysts (E. coli, Giardia)', status: 'ACTIVE', pressureInBar: 1.4, pressureOutBar: 1.3, flowLpm: 4.8, healthPercent: 95, operatingHours: 842, isFlowing: true, notes: 'UV dose: 42 mJ/cm², 100% germicidal kill rate' },
    { id: 's12', code: 'FNM', name: 'Final Water Monitoring', fullName: 'Dual-Redundant Post-Purification Sensor Node', category: 'disinfection', targetContaminant: 'Verification against BIS IS-10500 standards', status: 'ACTIVE', pressureInBar: 1.3, pressureOutBar: 1.2, flowLpm: 4.8, healthPercent: 99, operatingHours: 1420, isFlowing: true, notes: 'Real-time telemetry passing to Decision Engine' },
    { id: 's13', code: 'CST', name: 'Clean Water Tank', fullName: 'Food-Grade Stainless Steel Clean Water Reservoir', category: 'storage', targetContaminant: 'Safe drinking distribution to rural community', status: 'ACTIVE', pressureInBar: 1.2, pressureOutBar: 0.2, flowLpm: 4.8, healthPercent: 99, operatingHours: 1420, isFlowing: true, notes: 'Storage level 84% (420 L / 500 L)' }
  ];

  // IoT Connectivity Status
  public iotStatus: IoTStatus = {
    esp32: 'CONNECTED',
    wifi: 'CONNECTED',
    cloudMqtt: 'ONLINE',
    sensorBus: 'NORMAL',
    signalRssi: -62,
    lastDataPacketTime: new Date(),
    secondsSinceLastUpdate: 3,
    firmwareVersion: 'v2.4.1-sih',
    ipAddress: '192.168.4.105',
    brokerEndpoint: 'mqtts://iot.aquorix.jharkhand.gov.in:8883',
    packetsReceived: 28410,
    packetLossPercent: 0.12
  };

  // Flow & Volume Stats
  public volumeStats: VolumeStatistics = {
    currentFlowRate: 4.8,
    totalWaterProcessed: 18450,
    totalCleanWaterDelivered: 15280,
    rejectedWater: 2430,
    recirculatedWater: 740,
    dailyProcessingVolume: 1840
  };

  // Filter & RO Health
  public filterHealth: FilterHealthItem[] = [
    { id: 'f_psf', name: 'PSF', fullName: 'Pre-Sediment Filter', type: 'PSF', status: 'HEALTHY', operatingHours: 320, maxRecommendedHours: 1000, inletPressureBar: 1.2, differentialPressureBar: 0.1, replacementDate: 'Nov 2026' },
    { id: 'f_acf', name: 'ACF', fullName: 'Activated Carbon Filter', type: 'ACF', status: 'MAINTENANCE SOON', operatingHours: 780, maxRecommendedHours: 900, inletPressureBar: 1.1, differentialPressureBar: 0.2, replacementDate: 'Oct 2026' },
    { id: 'f_irf', name: 'IRF', fullName: 'Iron Removal Filter', type: 'IRF', status: 'HEALTHY', operatingHours: 410, maxRecommendedHours: 1200, inletPressureBar: 1.0, differentialPressureBar: 0.1, replacementDate: 'Dec 2026' },
    { id: 'f_mf', name: 'MF', fullName: '1µm Micro Filter', type: 'MF', status: 'HEALTHY', operatingHours: 290, maxRecommendedHours: 800, inletPressureBar: 0.9, differentialPressureBar: 0.1, replacementDate: 'Jan 2027' },
    { id: 'f_ro', name: 'RO/NF', fullName: 'High-Flux RO Membrane', type: 'RO', status: 'HEALTHY', operatingHours: 1120, maxRecommendedHours: 3000, inletPressureBar: 8.4, differentialPressureBar: 0.4, replacementDate: 'May 2027' },
    { id: 'f_uv', name: 'UV-C', fullName: 'Philips 254nm Disinfection Tube', type: 'UV', status: 'HEALTHY', operatingHours: 842, maxRecommendedHours: 9000, inletPressureBar: 1.4, differentialPressureBar: 0.0, replacementDate: 'Aug 2027' }
  ];

  // Active Alerts
  public alerts: AlertNotification[] = [];

  // System Notifications
  public notifications: SystemNotification[] = [
    { id: 'n1', timestamp: 'Just now', message: 'ESP32 IoT telemetry stream synchronized over 4G LTE gateway.', type: 'iot', severity: 'success', read: false },
    { id: 'n2', timestamp: '5 min ago', message: 'Water quality returned to optimal safe range (pH 7.2, TDS 286 mg/L).', type: 'quality', severity: 'success', read: false },
    { id: 'n3', timestamp: '18 min ago', message: 'Automated recirculation cycle 1 finished successfully.', type: 'recirculation', severity: 'info', read: true },
    { id: 'n4', timestamp: '42 min ago', message: 'ACF filter operating hours reached 780 hrs (maintenance recommended soon).', type: 'filter', severity: 'warning', read: true }
  ];

  // Historical Records
  public treatmentHistory: TreatmentHistoryRecord[] = [
    { id: 'h1', date: '26 Sep 2026', time: '09:40 PM', rawWaterStatus: 'Unsafe', finalWaterStatus: 'Safe', treatmentDecision: 'Completed', tdsReductionPercent: 73.7, turbidityReductionPercent: 96.7, durationMinutes: 18, waterVolumeLitres: 42, actionTaken: 'Standard Single-Pass Purification & UV sterilization', operator: 'Auto-IoT Node #04' },
    { id: 'h2', date: '26 Sep 2026', time: '08:15 PM', rawWaterStatus: 'Unsafe', finalWaterStatus: 'Safe', treatmentDecision: 'Completed', tdsReductionPercent: 71.4, turbidityReductionPercent: 95.8, durationMinutes: 22, waterVolumeLitres: 50, actionTaken: 'Pre-filtration with Anti-scalant dosage', operator: 'Auto-IoT Node #04' },
    { id: 'h3', date: '26 Sep 2026', time: '06:50 PM', rawWaterStatus: 'Unsafe', finalWaterStatus: 'Safe', treatmentDecision: 'Recirculated', tdsReductionPercent: 76.2, turbidityReductionPercent: 97.1, durationMinutes: 34, waterVolumeLitres: 65, actionTaken: 'Dual-Pass Recirculation through RO/NF membrane', operator: 'Auto-IoT Node #04' },
    { id: 'h4', date: '26 Sep 2026', time: '04:10 PM', rawWaterStatus: 'Unsafe', finalWaterStatus: 'Safe', treatmentDecision: 'Completed', tdsReductionPercent: 74.0, turbidityReductionPercent: 96.1, durationMinutes: 19, waterVolumeLitres: 44, actionTaken: 'Routine batch purification for community tap', operator: 'Auto-IoT Node #04' },
    { id: 'h5', date: '26 Sep 2026', time: '02:30 PM', rawWaterStatus: 'Unsafe', finalWaterStatus: 'Unsafe', treatmentDecision: 'Rejected', tdsReductionPercent: 22.0, turbidityReductionPercent: 45.0, durationMinutes: 8, waterVolumeLitres: 12, actionTaken: 'High coal sludge turbidity triggered auto-purge reject drain', operator: 'Safety Interlock' }
  ];

  // Trend history cache
  public trendHistory: Record<string, TrendDataPoint[]> = {};

  constructor() {
    this.decision = evaluateWaterSafety(this.finalWater, this.thresholds);
    this.generateInitialTrendData();
    this.startSimulationTicker();
    this.initBackendStream();
  }

  // Auto-connect to live ESP32 gateway when available
  private initBackendStream() {
    if (typeof window === 'undefined' || !window.EventSource) return;
    try {
      const es = new EventSource('http://localhost:5001/api/aquorix/stream');
      es.onopen = () => {
        this.iotStatus.esp32 = 'CONNECTED';
        this.iotStatus.wifi = 'CONNECTED';
        this.iotStatus.cloudMqtt = 'ONLINE';
        this.iotStatus.brokerEndpoint = 'http://localhost:5001 (Live ESP32 Gateway)';
        this.notify();
      };
      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'TELEMETRY_UPDATE' || payload.type === 'SNAPSHOT') {
            if (payload.state?.rawWater) this.rawWater = { ...this.rawWater, ...payload.state.rawWater };
            if (payload.state?.finalWater) this.finalWater = { ...this.finalWater, ...payload.state.finalWater };
            this.iotStatus.secondsSinceLastUpdate = 0;
            this.iotStatus.lastDataPacketTime = new Date();
            this.iotStatus.packetsReceived += 1;
            this.evaluateCurrentState();
            this.notify();
          }
        } catch {
          // Ignore malformed packet
        }
      };
      es.onerror = () => {
        es.close();
        // Fall back gracefully to standalone simulation
      };
    } catch {
      // Standalone browser mode
    }
  }

  // Subscribe to changes
  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  private startSimulationTicker() {
    if (this.tickTimer) clearInterval(this.tickTimer);

    this.tickTimer = setInterval(() => {
      this.iotStatus.secondsSinceLastUpdate = (this.iotStatus.secondsSinceLastUpdate + 1) % 60;

      // Every 3 seconds in demo mode, inject realistic subtle fluctuations
      if (this.isDemoMode && this.iotStatus.secondsSinceLastUpdate % 3 === 0) {
        this.applyGentleFluctuation();
      }

      this.notify();
    }, 1000);
  }

  private applyGentleFluctuation() {
    if (this.iotStatus.esp32 === 'DISCONNECTED') return;

    // Small microscopic noise around current steady state
    const noise = (Math.random() - 0.5) * 0.04;
    this.finalWater.ph = Math.max(4.0, Math.min(10.0, parseFloat((this.finalWater.ph + noise).toFixed(2))));
    
    const tdsNoise = Math.round((Math.random() - 0.5) * 6);
    this.finalWater.tds = Math.max(50, this.finalWater.tds + tdsNoise);

    const turbNoise = (Math.random() - 0.5) * 0.02;
    this.finalWater.turbidity = Math.max(0.1, parseFloat((this.finalWater.turbidity + turbNoise).toFixed(2)));

    const tempNoise = (Math.random() - 0.5) * 0.1;
    this.finalWater.temperature = parseFloat((this.finalWater.temperature + tempNoise).toFixed(1));

    if (this.isPurificationRunning) {
      this.volumeStats.currentFlowRate = parseFloat((4.8 + (Math.random() - 0.5) * 0.2).toFixed(2));
      this.volumeStats.totalWaterProcessed += 0.08;
      this.volumeStats.totalCleanWaterDelivered += 0.07;
      this.volumeStats.dailyProcessingVolume += 0.08;
    }

    this.iotStatus.lastDataPacketTime = new Date();
    this.iotStatus.packetsReceived += 1;
    this.iotStatus.secondsSinceLastUpdate = 0;

    // Re-evaluate water safety dynamically
    this.evaluateCurrentState();
  }

  public evaluateCurrentState(systemFaultOverride?: string) {
    this.decision = evaluateWaterSafety(this.finalWater, this.thresholds, systemFaultOverride);
    this.syncAlertsFromEvaluation();
  }

  private syncAlertsFromEvaluation() {
    const newAlerts: AlertNotification[] = [];
    const now = new Date().toLocaleTimeString();

    // TDS alert
    if (this.finalWater.tds > this.thresholds.tds.permissibleLimit) {
      newAlerts.push({
        id: 'alt_tds_crit',
        timestamp: now,
        type: 'WATER_QUALITY',
        severity: 'CRITICAL',
        parameter: 'Final TDS',
        currentValue: `${this.finalWater.tds} mg/L`,
        threshold: `Permissible: ≤${this.thresholds.tds.permissibleLimit} mg/L`,
        title: 'CRITICAL HIGH TDS DETECTED',
        message: `Final water TDS (${this.finalWater.tds} mg/L) exceeds safe permissible limits. Heavy mineral salinity.`,
        recommendedAction: 'Immediate diversion to Reject Drain (V-REJ Open). Inspect RO membrane.',
        acknowledged: false
      });
    } else if (this.finalWater.tds > this.thresholds.tds.acceptableLimit) {
      newAlerts.push({
        id: 'alt_tds_warn',
        timestamp: now,
        type: 'WATER_QUALITY',
        severity: 'WARNING',
        parameter: 'Final TDS',
        currentValue: `${this.finalWater.tds} mg/L`,
        threshold: `Acceptable: ≤${this.thresholds.tds.acceptableLimit} mg/L`,
        title: 'ELEVATED TDS (RE-TREAT REQUIRED)',
        message: `TDS (${this.finalWater.tds} mg/L) is above acceptable standard of 500 mg/L. Recirculation needed.`,
        recommendedAction: 'Engage Recirculation Pump and divert stream for second pass.',
        acknowledged: false
      });
    }

    // Turbidity alert
    if (this.finalWater.turbidity > this.thresholds.turbidity.permissibleLimit) {
      newAlerts.push({
        id: 'alt_turb_crit',
        timestamp: now,
        type: 'WATER_QUALITY',
        severity: 'CRITICAL',
        parameter: 'Final Turbidity',
        currentValue: `${this.finalWater.turbidity.toFixed(1)} NTU`,
        threshold: `Permissible: ≤${this.thresholds.turbidity.permissibleLimit} NTU`,
        title: 'CRITICAL TURBIDITY EXCEEDED',
        message: `Final Turbidity (${this.finalWater.turbidity.toFixed(1)} NTU) violates drinking standard. Particulate breakthrough.`,
        recommendedAction: 'Halt clean delivery. Check Micro-Filter (MF) and Pre-Sediment (PSF) integrity.',
        acknowledged: false
      });
    } else if (this.finalWater.turbidity > this.thresholds.turbidity.acceptableLimit) {
      newAlerts.push({
        id: 'alt_turb_warn',
        timestamp: now,
        type: 'WATER_QUALITY',
        severity: 'WARNING',
        parameter: 'Final Turbidity',
        currentValue: `${this.finalWater.turbidity.toFixed(1)} NTU`,
        threshold: `Acceptable: ≤${this.thresholds.turbidity.acceptableLimit} NTU`,
        title: 'TURBIDITY ABOVE ACCEPTABLE LIMIT',
        message: `Turbidity is ${this.finalWater.turbidity.toFixed(1)} NTU. Above 1.0 NTU threshold.`,
        recommendedAction: 'Trigger automated backwash cycle or re-filter.',
        acknowledged: false
      });
    }

    // pH alert
    if (this.finalWater.ph < 6.5 || this.finalWater.ph > 8.5) {
      const isExtreme = this.finalWater.ph < 5.8 || this.finalWater.ph > 9.2;
      newAlerts.push({
        id: 'alt_ph',
        timestamp: now,
        type: 'WATER_QUALITY',
        severity: isExtreme ? 'CRITICAL' : 'WARNING',
        parameter: 'Final pH',
        currentValue: `${this.finalWater.ph.toFixed(1)}`,
        threshold: `Range: ${this.thresholds.ph.acceptableMin} – ${this.thresholds.ph.acceptableMax}`,
        title: isExtreme ? 'CRITICAL pH ANOMALY' : 'pH IMBALANCE',
        message: `pH reading of ${this.finalWater.ph.toFixed(1)} is outside standard drinking parameters.`,
        recommendedAction: 'Calibrate pH / Mineral Correction bed (Calcite/Dolomite dosing).',
        acknowledged: false
      });
    }

    // Hardware checks
    const uvActuator = this.actuators.find(a => a.id === 'uv_module');
    if (uvActuator && uvActuator.state === 'OFF') {
      newAlerts.push({
        id: 'alt_uv_off',
        timestamp: now,
        type: 'EQUIPMENT_TREATMENT',
        severity: 'CRITICAL',
        parameter: 'UV-C Lamp',
        currentValue: 'OFF',
        threshold: 'Must be ON',
        title: 'UV-C DISINFECTION INACTIVE',
        message: 'Germicidal UV-C reactor is unpowered. Microorganism destruction suspended.',
        recommendedAction: 'Turn ON UV-C ballast immediately or isolate clean delivery valve.',
        acknowledged: false
      });
    }

    const hpPump = this.actuators.find(a => a.id === 'pump_hp');
    if (hpPump && hpPump.state === 'OFF' && this.isPurificationRunning) {
      newAlerts.push({
        id: 'alt_hp_pump',
        timestamp: now,
        type: 'EQUIPMENT_TREATMENT',
        severity: 'CRITICAL',
        parameter: 'High Pressure Pump',
        currentValue: 'OFF',
        threshold: 'Operating >7 bar',
        title: 'RO BOOSTER PUMP TRIP',
        message: 'High pressure pump is OFF. Membrane differential pressure insufficient.',
        recommendedAction: 'Inspect thermal overload switch and restart pump booster.',
        acknowledged: false
      });
    }

    if (this.iotStatus.esp32 === 'DISCONNECTED') {
      newAlerts.push({
        id: 'alt_iot_disc',
        timestamp: now,
        type: 'IOT_SYSTEM',
        severity: 'CRITICAL',
        parameter: 'ESP32 Gateway',
        currentValue: 'OFFLINE',
        threshold: 'Telemetry Alive',
        title: 'IoT TELEMETRY LINK LOST',
        message: 'No packet heartbeat received from rural field node. Operating on local fail-safe.',
        recommendedAction: 'Verify 4G SIM / LoRa base station power and antenna alignment.',
        acknowledged: false
      });
    }

    this.alerts = newAlerts;
  }

  /**
   * Quick SIH Demo Scenarios
   */
  public triggerScenario(scenario: DemoScenario) {
    if (this.autoCycleTimer) {
      clearInterval(this.autoCycleTimer);
      this.autoCycleTimer = null;
    }

    this.activeScenario = scenario;
    const nowStr = new Date().toLocaleTimeString();

    switch (scenario) {
      case 'SAFE_WATER': {
        this.rawWater = { ph: 5.9, tds: 1180, turbidity: 18.0, temperature: 29.2, flowRate: 4.2 };
        this.finalWater = { ph: 7.2, tds: 286, turbidity: 0.6, temperature: 27.1, flowRate: 4.8 };
        this.isPurificationRunning = true;
        this.recirculationStatus = 'NOT REQUIRED';
        this.recirculationCycle = 0;
        this.iotStatus.esp32 = 'CONNECTED';
        this.iotStatus.wifi = 'CONNECTED';
        this.iotStatus.cloudMqtt = 'ONLINE';
        this.iotStatus.sensorBus = 'NORMAL';

        this.setAllActuatorsNominal();
        this.setAllStagesNominal();
        this.evaluateCurrentState();

        this.addNotification({
          id: 'n_safe_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: Nominal Safe Water operational. All parameters within BIS standards.',
          type: 'quality',
          severity: 'success',
          read: false
        });
        break;
      }

      case 'RETREAT_REQUIRED': {
        // Final TDS is 720 mg/L (Above 500, but within permissible 2000)
        this.rawWater = { ph: 5.8, tds: 1350, turbidity: 22.0, temperature: 29.8, flowRate: 4.0 };
        this.finalWater = { ph: 6.8, tds: 720, turbidity: 0.9, temperature: 27.5, flowRate: 4.6 };
        this.isPurificationRunning = true;
        this.recirculationStatus = 'IN PROGRESS';
        this.recirculationCycle = 1;

        this.setAllActuatorsNominal();
        const recPump = this.actuators.find(a => a.id === 'pump_rec');
        if (recPump) recPump.state = 'ON';

        // Stage RO/NF shows warning
        const roStage = this.stages.find(s => s.code === 'RO/NF');
        if (roStage) {
          roStage.status = 'WARNING';
          roStage.notes = 'Partial mineral breakthrough. Recirculating permeate.';
        }

        this.evaluateCurrentState();

        this.addNotification({
          id: 'n_ret_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: TDS at 720 mg/L. Decision Engine triggered automated recirculation pass.',
          type: 'recirculation',
          severity: 'warning',
          read: false
        });
        break;
      }

      case 'UNSAFE_REJECT': {
        // High TDS (>2000) and High Turbidity (>5)
        this.rawWater = { ph: 4.6, tds: 2600, turbidity: 34.0, temperature: 30.5, flowRate: 3.4 };
        this.finalWater = { ph: 5.2, tds: 2240, turbidity: 6.8, temperature: 28.2, flowRate: 4.2 };
        this.isPurificationRunning = true;
        this.recirculationStatus = 'FAILED';

        // Reject valve opens, storage valve closes
        const rejValve = this.actuators.find(a => a.id === 'valve_reject');
        if (rejValve) rejValve.state = 'OPEN';
        const strValve = this.actuators.find(a => a.id === 'valve_storage');
        if (strValve) strValve.state = 'CLOSED';

        const roStage = this.stages.find(s => s.code === 'RO/NF');
        if (roStage) {
          roStage.status = 'FAULT';
          roStage.notes = 'Membrane breach detected. Water rejected to drain.';
        }

        this.evaluateCurrentState();

        this.addNotification({
          id: 'n_rej_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: Critical water contamination! Permissible limits exceeded. Auto-Reject activated.',
          type: 'quality',
          severity: 'danger',
          read: false
        });
        break;
      }

      case 'HIGH_TURBIDITY': {
        // Coal dust slurry runoff spike
        this.rawWater = { ph: 6.2, tds: 1200, turbidity: 45.0, temperature: 28.8, flowRate: 3.8 };
        this.finalWater = { ph: 7.1, tds: 310, turbidity: 7.4, temperature: 27.0, flowRate: 4.5 };
        this.recirculationStatus = 'IN PROGRESS';

        const psfStage = this.stages.find(s => s.code === 'PSF');
        if (psfStage) {
          psfStage.status = 'WARNING';
          psfStage.notes = 'High particulate loading. Differential pressure high.';
        }

        this.evaluateCurrentState();

        this.addNotification({
          id: 'n_turb_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: Mining coal slurry event. Turbidity spiked to 7.4 NTU at outlet.',
          type: 'quality',
          severity: 'warning',
          read: false
        });
        break;
      }

      case 'HIGH_TDS': {
        // Acid mine drainage high mineral salt
        this.rawWater = { ph: 5.4, tds: 1850, turbidity: 14.0, temperature: 29.5, flowRate: 4.1 };
        this.finalWater = { ph: 6.9, tds: 860, turbidity: 0.7, temperature: 27.4, flowRate: 4.7 };
        this.recirculationStatus = 'IN PROGRESS';
        this.recirculationCycle = 2;

        this.evaluateCurrentState();

        this.addNotification({
          id: 'n_tds_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: Deep mine water high TDS (860 mg/L). Re-treatment loop initiated.',
          type: 'recirculation',
          severity: 'warning',
          read: false
        });
        break;
      }

      case 'ABNORMAL_PH': {
        // Acid mine runoff pH 4.2
        this.rawWater = { ph: 4.2, tds: 1400, turbidity: 16.0, temperature: 28.9, flowRate: 4.0 };
        this.finalWater = { ph: 5.6, tds: 340, turbidity: 0.8, temperature: 27.2, flowRate: 4.6 };
        this.recirculationStatus = 'IN PROGRESS';

        const pmcStage = this.stages.find(s => s.code === 'PMC');
        if (pmcStage) {
          pmcStage.status = 'WARNING';
          pmcStage.notes = 'Calcite buffer depleted. Buffering pH from 4.2.';
        }

        this.evaluateCurrentState();

        this.addNotification({
          id: 'n_ph_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: Acid Mine Drainage detected (pH 4.2 raw). Remineralization buffer active.',
          type: 'quality',
          severity: 'warning',
          read: false
        });
        break;
      }

      case 'PUMP_FAULT': {
        this.setAllActuatorsNominal();
        const hpPump = this.actuators.find(a => a.id === 'pump_hp');
        if (hpPump) hpPump.state = 'OFF';

        const hpStage = this.stages.find(s => s.code === 'HPP');
        if (hpStage) {
          hpStage.status = 'FAULT';
          hpStage.pressureOutBar = 1.0;
          hpStage.notes = 'Thermal trip switch open. Overcurrent fault.';
        }

        const roStage = this.stages.find(s => s.code === 'RO/NF');
        if (roStage) {
          roStage.isFlowing = false;
          roStage.status = 'STANDBY';
        }

        this.finalWater.flowRate = 0.4;
        this.evaluateCurrentState('High Pressure RO Pump Failure');

        this.addNotification({
          id: 'n_pump_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: High Pressure Booster Pump Trip. RO membrane depressurized.',
          type: 'system',
          severity: 'danger',
          read: false
        });
        break;
      }

      case 'UV_FAILURE': {
        this.setAllActuatorsNominal();
        const uvActuator = this.actuators.find(a => a.id === 'uv_module');
        if (uvActuator) uvActuator.state = 'OFF';

        const uvStage = this.stages.find(s => s.code === 'UV-C');
        if (uvStage) {
          uvStage.status = 'FAULT';
          uvStage.notes = 'Ballast circuit open. UV-C intensity 0 mW/cm².';
        }

        this.evaluateCurrentState('UV-C Disinfection Lamp Fault');

        this.addNotification({
          id: 'n_uv_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: UV-C Germicidal Disinfection Lamp Failure. Pathogen safety compromised.',
          type: 'uv',
          severity: 'danger',
          read: false
        });
        break;
      }

      case 'IOT_DISCONNECTED': {
        this.iotStatus.esp32 = 'DISCONNECTED';
        this.iotStatus.wifi = 'DISCONNECTED';
        this.iotStatus.cloudMqtt = 'OFFLINE';
        this.iotStatus.sensorBus = 'ERROR';
        this.iotStatus.secondsSinceLastUpdate = 48;

        this.evaluateCurrentState('IoT Telemetry Offline');

        this.addNotification({
          id: 'n_iot_' + Date.now(),
          timestamp: nowStr,
          message: 'Scenario: Remote ESP32 hardware node lost cellular connectivity.',
          type: 'iot',
          severity: 'danger',
          read: false
        });
        break;
      }

      case 'FULL_CYCLE': {
        this.startAutomatedPurificationCycle();
        break;
      }
    }

    this.notify();
  }

  /**
   * Automated end-to-end purification simulation
   * Simulates contaminated raw water intake -> stages filtering -> safe output
   */
  public startAutomatedPurificationCycle() {
    this.activeScenario = 'FULL_CYCLE';
    let step = 0;

    // Reset to heavy raw contamination
    this.rawWater = { ph: 5.6, tds: 1420, turbidity: 24.0, temperature: 29.5, flowRate: 4.0 };
    this.finalWater = { ph: 5.8, tds: 980, turbidity: 4.8, temperature: 28.5, flowRate: 3.5 };
    this.recirculationStatus = 'IN PROGRESS';
    this.recirculationCycle = 1;
    this.setAllActuatorsNominal();
    this.evaluateCurrentState();

    this.addNotification({
      id: 'n_cyc_start_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message: 'Purification Cycle Started: Ingesting contaminated raw water (TDS: 1420, Turbidity: 24 NTU).',
      type: 'quality',
      severity: 'info',
      read: false
    });

    if (this.autoCycleTimer) clearInterval(this.autoCycleTimer);

    this.autoCycleTimer = setInterval(() => {
      step++;

      if (step === 1) {
        // Pre-treatment active: Turbidity dropping
        this.finalWater.turbidity = 2.2;
        this.stages[2].status = 'ACTIVE';
        this.stages[3].status = 'ACTIVE';
        this.stages[4].status = 'ACTIVE';
        this.stages[5].status = 'ACTIVE';
        this.evaluateCurrentState();
        this.notify();
      } else if (step === 2) {
        // High pressure pump active, RO membrane cutting TDS
        this.finalWater.tds = 560;
        this.finalWater.turbidity = 0.9;
        this.stages[7].status = 'ACTIVE';
        this.stages[8].status = 'ACTIVE';
        this.evaluateCurrentState();
        this.notify();
      } else if (step === 3) {
        // Recirculation triggered because TDS was 560 (>500)
        this.recirculationCycle = 2;
        const recPump = this.actuators.find(a => a.id === 'pump_rec');
        if (recPump) recPump.state = 'ON';
        this.evaluateCurrentState();
        this.notify();
      } else if (step === 4) {
        // Polishing pass + pH buffer + UV-C
        this.finalWater.ph = 7.2;
        this.finalWater.tds = 280;
        this.finalWater.turbidity = 0.5;
        this.finalWater.flowRate = 4.8;
        this.stages[9].status = 'ACTIVE';
        this.stages[10].status = 'ACTIVE';
        this.stages[11].status = 'ACTIVE';
        this.stages[12].status = 'ACTIVE';

        const recPump = this.actuators.find(a => a.id === 'pump_rec');
        if (recPump) recPump.state = 'OFF';
        this.recirculationStatus = 'COMPLETED';

        this.evaluateCurrentState();

        // Add to history
        this.treatmentHistory.unshift({
          id: 'h_' + Date.now(),
          date: '26 Sep 2026',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rawWaterStatus: 'Unsafe',
          finalWaterStatus: 'Safe',
          treatmentDecision: 'Completed',
          tdsReductionPercent: 80.3,
          turbidityReductionPercent: 97.9,
          durationMinutes: 16,
          waterVolumeLitres: 48,
          actionTaken: 'Automated 2-Pass RO/NF + UV-C Disinfection Cycle Complete',
          operator: 'Demo Simulator'
        });

        this.addNotification({
          id: 'n_cyc_end_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          message: 'Purification Cycle Completed! Water is SAFE (pH: 7.2, TDS: 280, Turbidity: 0.5 NTU).',
          type: 'quality',
          severity: 'success',
          read: false
        });

        clearInterval(this.autoCycleTimer);
        this.autoCycleTimer = null;
        this.notify();
      }
    }, 3000);
  }

  // Actuator controls
  public toggleActuator(id: string, newState?: ActuatorState): boolean {
    const act = this.actuators.find(a => a.id === id);
    if (!act) return false;

    if (newState) {
      act.state = newState;
    } else {
      if (act.type === 'pump' || act.type === 'uv') {
        act.state = act.state === 'ON' ? 'OFF' : 'ON';
      } else {
        act.state = act.state === 'OPEN' ? 'CLOSED' : 'OPEN';
      }
    }

    act.lastToggled = new Date().toLocaleTimeString();

    // Side effects on stages
    if (id === 'pump_hp') {
      const roStage = this.stages.find(s => s.code === 'RO/NF');
      if (roStage) {
        roStage.isFlowing = act.state === 'ON';
        roStage.status = act.state === 'ON' ? 'ACTIVE' : 'STANDBY';
      }
    } else if (id === 'uv_module') {
      const uvStage = this.stages.find(s => s.code === 'UV-C');
      if (uvStage) {
        uvStage.status = act.state === 'ON' ? 'ACTIVE' : 'FAULT';
      }
    }

    this.evaluateCurrentState();
    this.notify();
    return true;
  }

  public setAllActuatorsNominal() {
    this.actuators.forEach(act => {
      if (act.id === 'pump_raw' || act.id === 'pump_hp' || act.id === 'uv_module') {
        act.state = 'ON';
      } else if (act.id === 'pump_rec' || act.id === 'valve_reject') {
        act.state = act.type === 'pump' ? 'OFF' : 'CLOSED';
      } else {
        act.state = 'OPEN';
      }
    });
  }

  public setAllStagesNominal() {
    this.stages.forEach(st => {
      st.status = 'ACTIVE';
      st.isFlowing = true;
    });
  }

  public acknowledgeAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      this.notify();
    }
  }

  public clearAllAlerts() {
    this.alerts = [];
    this.notify();
  }

  public addNotification(item: SystemNotification) {
    this.notifications.unshift(item);
    if (this.notifications.length > 25) this.notifications.pop();
    this.notify();
  }

  public markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify();
    }
  }

  public markAllNotificationsRead() {
    this.notifications.forEach(n => (n.read = true));
    this.notify();
  }

  // Generate realistic historical analytics points
  private generateInitialTrendData() {
    const ranges = ['1h', '6h', '24h', '7d', '30d'];
    const now = Date.now();

    ranges.forEach(range => {
      const points: TrendDataPoint[] = [];
      const count = range === '1h' ? 20 : range === '6h' ? 24 : range === '24h' ? 24 : 30;
      const stepMs =
        range === '1h'
          ? (60 * 60 * 1000) / count
          : range === '6h'
          ? (6 * 3600 * 1000) / count
          : range === '24h'
          ? (24 * 3600 * 1000) / count
          : range === '7d'
          ? (7 * 86400 * 1000) / count
          : (30 * 86400 * 1000) / count;

      for (let i = count; i >= 0; i--) {
        const time = new Date(now - i * stepMs);
        const timeLabel =
          range === '1h' || range === '6h'
            ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : range === '24h'
            ? `${time.getHours()}:00`
            : `${time.getDate()} ${time.toLocaleString('default', { month: 'short' })}`;

        // Slight trend with mining variance
        const rawPh = parseFloat((5.8 + Math.sin(i * 0.4) * 0.4 + (Math.random() - 0.5) * 0.2).toFixed(2));
        const finalPh = parseFloat((7.2 + (Math.random() - 0.5) * 0.2).toFixed(2));

        const rawTds = Math.round(1180 + Math.sin(i * 0.3) * 180 + (Math.random() - 0.5) * 60);
        const finalTds = Math.round(290 + (Math.random() - 0.5) * 35);

        const rawTurb = parseFloat((18.0 + Math.cos(i * 0.5) * 4.0 + (Math.random() - 0.5) * 2.0).toFixed(1));
        const finalTurb = parseFloat((0.6 + (Math.random() - 0.5) * 0.25).toFixed(2));

        const rawTemp = parseFloat((29.0 + Math.sin(i * 0.2) * 1.5).toFixed(1));
        const finalTemp = parseFloat((27.1 + Math.sin(i * 0.2) * 0.8).toFixed(1));

        const flow = parseFloat((4.8 + (Math.random() - 0.5) * 0.4).toFixed(2));

        points.push({
          timestamp: time.toISOString(),
          timeLabel,
          rawPh,
          finalPh,
          rawTds,
          finalTds,
          rawTurbidity: Math.max(0.1, rawTurb),
          finalTurbidity: Math.max(0.2, finalTurb),
          rawTemperature: rawTemp,
          finalTemperature: finalTemp,
          flowRate: flow
        });
      }

      this.trendHistory[range] = points;
    });
  }
}

export const iotSimulator = new IoTSimulatorService();
