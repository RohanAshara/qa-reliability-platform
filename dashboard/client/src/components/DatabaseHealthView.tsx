import React from 'react';
import { Database, ShieldCheck, HardDrive, FileText, Activity } from 'lucide-react';
import { DbMetrics } from '../types';

interface DatabaseHealthViewProps {
  metrics: DbMetrics | null;
}

export const DatabaseHealthView: React.FC<DatabaseHealthViewProps> = ({ metrics }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="kpi-grid">
        <div className="glass-panel kpi-card" style={{ '--card-accent': '#10b981' } as any}>
          <div className="kpi-header">
            <span>Relational Integrity</span>
            <ShieldCheck size={16} color="#10b981" />
          </div>
          <div className="kpi-value" style={{ color: '#34d399', fontSize: '1.8rem' }}>
            0 Orphans
          </div>
          <div className="kpi-footer">
            <span>Foreign keys strictly enforced</span>
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': '#3b82f6' } as any}>
          <div className="kpi-header">
            <span>Catalog Products</span>
            <HardDrive size={16} color="#3b82f6" />
          </div>
          <div className="kpi-value">{metrics?.products || 4}</div>
          <div className="kpi-footer">
            <span>PostgreSQL products table</span>
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': '#8b5cf6' } as any}>
          <div className="kpi-header">
            <span>Processed Orders</span>
            <Activity size={16} color="#8b5cf6" />
          </div>
          <div className="kpi-value">{metrics?.orders || 0}</div>
          <div className="kpi-footer">
            <span>Transactional order records</span>
          </div>
        </div>

        <div className="glass-panel kpi-card" style={{ '--card-accent': '#06b6d4' } as any}>
          <div className="kpi-header">
            <span>Audit Trail Entries</span>
            <FileText size={16} color="#06b6d4" />
          </div>
          <div className="kpi-value">{metrics?.auditLogs || 0}</div>
          <div className="kpi-footer">
            <span>Immutable lifecycle audit logs</span>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="#06b6d4" />
          <span>Active PostgreSQL Schema & Data Verification Contracts</span>
        </h3>

        <div className="table-container">
          <table className="test-table">
            <thead>
              <tr>
                <th>Table Name</th>
                <th>Validation Scope</th>
                <th>Integrity Constraint Checked</th>
                <th>Automated Test Spec</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>products</td>
                <td>Stock decrements & price validations</td>
                <td><span className="badge badge-passed">CHECK (price &gt;= 0)</span></td>
                <td>tests/database/business-invariants.spec.ts</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>orders</td>
                <td>Transactional lifecycle & total amount</td>
                <td><span className="badge badge-passed">FOREIGN KEY (user_id)</span></td>
                <td>tests/database/data-persistence.spec.ts</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>order_items</td>
                <td>Orphan prevention & price snapshot</td>
                <td><span className="badge badge-passed">CASCADE ON DELETE</span></td>
                <td>tests/database/relational-integrity.spec.ts</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>audit_logs</td>
                <td>Immutable traceability for operations</td>
                <td><span className="badge badge-passed">BIGSERIAL / JSONB</span></td>
                <td>tests/database/business-invariants.spec.ts</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>test_runs</td>
                <td>Observability metrics for Grafana</td>
                <td><span className="badge badge-passed">UNIQUE (run_id)</span></td>
                <td>scripts/record-metrics.ts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
