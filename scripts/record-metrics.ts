import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://admin:password@localhost:5432/qa_db',
});

export async function ingestTestResults(
  suiteName: string = 'Full Platform Suite',
  runIdParam?: string
): Promise<string> {
  const resultsPath = path.resolve(__dirname, '../reports/results.json');
  if (!fs.existsSync(resultsPath)) {
    throw new Error(`Results file not found at ${resultsPath}`);
  }

  const raw = fs.readFileSync(resultsPath, 'utf-8');
  const json = JSON.parse(raw);

  const runId = runIdParam || `run-${Date.now()}`;
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let totalDurationMs = 0;

  const testEntries: Array<{
    title: string;
    file: string;
    layer: string;
    status: string;
    durationMs: number;
    error?: string;
  }> = [];

  function categorizeLayer(filePath: string): string {
    if (filePath.includes('api')) return 'API';
    if (filePath.includes('database')) return 'Database';
    if (filePath.includes('ui')) return 'UI';
    if (filePath.includes('smoke')) return 'Smoke';
    return 'Core';
  }

  function traverseSuites(suite: any) {
    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          for (const result of test.results) {
            const status = result.status; // 'passed', 'failed', 'timedOut', 'skipped'
            const duration = result.duration || 0;
            totalDurationMs += duration;

            if (status === 'passed') passed++;
            else if (status === 'skipped') skipped++;
            else failed++;

            const layer = categorizeLayer(spec.file || '');
            const error =
              result.errors && result.errors.length > 0
                ? result.errors.map((e: any) => e.message || e.value).join('\n')
                : null;

            testEntries.push({
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
      for (const child of suite.suites) {
        traverseSuites(child);
      }
    }
  }

  traverseSuites(json);

  const total = passed + failed + skipped;
  const overallStatus = failed === 0 ? 'passed' : 'failed';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert Run
    await client.query(
      `INSERT INTO test_runs (run_id, suite_name, status, total_tests, passed_tests, failed_tests, skipped_tests, duration_ms, triggered_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        runId,
        suiteName,
        overallStatus,
        total,
        passed,
        failed,
        skipped,
        totalDurationMs,
        'manual',
      ]
    );

    // Insert Detailed Test Entries
    for (const entry of testEntries) {
      await client.query(
        `INSERT INTO test_results (run_id, test_title, file_path, layer, status, duration_ms, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          runId,
          entry.title,
          entry.file,
          entry.layer,
          entry.status,
          entry.durationMs,
          entry.error,
        ]
      );
    }

    await client.query('COMMIT');
    console.log(
      `[TestOps] Ingested Run ${runId}: ${total} tests (${passed} passed, ${failed} failed) into PostgreSQL.`
    );
    return runId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  ingestTestResults()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Failed to ingest test metrics:', err);
      pool.end();
      process.exit(1);
    });
}
