import React, { useState } from 'react';
import type { ParameterThresholds } from '../types/aquorix';
import { Save, RotateCcw, Sliders, Server, Check } from 'lucide-react';

interface SettingsViewProps {
  thresholds: ParameterThresholds;
  onUpdateThresholds: (updated: ParameterThresholds) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  thresholds,
  onUpdateThresholds
}) => {
  const [formData, setFormData] = useState<ParameterThresholds>({ ...thresholds });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateThresholds(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const defaults: ParameterThresholds = {
      ph: { acceptableMin: 6.5, acceptableMax: 8.5, unit: 'pH' },
      tds: { acceptableLimit: 500, permissibleLimit: 2000, unit: 'mg/L' },
      turbidity: { acceptableLimit: 1.0, permissibleLimit: 5.0, unit: 'NTU' },
      temperature: { operationalMin: 15.0, operationalMax: 35.0, unit: '°C' },
      flowRate: { targetMin: 3.0, targetMax: 6.0, unit: 'L/min' }
    };
    setFormData(defaults);
    onUpdateThresholds(defaults);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
          System Configuration & Statutory Standards Calibration
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
          Configure BIS IS-10500 threshold values, decision rules, IoT telemetry endpoints, and system alerts
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* BIS Limits Section */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#0047AB" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                Water Quality Threshold Configuration
              </h2>
            </div>
            <span className="badge badge-aqua">BIS IS-10500:2012 Standard</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}
          >
            {/* TDS */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                TDS Acceptable Limit (mg/L)
              </label>
              <input
                type="number"
                value={formData.tds.acceptableLimit}
                onChange={e =>
                  setFormData({
                    ...formData,
                    tds: { ...formData.tds, acceptableLimit: Number(e.target.value) }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Default: 500 mg/L (Trigger for Re-Treat)
              </span>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                TDS Permissible Limit (mg/L)
              </label>
              <input
                type="number"
                value={formData.tds.permissibleLimit}
                onChange={e =>
                  setFormData({
                    ...formData,
                    tds: { ...formData.tds, permissibleLimit: Number(e.target.value) }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Default: 2000 mg/L (Trigger for Reject)
              </span>
            </div>

            {/* Turbidity */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                Turbidity Acceptable Limit (NTU)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.turbidity.acceptableLimit}
                onChange={e =>
                  setFormData({
                    ...formData,
                    turbidity: { ...formData.turbidity, acceptableLimit: Number(e.target.value) }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Default: 1.0 NTU
              </span>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                Turbidity Permissible Limit (NTU)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.turbidity.permissibleLimit}
                onChange={e =>
                  setFormData({
                    ...formData,
                    turbidity: { ...formData.turbidity, permissibleLimit: Number(e.target.value) }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Default: 5.0 NTU
              </span>
            </div>

            {/* pH */}
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                pH Lower Acceptable Bound
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.ph.acceptableMin}
                onChange={e =>
                  setFormData({
                    ...formData,
                    ph: { ...formData.ph, acceptableMin: Number(e.target.value) }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Default: 6.5
              </span>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                pH Upper Acceptable Bound
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.ph.acceptableMax}
                onChange={e =>
                  setFormData({
                    ...formData,
                    ph: { ...formData.ph, acceptableMax: Number(e.target.value) }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem'
                }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Default: 8.5
              </span>
            </div>
          </div>
        </div>

        {/* SIH Project Information & IoT Settings */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Server size={20} color="#0047AB" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
              Smart India Hackathon Project Metadata
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Problem Statement ID:</span>
              <div style={{ fontWeight: '800', color: '#0047AB', marginTop: '2px' }}>26040</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Organization:</span>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>Government of Jharkhand</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Department:</span>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>Higher & Technical Education</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B' }}>Category / Theme:</span>
              <div style={{ fontWeight: '800', color: '#059669', marginTop: '2px' }}>Hardware • Clean & Green Technology</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          {savedSuccess && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} />
              Thresholds successfully calibrated & deployed!
            </span>
          )}

          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={16} />
            <span>Reset BIS Defaults</span>
          </button>

          <button
            type="submit"
            className="btn-primary"
            style={{ fontSize: '0.82rem', padding: '10px 20px' }}
          >
            <Save size={16} />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
