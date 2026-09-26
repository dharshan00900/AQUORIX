import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Droplet,
  GitFork,
  Cpu,
  AlertTriangle,
  LineChart,
  History,
  HeartPulse,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import type { ActiveNavTab, WaterStatus } from '../types/aquorix';

interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  alertCount: number;
  waterStatus: WaterStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  alertCount,
  waterStatus
}) => {
  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={19} /> },
    { id: 'live', label: 'Live Monitoring', icon: <Activity size={19} /> },
    { id: 'quality', label: 'Water Quality', icon: <Droplet size={19} /> },
    { id: 'purification', label: 'Purification', icon: <GitFork size={19} /> },
    { id: 'decision', label: 'Decision Engine', icon: <Cpu size={19} /> },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <AlertTriangle size={19} />,
      badge: alertCount > 0 ? alertCount : undefined
    },
    { id: 'analytics', label: 'Analytics', icon: <LineChart size={19} /> },
    { id: 'history', label: 'Treatment History', icon: <History size={19} /> },
    { id: 'health', label: 'System Health', icon: <HeartPulse size={19} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={19} /> }
  ];

  return (
    <aside
      style={{
        width: collapsed ? '76px' : '250px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid rgba(0, 180, 216, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 30,
        flexShrink: 0,
        height: 'calc(100vh - 72px)',
        position: 'sticky',
        top: '72px'
      }}
    >
      {/* Top: Menu Items */}
      <div style={{ padding: '16px 10px', overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: isActive
                    ? 'rgba(0, 180, 216, 0.12)'
                    : 'transparent',
                  color: isActive ? '#0047AB' : '#475569',
                  fontWeight: isActive ? '700' : '500',
                  border: isActive ? '1px solid rgba(0, 180, 216, 0.35)' : '1px solid transparent',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  position: 'relative',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer'
                }}
                title={collapsed ? item.label : undefined}
              >
                {/* Active Indicator Strip */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '3px',
                      top: '25%',
                      height: '50%',
                      width: '4px',
                      borderRadius: '4px',
                      backgroundColor: '#0047AB'
                    }}
                  />
                )}

                <div
                  style={{
                    color: isActive ? '#0047AB' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </div>

                {!collapsed && (
                  <span style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '2px 7px',
                      borderRadius: '9999px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom: System summary widget & Collapse toggle */}
      <div
        style={{
          padding: '14px',
          borderTop: '1px solid rgba(0, 180, 216, 0.15)',
          backgroundColor: '#F8FBFE'
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 180, 216, 0.25)',
              marginBottom: '10px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px'
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                PURIFICATION STATUS
              </span>
              {waterStatus === 'SAFE' ? (
                <CheckCircle2 size={15} color="#10B981" />
              ) : waterStatus === 'RE-TREAT' ? (
                <AlertCircle size={15} color="#F59E0B" />
              ) : (
                <XCircle size={15} color="#EF4444" />
              )}
            </div>

            <div
              style={{
                fontSize: '0.84rem',
                fontWeight: '800',
                color:
                  waterStatus === 'SAFE'
                    ? '#059669'
                    : waterStatus === 'RE-TREAT'
                    ? '#D97706'
                    : '#DC2626'
              }}
            >
              {waterStatus === 'SAFE' && '🟢 SAFE WATER'}
              {waterStatus === 'RE-TREAT' && '🟠 RE-TREATMENT'}
              {waterStatus === 'REJECT' && '🔴 REJECTED / UNSAFE'}
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>
              Multi-Stage IoT Membrane Cell
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: '#EDF5FB',
            color: '#0369A1',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
