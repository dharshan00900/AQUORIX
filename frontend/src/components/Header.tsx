import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Wifi,
  WifiOff,
  Bell,
  User,
  Cpu,
  Sparkles
} from 'lucide-react';
import type { IoTStatus, DecisionResult } from '../types/aquorix';

interface HeaderProps {
  iotStatus: IoTStatus;
  decision: DecisionResult;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  iotStatus,
  decision,
  isDemoMode,
  onToggleDemoMode,
  onOpenNotifications,
  unreadCount
}) => {
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: '26 Sep 2026',
    timeStr: '09:42:18 PM'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime({
        dateStr: now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        timeStr: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = iotStatus.esp32 === 'CONNECTED';

  return (
    <header
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 180, 216, 0.2)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 4px 20px rgba(10, 37, 64, 0.04)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Branding & SIH info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Logo Mark */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0A192F 0%, #0047AB 50%, #00D2FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(0, 71, 171, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 60%)',
                animation: 'dropletFloat 4s ease-in-out infinite'
              }}
            />
            <Droplets size={26} color="#FFFFFF" strokeWidth={2.2} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #0A192F 0%, #0047AB 70%, #00B4D8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                AQUORIX
              </span>
              <span
                style={{
                  background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  letterSpacing: '0.04em'
                }}
              >
                SIH 26040
              </span>
              <span
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  padding: '2px 7px',
                  borderRadius: '6px'
                }}
              >
                Govt. of Jharkhand
              </span>
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Smart Water Monitoring System</span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <span style={{ color: '#0369A1', fontWeight: '500' }}>
                Jharkhand • Rural / Mining-Affected Zone
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: System connection, time, status & quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* IoT Connection Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: isOnline ? 'var(--status-safe-bg)' : 'var(--status-danger-bg)',
              border: `1px solid ${isOnline ? 'var(--status-safe-border)' : 'var(--status-danger-border)'}`,
              fontSize: '0.78rem',
              fontWeight: '600',
              color: isOnline ? 'var(--status-safe)' : 'var(--status-danger)'
            }}
          >
            {isOnline ? (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-safe)',
                  boxShadow: '0 0 8px var(--status-safe)'
                }}
              />
            ) : (
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-danger)'
                }}
              />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isOnline ? 'IoT ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>

          {/* Date, Time & Last updated counter */}
          <div
            style={{
              padding: '5px 12px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'right',
              fontSize: '0.78rem'
            }}
          >
            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentDateTime.dateStr} •{' '}
              <span className="mono-num" style={{ color: 'var(--color-ocean-blue)' }}>
                {currentDateTime.timeStr}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Last updated{' '}
              <span className="mono-num" style={{ fontWeight: '600', color: '#0284C7' }}>
                {iotStatus.secondsSinceLastUpdate}s
              </span>{' '}
              ago
            </div>
          </div>

          {/* Compact System Status Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
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
              fontSize: '0.75rem',
              fontWeight: '700',
              color:
                decision.decision === 'SAFE'
                  ? '#059669'
                  : decision.decision === 'RE-TREAT'
                  ? '#D97706'
                  : '#DC2626'
            }}
          >
            <Cpu size={14} />
            <span>
              {decision.decision === 'SAFE'
                ? 'SYSTEM OPERATIONAL'
                : decision.decision === 'RE-TREAT'
                ? 'RECIRCULATION ACTIVE'
                : 'INTERLOCK ENGAGED'}
            </span>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={onToggleDemoMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: isDemoMode ? '#EFF6FF' : '#F8FAFC',
              border: `1px solid ${isDemoMode ? '#93C5FD' : '#E2E8F0'}`,
              color: isDemoMode ? '#1D4ED8' : '#64748B',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Toggle SIH Interactive Simulation Mode"
          >
            <Sparkles size={14} color={isDemoMode ? '#2563EB' : '#94A3B8'} />
            <span>DEMO MODE</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isDemoMode ? '#10B981' : '#CBD5E1'
              }}
            />
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.2s'
            }}
            title="View Real-Time System Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User/Operator Profile */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 6px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0'
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#E0F2FE',
                color: '#0369A1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={16} />
            </div>
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                SIH Operator
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                Jharkhand Unit #04
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
