import React from 'react';
import type {
  SensorData,
  DecisionResult,
  ParameterThresholds
} from '../types/aquorix';
import {
  Cpu,
  ArrowDown,
  CheckCircle,
  XCircle,
  RotateCcw,
  Filter,
  Activity
} from 'lucide-react';

interface DecisionEngineViewProps {
  finalWater: SensorData;
  decision: DecisionResult;
  thresholds: ParameterThresholds;
}

export const DecisionEngineView: React.FC<DecisionEngineViewProps> = ({
  finalWater,
  decision,
  thresholds: _thresholds
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
          Autonomous Decision Engine & Rule Matrix
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
          Real-time algorithmic state machine evaluating sensor inputs against statutory limits to dictate automated actuator routing
        </p>
      </div>

      {/* Visual Logic Flowchart (Prompt Section 11) */}
      <div
        className="glass-card"
        style={{
          padding: '28px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFE 100%)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#0047AB',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}
          >
            DECISION ENGINE ARCHITECTURE
          </span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
            Closed-Loop Autonomous Water Safety Arbitration
          </h2>
        </div>

        {/* Vertical Visual Flow */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* STEP 1: Sensor Data */}
          <div
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #BAE6FD',
              boxShadow: '0 4px 12px rgba(0, 180, 216, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>
                  STEP 1: Continuous Sensor Data Ingestion
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  pH: {finalWater.ph.toFixed(1)} • TDS: {finalWater.tds} mg/L • Turbidity: {finalWater.turbidity.toFixed(1)} NTU
                </div>
              </div>
            </div>
            <span className="badge badge-aqua">ACTIVE STREAM</span>
          </div>

          <ArrowDown size={22} color="#00B4D8" />

          {/* STEP 2: Quality Evaluation */}
          <div
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '14px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #DDD6FE',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Filter size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0F172A' }}>
                  STEP 2: Statutory Limit Quality Evaluation
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Cross-referencing BIS IS-10500 Acceptable vs Permissible boundaries
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '3px 8px', borderRadius: '6px' }}>
              BIS COMPLIANCE MATRIX
            </span>
          </div>

          <ArrowDown size={22} color="#7C3AED" />

          {/* STEP 3: Decision Engine Core */}
          <div
            style={{
              width: '100%',
              padding: '18px 20px',
              borderRadius: '14px',
              backgroundColor: '#0F2744',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(10, 25, 47, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 210, 255, 0.2)',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cpu size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#FFFFFF' }}>
                  STEP 3: Decision Engine Arbitration Node
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                  Evaluating multi-parameter vector: [pH, TDS, Turbidity, Hardware Interlocks]
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: '#38BDF8',
                backgroundColor: 'rgba(0, 210, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 210, 255, 0.3)'
              }}
            >
              RUNNING
            </span>
          </div>

          <ArrowDown size={22} color="#0F2744" />

          {/* STEP 4: Three Output States Branch */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px'
            }}
          >
            {/* SAFE */}
            <div
              style={{
                padding: '16px 12px',
                borderRadius: '14px',
                backgroundColor: decision.decision === 'SAFE' ? '#ECFDF5' : '#FFFFFF',
                border: decision.decision === 'SAFE' ? '3px solid #10B981' : '1px solid #E2E8F0',
                textAlign: 'center',
                boxShadow: decision.decision === 'SAFE' ? '0 6px 20px rgba(16, 185, 129, 0.25)' : 'none',
                opacity: decision.decision === 'SAFE' ? 1 : 0.65
              }}
            >
              <CheckCircle size={28} color="#059669" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#059669' }}>
                🟢 SAFE
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
                All parameters ≤ Acceptable limit. Route to community tap.
              </div>
            </div>

            {/* RE-TREAT */}
            <div
              style={{
                padding: '16px 12px',
                borderRadius: '14px',
                backgroundColor: decision.decision === 'RE-TREAT' ? '#FFFBEB' : '#FFFFFF',
                border: decision.decision === 'RE-TREAT' ? '3px solid #F59E0B' : '1px solid #E2E8F0',
                textAlign: 'center',
                boxShadow: decision.decision === 'RE-TREAT' ? '0 6px 20px rgba(245, 158, 11, 0.25)' : 'none',
                opacity: decision.decision === 'RE-TREAT' ? 1 : 0.65
              }}
            >
              <RotateCcw size={28} color="#D97706" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#D97706' }}>
                🟠 RE-TREAT
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
                Parameters in Permissible band. Divert to Recirculation loop.
              </div>
            </div>

            {/* REJECT */}
            <div
              style={{
                padding: '16px 12px',
                borderRadius: '14px',
                backgroundColor: decision.decision === 'REJECT' ? '#FEF2F2' : '#FFFFFF',
                border: decision.decision === 'REJECT' ? '3px solid #EF4444' : '1px solid #E2E8F0',
                textAlign: 'center',
                boxShadow: decision.decision === 'REJECT' ? '0 6px 20px rgba(239, 68, 68, 0.25)' : 'none',
                opacity: decision.decision === 'REJECT' ? 1 : 0.65
              }}
            >
              <XCircle size={28} color="#DC2626" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#DC2626' }}>
                🔴 REJECT
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
                Permissible limits violated. Divert to Reject Drain.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Rationale & Recommended Action (Prompt Section 11) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
          Current Active Decision Log & Mathematical Justification
        </h2>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor:
              decision.decision === 'SAFE'
                ? '#ECFDF5'
                : decision.decision === 'RE-TREAT'
                ? '#FFFBEB'
                : '#FEF2F2',
            border: `1px solid ${
              decision.decision === 'SAFE'
                ? '#A7F3D0'
                : decision.decision === 'RE-TREAT'
                ? '#FDE68A'
                : '#FECACA'
            }`,
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '1rem',
                fontWeight: '800',
                color: decision.statusColor
              }}
            >
              ACTIVE VERDICT: {decision.decision}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              • Safety Index: <strong>{decision.score}/100</strong>
            </span>
          </div>

          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
              MATHEMATICAL RATIONALE & THRESHOLD ANALYSIS:
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
              {decision.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div
            style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px dashed rgba(0, 0, 0, 0.1)',
              fontSize: '0.8rem',
              color: '#0F172A'
            }}
          >
            <strong>Prescribed Actuator Action: </strong>
            <span>{decision.recommendedAction}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
