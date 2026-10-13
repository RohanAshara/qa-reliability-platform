const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });
const { auditUrl } = require('../crawler/crawlerService');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 4000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/qa_db',
});

let isRunning = false;
let currentSuite = 'idle';
let activeRunId = null;
let currentLogs = [];
const sseClients = [];

function broadcastLog(line) {
  currentLogs.push(line);
  if (currentLogs.length > 500) currentLogs.shift();
  const data = `data: ${JSON.stringify({ line, timestamp: new Date().toISOString() })}\n\n`;
  sseClients.forEach((client) => client.write(data));
}

// -------------------------------------------------------------
// Live Log Streaming (Server-Sent Events)
// -------------------------------------------------------------
app.get('/api/stream-logs', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send historical logs for this run
  currentLogs.forEach((line) => {
    res.write(`data: ${JSON.stringify({ line, timestamp: new Date().toISOString() })}\n\n`);
  });

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// -------------------------------------------------------------
// Runner State & Execution Trigger
// -------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({
    isRunning,
    currentSuite,
    activeRunId,
    logCount: currentLogs.length,
  });
});

app.post('/api/run', async (req, res) => {
  if (isRunning) {
    return res.status(409).json({ error: 'A test run is already currently in progress' });
  }

  const { suite = 'all' } = req.body;
  isRunning = true;
  currentSuite = suite;
  activeRunId = `run-${Date.now()}`;
  currentLogs = [];

  let testArgs = ['playwright', 'test'];
  let suiteDisplayName = 'Full Suite';

  if (suite === 'smoke') {
    testArgs.push('--grep', '@smoke');
    suiteDisplayName = 'Smoke Suite';
  } else if (suite === 'api') {
    testArgs.push('tests/api');
    suiteDisplayName = 'API Contract Suite';
  } else if (suite === 'database') {
    testArgs.push('tests/database');
    suiteDisplayName = 'Database Integrity Suite';
  } else if (suite === 'ui') {
    testArgs.push('tests/ui');
    suiteDisplayName = 'UI & E2E Suite';
  } else if (suite === 'config') {
    testArgs.push('tests/config-driven');
    suiteDisplayName = 'Level 1: Config-Driven Suite';
  } else if (suite === 'crawler') {
    testArgs.push('tests/crawler');
    suiteDisplayName = 'Level 2: Universal Crawler Suite';
  }

  broadcastLog(`🚀 [TestOps] Starting ${suiteDisplayName} (Run ID: ${activeRunId})...`);

  // Respond immediately so UI can show real-time progress
  res.json({ message: 'Execution initiated', runId: activeRunId, suite: suiteDisplayName });

  const rootDir = path.resolve(__dirname, '..');
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  const runnerProcess = spawn(npxCmd, testArgs, {
    cwd: rootDir,
    env: { ...process.env, CI: 'false' },
    shell: true,
  });

  runnerProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) broadcastLog(line.trim());
    });
  });

  runnerProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) broadcastLog(`[stderr] ${line.trim()}`);
    });
  });

  runnerProcess.on('close', async (code) => {
    isRunning = false;
    broadcastLog(`🏁 [TestOps] Execution finished with exit code ${code}. Ingesting metrics...`);

    try {
      // Ingest results into PostgreSQL
      await ingestMetrics(activeRunId, suiteDisplayName);
      broadcastLog(`✅ [TestOps] Metrics successfully saved to PostgreSQL for Grafana visualization.`);
    } catch (err) {
      broadcastLog(`❌ [TestOps] Metrics ingestion error: ${err.message}`);
    }

    currentSuite = 'idle';
  });
});

async function ingestMetrics(runId, suiteName) {
  const resultsPath = path.resolve(__dirname, '../reports/results.json');
  if (!fs.existsSync(resultsPath)) return;

  const raw = fs.readFileSync(resultsPath, 'utf-8');
  const json = JSON.parse(raw);

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let totalDurationMs = 0;
  const entries = [];

  function categorizeLayer(filePath) {
    if (filePath.includes('api')) return 'API';
    if (filePath.includes('database')) return 'Database';
    if (filePath.includes('ui')) return 'UI';
    if (filePath.includes('smoke')) return 'Smoke';
    if (filePath.includes('config-driven')) return 'Config';
    if (filePath.includes('crawler')) return 'Crawler';
    return 'Core';
  }

  function traverse(suite) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          for (const result of test.results) {
            const status = result.status;
            const duration = result.duration || 0;
            totalDurationMs += duration;

            if (status === 'passed') passed++;
            else if (status === 'skipped') skipped++;
            else failed++;

            const layer = categorizeLayer(spec.file || '');
            const error =
              result.errors && result.errors.length > 0
                ? result.errors.map((e) => e.message || e.value).join('\n')
                : null;

            entries.push({
              title: spec.title || test.title,
              file: spec.file || '',
              layer,
              status: status === 'passed' ? 'passed' : status === 'skipped' ? 'skipped' : 'failed',
              durationMs: duration,
              error,
            });
          }
        }
      }
    }
    if (suite.suites) {
      for (const child of suite.suites) traverse(child);
    }
  }

  traverse(json);

  const total = passed + failed + skipped;
  const overallStatus = failed === 0 ? 'passed' : 'failed';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO test_runs (run_id, suite_name, status, total_tests, passed_tests, failed_tests, skipped_tests, duration_ms, triggered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [runId, suiteName, overallStatus, total, passed, failed, skipped, totalDurationMs, 'dashboard-ui']
    );

    for (const entry of entries) {
      await client.query(
        `INSERT INTO test_results (run_id, test_title, file_path, layer, status, duration_ms, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [runId, entry.title, entry.file, entry.layer, entry.status, entry.durationMs, entry.error]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// -------------------------------------------------------------
// Level 1: Config-Driven Targets API
// -------------------------------------------------------------
const targetsConfigPath = path.resolve(__dirname, '../config/web-targets.json');

app.get('/api/config-targets', (req, res) => {
  try {
    if (!fs.existsSync(targetsConfigPath)) {
      return res.json([]);
    }
    const data = JSON.parse(fs.readFileSync(targetsConfigPath, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config-targets', (req, res) => {
  try {
    const targets = req.body;
    fs.writeFileSync(targetsConfigPath, JSON.stringify(targets, null, 2), 'utf-8');
    res.json({ success: true, count: targets.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Level 2: Universal Web Crawler Diagnostic API
// -------------------------------------------------------------
app.post('/api/crawler/audit', async (req, res) => {
  const { url, maxLinksToCheck = 15, slaMs = 3500 } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing required field: url' });
  }

  try {
    broadcastLog(`🕷️ [Crawler Engine] Starting automated deep audit on: ${url}`);
    const report = await auditUrl(url, { maxLinksToCheck, slaMs });
    broadcastLog(
      `✅ [Crawler Engine] Completed audit for ${url}: ${report.metrics.totalLinksScanned} links scanned, ${report.metrics.brokenLinksCount} broken, ${report.metrics.consoleErrorsCount} console errors.`
    );
    res.json(report);
  } catch (err) {
    broadcastLog(`❌ [Crawler Engine] Error auditing ${url}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Level 3: Playwright Codegen Interactive Studio API
// -------------------------------------------------------------
const generatedDir = path.resolve(__dirname, '../tests/generated');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

app.post('/api/codegen/launch', (req, res) => {
  const { url = 'https://www.saucedemo.com', testName = `recorded_${Date.now()}` } = req.body;
  const cleanName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const outFile = path.join(generatedDir, `${cleanName}.spec.ts`);

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  broadcastLog(`🎥 [Codegen Studio] Launching interactive recorder for ${url} -> ${cleanName}.spec.ts`);

  const codegenProcess = spawn(npxCmd, ['playwright', 'codegen', url, '-o', outFile], {
    cwd: path.resolve(__dirname, '..'),
    detached: true,
    stdio: 'ignore',
    shell: true,
  });
  codegenProcess.unref();

  res.json({
    message: 'Playwright Codegen launched in separate window',
    outputFile: `${cleanName}.spec.ts`,
    url,
  });
});

app.get('/api/generated-tests', (req, res) => {
  try {
    if (!fs.existsSync(generatedDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(generatedDir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
    const details = files.map((filename) => {
      const fullPath = path.join(generatedDir, filename);
      const stat = fs.statSync(fullPath);
      return {
        filename,
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
      };
    });
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/generated-tests/:filename', (req, res) => {
  try {
    const filePath = path.join(generatedDir, path.basename(req.params.filename));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    res.json({ filename: req.params.filename, content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Test Run Metrics Endpoints
// -------------------------------------------------------------
app.get('/api/runs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM test_runs ORDER BY created_at DESC LIMIT 30'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/runs/:runId', async (req, res) => {
  try {
    const runRes = await pool.query('SELECT * FROM test_runs WHERE run_id = $1', [
      req.params.runId,
    ]);
    if (runRes.rows.length === 0) {
      return res.status(404).json({ error: 'Run not found' });
    }
    const testsRes = await pool.query(
      'SELECT * FROM test_results WHERE run_id = $1 ORDER BY id ASC',
      [req.params.runId]
    );

    res.json({
      run: runRes.rows[0],
      tests: testsRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/db-metrics', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int as count FROM users');
    const productsCount = await pool.query('SELECT COUNT(*)::int as count FROM products');
    const ordersCount = await pool.query('SELECT COUNT(*)::int as count FROM orders');
    const auditCount = await pool.query('SELECT COUNT(*)::int as count FROM audit_logs');
    const runsCount = await pool.query('SELECT COUNT(*)::int as count FROM test_runs');

    res.json({
      users: usersCount.rows[0].count,
      products: productsCount.rows[0].count,
      orders: ordersCount.rows[0].count,
      auditLogs: auditCount.rows[0].count,
      testRuns: runsCount.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/system-health', async (req, res) => {
  let dbOk = false;
  try {
    await pool.query('SELECT 1');
    dbOk = true;
  } catch {}

  res.json({
    database: dbOk ? 'healthy' : 'disconnected',
    targetApi: 'http://localhost:5000',
    grafana: 'http://localhost:3001',
    timestamp: new Date().toISOString(),
  });
});

// Serve React static build if present
const clientDist = path.resolve(__dirname, 'client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Platform Orchestrator] Server & React UI running on http://localhost:${PORT}`);
});
