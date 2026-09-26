import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  consequences: string[];
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  consequences,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(10, 25, 47, 0.3)',
          overflow: 'hidden',
          animation: 'waterPulse 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: isDestructive ? '#FEF2F2' : '#F0F9FF',
            borderBottom: `1px solid ${isDestructive ? '#FECACA' : '#BAE6FD'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: isDestructive ? '#FEE2E2' : '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDestructive ? '#DC2626' : '#0284C7'
              }}
            >
              {isDestructive ? <AlertTriangle size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A' }}>
                {title}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                Hardware Safety Interlock Confirmation
              </span>
            </div>
          </div>

          <button
            onClick={onCancel}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#64748B',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.88rem', color: '#334155', marginBottom: '14px', lineHeight: 1.5 }}>
            {message}
          </p>

          {consequences && consequences.length > 0 && (
            <div
              style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#475569',
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}
              >
                Expected System Impact:
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                {consequences.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button
              onClick={onCancel}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: isDestructive ? '#DC2626' : '#0284C7',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: '700',
                boxShadow: isDestructive
                  ? '0 4px 12px rgba(220, 38, 38, 0.3)'
                  : '0 4px 12px rgba(2, 132, 199, 0.3)',
                cursor: 'pointer'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
