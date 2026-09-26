import React, { useState } from 'react';
import type {
  AlertNotification
} from '../types/aquorix';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Check,
  Trash2
} from 'lucide-react';

interface AlertsCenterViewProps {
  alerts: AlertNotification[];
  onAcknowledge: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({
  alerts,
  onAcknowledge,
  onClearAll
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'WATER_QUALITY' | 'EQUIPMENT_TREATMENT' | 'IOT_SYSTEM'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  const filteredAlerts = alerts.filter(a => {
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
            System Alerts & Diagnostics Command Center
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Automated threshold violation telemetry partitioned by Water Quality and Physical Equipment
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onClearAll}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={15} />
            <span>Clear Resolved Alerts</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="glass-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>CATEGORY:</span>
          {(['ALL', 'WATER_QUALITY', 'EQUIPMENT_TREATMENT', 'IOT_SYSTEM'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: filterType === type ? 'rgba(0, 71, 171, 0.12)' : '#FFFFFF',
                color: filterType === type ? '#0047AB' : '#64748B',
                border: filterType === type ? '1px solid rgba(0, 71, 171, 0.3)' : '1px solid #E2E8F0',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {type === 'ALL'
                ? 'All Alerts'
                : type === 'WATER_QUALITY'
                ? 'Water Quality'
                : type === 'EQUIPMENT_TREATMENT'
                ? 'Equipment & Stage'
                : 'IoT Telemetry'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>SEVERITY:</span>
          {(['ALL', 'CRITICAL', 'WARNING'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: filterSeverity === sev ? '#0F172A' : '#FFFFFF',
                color: filterSeverity === sev ? '#FFFFFF' : '#64748B',
                border: '1px solid #CBD5E1',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#64748B'
            }}
          >
            <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#059669' }}>
              No Active Alerts in this Category
            </h2>
            <p style={{ fontSize: '0.8rem', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0' }}>
              System sensors report nominal operating ranges. No threshold exceptions or hardware faults active.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alt => {
            const isCrit = alt.severity === 'CRITICAL';
            return (
              <div
                key={alt.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  borderLeft: `5px solid ${isCrit ? '#EF4444' : '#F59E0B'}`,
                  backgroundColor: isCrit ? '#FFFDFD' : '#FFFEFA'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: isCrit ? '#FEF2F2' : '#FFFBEB',
                        color: isCrit ? '#DC2626' : '#D97706',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isCrit ? <AlertOctagon size={22} /> : <AlertTriangle size={22} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: isCrit ? '#FEF2F2' : '#FFFBEB',
                            color: isCrit ? '#DC2626' : '#D97706',
                            border: `1px solid ${isCrit ? '#FECACA' : '#FDE68A'}`
                          }}
                        >
                          {alt.severity}
                        </span>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            color: '#64748B',
                            backgroundColor: '#F1F5F9',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {alt.type === 'WATER_QUALITY' ? 'Water Quality Alert' : 'Treatment Hardware Alert'}
                        </span>

                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{alt.timestamp}</span>
                      </div>

                      <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>
                        {alt.title}
                      </h2>

                      <p style={{ fontSize: '0.82rem', color: '#334155', marginTop: '4px' }}>
                        {alt.message}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          marginTop: '10px',
                          fontSize: '0.78rem',
                          backgroundColor: '#F8FAFC',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          flexWrap: 'wrap'
                        }}
                      >
                        {alt.parameter && (
                          <div>
                            <span style={{ color: '#64748B' }}>Parameter: </span>
                            <strong>{alt.parameter}</strong>
                          </div>
                        )}
                        {alt.currentValue && (
                          <div>
                            <span style={{ color: '#64748B' }}>Reading: </span>
                            <span className="mono-num" style={{ fontWeight: '800', color: isCrit ? '#DC2626' : '#D97706' }}>
                              {alt.currentValue}
                            </span>
                          </div>
                        )}
                        {alt.threshold && (
                          <div>
                            <span style={{ color: '#64748B' }}>Safe Limit: </span>
                            <span className="mono-num">{alt.threshold}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#0047AB', fontWeight: '600' }}>
                        <strong>Required Action: </strong>
                        <span>{alt.recommendedAction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {alt.acknowledged ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color: '#059669',
                          backgroundColor: '#ECFDF5',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid #A7F3D0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={14} />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => onAcknowledge(alt.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          color: '#0284C7',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={14} />
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
