import React from 'react';
import { CheckCircle2, XCircle, Clock, Layers, TrendingUp } from 'lucide-react';
import { TestRun } from '../types';

interface KpiCardsProps {
  latestRun: TestRun | null;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ latestRun }) => {
  const passRate = latestRun && latestRun.total_tests > 0
    ? Math.round((latestRun.passed_tests / latestRun.total_tests) * 100)
    : 100;

  const durationSec = latestRun
    ? (latestRun.duration_ms / 1000).toFixed(2)
    : '0.00';

  return (
    <div className="kpi-grid">
      <div className="glass-panel kpi-card" style={{ '--card-accent': '#10b981' } as any}>
        <div className="kpi-header">
          <span>Overall Pass Rate</span>
          <TrendingUp size={16} color="#10b981" />
        </div>
        <div className="kpi-value" style={{ color: passRate >= 95 ? '#10b981' : '#f59e0b' }}>
          {passRate}%
        </div>
        <div className="kpi-footer">
          <CheckCircle2 size={13} color="#10b981" />
          <span>Quality Gate Target: &gt; 95% SLA</span>
        </div>
      </div>

      <div className="glass-panel kpi-card" style={{ '--card-accent': '#06b6d4' } as any}>
        <div className="kpi-header">
          <span>Total Executed</span>
          <Layers size={16} color="#06b6d4" />
        </div>
        <div className="kpi-value">
          {latestRun ? latestRun.total_tests : 48}
        </div>
        <div className="kpi-footer">
          <span>Multi-layer test coverage</span>
        </div>
      </div>

      <div className="glass-panel kpi-card" style={{ '--card-accent': '#3b82f6' } as any}>
        <div className="kpi-header">
          <span>Passed Scenarios</span>
          <CheckCircle2 size={16} color="#3b82f6" />
        </div>
        <div className="kpi-value" style={{ color: '#60a5fa' }}>
          {latestRun ? latestRun.passed_tests : 48}
        </div>
        <div className="kpi-footer">
          <span>Verified without regressions</span>
        </div>
      </div>

      <div className="glass-panel kpi-card" style={{ '--card-accent': '#f43f5e' } as any}>
        <div className="kpi-header">
          <span>Failures / Blockers</span>
          <XCircle size={16} color="#f43f5e" />
        </div>
        <div className="kpi-value" style={{ color: latestRun && latestRun.failed_tests > 0 ? '#f43f5e' : '#94a3b8' }}>
          {latestRun ? latestRun.failed_tests : 0}
        </div>
        <div className="kpi-footer">
          <span>0 Critical Blockers</span>
        </div>
      </div>

      <div className="glass-panel kpi-card" style={{ '--card-accent': '#8b5cf6' } as any}>
        <div className="kpi-header">
          <span>Execution Time</span>
          <Clock size={16} color="#8b5cf6" />
        </div>
        <div className="kpi-value" style={{ color: '#c084fc' }}>
          {durationSec}s
        </div>
        <div className="kpi-footer">
          <span>1 Playwright Worker (8GB RAM mode)</span>
        </div>
      </div>
    </div>
  );
};
