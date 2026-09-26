import React from 'react';
import {
  Sparkles,
  CheckCircle,
  RotateCcw,
  AlertOctagon,
  Waves,
  FlaskConical,
  TestTube2,
  Wrench,
  Radio,
  PlayCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { DemoScenario } from '../types/aquorix';

interface DemoControlBarProps {
  activeScenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isPurificationRunning?: boolean;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({
  activeScenario,
  onSelectScenario,
  isOpen,
  onToggleOpen
}) => {
  const scenarios: {
    id: DemoScenario;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    borderColor: string;
  }[] = [
    {
      id: 'SAFE_WATER',
      label: 'Safe Water',
      sublabel: 'TDS: 286, Turb: 0.6',
      icon: <CheckCircle size={15} />,
      color: '#059669',
      bg: '#ECFDF5',
      borderColor: '#A7F3D0'
    },
    {
      id: 'RETREAT_REQUIRED',
      label: 'Re-Treat Required',
      sublabel: 'TDS: 720 mg/L',
      icon: <RotateCcw size={15} />,
      color: '#D97706',
      bg: '#FFFBEB',
      borderColor: '#FDE68A'
    },
    {
      id: 'UNSAFE_REJECT',
      label: 'Unsafe / Reject',
      sublabel: 'TDS: 2240, Turb: 6.8',
      icon: <AlertOctagon size={15} />,
      color: '#DC2626',
      bg: '#FEF2F2',
      borderColor: '#FECACA'
    },
    {
      id: 'HIGH_TURBIDITY',
      label: 'High Turbidity',
      sublabel: 'Coal slurry: 7.4 NTU',
      icon: <Waves size={15} />,
      color: '#B45309',
      bg: '#FFFBEB',
      borderColor: '#FDE68A'
    },
    {
      id: 'HIGH_TDS',
      label: 'High TDS Spurt',
      sublabel: 'Mine drainage: 860 mg/L',
      icon: <FlaskConical size={15} />,
      color: '#7C3AED',
      bg: '#F5F3FF',
      borderColor: '#DDD6FE'
    },
    {
      id: 'ABNORMAL_PH',
      label: 'Abnormal pH',
      sublabel: 'Acidic runoff: 5.6 pH',
      icon: <TestTube2 size={15} />,
      color: '#C026D3',
      bg: '#FDF4FF',
      borderColor: '#F5D0FE'
    },
    {
      id: 'PUMP_FAULT',
      label: 'Pump Fault',
      sublabel: 'HP Booster tripped',
      icon: <Wrench size={15} />,
      color: '#DC2626',
      bg: '#FEF2F2',
      borderColor: '#FECACA'
    },
    {
      id: 'UV_FAILURE',
      label: 'UV-C Failure',
      sublabel: 'Lamp unpowered',
      icon: <AlertOctagon size={15} />,
      color: '#E11D48',
      bg: '#FFF1F2',
      borderColor: '#FECDD3'
    },
    {
      id: 'IOT_DISCONNECTED',
      label: 'IoT Disconnect',
      sublabel: 'ESP32 offline',
      icon: <Radio size={15} />,
      color: '#475569',
      bg: '#F8FAFC',
      borderColor: '#E2E8F0'
    },
    {
      id: 'FULL_CYCLE',
      label: 'Purify Cycle Demo',
      sublabel: 'Automated 15s Flow',
      icon: <PlayCircle size={15} />,
      color: '#0284C7',
      bg: '#F0F9FF',
      borderColor: '#BAE6FD'
    }
  ];

  return (
    <div
      style={{
        backgroundColor: '#0F2744',
        borderBottom: '1px solid rgba(0, 210, 255, 0.25)',
        boxShadow: '0 4px 18px rgba(10, 25, 47, 0.35)',
        color: '#FFFFFF',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Top Banner Strip */}
      <div
        style={{
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={onToggleOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 210, 255, 0.2)',
              border: '1px solid rgba(0, 210, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#38BDF8',
              letterSpacing: '0.04em'
            }}
          >
            <Sparkles size={13} />
            <span>SIH JUDGE PRESENTATION CONTROLS</span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
            Interactive Demo Mode simulates real hardware telemetry, sensor thresholds, decision engine logic, and actuator loops.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#38BDF8'
            }}
          >
            Active: {activeScenario.replace('_', ' ')}
          </span>
          <button
            style={{
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem'
            }}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Scenario Buttons */}
      {isOpen && (
        <div
          style={{
            padding: '12px 24px 16px 24px',
            backgroundColor: '#091B30',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: '600',
              color: '#94A3B8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Select Simulation Scenario to Test Dashboard Response:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '10px'
            }}
          >
            {scenarios.map(sc => {
              const isSelected = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  style={{
                    backgroundColor: isSelected ? sc.bg : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected
                      ? `2px solid ${sc.color}`
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? `0 0 12px ${sc.borderColor}` : 'none'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: isSelected ? sc.color : '#F1F5F9',
                      fontWeight: '700',
                      fontSize: '0.8rem'
                    }}
                  >
                    {sc.icon}
                    <span>{sc.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: isSelected ? sc.color : '#94A3B8',
                      fontWeight: '500'
                    }}
                  >
                    {sc.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
