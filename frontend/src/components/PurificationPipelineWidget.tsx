import React, { useState } from 'react';
import type {
  PurificationStageInfo,
  StageStatus
} from '../types/aquorix';
import {
  Waves,
  ArrowRight
} from 'lucide-react';

interface PipelineProps {
  stages: PurificationStageInfo[];
  isRunning: boolean;
  onSelectStage?: (stage: PurificationStageInfo) => void;
}

export const PurificationPipelineWidget: React.FC<PipelineProps> = ({
  stages,
  isRunning,
  onSelectStage
}) => {
  const [selectedStage, setSelectedStage] = useState<PurificationStageInfo | null>(null);

  const getStatusBadge = (status: StageStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'ACTIVE', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' };
      case 'WARNING':
        return { label: 'WARNING', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
      case 'FAULT':
        return { label: 'FAULT', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
      case 'STANDBY':
      default:
        return { label: 'STANDBY', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
    }
  };

  // Water color gradient progression along 13 stages:
  // Starts murky amber-brownish and becomes vibrant crystal aqua!
  const getWaterColor = (index: number) => {
    if (index <= 1) return '#92400E'; // Murky raw
    if (index <= 5) return '#0284C7'; // Filtered
    if (index <= 8) return '#00B4D8'; // RO permeate
    return '#06D6A0'; // UV disinfected safe water
  };

  const handleStageClick = (stage: PurificationStageInfo) => {
    setSelectedStage(stage);
    if (onSelectStage) onSelectStage(stage);
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 180, 216, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0047AB'
              }}
            >
              <Waves size={18} />
            </div>
            <h2 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0F172A' }}>
              Purification Process Architecture
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                backgroundColor: isRunning ? '#ECFDF5' : '#F1F5F9',
                color: isRunning ? '#059669' : '#64748B',
                padding: '3px 8px',
                borderRadius: '9999px',
                border: `1px solid ${isRunning ? '#A7F3D0' : '#E2E8F0'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isRunning ? '#10B981' : '#94A3B8'
                }}
              />
              {isRunning ? 'FLOW ACTIVE (4.8 L/min)' : 'FLOW SUSPENDED'}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            13-Stage Multi-Barrier Water Purification Chain • Direct Engineering Schematic
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.72rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ color: '#475569', fontWeight: '600' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ color: '#475569', fontWeight: '600' }}>Warning / Backwash</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ color: '#475569', fontWeight: '600' }}>Fault / Interlock</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
            <span style={{ color: '#475569', fontWeight: '600' }}>Standby</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Schematic */}
      <div
        style={{
          overflowX: 'auto',
          paddingBottom: '16px',
          paddingTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {stages.map((st, idx) => {
          const badge = getStatusBadge(st.status);
          const isSelected = selectedStage?.id === st.id;
          const stageWaterColor = getWaterColor(idx);
          const hasFlow = isRunning && st.isFlowing && st.status !== 'FAULT';

          return (
            <React.Fragment key={st.id}>
              {/* Stage Node Box */}
              <div
                onClick={() => handleStageClick(st)}
                style={{
                  minWidth: '150px',
                  maxWidth: '165px',
                  flexShrink: 0,
                  backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF',
                  borderRadius: '14px',
                  border: isSelected
                    ? '2px solid #00B4D8'
                    : `1px solid ${st.status === 'FAULT' ? '#FECACA' : st.status === 'WARNING' ? '#FDE68A' : 'rgba(0, 180, 216, 0.22)'}`,
                  boxShadow: isSelected
                    ? '0 6px 20px rgba(0, 180, 216, 0.25)'
                    : '0 4px 12px rgba(10, 37, 64, 0.04)',
                  padding: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Node Step Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: '800',
                      color: '#0047AB',
                      backgroundColor: 'rgba(0, 71, 171, 0.08)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    #{idx + 1}
                  </span>

                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      color: badge.color,
                      backgroundColor: badge.bg,
                      border: `1px solid ${badge.border}`,
                      padding: '1px 6px',
                      borderRadius: '9999px'
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Stage Code & Name */}
                <div
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2'
                  }}
                >
                  {st.code}
                </div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    color: '#334155',
                    fontWeight: '600',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={st.name}
                >
                  {st.name}
                </div>

                {/* Target contaminant chip */}
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748B',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    marginTop: '8px',
                    border: '1px solid #E2E8F0',
                    minHeight: '38px',
                    lineHeight: '1.3'
                  }}
                >
                  <span style={{ fontWeight: '700', color: '#475569' }}>Target: </span>
                  {st.targetContaminant}
                </div>

                {/* Sensor telemetry snippet */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #E2E8F0',
                    fontSize: '0.68rem',
                    color: '#475569'
                  }}
                >
                  <span className="mono-num">
                    P: <strong>{st.pressureOutBar.toFixed(1)}</strong> bar
                  </span>
                  <span
                    style={{
                      fontWeight: '700',
                      color: st.healthPercent > 90 ? '#059669' : '#D97706'
                    }}
                  >
                    {st.healthPercent}%
                  </span>
                </div>

                {/* Fluid indicator strip at bottom */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '12px',
                    right: '12px',
                    height: '3px',
                    backgroundColor: stageWaterColor,
                    borderRadius: '3px 3px 0 0',
                    opacity: hasFlow ? 1 : 0.25
                  }}
                />
              </div>

              {/* Connecting Pipe with Animated Flow Line */}
              {idx < stages.length - 1 && (
                <div
                  style={{
                    width: '32px',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <svg width="32" height="24" viewBox="0 0 32 24">
                    {/* Pipe background */}
                    <line
                      x1="0"
                      y1="12"
                      x2="32"
                      y2="12"
                      stroke="#CBD5E1"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Liquid flow */}
                    {hasFlow && (
                      <line
                        x1="0"
                        y1="12"
                        x2="32"
                        y2="12"
                        stroke={stageWaterColor}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="flow-animated-line"
                      />
                    )}
                  </svg>
                  <ArrowRight
                    size={10}
                    color={hasFlow ? stageWaterColor : '#94A3B8'}
                    style={{ position: 'absolute', right: '4px', top: '7px' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer / Card */}
      {selectedStage && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: '#F8FBFE',
            border: '1px solid rgba(0, 180, 216, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            animation: 'waterPulse 0.2s ease-out'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#0047AB',
                  backgroundColor: 'rgba(0, 180, 216, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}
              >
                STAGE {selectedStage.code}
              </span>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A' }}>
                {selectedStage.fullName}
              </h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
              <strong>Operational Status:</strong> {selectedStage.notes} •{' '}
              <strong>Target Impurity:</strong> {selectedStage.targetContaminant}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem' }}>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>INLET PRESSURE</div>
              <div className="mono-num" style={{ fontWeight: '700', color: '#0F172A' }}>
                {selectedStage.pressureInBar.toFixed(1)} bar
              </div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>OUTLET PRESSURE</div>
              <div className="mono-num" style={{ fontWeight: '700', color: '#0F172A' }}>
                {selectedStage.pressureOutBar.toFixed(1)} bar
              </div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>OPERATING HOURS</div>
              <div className="mono-num" style={{ fontWeight: '700', color: '#0F172A' }}>
                {selectedStage.operatingHours} hrs
              </div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.7rem' }}>HEALTH RATING</div>
              <div
                style={{
                  fontWeight: '800',
                  color: selectedStage.healthPercent > 90 ? '#059669' : '#D97706'
                }}
              >
                {selectedStage.healthPercent}%
              </div>
            </div>

            <button
              onClick={() => setSelectedStage(null)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
