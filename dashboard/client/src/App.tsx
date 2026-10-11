import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { RunControlBar } from './components/RunControlBar';
import { LiveConsole } from './components/LiveConsole';
import { TestExplorer } from './components/TestExplorer';
import { GrafanaView } from './components/GrafanaView';
import { DatabaseHealthView } from './components/DatabaseHealthView';
import { FailureModal } from './components/FailureModal';
import { TestRun, TestResult, RunnerStatus, DbMetrics, SystemHealth } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'grafana' | 'database' | 'console'>('explorer');
  const [status, setStatus] = useState<RunnerStatus>({
    isRunning: false,
    currentSuite: 'idle',
    activeRunId: null,
    logCount: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [latestRun, setLatestRun] = useState<TestRun | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DbMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  // Fetch runs and test details
  const refreshData = useCallback(async () => {
    try {
      const [runsRes, dbRes, healthRes] = await Promise.all([
        fetch('/api/runs'),
        fetch('/api/db-metrics'),
        fetch('/api/system-health'),
      ]);

      if (runsRes.ok) {
        const runs: TestRun[] = await runsRes.json();
        if (runs.length > 0) {
          setLatestRun(runs[0]);
          const detailRes = await fetch(`/api/runs/${runs[0].run_id}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            setTests(detail.tests || []);
          }
        }
      }

      if (dbRes.ok) {
        const metrics = await dbRes.json();
        setDbMetrics(metrics);
      }

      if (healthRes.ok) {
        const h = await healthRes.json();
        setHealth(h);
      }
    } catch (err) {
      console.error('Failed to refresh platform data:', err);
    }
  }, []);

  // Poll status every 2 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const s: RunnerStatus = await res.json();
          setStatus((prev) => {
            // When run finishes, refresh data
            if (prev.isRunning && !s.isRunning) {
              refreshData();
            }
            return s;
          });
        }
      } catch {}
    };

    checkStatus();
    refreshData();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Connect to SSE stream for live test execution logs
  useEffect(() => {
    const eventSource = new EventSource('/api/stream-logs');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [...prev, data.line]);
      } catch {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Handle Trigger Run
  const handleTriggerRun = async (suite: 'all' | 'smoke' | 'api' | 'database' | 'ui') => {
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite }),
      });
      if (res.ok) {
        setStatus((prev) => ({ ...prev, isRunning: true, currentSuite: suite }));
        setActiveTab('console'); // Automatically switch to console to show live execution
      }
    } catch (err) {
      console.error('Failed to trigger test suite:', err);
    }
  };

  return (
    <div className="app-container">
      <Header health={health} />

      <KpiCards latestRun={latestRun} />

      <RunControlBar
        status={status}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onTriggerRun={handleTriggerRun}
      />

      {status.isRunning && (
        <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(6, 182, 212, 0.1)', borderColor: 'var(--accent-cyan)' }}>
          <div className="status-dot online pulsing" />
          <span style={{ fontWeight: 600, color: '#22d3ee', fontSize: '0.9rem' }}>
            Live Execution in Progress: Running {status.currentSuite.toUpperCase()} Suite on Playwright Worker...
          </span>
        </div>
      )}

      {activeTab === 'explorer' && (
        <TestExplorer tests={tests} onSelectTest={setSelectedTest} />
      )}

      {activeTab === 'grafana' && <GrafanaView />}

      {activeTab === 'database' && <DatabaseHealthView metrics={dbMetrics} />}

      {activeTab === 'console' && (
        <LiveConsole logs={logs} onClear={() => setLogs([])} />
      )}

      <FailureModal test={selectedTest} onClose={() => setSelectedTest(null)} />
    </div>
  );
}

export default App;
