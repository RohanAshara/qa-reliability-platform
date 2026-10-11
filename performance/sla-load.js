/**
 * ============================================================================
 * Enterprise QA Reliability Platform - SLA & Performance Benchmark Suite
 * ============================================================================
 * Measures API latency percentiles (p50, p95, p99), throughput (RPS), and error
 * rates under concurrent load against the target system under test.
 *
 * Enforces SLA Quality Gate:
 *   - Error rate == 0.00%
 *   - P95 response latency < 200ms
 *   - P99 response latency < 350ms
 * ============================================================================
 */

const TARGET_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '25', 10);
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS || '150', 10);
const P95_SLA_MS = 200;
const P99_SLA_MS = 350;

const ENDPOINTS = [
  { method: 'GET', path: '/health', name: 'Health Check' },
  { method: 'GET', path: '/api/products', name: 'Product Catalog' },
  { method: 'GET', path: '/api/products/b0000000-0000-0000-0000-000000000001', name: 'Product Detail' },
];

function calculatePercentile(sortedValues, percentile) {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

async function executeSingleRequest(endpoint) {
  const startTime = performance.now();
  try {
    const response = await fetch(`${TARGET_BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: {
        'Accept': 'application/json',
      },
    });

    const duration = performance.now() - startTime;
    return {
      success: response.status >= 200 && response.status < 300,
      statusCode: response.status,
      durationMs: duration,
      endpoint: endpoint.name,
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      success: false,
      statusCode: 0,
      error: error.message,
      durationMs: duration,
      endpoint: endpoint.name,
    };
  }
}

async function runWorker(requestQueue, results) {
  while (requestQueue.length > 0) {
    const item = requestQueue.shift();
    if (!item) break;
    const res = await executeSingleRequest(item);
    results.push(res);
  }
}

async function runBenchmark() {
  console.log('\n======================================================================');
  console.log('🚀 ENTERPRISE QA RELIABILITY PLATFORM - SLA PERFORMANCE BENCHMARK');
  console.log('======================================================================');
  console.log(`Target SUT Base URL:   ${TARGET_BASE_URL}`);
  console.log(`Concurrency Limit:    ${CONCURRENCY} concurrent workers`);
  console.log(`Total Requests:       ${TOTAL_REQUESTS} requests across endpoints`);
  console.log(`P95 Latency SLA Cap:  ${P95_SLA_MS} ms`);
  console.log(`P99 Latency SLA Cap:  ${P99_SLA_MS} ms`);
  console.log('----------------------------------------------------------------------\n');

  // Build request queue cycling through endpoints
  const queue = [];
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    queue.push(ENDPOINTS[i % ENDPOINTS.length]);
  }

  const results = [];
  const benchmarkStart = performance.now();

  // Run concurrency workers
  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(runWorker(queue, results));
  }
  await Promise.all(workers);

  const totalTimeSeconds = (performance.now() - benchmarkStart) / 1000;
  const latencies = results.map(r => r.durationMs).sort((a, b) => a - b);
  const successes = results.filter(r => r.success).length;
  const failures = results.length - successes;
  const errorRate = (failures / results.length) * 100;

  const minLatency = latencies[0] || 0;
  const maxLatency = latencies[latencies.length - 1] || 0;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const p50 = calculatePercentile(latencies, 50);
  const p90 = calculatePercentile(latencies, 90);
  const p95 = calculatePercentile(latencies, 95);
  const p99 = calculatePercentile(latencies, 99);
  const rps = results.length / totalTimeSeconds;

  console.log('----------------------------------------------------------------------');
  console.log('📊 BENCHMARK METRIC SUMMARY');
  console.log('----------------------------------------------------------------------');
  console.log(`Total Requests Completed: ${results.length}`);
  console.log(`Successful Responses:     ${successes} (HTTP 2xx)`);
  console.log(`Failed Responses:         ${failures} (HTTP non-2xx / network drop)`);
  console.log(`Error Rate:               ${errorRate.toFixed(2)}%`);
  console.log(`Total Execution Time:     ${totalTimeSeconds.toFixed(2)}s`);
  console.log(`Throughput:               ${rps.toFixed(1)} requests/sec (RPS)`);
  console.log('----------------------------------------------------------------------');
  console.log('⏱️ LATENCY DISTRIBUTION (Percentiles)');
  console.log('----------------------------------------------------------------------');
  console.log(`Min Latency:              ${minLatency.toFixed(2)} ms`);
  console.log(`P50 (Median):             ${p50.toFixed(2)} ms`);
  console.log(`P90:                      ${p90.toFixed(2)} ms`);
  console.log(`P95:                      ${p95.toFixed(2)} ms (SLA Threshold: < ${P95_SLA_MS} ms)`);
  console.log(`P99:                      ${p99.toFixed(2)} ms (SLA Threshold: < ${P99_SLA_MS} ms)`);
  console.log(`Max Latency:              ${maxLatency.toFixed(2)} ms`);
  console.log(`Average Latency:          ${avgLatency.toFixed(2)} ms`);
  console.log('======================================================================\n');

  // Breakdown by endpoint
  console.log('📌 PER-ENDPOINT PERFORMANCE BREAKDOWN:');
  for (const ep of ENDPOINTS) {
    const epResults = results.filter(r => r.endpoint === ep.name);
    const epLatencies = epResults.map(r => r.durationMs).sort((a, b) => a - b);
    const epAvg = epLatencies.reduce((a, b) => a + b, 0) / (epLatencies.length || 1);
    const epP95 = calculatePercentile(epLatencies, 95);
    console.log(`  • ${ep.name.padEnd(20)}: ${epResults.length} reqs | Avg: ${epAvg.toFixed(1)}ms | P95: ${epP95.toFixed(1)}ms | Success: ${epResults.filter(r => r.success).length}/${epResults.length}`);
  }
  console.log('\n======================================================================');

  // Quality gate assertions
  let passed = true;
  if (failures > 0) {
    console.error(`❌ GATE FAILED: Zero failures allowed, but got ${failures} failed requests (${errorRate.toFixed(2)}% error rate).`);
    passed = false;
  }
  if (p95 > P95_SLA_MS) {
    console.error(`❌ GATE FAILED: P95 latency (${p95.toFixed(2)} ms) exceeded SLA cap of ${P95_SLA_MS} ms.`);
    passed = false;
  }
  if (p99 > P99_SLA_MS) {
    console.error(`❌ GATE FAILED: P99 latency (${p99.toFixed(2)} ms) exceeded SLA cap of ${P99_SLA_MS} ms.`);
    passed = false;
  }

  if (passed) {
    console.log('✅ SLA QUALITY GATE: PASSED (All latency thresholds and zero error rate criteria met)');
    console.log('======================================================================\n');
    process.exit(0);
  } else {
    console.log('❌ SLA QUALITY GATE: FAILED');
    console.log('======================================================================\n');
    process.exit(1);
  }
}

runBenchmark().catch((err) => {
  console.error('Fatal benchmark execution error:', err);
  process.exit(1);
});
