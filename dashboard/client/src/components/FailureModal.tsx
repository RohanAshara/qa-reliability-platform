import React from 'react';
import { X, CheckCircle2, AlertOctagon, Clock, FileCode, Layers } from 'lucide-react';
import { TestResult } from '../types';

interface FailureModalProps {
  test: TestResult | null;
  onClose: () => void;
}

export const FailureModal: React.FC<FailureModalProps> = ({ test, onClose }) => {
  if (!test) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {test.status === 'passed' ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <AlertOctagon size={20} color="#f43f5e" />
            )}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Test Diagnostic Report</h3>
          </div>
          <button className="btn" style={{ padding: '6px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Test Scenario Name
            </label>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>
              {test.test_title}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={12} /> Layer
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{test.layer}</div>
            </div>

            <div className="glass-panel" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Execution Duration
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{test.duration_ms} ms</div>
            </div>

            <div className="glass-panel" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileCode size={12} /> Status
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', color: test.status === 'passed' ? '#34d399' : '#f43f5e' }}>
                {test.status}
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Spec Source Location
            </label>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              {test.file_path}
            </div>
          </div>

          {test.error_message ? (
            <div>
              <label style={{ fontSize: '0.75rem', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Failure Root Cause & Stack Trace
              </label>
              <div className="code-block" style={{ marginTop: '6px' }}>
                {test.error_message}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>
                ✓ Clean execution without assertions errors or timeouts.
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '4px' }}>
                All Playwright locators resolved, HTTP contracts verified, and database invariants satisfied.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
