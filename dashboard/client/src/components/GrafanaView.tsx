import React, { useState } from 'react';
import { ExternalLink, RefreshCw, BarChart3, AlertCircle } from 'lucide-react';

export const GrafanaView: React.FC = () => {
  const [iframeKey, setIframeKey] = useState(Date.now());
  const grafanaUrl = 'http://localhost:3001/d/qa-platform-main?orgId=1&kiosk=tv';

  const handleRefresh = () => {
    setIframeKey(Date.now());
  };

  return (
    <div className="grafana-container glass-panel">
      <div className="grafana-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={18} color="#8b5cf6" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            Grafana TestOps Analytics & Observability Center
          </span>
          <span className="badge badge-layer-db">Live PostgreSQL Connection</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn" onClick={handleRefresh}>
            <RefreshCw size={13} />
            <span>Refresh Panels</span>
          </button>

          <a
            href="http://localhost:3001/d/qa-platform-main"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>Open in Fullscreen Grafana</span>
          </a>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          key={iframeKey}
          src={grafanaUrl}
          className="grafana-iframe"
          title="Grafana QA Platform Dashboard"
          onError={() => console.error('Grafana iframe loading error')}
        />
      </div>

      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          Grafana Service: <strong style={{ color: '#fff' }}>http://localhost:3001</strong> (DataSource: PostgreSQL <code>qa_db</code>)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} color="#06b6d4" /> Auto-refreshes metrics every 5 seconds
        </span>
      </div>
    </div>
  );
};
