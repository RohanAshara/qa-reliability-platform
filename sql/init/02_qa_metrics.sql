-- ============================================================
-- QA Platform Metrics & TestOps Observability Schema
-- Stores test execution runs and individual test results
-- for Grafana analytics and real-time dashboard visualizations
-- ============================================================

CREATE TABLE IF NOT EXISTS test_runs (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(100) UNIQUE NOT NULL,
    suite_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'passed', 'failed', 'running'
    total_tests INTEGER NOT NULL DEFAULT 0,
    passed_tests INTEGER NOT NULL DEFAULT 0,
    failed_tests INTEGER NOT NULL DEFAULT 0,
    skipped_tests INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    triggered_by VARCHAR(100) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_results (
    id BIGSERIAL PRIMARY KEY,
    run_id VARCHAR(100) REFERENCES test_runs(run_id) ON DELETE CASCADE,
    test_title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    layer VARCHAR(50) NOT NULL, -- 'API', 'Database', 'UI', 'Smoke'
    status VARCHAR(50) NOT NULL, -- 'passed', 'failed', 'skipped'
    duration_ms INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for rapid Grafana queries
CREATE INDEX IF NOT EXISTS idx_test_runs_created_at ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_results_layer ON test_results(layer);
