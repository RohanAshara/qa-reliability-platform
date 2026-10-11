export interface TestRun {
  id: number;
  run_id: string;
  suite_name: string;
  status: 'passed' | 'failed' | 'running';
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  duration_ms: number;
  triggered_by: string;
  created_at: string;
}

export interface TestResult {
  id: number;
  run_id: string;
  test_title: string;
  file_path: string;
  layer: 'API' | 'Database' | 'UI' | 'Smoke' | 'Core';
  status: 'passed' | 'failed' | 'skipped';
  duration_ms: number;
  error_message: string | null;
  created_at: string;
}

export interface RunnerStatus {
  isRunning: boolean;
  currentSuite: string;
  activeRunId: string | null;
  logCount: number;
}

export interface DbMetrics {
  users: number;
  products: number;
  orders: number;
  auditLogs: number;
  testRuns: number;
}

export interface SystemHealth {
  database: string;
  targetApi: string;
  grafana: string;
  timestamp: string;
}
