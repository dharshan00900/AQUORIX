import React, { useState } from 'react';
import type { TreatmentHistoryRecord } from '../types/aquorix';
import {
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface TreatmentHistoryProps {
  history: TreatmentHistoryRecord[];
}

export const TreatmentHistoryView: React.FC<TreatmentHistoryProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'Completed' | 'Recirculated' | 'Rejected'>('ALL');

  const filtered = history.filter(h => {
    if (decisionFilter !== 'ALL' && h.treatmentDecision !== decisionFilter) return false;
    if (searchTerm) {
      const match =
        h.actionTaken.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.date.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = 'Date,Time,Raw Status,Final Status,Decision,TDS Reduction %,Turbidity Reduction %,Duration (min),Volume (L),Action Taken,Operator\n';
    const rows = filtered
      .map(
        h =>
          `"${h.date}","${h.time}","${h.rawWaterStatus}","${h.finalWaterStatus}","${h.treatmentDecision}","${h.tdsReductionPercent}%","${h.turbidityReductionPercent}%","${h.durationMinutes}","${h.waterVolumeLitres}","${h.actionTaken}","${h.operator}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aquorix_treatment_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
            Purification Batch Treatment Log & Audit Trail
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Historical record of every water purification cycle, efficiency reductions, and regulatory actions
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="btn-primary"
          style={{ fontSize: '0.78rem', padding: '8px 16px' }}
        >
          <FileSpreadsheet size={16} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by action, operator, or date..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.84rem',
              width: '100%',
              color: '#0F172A'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>DECISION:</span>
          {(['ALL', 'Completed', 'Recirculated', 'Rejected'] as const).map(dec => (
            <button
              key={dec}
              onClick={() => setDecisionFilter(dec)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: decisionFilter === dec ? '#0047AB' : '#FFFFFF',
                color: decisionFilter === dec ? '#FFFFFF' : '#64748B',
                border: '1px solid #CBD5E1',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {dec}
            </button>
          ))}
        </div>
      </div>

      {/* History Table (Prompt Section 20) */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FBFE', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#475569', fontWeight: '700' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>RAW STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>FINAL STATUS</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>DECISION</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: '700' }}>TDS REDUCTION</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#059669', fontWeight: '700' }}>TURB REDUCTION</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#64748B' }}>DURATION</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: '#64748B' }}>VOLUME</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B' }}>ACTION TAKEN</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap' }}>
                    {h.date} • <span className="mono-num" style={{ color: '#0047AB' }}>{h.time}</span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span className="badge badge-danger">{h.rawWaterStatus}</span>
                  </td>
                  <td style={{ padding: '14px' }}>
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
                  <td style={{ padding: '14px', fontWeight: '800' }}>
                    <span
                      style={{
                        color:
                          h.treatmentDecision === 'Completed'
                            ? '#059669'
                            : h.treatmentDecision === 'Recirculated'
                            ? '#D97706'
                            : '#DC2626'
                      }}
                    >
                      {h.treatmentDecision}
                    </span>
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                    {h.tdsReductionPercent}%
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right', fontWeight: '800', color: '#059669' }}>
                    {h.turbidityReductionPercent}%
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right' }}>
                    {h.durationMinutes} min
                  </td>
                  <td className="mono-num" style={{ padding: '14px', textAlign: 'right', fontWeight: '700' }}>
                    {h.waterVolumeLitres} L
                  </td>
                  <td style={{ padding: '14px', color: '#334155' }}>
                    <div>{h.actionTaken}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px' }}>
                      Operator: {h.operator}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
