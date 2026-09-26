import React from 'react';
import { X, Bell, CheckCheck, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import type { SystemNotification } from '../types/aquorix';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 90,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 32px rgba(10, 37, 64, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FBFE'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 180, 216, 0.15)',
                color: '#0047AB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                System Notifications
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                AQUORIX Event & Telemetry Logs
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onMarkAllRead}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                fontSize: '0.72rem',
                fontWeight: '600',
                color: '#0369A1',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Mark all</span>
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px',
                borderRadius: '6px',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {notifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#94A3B8'
              }}
            >
              <Bell size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#64748B' }}>
                No active notifications
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                All IoT telemetry messages acknowledged.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.map(n => {
                const getIcon = () => {
                  switch (n.severity) {
                    case 'danger':
                      return <AlertCircle size={16} color="#DC2626" />;
                    case 'warning':
                      return <AlertTriangle size={16} color="#D97706" />;
                    case 'success':
                      return <CheckCheck size={16} color="#059669" />;
                    default:
                      return <Info size={16} color="#0284C7" />;
                  }
                };

                return (
                  <div
                    key={n.id}
                    onClick={() => onMarkRead(n.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: n.read ? '#FFFFFF' : '#F0F9FF',
                      border: `1px solid ${n.read ? '#E2E8F0' : '#BAE6FD'}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon()}</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          color: '#1E293B',
                          fontWeight: n.read ? '500' : '700',
                          lineHeight: 1.4
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#94A3B8',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{n.timestamp}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{n.type}</span>
                        {!n.read && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#0284C7'
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
