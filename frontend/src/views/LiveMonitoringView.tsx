import React from 'react';
import type {
  SensorData,
  DecisionResult,
  VolumeStatistics,
  ParameterThresholds
} from '../types/aquorix';

interface LiveMonitoringProps {
  rawWater: SensorData;
  finalWater: SensorData;
  decision: DecisionResult;
  volumeStats: VolumeStatistics;
  thresholds: ParameterThresholds;
}

export const LiveMonitoringView: React.FC<LiveMonitoringProps> = ({
  rawWater,
  finalWater,
  decision,
  volumeStats,
  thresholds
}) => {
  // Sensor parameters list
  const parameters = [
    {
      name: 'pH (Acidity / Alkalinity)',
      code: 'ph',
      rawVal: rawWater.ph.toFixed(1),
      finalVal: finalWater.ph.toFixed(1),
      unit: 'pH',
      acceptable: `${thresholds.ph.acceptableMin} – ${thresholds.ph.acceptableMax}`,
      permissible: '5.8 – 9.2',
      status: decision.parametersEvaluation.ph.status,
      safe: decision.parametersEvaluation.ph.safe,
      message: decision.parametersEvaluation.ph.message,
      isSafetyParam: true
    },
    {
      name: 'Total Dissolved Solids (TDS)',
      code: 'tds',
      rawVal: rawWater.tds.toString(),
      finalVal: finalWater.tds.toString(),
      unit: 'mg/L',
      acceptable: `≤ ${thresholds.tds.acceptableLimit}`,
      permissible: `≤ ${thresholds.tds.permissibleLimit}`,
      status: decision.parametersEvaluation.tds.status,
      safe: decision.parametersEvaluation.tds.safe,
      message: decision.parametersEvaluation.tds.message,
      isSafetyParam: true
    },
    {
      name: 'Turbidity (Optical Nephelometry)',
      code: 'turbidity',
      rawVal: rawWater.turbidity.toFixed(1),
      finalVal: finalWater.turbidity.toFixed(1),
      unit: 'NTU',
      acceptable: `≤ ${thresholds.turbidity.acceptableLimit}`,
      permissible: `≤ ${thresholds.turbidity.permissibleLimit}`,
      status: decision.parametersEvaluation.turbidity.status,
      safe: decision.parametersEvaluation.turbidity.safe,
      message: decision.parametersEvaluation.turbidity.message,
      isSafetyParam: true
    },
    {
      name: 'Water Temperature',
      code: 'temperature',
      rawVal: rawWater.temperature.toFixed(1),
      finalVal: finalWater.temperature.toFixed(1),
      unit: '°C',
      acceptable: '15.0 – 35.0 (Opt.)',
      permissible: '— (Operational)',
      status: decision.parametersEvaluation.temperature.status,
      safe: true,
      message: decision.parametersEvaluation.temperature.message,
      isSafetyParam: false
    },
    {
      name: 'Purification Flow Velocity',
      code: 'flowRate',
      rawVal: rawWater.flowRate.toFixed(1),
      finalVal: finalWater.flowRate.toFixed(1),
      unit: 'L/min',
      acceptable: '3.0 – 6.0 (Nominal)',
      permissible: '— (Operational)',
      status: decision.parametersEvaluation.flowRate.status,
      safe: true,
      message: decision.parametersEvaluation.flowRate.message,
      isSafetyParam: false
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
            Live Dual-Stream Telemetry Monitoring
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Synchronized comparison between untreated Raw Water Intake and Post-Purification Distribution Stream
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            RS485 Modbus Bus: Synchronized
          </span>
        </div>
      </div>

      {/* Side-by-side Dual Cards: Raw Water Intake vs Final Water Output */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* RAW WATER QUALITY PANEL */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderTop: '4px solid #DC2626',
            backgroundColor: '#FFFDFD'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#DC2626', letterSpacing: '0.04em' }}>
                INTAKE SOURCE MONITORING
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                Raw Contaminated Water
              </h2>
            </div>
            <span className="badge badge-danger">Untreated Mine Water</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#7F1D1D', fontWeight: '700' }}>RAW pH</div>
                <div className="mono-num" style={{ fontSize: '1.7rem', fontWeight: '800', color: '#991B1B' }}>
                  {rawWater.ph.toFixed(1)} <span style={{ fontSize: '0.78rem' }}>pH</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#991B1B', fontWeight: '600' }}>
                ⚠ Acidic Mine Runoff
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#7F1D1D', fontWeight: '700' }}>RAW TDS</div>
                <div className="mono-num" style={{ fontSize: '1.7rem', fontWeight: '800', color: '#991B1B' }}>
                  {rawWater.tds} <span style={{ fontSize: '0.78rem' }}>mg/L</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#991B1B', fontWeight: '600' }}>
                🔴 Extreme Mineralization
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#7F1D1D', fontWeight: '700' }}>RAW TURBIDITY</div>
                <div className="mono-num" style={{ fontSize: '1.7rem', fontWeight: '800', color: '#991B1B' }}>
                  {rawWater.turbidity.toFixed(1)} <span style={{ fontSize: '0.78rem' }}>NTU</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#991B1B', fontWeight: '600' }}>
                🔴 Coal Slurry & Silt
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Inlet Temperature: <strong>{rawWater.temperature.toFixed(1)} °C</strong></span>
              <span style={{ color: '#64748B' }}>Intake Flow: <strong>{rawWater.flowRate.toFixed(1)} L/min</strong></span>
            </div>
          </div>
        </div>

        {/* FINAL WATER QUALITY PANEL */}
        <div
          className="glass-card"
          style={{
            padding: '24px',
            borderTop: '4px solid #059669',
            backgroundColor: '#F8FCFA'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#059669', letterSpacing: '0.04em' }}>
                OUTLET DISTRIBUTION MONITORING
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                Final Purified Water
              </h2>
            </div>
            <span
              className={`badge ${
                decision.decision === 'SAFE'
                  ? 'badge-safe'
                  : decision.decision === 'RE-TREAT'
                  ? 'badge-warning'
                  : 'badge-danger'
              }`}
            >
              {decision.decision}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: '700' }}>PURIFIED pH</div>
                <div className="mono-num" style={{ fontSize: '1.7rem', fontWeight: '800', color: '#047857' }}>
                  {finalWater.ph.toFixed(1)} <span style={{ fontSize: '0.78rem' }}>pH</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#047857', fontWeight: '600' }}>
                🟢 Calcite Remineralized
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: '700' }}>PURIFIED TDS</div>
                <div className="mono-num" style={{ fontSize: '1.7rem', fontWeight: '800', color: '#047857' }}>
                  {finalWater.tds} <span style={{ fontSize: '0.78rem' }}>mg/L</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#047857', fontWeight: '600' }}>
                🟢 Desalinated & Safe
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#065F46', fontWeight: '700' }}>PURIFIED TURBIDITY</div>
                <div className="mono-num" style={{ fontSize: '1.7rem', fontWeight: '800', color: '#047857' }}>
                  {finalWater.turbidity.toFixed(1)} <span style={{ fontSize: '0.78rem' }}>NTU</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#047857', fontWeight: '600' }}>
                🟢 Crystal Clear Permeate
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem'
              }}
            >
              <span style={{ color: '#64748B' }}>Outlet Temperature: <strong>{finalWater.temperature.toFixed(1)} °C</strong></span>
              <span style={{ color: '#64748B' }}>Clean Delivery: <strong>{finalWater.flowRate.toFixed(1)} L/min</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 18: REAL-TIME SENSOR DATA TABLE
         ========================================================================= */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
            Comprehensive Real-Time Sensor Telemetry Matrix
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Direct sensor readings mapped against BIS IS-10500 potable limits with automated verdict
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FBFE', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#475569', fontWeight: '700' }}>PARAMETER</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#DC2626', fontWeight: '700' }}>RAW INTAKE</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: '700' }}>FINAL OUTLET</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', color: '#64748B' }}>UNIT</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', color: '#64748B' }}>ACCEPTABLE</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', color: '#64748B' }}>PERMISSIBLE</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', color: '#64748B' }}>STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>EVALUATION SUMMARY</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', fontWeight: '700', color: '#0F172A' }}>
                    {p.name}
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#DC2626' }}>
                    {p.rawVal}
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                    {p.finalVal}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center', color: '#64748B' }}>
                    {p.unit}
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'center', color: '#334155' }}>
                    {p.acceptable}
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'center', color: '#64748B' }}>
                    {p.permissible}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'center' }}>
                    <span
                      className={`badge ${
                        p.status === 'SAFE' || p.status === 'NORMAL'
                          ? 'badge-safe'
                          : p.status === 'WARNING'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', color: '#475569', fontSize: '0.78rem' }}>
                    {p.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 15: FLOW & VOLUME MONITORING SECTION
         ========================================================================= */}
      <div
        className="glass-card"
        style={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
            Flow & Processing Volume Statistics
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Cumulative volumetric measurements tracked through high-precision Hall-effect flow meters
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}
        >
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>CURRENT FLOW RATE</div>
            <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0047AB' }}>
              {volumeStats.currentFlowRate.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>L/min</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '600' }}>● Constant pressure 8.4 bar</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>TOTAL PROCESSED</div>
            <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A' }}>
              {Math.round(volumeStats.totalWaterProcessed).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>Litres</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Lifetime intake</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>CLEAN WATER DELIVERED</div>
            <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#059669' }}>
              {Math.round(volumeStats.totalCleanWaterDelivered).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>Litres</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '600' }}>Recovery rate: 82.8%</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>REJECTED BRINE</div>
            <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#DC2626' }}>
              {Math.round(volumeStats.rejectedWater).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>Litres</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#DC2626' }}>Concentrate stream: 13.2%</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>RECIRCULATED VOLUME</div>
            <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#D97706' }}>
              {Math.round(volumeStats.recirculatedWater).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>Litres</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#D97706' }}>Polishing loops: 4.0%</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>DAILY PRODUCTION</div>
            <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0284C7' }}>
              {Math.round(volumeStats.dailyProcessingVolume).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>Litres</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#0284C7' }}>Supplying 60 rural families</span>
          </div>
        </div>
      </div>
    </div>
  );
};
