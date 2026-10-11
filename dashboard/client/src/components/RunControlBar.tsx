import React from 'react';
import { Play, Flame, Globe, Database, Monitor, BarChart3, Terminal, Layers } from 'lucide-react';
import { RunnerStatus } from '../types';

interface RunControlBarProps {
  status: RunnerStatus;
  activeTab: 'explorer' | 'grafana' | 'database' | 'console';
  onSelectTab: (tab: 'explorer' | 'grafana' | 'database' | 'console') => void;
  onTriggerRun: (suite: 'all' | 'smoke' | 'api' | 'database' | 'ui') => void;
}

export const RunControlBar: React.FC<RunControlBarProps> = ({
  status,
  activeTab,
  onSelectTab,
  onTriggerRun,
}) => {
  return (
    <div className="glass-panel control-bar">
      <div className="suite-buttons-group">
        <button
          className="btn btn-primary"
          disabled={status.isRunning}
          onClick={() => onTriggerRun('all')}
        >
          <Play size={15} fill="#fff" />
          <span>{status.isRunning ? 'Executing Suite...' : 'Run All (48 Tests)'}</span>
        </button>

        <button
          className="btn"
          disabled={status.isRunning}
          onClick={() => onTriggerRun('smoke')}
        >
          <Flame size={15} color="#f59e0b" />
          <span>Smoke Suite</span>
        </button>

        <button
          className="btn"
          disabled={status.isRunning}
          onClick={() => onTriggerRun('api')}
        >
          <Globe size={15} color="#3b82f6" />
          <span>API Suite</span>
        </button>

        <button
          className="btn"
          disabled={status.isRunning}
          onClick={() => onTriggerRun('database')}
        >
          <Database size={15} color="#8b5cf6" />
          <span>Database Suite</span>
        </button>

        <button
          className="btn"
          disabled={status.isRunning}
          onClick={() => onTriggerRun('ui')}
        >
          <Monitor size={15} color="#06b6d4" />
          <span>UI & E2E Suite</span>
        </button>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => onSelectTab('explorer')}
        >
          <Layers size={14} />
          <span>Test Explorer</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'grafana' ? 'active' : ''}`}
          onClick={() => onSelectTab('grafana')}
        >
          <BarChart3 size={14} color="#8b5cf6" />
          <span>Grafana Dashboard</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => onSelectTab('database')}
        >
          <Database size={14} color="#10b981" />
          <span>DB Integrity</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'console' ? 'active' : ''}`}
          onClick={() => onSelectTab('console')}
        >
          <Terminal size={14} />
          <span>Live Logs ({status.logCount})</span>
        </button>
      </div>
    </div>
  );
};
