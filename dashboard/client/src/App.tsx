import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { darkTheme } from './theme';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { OverviewView } from './views/OverviewView';
import { ConfigDrivenView } from './views/ConfigDrivenView';
import { UniversalCrawlerView } from './views/UniversalCrawlerView';
import { TestStudioView } from './views/TestStudioView';
import { CodeSuiteView } from './views/CodeSuiteView';
import { GrafanaTabView } from './views/GrafanaTabView';
import { ConsoleView } from './views/ConsoleView';
import {
  TestRun,
  TestResult,
  RunnerStatus,
  DbMetrics,
  SystemHealth,
  NavTab,
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [status, setStatus] = useState<RunnerStatus>({
    isRunning: false,
    currentSuite: 'idle',
    activeRunId: null,
    logCount: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [latestRun, setLatestRun] = useState<TestRun | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DbMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);

  // Refresh platform runs, tests, and database health metrics
  const refreshData = useCallback(async () => {
    try {
      const [runsRes, dbRes, healthRes] = await Promise.all([
        fetch('/api/runs'),
        fetch('/api/db-metrics'),
        fetch('/api/system-health'),
      ]);

      if (runsRes.ok) {
        const fetchedRuns: TestRun[] = await runsRes.json();
        setRuns(fetchedRuns);
        if (fetchedRuns.length > 0) {
          setLatestRun(fetchedRuns[0]);
          const detailRes = await fetch(`/api/runs/${fetchedRuns[0].run_id}`);
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

  // Poll status while tests are running
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const s: RunnerStatus = await res.json();
          setStatus(s);
          if (!s.isRunning && status.isRunning) {
            // Execution just completed, refresh telemetry
            refreshData();
          }
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, status.isRunning ? 1500 : 4000);
    return () => clearInterval(interval);
  }, [status.isRunning, refreshData]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Server-Sent Events (SSE) for Real-Time Streaming Logs
  useEffect(() => {
    const eventSource = new EventSource('/api/stream-logs');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.line) {
          setLogs((prev) => [...prev, data.line]);
        }
      } catch {
        setLogs((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect after brief backoff
      setTimeout(() => {
        // Handled on next render cycle
      }, 3000);
    };

    return () => eventSource.close();
  }, []);

  // Execution trigger handler
  const handleTriggerRun = async (
    suite: 'all' | 'smoke' | 'api' | 'database' | 'ui' | 'config' | 'crawler'
  ) => {
    try {
      setLogs((prev) => [
        ...prev,
        `\n-------------------------------------------------------------`,
        `🚀 [UI Dispatch] Launching ${suite.toUpperCase()} Suite...`,
      ]);

      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite }),
      });

      if (res.ok) {
        setStatus((prev) => ({ ...prev, isRunning: true, currentSuite: suite }));
        setActiveTab('console'); // Automatically navigate to live console to observe real-time output
      }
    } catch (err) {
      console.error('Failed to trigger test suite:', err);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070b14' }}>
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          health={health}
          status={status}
        />

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          {/* Top Bar with Suite Actions */}
          <TopNav
            status={status}
            activeTab={activeTab}
            onTriggerRun={handleTriggerRun}
          />

          {/* View Container */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3.5,
              overflowY: 'auto',
              backgroundColor: '#070b14',
            }}
          >
            {activeTab === 'overview' && (
              <OverviewView
                runs={runs}
                latestRun={latestRun}
                dbMetrics={dbMetrics}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'config' && (
              <ConfigDrivenView
                status={status}
                onRunConfigSuite={() => handleTriggerRun('config')}
              />
            )}

            {activeTab === 'crawler' && <UniversalCrawlerView />}

            {activeTab === 'studio' && <TestStudioView />}

            {activeTab === 'explorer' && <CodeSuiteView tests={tests} />}

            {activeTab === 'grafana' && <GrafanaTabView />}

            {activeTab === 'console' && (
              <ConsoleView
                logs={logs}
                status={status}
                onClearLogs={() => setLogs([])}
              />
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
