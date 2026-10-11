import React from 'react';
import { Activity, ShieldCheck, Database, BarChart3 } from 'lucide-react';
import { SystemHealth } from '../types';

interface HeaderProps {
  health: SystemHealth | null;
}

export const Header: React.FC<HeaderProps> = ({ health }) => {
  return (
    <header className="glass-panel header-bar">
      <div className="header-brand">
        <div className="brand-icon">
          <ShieldCheck size={24} color="#fff" />
        </div>
        <div className="brand-title">
          <h1>Enterprise QA Reliability Platform</h1>
          <div className="brand-subtitle">
            <span>Target: PostgreSQL + REST API + SwagLabs UI</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-cyan)' }}>TestOps Observability</span>
          </div>
        </div>
      </div>

      <div className="header-status-pills">
        <div className="status-pill">
          <Database size={14} color="#10b981" />
          <span>PostgreSQL: 5432</span>
          <span className={`status-dot ${health?.database === 'healthy' ? 'online pulsing' : ''}`} />
        </div>

        <div className="status-pill">
          <Activity size={14} color="#06b6d4" />
          <span>Target API: 5000</span>
          <span className="status-dot online" />
        </div>

        <div className="status-pill">
          <BarChart3 size={14} color="#8b5cf6" />
          <span>Grafana: 3001</span>
          <span className="status-dot online pulsing" />
        </div>
      </div>
    </header>
  );
};
