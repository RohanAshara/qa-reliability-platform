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
  layer: 'API' | 'Database' | 'UI' | 'Smoke' | 'Config' | 'Crawler' | 'Core';
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

export interface WebTarget {
  id: string;
  name: string;
  url: string;
  expectedTitle?: string;
  slaBudgetMs: number;
  checkSsl: boolean;
  enabled: boolean;
}

export interface CrawlerBrokenLink {
  href: string;
  text: string;
  status: number;
  isBroken: boolean;
  error?: string;
  durationMs: number;
}

export interface CrawlerReport {
  url: string;
  title: string;
  httpStatus: number;
  durationMs: number;
  slaBudgetMs: number;
  slaPassed: boolean;
  loadError: string | null;
  overallHealthy: boolean;
  metrics: {
    totalLinksScanned: number;
    brokenLinksCount: number;
    consoleErrorsCount: number;
    networkFailuresCount: number;
  };
  brokenLinks: CrawlerBrokenLink[];
  allLinks: CrawlerBrokenLink[];
  consoleErrors: Array<{ text: string; location: string }>;
  networkFailures: Array<{ url: string; failure: string }>;
  screenshotBase64: string | null;
  auditedAt: string;
}

export interface GeneratedTest {
  filename: string;
  sizeBytes: number;
  updatedAt: string;
}

export type NavTab =
  | 'overview'
  | 'config'
  | 'crawler'
  | 'studio'
  | 'explorer'
  | 'grafana'
  | 'console';
