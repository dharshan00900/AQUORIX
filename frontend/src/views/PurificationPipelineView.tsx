import React, { useState } from 'react';
import type {
  PurificationStageInfo,
  ActuatorControl,
  RecirculationState
} from '../types/aquorix';
import { PurificationPipelineWidget } from '../components/PurificationPipelineWidget';
import { ConfirmationModal } from '../components/ConfirmationModal';
import {
  RotateCcw
} from 'lucide-react';

interface PurificationPipelineViewProps {
  stages: PurificationStageInfo[];
  actuators: ActuatorControl[];
  recirculationStatus: RecirculationState;
  recirculationCycle: number;
  maxCycles: number;
  isRunning: boolean;
  onToggleActuator: (id: string) => void;
}

export const PurificationPipelineView: React.FC<PurificationPipelineViewProps> = ({
  stages,
  actuators,
  recirculationStatus,
  recirculationCycle,
  maxCycles,
  isRunning,
  onToggleActuator
}) => {
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
        title: `${willTurnOff ? 'De-energize' : 'Activate'} ${act.name}`,
        message: `Are you sure you want to toggle ${act.name}?`,
        consequences: [
          'Directly affects pressure dynamics in RO membrane.',
          'Interlock will log this operator action in compliance history.'
        ]
      });
    } else {
      onToggleActuator(act.id);
    }
  };

  // 8 Treatment Stages (Prompt Section 13)
  const treatmentGroups = [
    {
      stageNumber: 1,
      name: 'Inlet & Monitoring',
      status: 'ACTIVE',
      progress: 100,
      description: 'Raw water buffer intake and initial sensor profiling',
      elements: 'Equalization Tank, In-line optical probe array'
    },
    {
      stageNumber: 2,
      name: 'Pre-Treatment Cascade',
      status: 'ACTIVE',
      progress: 95,
      description: 'Particulate filtration and adsorption',
      elements: 'PSF (5µm), ACF (Carbon), IRF (Iron/Mn), MF (1µm)'
    },
    {
      stageNumber: 3,
      name: 'Protection / Anti-Scaling',
      status: 'ACTIVE',
      progress: 98,
      description: 'Inorganic scaling prevention',
      elements: 'Phosphonate dosing metering pump'
    },
    {
      stageNumber: 4,
      name: 'Pressure & Membrane',
      status: 'ACTIVE',
      progress: 92,
      description: 'Osmotic separation and heavy ion rejection',
      elements: 'Multistage booster pump (8.4 bar) & RO/NF membrane'
    },
    {
      stageNumber: 5,
      name: 'Post-Treatment Remineralization',
      status: 'ACTIVE',
      progress: 97,
      description: 'pH neutralization and mineral re-balancing',
      elements: 'Calcite and dolomite enriched mineralizer bed'
    },
    {
      stageNumber: 6,
      name: 'UV-C Disinfection',
      status: 'ACTIVE',
      progress: 100,
      description: 'Germicidal destruction of microbial pathogens',
      elements: '254nm ultraviolet germicidal irradiation quartz tube'
    },
    {
      stageNumber: 7,
      name: 'Final Quality Verification',
      status: 'ACTIVE',
      progress: 100,
      description: 'Dual-redundant sensor array check against BIS limits',
      elements: 'Secondary pH, TDS, Turbidity node before clean tank'
    },
    {
      stageNumber: 8,
      name: 'Storage & Community Delivery',
      status: 'ACTIVE',
      progress: 84,
      description: 'Food-grade clean storage and dispensing',
      elements: '500-Litre isolated reservoir with community distribution tap'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
          Purification Engineering Pipeline & Stage Controls
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
          Real-time physical stage monitoring, pressure profiles, and actuator switching
        </p>
      </div>

      {/* Recirculation Status Card (Prompt Section 21) */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          borderLeft: `5px solid ${
            recirculationStatus === 'IN PROGRESS'
              ? '#F59E0B'
              : recirculationStatus === 'COMPLETED'
              ? '#10B981'
              : recirculationStatus === 'FAILED'
              ? '#EF4444'
              : '#94A3B8'
          }`,
          backgroundColor:
            recirculationStatus === 'IN PROGRESS'
              ? '#FFFBEB'
              : recirculationStatus === 'COMPLETED'
              ? '#ECFDF5'
              : recirculationStatus === 'FAILED'
              ? '#FEF2F2'
              : '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color:
                  recirculationStatus === 'IN PROGRESS'
                    ? '#D97706'
                    : recirculationStatus === 'COMPLETED'
                    ? '#059669'
                    : '#DC2626'
              }}
            >
              <RotateCcw size={22} className={recirculationStatus === 'IN PROGRESS' ? 'ripple-effect' : ''} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', letterSpacing: '0.04em' }}>
                  RECIRCULATION / RE-TREATMENT ENGINE
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#FFFFFF',
                    color:
                      recirculationStatus === 'IN PROGRESS'
                        ? '#D97706'
                        : recirculationStatus === 'COMPLETED'
                        ? '#059669'
                        : '#DC2626',
                    border: '1px solid currentColor'
                  }}
                >
                  {recirculationStatus}
                </span>
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {recirculationStatus === 'IN PROGRESS'
                  ? `Recirculating Water — Pass ${recirculationCycle} of ${maxCycles}`
                  : recirculationStatus === 'COMPLETED'
                  ? 'Recirculation Cycle Successfully Completed (Safe Water Achieved)'
                  : recirculationStatus === 'FAILED'
                  ? 'Recirculation Limit Exceeded — Water Diverted to Reject'
                  : 'Recirculation Standby (Single Pass Sufficient)'}
              </h2>

              <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                {recirculationStatus === 'IN PROGRESS'
                  ? 'TDS / Turbidity parameters require secondary pass. Water is returned via Recirculation Valve (V-REC) to High Pressure RO feed.'
                  : 'System automatically initiates a maximum of 3 recirculating passes before routing to reject drain if parameters fail to conform.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>CURRENT STAGE</div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A' }}>
                {recirculationStatus === 'IN PROGRESS' ? 'RO/NF Membrane' : 'Idle'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>CYCLES COUNT</div>
              <div className="mono-num" style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0047AB' }}>
                {recirculationCycle} / {maxCycles}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Process Visualization */}
      <PurificationPipelineWidget stages={stages} isRunning={isRunning} />

      {/* 8 Grouped Treatment Stages Status Panel (Prompt Section 13) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
            8 Core Treatment Stages Operational Health
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            High-level operational overview across all treatment domains
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {treatmentGroups.map(grp => (
            <div
              key={grp.stageNumber}
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(10, 37, 64, 0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    color: '#0047AB',
                    backgroundColor: 'rgba(0, 71, 171, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  STAGE {grp.stageNumber}
                </span>
                <span className="badge badge-safe">ACTIVE</span>
              </div>

              <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F172A' }}>
                {grp.name}
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                {grp.description}
              </p>

              <div
                style={{
                  fontSize: '0.7rem',
                  color: '#475569',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  marginTop: '8px',
                  border: '1px solid #E2E8F0'
                }}
              >
                <strong>Hardware:</strong> {grp.elements}
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginBottom: '3px' }}>
                  <span>Efficacy Rating</span>
                  <span className="mono-num" style={{ fontWeight: '700', color: '#059669' }}>{grp.progress}%</span>
                </div>
                <div style={{ height: '5px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${grp.progress}%`, backgroundColor: '#059669', borderRadius: '9999px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pump & Valve Actuator Control Matrix */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
            Actuators, Solenoid Valves & Pump Control Matrix
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Direct control interface with safety confirmation popups preventing accidental system halts
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px'
          }}
        >
          {actuators.map(act => {
            const isOn = act.state === 'ON' || act.state === 'OPEN';
            return (
              <div
                key={act.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${isOn ? '#A7F3D0' : '#E2E8F0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isOn ? '#10B981' : '#94A3B8'
                      }}
                    />
                    <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0F172A' }}>
                      {act.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                    {act.type.toUpperCase()} • Last switch: {act.lastToggled}
                  </div>
                </div>

                <button
                  onClick={() => handleActuatorClick(act)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: isOn ? '#ECFDF5' : '#F8FAFC',
                    border: `1px solid ${isOn ? '#A7F3D0' : '#CBD5E1'}`,
                    color: isOn ? '#059669' : '#64748B',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: isOn ? '0 2px 8px rgba(16, 185, 129, 0.2)' : 'none',
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

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        consequences={confirmModal.consequences}
        onConfirm={() => {
          onToggleActuator(confirmModal.actuatorId);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
