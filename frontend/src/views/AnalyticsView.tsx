import React, { useState } from 'react';
import type {
  TrendDataPoint,
  TimeRange,
  ParameterThresholds
} from '../types/aquorix';

interface AnalyticsViewProps {
  trendHistory: Record<string, TrendDataPoint[]>;
  thresholds: ParameterThresholds;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  trendHistory,
  thresholds
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('24h');
  const [activeParam, setActiveParam] = useState<'tds' | 'turbidity' | 'ph' | 'flow' | 'temp'>('tds');
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);

  const currentPoints = trendHistory[selectedRange] || [];

  // Helper to build SVG paths
  const renderLineChart = () => {
    if (currentPoints.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    let getValRaw: (d: TrendDataPoint) => number;
    let getValFinal: (d: TrendDataPoint) => number;
    let unit = '';
    let acceptableLimit: number | null = null;
    let permissibleLimit: number | null = null;
    let yMin = 0;
    let yMax = 100;

    switch (activeParam) {
      case 'tds':
        getValRaw = d => d.rawTds;
        getValFinal = d => d.finalTds;
        unit = 'mg/L';
        acceptableLimit = thresholds.tds.acceptableLimit; // 500
        permissibleLimit = thresholds.tds.permissibleLimit; // 2000
        yMin = 0;
        yMax = 2200;
        break;
      case 'turbidity':
        getValRaw = d => d.rawTurbidity;
        getValFinal = d => d.finalTurbidity;
        unit = 'NTU';
        acceptableLimit = thresholds.turbidity.acceptableLimit; // 1.0
        permissibleLimit = thresholds.turbidity.permissibleLimit; // 5.0
        yMin = 0;
        yMax = 25;
        break;
      case 'ph':
        getValRaw = d => d.rawPh;
        getValFinal = d => d.finalPh;
        unit = 'pH';
        acceptableLimit = 8.5;
        permissibleLimit = 6.5; // used as min acceptable
        yMin = 4.0;
        yMax = 9.5;
        break;
      case 'temp':
        getValRaw = d => d.rawTemperature;
        getValFinal = d => d.finalTemperature;
        unit = '°C';
        yMin = 15;
        yMax = 40;
        break;
      case 'flow':
        getValRaw = d => d.flowRate;
        getValFinal = d => d.flowRate;
        unit = 'L/min';
        yMin = 0;
        yMax = 8;
        break;
    }

    const scaleX = (index: number) => padding.left + (index / (currentPoints.length - 1)) * chartWidth;
    const scaleY = (val: number) => padding.top + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;

    // Generate Path Data
    const rawPath = currentPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(getValRaw(p))}`)
      .join(' ');

    const finalPath = currentPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(getValFinal(p))}`)
      .join(' ');

    const acceptableY = acceptableLimit !== null ? scaleY(acceptableLimit) : null;
    const permissibleY = permissibleLimit !== null ? scaleY(permissibleLimit) : null;

    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding.top + chartHeight * ratio;
            const val = yMax - (ratio * (yMax - yMin));
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94A3B8"
                  className="mono-num"
                >
                  {val.toFixed(val < 10 ? 1 : 0)} {unit}
                </text>
              </g>
            );
          })}

          {/* Acceptable Threshold Reference Line */}
          {acceptableY !== null && (
            <g>
              <line
                x1={padding.left}
                y1={acceptableY}
                x2={width - padding.right}
                y2={acceptableY}
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={width - padding.right}
                y={acceptableY - 5}
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="#059669"
              >
                Acceptable Limit: {acceptableLimit} {unit}
              </text>
            </g>
          )}

          {/* Permissible Threshold Reference Line */}
          {permissibleY !== null && (
            <g>
              <line
                x1={padding.left}
                y1={permissibleY}
                x2={width - padding.right}
                y2={permissibleY}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={width - padding.right}
                y={permissibleY - 5}
                textAnchor="end"
                fontSize="10"
                fontWeight="700"
                fill="#D97706"
              >
                Permissible Limit: {permissibleLimit} {unit}
              </text>
            </g>
          )}

          {/* Raw Water Curve (Red/Orange) */}
          {activeParam !== 'flow' && (
            <path
              d={rawPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Final Purified Water Curve (Teal/Emerald) */}
          <path
            d={finalPath}
            fill="none"
            stroke="#00B4D8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {currentPoints.map((p, i) => {
            const cx = scaleX(i);
            const cyFinal = scaleY(getValFinal(p));
            return (
              <circle
                key={i}
                cx={cx}
                cy={cyFinal}
                r="4"
                fill="#FFFFFF"
                stroke="#0047AB"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
              />
            );
          })}

          {/* X-Axis Labels */}
          {currentPoints.map((p, i) => {
            // Show every 4th label to prevent clutter
            if (i % Math.ceil(currentPoints.length / 7) !== 0 && i !== currentPoints.length - 1) return null;
            return (
              <text
                key={i}
                x={scaleX(i)}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#64748B"
                className="mono-num"
              >
                {p.timeLabel}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '20px',
              backgroundColor: '#0F2744',
              color: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              fontSize: '0.75rem',
              lineHeight: 1.5,
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: '700', color: '#38BDF8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
              Time: {hoveredPoint.timeLabel}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '4px' }}>
              <span>Raw Intake:</span>
              <span className="mono-num" style={{ fontWeight: '700', color: '#F87171' }}>
                {activeParam === 'tds' ? hoveredPoint.rawTds : activeParam === 'turbidity' ? hoveredPoint.rawTurbidity : hoveredPoint.rawPh} {unit}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <span>Final Purified:</span>
              <span className="mono-num" style={{ fontWeight: '700', color: '#34D399' }}>
                {activeParam === 'tds' ? hoveredPoint.finalTds : activeParam === 'turbidity' ? hoveredPoint.finalTurbidity : hoveredPoint.finalPh} {unit}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A' }}>
            Historical Telemetry & Water Quality Trends
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
            Longitudinal sensor analytics comparing raw influent against purified effluent across time windows
          </p>
        </div>

        {/* Time Range Selector (Prompt Section 19: 1h, 6h, 24h, 7d, 30d) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
          {(['1h', '6h', '24h', '7d', '30d'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setSelectedRange(r)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: selectedRange === r ? '#0047AB' : 'transparent',
                color: selectedRange === r ? '#FFFFFF' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'tds', label: 'TDS vs Time (mg/L)' },
          { id: 'turbidity', label: 'Turbidity vs Time (NTU)' },
          { id: 'ph', label: 'pH vs Time' },
          { id: 'flow', label: 'Flow Rate vs Time (L/min)' },
          { id: 'temp', label: 'Temperature vs Time (°C)' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setActiveParam(p.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: activeParam === p.id ? '#0F2744' : '#FFFFFF',
              color: activeParam === p.id ? '#FFFFFF' : '#475569',
              border: `1px solid ${activeParam === p.id ? '#0F2744' : '#E2E8F0'}`,
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
              {activeParam === 'tds'
                ? 'Total Dissolved Solids (TDS) Trajectory'
                : activeParam === 'turbidity'
                ? 'Turbidity Optical Density Trajectory'
                : activeParam === 'ph'
                ? 'pH Acidity / Alkalinity Buffer Trend'
                : activeParam === 'flow'
                ? 'Purification Volumetric Flow Rate'
                : 'Thermal Fluid Stability Profile'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.74rem' }}>
              {activeParam !== 'flow' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', backgroundColor: '#EF4444', borderRadius: '2px' }} />
                  <span style={{ color: '#475569', fontWeight: '600' }}>Raw Influent</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '3px', backgroundColor: '#00B4D8', borderRadius: '2px' }} />
                <span style={{ color: '#475569', fontWeight: '600' }}>Final Purified Permeate</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
            Window: <strong>{selectedRange.toUpperCase()}</strong> • Sampling Interval: <strong>Adaptive</strong>
          </div>
        </div>

        {renderLineChart()}
      </div>
    </div>
  );
};
