import React, { useState } from 'react';
import type {
  SensorData,
  DecisionResult,
  PurificationStageInfo,
  ActuatorControl,
  IoTStatus,
  AlertNotification,
  TreatmentHistoryRecord,
  VolumeStatistics,
  ParameterThresholds
} from '../types/aquorix';
import { calculateReduction } from '../services/waterEngine';
import { PurificationPipelineWidget } from '../components/PurificationPipelineWidget';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  ShieldCheck,
  RotateCcw,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Power,
  Wifi,
  History,
  ChevronRight
} from 'lucide-react';

interface OverviewViewProps {
  rawWater: SensorData;
  finalWater: SensorData;
  decision: DecisionResult;
  stages: PurificationStageInfo[];
  actuators: ActuatorControl[];
  iotStatus: IoTStatus;
  alerts: AlertNotification[];
  history: TreatmentHistoryRecord[];
  volumeStats: VolumeStatistics;
  thresholds: ParameterThresholds;
  isRunning: boolean;
  onToggleActuator: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  rawWater,
  finalWater,
  decision,
  stages,
  actuators,
  iotStatus,
  alerts,
  history,
  volumeStats: _volumeStats,
  thresholds: _thresholds,
  isRunning,
  onToggleActuator,
  onNavigateTab
}) => {
  // Confirmation modal state for destructive actuator toggling
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    actuatorId: string;
    title: string;
    message: string;
    consequences: string[];
  }>({
    isOpen: false,
    actuatorId: '',
    title: '',
    message: '',
    consequences: []
  });

  const handleActuatorClick = (act: ActuatorControl) => {
    if (act.isDestructive) {
      const willTurnOff = act.state === 'ON' || act.state === 'OPEN';
      setConfirmModal({
        isOpen: true,
        actuatorId: act.id,
        title: `${willTurnOff ? 'Disable' : 'Engage'} ${act.name}`,
        message: `You are about to manually ${willTurnOff ? 'de-energize / close' : 'activate'} ${act.name}.`,
        consequences: willTurnOff
          ? [
              'Purification fluid dynamics will immediately be altered.',
              'May trigger automated safety interlock or system bypass.',
              'Requires operator validation before restart.'
            ]
          : [
              'High pressure or valve diversion will commence immediately.',
              'Monitor pressure gauges and flow sensors closely.'
            ]
      });
    } else {
      onToggleActuator(act.id);
    }
  };

  const handleConfirmAction = () => {
    if (confirmModal.actuatorId) {
      onToggleActuator(confirmModal.actuatorId);
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const tdsReduction = calculateReduction(rawWater.tds, finalWater.tds);
  const turbReduction = calculateReduction(rawWater.turbidity, finalWater.turbidity);

  // Status UI helpers
  const getDecisionBanner = () => {
    switch (decision.decision) {
      case 'SAFE':
        return {
          title: 'SAFE DRINKING WATER',
          subtitle: 'All monitored parameters are strictly within BIS IS-10500 acceptable limits.',
          color: '#059669',
          bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '#6EE7B7',
          icon: <ShieldCheck size={42} color="#059669" />,
          action: 'Water routed to rural community storage reservoir.'
        };
      case 'RE-TREAT':
        return {
          title: 'RE-TREATMENT REQUIRED',
          subtitle: 'Parameters above acceptable limit but within permissible range. Recirculation active.',
          color: '#D97706',
          bg: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '#FCD34D',
          icon: <RotateCcw size={42} color="#D97706" />,
          action: 'Recirculating water through RO/NF membrane for secondary polishing.'
        };
      case 'REJECT':
      default:
        return {
          title: 'REJECT / UNSAFE WATER',
          subtitle: 'Critical permissible threshold violated or hardware interlock tripped.',
          color: '#DC2626',
          bg: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
          border: '#FCA5A5',
          icon: <AlertOctagon size={42} color="#DC2626" />,
          action: 'Automatic valve diversion to reject drain. Clean delivery isolated.'
        };
    }
  };

  const banner = getDecisionBanner();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* =========================================================================
          SECTION 1: LARGE WATER SAFETY STATUS PANEL (Master Visual Anchor)
         ========================================================================= */}
      <div
        style={{
          background: banner.bg,
          border: `2px solid ${banner.border}`,
          borderRadius: '20px',
          padding: '24px 28px',
          boxShadow: '0 10px 30px rgba(10, 37, 64, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {banner.icon}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: banner.color
                }}
              >
                CURRENT WATER EVALUATION STATUS
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  color: banner.color,
                  border: `1px solid ${banner.border}`
                }}
              >
                BIS IS-10500 COMPLIANT ENGINE
              </span>
            </div>

            <h1
              style={{
                fontSize: '1.9rem',
                fontWeight: '800',
                color: banner.color,
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
                marginTop: '2px'
              }}
            >
              {banner.title}
            </h1>

            <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: '4px', maxWidth: '640px' }}>
              {banner.subtitle}
            </p>

            <div
              style={{
                marginTop: '8px',
                fontSize: '0.78rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <strong>Recommended Action:</strong>
              <span>{decision.recommendedAction}</span>
            </div>
          </div>
        </div>

        {/* Right side: Water Safety Index Score Gauge & Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '14px 20px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Circular Score Visualizer */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748B' }}>
              WATER SAFETY INDEX
            </div>
            <div
              className="mono-num"
              style={{
                fontSize: '2.1rem',
                fontWeight: '800',
                color: banner.color,
                lineHeight: '1.1'
              }}
            >
              {decision.score}
              <span style={{ fontSize: '1rem', color: '#94A3B8' }}>/100</span>
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                color: decision.score > 80 ? '#059669' : decision.score > 50 ? '#D97706' : '#DC2626'
              }}
            >
              {decision.score > 80 ? 'EXCELLENT' : decision.score > 50 ? 'MODERATE' : 'CRITICAL'}
            </span>
          </div>

          <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '16px', fontSize: '0.75rem' }}>
            <div style={{ color: '#64748B' }}>Telemetry Verification:</div>
            <div style={{ fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
              Checked 09:42:18 PM
            </div>
            <div style={{ color: '#0284C7', marginTop: '4px', fontWeight: '600' }}>
              Real-Time Automated Loop
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: FOUR PRIMARY FINAL WATER QUALITY CARDS + FLOW
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        {/* pH Card */}
        <div
          className="glass-card"
          style={{ padding: '18px', borderLeft: '4px solid #00B4D8' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>
              FINAL pH
            </span>
            <span
              className={`badge ${
                decision.parametersEvaluation.ph.status === 'SAFE'
                  ? 'badge-safe'
                  : decision.parametersEvaluation.ph.status === 'WARNING'
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}
            >
              {decision.parametersEvaluation.ph.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px 0' }}>
            <span className="mono-num" style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0F172A' }}>
              {finalWater.ph.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>pH</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            BIS Acceptable: <strong>6.5 – 8.5</strong>
          </div>
        </div>

        {/* TDS Card */}
        <div
          className="glass-card"
          style={{ padding: '18px', borderLeft: '4px solid #0284C7' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>
              FINAL TDS
            </span>
            <span
              className={`badge ${
                decision.parametersEvaluation.tds.status === 'SAFE'
                  ? 'badge-safe'
                  : decision.parametersEvaluation.tds.status === 'WARNING'
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}
            >
              {decision.parametersEvaluation.tds.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px 0' }}>
            <span className="mono-num" style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0F172A' }}>
              {finalWater.tds}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>mg/L</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Acceptable: <strong>≤500</strong> • Permissible: <strong>≤2000</strong>
          </div>
        </div>

        {/* Turbidity Card */}
        <div
          className="glass-card"
          style={{ padding: '18px', borderLeft: '4px solid #06D6A0' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>
              FINAL TURBIDITY
            </span>
            <span
              className={`badge ${
                decision.parametersEvaluation.turbidity.status === 'SAFE'
                  ? 'badge-safe'
                  : decision.parametersEvaluation.turbidity.status === 'WARNING'
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}
            >
              {decision.parametersEvaluation.turbidity.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px 0' }}>
            <span className="mono-num" style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0F172A' }}>
              {finalWater.turbidity.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>NTU</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Acceptable: <strong>≤1.0</strong> • Permissible: <strong>≤5.0</strong>
          </div>
        </div>

        {/* Temperature Card (Operational Only) */}
        <div
          className="glass-card"
          style={{ padding: '18px', borderLeft: '4px solid #F59E0B' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>
              TEMPERATURE
            </span>
            <span className="badge badge-neutral">OPERATIONAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px 0' }}>
            <span className="mono-num" style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0F172A' }}>
              {finalWater.temperature.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>°C</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Membrane range: <strong>15°C – 35°C</strong> (Non-safety)
          </div>
        </div>

        {/* Flow Rate Card (Operational Only) */}
        <div
          className="glass-card"
          style={{ padding: '18px', borderLeft: '4px solid #0047AB' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>
              PROCESSING FLOW
            </span>
            <span className="badge badge-aqua">NOMINAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 4px 0' }}>
            <span className="mono-num" style={{ fontSize: '2.1rem', fontWeight: '800', color: '#0F172A' }}>
              {finalWater.flowRate.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>L/min</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Target delivery: <strong>3.0 – 6.0 L/min</strong>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: RAW WATER → PURIFICATION → FINAL WATER TRANSFORMATION STRIP
         ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '22px 24px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
              Raw Water → Purification → Final Water Transformation
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Real-time dynamically calculated purification efficiency from physical inlet to delivery node
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('quality')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#0047AB',
              cursor: 'pointer'
            }}
          >
            <span>Compare Full Spectrum</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
          {/* TDS Transformation */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                TDS REDUCTION
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#059669',
                  backgroundColor: '#ECFDF5',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                {tdsReduction}% REDUCTION
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>RAW WATER</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#DC2626' }}>
                  {rawWater.tds} <span style={{ fontSize: '0.75rem' }}>mg/L</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mono-num" style={{ fontSize: '0.72rem', color: '#64748B' }}>RO/NF</span>
                <ArrowRight size={18} color="#00B4D8" />
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>FINAL PURIFIED</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
                  {finalWater.tds} <span style={{ fontSize: '0.75rem' }}>mg/L</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '6px',
                backgroundColor: '#F1F5F9',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginTop: '6px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${tdsReduction}%`,
                  backgroundColor: '#059669',
                  borderRadius: '9999px'
                }}
              />
            </div>
          </div>

          {/* Turbidity Transformation */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                TURBIDITY REDUCTION
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#059669',
                  backgroundColor: '#ECFDF5',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                {turbReduction}% REDUCTION
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>RAW WATER</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#DC2626' }}>
                  {rawWater.turbidity.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>NTU</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mono-num" style={{ fontSize: '0.72rem', color: '#64748B' }}>PSF+MF</span>
                <ArrowRight size={18} color="#00B4D8" />
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>FINAL PURIFIED</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
                  {finalWater.turbidity.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>NTU</span>
                </div>
              </div>
            </div>

            <div
              style={{
                height: '6px',
                backgroundColor: '#F1F5F9',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginTop: '6px'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${turbReduction}%`,
                  backgroundColor: '#059669',
                  borderRadius: '9999px'
                }}
              />
            </div>
          </div>

          {/* pH Neutralization */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>
                pH REMINERALIZATION
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#0284C7',
                  backgroundColor: '#F0F9FF',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                BUFFERED TO SAFE
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 0'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>RAW WATER</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#D97706' }}>
                  {rawWater.ph.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>Acidic</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="mono-num" style={{ fontSize: '0.72rem', color: '#64748B' }}>CALCITE</span>
                <ArrowRight size={18} color="#00B4D8" />
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>FINAL PURIFIED</span>
                <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
                  {finalWater.ph.toFixed(1)} <span style={{ fontSize: '0.75rem' }}>Neutral</span>
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.68rem',
                color: '#64748B',
                marginTop: '6px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                padding: '2px',
                borderRadius: '4px'
              }}
            >
              Calcite/Dolomite bed restored essential calcium & magnesium ions
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: LIVE PURIFICATION PIPELINE SCHEMATIC (Animated water flow)
         ========================================================================= */}
      <PurificationPipelineWidget
        stages={stages}
        isRunning={isRunning}
        onSelectStage={() => {
          // Open details or navigate
        }}
      />

      {/* =========================================================================
          SECTION 5, 6, 7: SPLIT 3-COLUMN CONTROL & STATUS ROW
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {/* ACTUATORS / PUMP & VALVE STATUS (Section 7) */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Power size={18} color="#0047AB" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A' }}>
                Pumps & Actuators
              </h3>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Safe Interlock</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actuators.map(act => {
              const isOn = act.state === 'ON' || act.state === 'OPEN';
              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1E293B' }}>
                      {act.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                      {act.powerWatts ? `${act.powerWatts}W • ` : ''}Toggled {act.lastToggled}
                    </div>
                  </div>

                  <button
                    onClick={() => handleActuatorClick(act)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: isOn ? '#ECFDF5' : '#F1F5F9',
                      border: `1px solid ${isOn ? '#A7F3D0' : '#CBD5E1'}`,
                      color: isOn ? '#059669' : '#64748B',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {act.state}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE ALERTS CENTER (Section 6) */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#D97706" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A' }}>
                Active Alert Center
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                color: alerts.length > 0 ? '#DC2626' : '#059669',
                backgroundColor: alerts.length > 0 ? '#FEF2F2' : '#ECFDF5',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}
            >
              {alerts.length} Active
            </span>
          </div>

          {alerts.length === 0 ? (
            <div
              style={{
                padding: '30px 16px',
                textAlign: 'center',
                color: '#64748B'
              }}
            >
              <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#059669' }}>
                Zero Active Threshold Alerts
              </div>
              <p style={{ fontSize: '0.72rem', marginTop: '4px' }}>
                All sensor parameters are conforming to safe configured thresholds.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.slice(0, 3).map(alt => (
                <div
                  key={alt.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    backgroundColor: alt.severity === 'CRITICAL' ? '#FEF2F2' : '#FFFBEB',
                    border: `1px solid ${alt.severity === 'CRITICAL' ? '#FECACA' : '#FDE68A'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: '800',
                        color: alt.severity === 'CRITICAL' ? '#DC2626' : '#D97706'
                      }}
                    >
                      {alt.title}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#64748B' }}>{alt.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '3px' }}>
                    {alt.message}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: '4px', fontWeight: '600' }}>
                    Action: {alt.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => onNavigateTab('alerts')}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#0369A1',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Open Complete Alert Center
          </button>
        </div>

        {/* IoT CONNECTIVITY PANEL (Section 8) */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wifi size={18} color="#00B4D8" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A' }}>
                IoT Connectivity
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                color: iotStatus.esp32 === 'CONNECTED' ? '#059669' : '#DC2626',
                backgroundColor: iotStatus.esp32 === 'CONNECTED' ? '#ECFDF5' : '#FEF2F2',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}
            >
              {iotStatus.esp32 === 'CONNECTED' ? 'ESP32 ONLINE' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Gateway Hardware</span>
              <span style={{ fontWeight: '700', color: '#0F172A' }}>ESP32 Dual-Core (4G LTE)</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Wi-Fi / Cellular RSSI</span>
              <span className="mono-num" style={{ fontWeight: '700', color: '#059669' }}>
                {iotStatus.signalRssi} dBm (Strong)
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Cloud Broker</span>
              <span style={{ fontWeight: '700', color: '#0284C7' }}>AWS IoT Core / MQTT</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Sensor Bus (RS485 Modbus)</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>NORMAL (0 errors)</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Packets Received</span>
              <span className="mono-num" style={{ fontWeight: '700', color: '#0F172A' }}>
                {iotStatus.packetsReceived.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 9: RECENT TREATMENT HISTORY SNIPPET
         ========================================================================= */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#0047AB" />
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>
              Recent Treatment Batch History
            </h3>
          </div>

          <button
            onClick={() => onNavigateTab('history')}
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#0047AB',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View Full Log</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FBFE', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B' }}>DATE / TIME</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B' }}>RAW STATUS</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B' }}>FINAL STATUS</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B' }}>DECISION</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>TDS REDUCTION</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>TURB REDUCTION</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748B' }}>VOLUME</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748B' }}>ACTION TAKEN</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 4).map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: '600', color: '#1E293B' }}>
                    {h.date} • <span className="mono-num">{h.time}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="badge badge-danger">{h.rawWaterStatus}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span
                      className={`badge ${
                        h.finalWaterStatus === 'Safe'
                          ? 'badge-safe'
                          : h.finalWaterStatus === 'Warning'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {h.finalWaterStatus}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: '700' }}>
                    {h.treatmentDecision}
                  </td>
                  <td className="mono-num" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                    {h.tdsReductionPercent}%
                  </td>
                  <td className="mono-num" style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>
                    {h.turbidityReductionPercent}%
                  </td>
                  <td className="mono-num" style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {h.waterVolumeLitres} L
                  </td>
                  <td style={{ padding: '10px 12px', color: '#64748B' }}>
                    {h.actionTaken}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        consequences={confirmModal.consequences}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
