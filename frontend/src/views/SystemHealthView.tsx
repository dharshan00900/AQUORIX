import React from 'react';
import type {
  FilterHealthItem,
  IoTStatus,
  ActuatorControl
} from '../types/aquorix';
import {
  Filter,
  Zap,
  Radio
} from 'lucide-react';

interface SystemHealthProps {
  filters: FilterHealthItem[];
  iotStatus: IoTStatus;
  actuators: ActuatorControl[];
}

export const SystemHealthView: React.FC<SystemHealthProps> = ({
  filters,
  iotStatus,
  actuators
}) => {
  const uvActuator = actuators.find(a => a.id === 'uv_module');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
          Equipment Diagnostics & Hardware Health
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
          Predictive maintenance metrics, membrane pressure drops, germicidal UV life, and IoT gateway connectivity
        </p>
      </div>

      {/* FILTER & RO MEMBRANE HEALTH (Prompt Section 22) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} color="#0047AB" />
            <h2 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0F172A' }}>
              Filter Media & RO/NF Membrane Health Status
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
            Differential pressure monitoring across depth filtration elements and reverse osmosis modules
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {filters.map(f => {
            const isWarn = f.status === 'MAINTENANCE SOON';
            const hoursRatio = Math.min(100, Math.round((f.operatingHours / f.maxRecommendedHours) * 100));

            return (
              <div
                key={f.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${isWarn ? '#FDE68A' : '#E2E8F0'}`,
                  boxShadow: '0 2px 8px rgba(10, 37, 64, 0.04)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      color: '#0047AB',
                      backgroundColor: 'rgba(0, 71, 171, 0.08)',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {f.type}
                  </span>
                  <span
                    className={`badge ${isWarn ? 'badge-warning' : 'badge-safe'}`}
                  >
                    {f.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A' }}>
                  {f.fullName}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Operating Hours:</span>
                    <span className="mono-num" style={{ fontWeight: '700' }}>
                      {f.operatingHours} / {f.maxRecommendedHours} hrs
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Inlet Pressure:</span>
                    <span className="mono-num" style={{ fontWeight: '700' }}>
                      {f.inletPressureBar.toFixed(1)} bar
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Differential ΔP:</span>
                    <span className="mono-num" style={{ fontWeight: '700', color: f.differentialPressureBar > 0.3 ? '#D97706' : '#059669' }}>
                      {f.differentialPressureBar.toFixed(1)} bar
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Next Inspection:</span>
                    <span style={{ fontWeight: '600', color: '#0284C7' }}>{f.replacementDate}</span>
                  </div>
                </div>

                {/* Lifetime bar */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B', marginBottom: '3px' }}>
                    <span>Media Consumption</span>
                    <span className="mono-num" style={{ fontWeight: '700' }}>{hoursRatio}%</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${hoursRatio}%`,
                        backgroundColor: hoursRatio > 80 ? '#F59E0B' : '#10B981',
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UV-C MONITORING & GERMICIDAL STATUS (Prompt Section 23) */}
      <div
        className="glass-card"
        style={{
          padding: '24px',
          borderLeft: '5px solid #7C3AED',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 243, 255, 0.8) 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#F5F3FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#7C3AED', letterSpacing: '0.04em' }}>
                MICROBIAL PATHOGEN CONTROL
              </span>
              <h2 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0F172A' }}>
                UV-C Germicidal Disinfection Subsystem
              </h2>
            </div>
          </div>

          <span
            className={`badge ${uvActuator?.state === 'ON' ? 'badge-safe' : 'badge-danger'}`}
          >
            {uvActuator?.state === 'ON' ? 'UV-C ACTIVE (254nm)' : 'UV-C UNPOWERED'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px'
          }}
        >
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>BALLAST POWER</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: uvActuator?.state === 'ON' ? '#059669' : '#DC2626' }}>
              {uvActuator?.state === 'ON' ? '45 Watts (Active)' : '0 Watts (OFF)'}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Electronic high-frequency ballast</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>GERMICIDAL INTENSITY</div>
            <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#7C3AED' }}>
              {uvActuator?.state === 'ON' ? '42 mJ/cm²' : '0 mJ/cm²'}
            </div>
            <span style={{ fontSize: '0.68rem', color: '#059669' }}>Exceeds 30 mJ NSF-55 Standard</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>OPERATING HOURS</div>
            <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
              842 / 9,000 hrs
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>90.6% quartz tube life remaining</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>DISINFECTION RATE</div>
            <div className="mono-num" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
              99.99% Log-4
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>E. Coli & Cryptosporidium kill</span>
          </div>
        </div>
      </div>

      {/* IoT CONNECTIVITY DIAGNOSTICS (Prompt Section 24) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={20} color="#00B4D8" />
            <h2 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#0F172A' }}>
              ESP32 Telemetry Gateway & Network Diagnostics
            </h2>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
            Cellular 4G LTE / Wi-Fi fallback transport parameters connecting Jharkhand rural node to Cloud
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}
        >
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>MICROCONTROLLER</span>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
              ESP32-WROOM-32D
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>
              Firmware: <strong>{iotStatus.firmwareVersion}</strong>
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>CARRIER SIGNAL RSSI</span>
            <div className="mono-num" style={{ fontSize: '1.05rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
              {iotStatus.signalRssi} dBm
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
              Airtel 4G LTE Jharkhand Circle
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>MQTT BROKER</span>
            <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0284C7', marginTop: '2px', wordBreak: 'break-all' }}>
              AWS IoT Core (TLS 1.3)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>
              MQTTS Port 8883 • Keep-Alive 30s
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>PACKET LOSS RATE</span>
            <div className="mono-num" style={{ fontSize: '1.05rem', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
              {iotStatus.packetLossPercent}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
              {iotStatus.packetsReceived} packets ingested
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
