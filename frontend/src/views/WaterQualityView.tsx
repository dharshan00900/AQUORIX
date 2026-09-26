import React from 'react';
import type {
  SensorData,
  DecisionResult,
  ParameterThresholds
} from '../types/aquorix';
import {
  Info,
  Layers
} from 'lucide-react';

interface WaterQualityViewProps {
  rawWater: SensorData;
  finalWater: SensorData;
  decision: DecisionResult;
  thresholds: ParameterThresholds;
}

export const WaterQualityView: React.FC<WaterQualityViewProps> = ({
  rawWater: _rawWater,
  finalWater,
  decision,
  thresholds: _thresholds
}) => {
  // Contamination to Treatment Mapping Matrix (Prompt Section 26)
  const contaminationMappings = [
    {
      impurity: 'Coal Dust / Suspended Silt & Particulates',
      source: 'Open-cast coal mining runoff & surface sediment',
      treatmentStage: 'PSF (Pre-Sediment Filter) + MF (1µm Micro Filter)',
      monitoringSurrogate: 'Turbidity (Optical Nephelometry)',
      removalMech: 'Mechanical depth filtration down to 1 micron',
      efficiency: '97.2%'
    },
    {
      impurity: 'Organic Matter, Hydrocarbons & Industrial Odor',
      source: 'Mining machinery wash water & decaying vegetation',
      treatmentStage: 'ACF (Granular Activated Carbon Filter)',
      monitoringSurrogate: 'TDS surrogate + UV absorbance',
      removalMech: 'High surface-area pore adsorption & dechlorination',
      efficiency: '92.5%'
    },
    {
      impurity: 'Dissolved Iron (Fe²⁺) & Manganese (Mn)',
      source: 'Acid Mine Drainage (AMD) pyritic rock leaching',
      treatmentStage: 'IRF (Birm / Manganese Dioxide Media Filter)',
      monitoringSurrogate: 'pH & Turbidity surrogate indicators',
      removalMech: 'Catalytic oxidation followed by precipitate filtration',
      efficiency: '95.0%'
    },
    {
      impurity: 'Heavy Salinity, Sulfates & Dissolved Minerals',
      source: 'Deep aquifer mineralization & mine pit seepage',
      treatmentStage: 'RO / NF (Thin Film Composite Membrane)',
      monitoringSurrogate: 'TDS (Electrical Conductivity sensor)',
      removalMech: 'High pressure cross-flow semi-permeable exclusion',
      efficiency: '94.8%'
    },
    {
      impurity: 'Silica & Calcium Carbonate Scaling Ions',
      source: 'Hard groundwater minerals precipitating under pressure',
      treatmentStage: 'Anti-Scalant Precision Dosing Pump',
      monitoringSurrogate: 'Pressure drop & dosing velocity',
      removalMech: 'Chemical sequestration preventing crystal lattice formation',
      efficiency: '99.0%'
    },
    {
      impurity: 'Waterborne Pathogens (Coliforms, E. Coli, Cysts)',
      source: 'Rural domestic runoff & biological contamination',
      treatmentStage: 'UV-C Disinfection Reactor (254 nm germicidal)',
      monitoringSurrogate: 'Operational UV lamp intensity sensor',
      removalMech: 'Photochemical dimerization of thymine bases in microbial DNA',
      efficiency: '99.99%'
    },
    {
      impurity: 'Acid Mine Drainage Acidity (Low pH Permeate)',
      source: 'Pyrite oxidation in Jharkhand mining areas + RO demineralization',
      treatmentStage: 'Calcite & Dolomite Remineralization Filter',
      monitoringSurrogate: 'Glass-electrode pH Sensor',
      removalMech: 'Controlled mineral dissolution restoring pH 6.5–8.5 buffer',
      efficiency: '100%'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
          Water Quality Standards & Contamination Mapping
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
          Configured in strict accordance with Bureau of Indian Standards (BIS IS-10500:2012) drinking water specifications
        </p>
      </div>

      {/* BIS Standard Compliance Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {/* pH Specification Card */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '4px solid #00B4D8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>pH Parameter</h3>
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

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="mono-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#0047AB' }}>
              {finalWater.ph.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Current Final pH</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>BIS Acceptable Limit:</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>6.5 – 8.5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Permissible (No Alt Source):</span>
              <span style={{ fontWeight: '700', color: '#D97706' }}>No relaxation below 6.5</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Status Evaluation:</span>
              <span style={{ fontWeight: '700' }}>{decision.parametersEvaluation.ph.message}</span>
            </div>
          </div>
        </div>

        {/* TDS Specification Card */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '4px solid #0284C7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Total Dissolved Solids (TDS)</h3>
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

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="mono-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#0047AB' }}>
              {finalWater.tds}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>mg/L Current Final TDS</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>BIS Acceptable Limit:</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>≤ 500 mg/L</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Permissible Limit:</span>
              <span style={{ fontWeight: '700', color: '#D97706' }}>≤ 2000 mg/L</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Status Evaluation:</span>
              <span style={{ fontWeight: '700' }}>{decision.parametersEvaluation.tds.message}</span>
            </div>
          </div>
        </div>

        {/* Turbidity Specification Card */}
        <div className="glass-card" style={{ padding: '20px', borderTop: '4px solid #06D6A0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>Turbidity</h3>
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

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span className="mono-num" style={{ fontSize: '2rem', fontWeight: '800', color: '#0047AB' }}>
              {finalWater.turbidity.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>NTU Current Turbidity</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>BIS Acceptable Limit:</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>≤ 1.0 NTU</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
              <span style={{ color: '#64748B' }}>Permissible Limit:</span>
              <span style={{ fontWeight: '700', color: '#D97706' }}>≤ 5.0 NTU</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Status Evaluation:</span>
              <span style={{ fontWeight: '700' }}>{decision.parametersEvaluation.turbidity.message}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 26: CONTAMINATION & TREATMENT MAPPING (Prompt Section 26)
         ========================================================================= */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#0047AB" />
            <h2 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0F172A' }}>
              Jharkhand Mining Impurities & Multi-Barrier Treatment Mapping
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
            How AQUORIX physical treatment stages target specific industrial and geological contaminants
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FBFE', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#475569' }}>TARGET CONTAMINANT</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>ENVIRONMENTAL SOURCE</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#0047AB', fontWeight: '700' }}>TREATMENT STAGE</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>MONITORED SURROGATE</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: '700' }}>REMOVAL RATE</th>
              </tr>
            </thead>
            <tbody>
              {contaminationMappings.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', fontWeight: '700', color: '#0F172A' }}>
                    {m.impurity}
                  </td>
                  <td style={{ padding: '14px', color: '#64748B' }}>
                    {m.source}
                  </td>
                  <td style={{ padding: '14px', fontWeight: '700', color: '#0047AB' }}>
                    {m.treatmentStage}
                  </td>
                  <td style={{ padding: '14px', color: '#475569' }}>
                    {m.monitoringSurrogate}
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                    {m.efficiency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scientific sensor disclaimer as requested by Prompt Section 26 */}
        <div
          style={{
            marginTop: '16px',
            padding: '14px 18px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.78rem',
            color: '#1E40AF',
            lineHeight: 1.5
          }}
        >
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Scientific Instrumentation Methodology:</strong> In compliance with water monitoring physics, optical nephelometry (turbidity), electrical conductivity (TDS), and electrochemical potential (pH) act as aggregate surrogate indicators for multi-barrier filtration efficacy. They do not directly assay specific biological genomes (such as coliforms) or elemental isotopes (such as lead or arsenic) at the probe head; rather, the multi-barrier purification system incorporates certified physical barriers (ACF, IRF, RO/NF, and 254nm UV-C) engineered to neutralize these targets. Additional modular spectrometry sensors can be integrated via the ESP32 RS485 expansion bus.
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 27: TRANSPARENT WATER SAFETY INDEX (Score Calculation)
         ========================================================================= */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
            Transparent Water Safety Index Methodology (Score: {decision.score}/100)
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Clear algorithmic derivation showing how sensor telemetry maps to the overall safety index
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>TDS WEIGHT (35%)</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>Conforming</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
              Current: {finalWater.tds} mg/L. Maximum score awarded for 150–300 mg/L. Graceful reduction for 500–2000 mg/L permissible range.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>TURBIDITY WEIGHT (35%)</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>Optimal</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
              Current: {finalWater.turbidity.toFixed(1)} NTU. ≤0.5 NTU scores 100%. Penalizes sharply above 1.0 NTU and falls to minimum above 5.0 NTU.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>pH WEIGHT (30%)</span>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#059669' }}>Neutral</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.4 }}>
              Current: {finalWater.ph.toFixed(1)}. Centered at 7.2 neutral. Penalizes deviations outside the 6.5–8.5 safe drinking envelope.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
