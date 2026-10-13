import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayersIcon from '@mui/icons-material/Layers';
import ErrorIcon from '@mui/icons-material/Error';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import ScienceIcon from '@mui/icons-material/Science';
import StorageIcon from '@mui/icons-material/Storage';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TestRun, DbMetrics, NavTab } from '../types';

interface OverviewViewProps {
  runs: TestRun[];
  latestRun: TestRun | null;
  dbMetrics: DbMetrics | null;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  runs,
  latestRun,
  dbMetrics,
  onNavigate,
}) => {
  const passRate =
    latestRun && latestRun.total_tests > 0
      ? Math.round((latestRun.passed_tests / latestRun.total_tests) * 100)
      : 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* KPI Cards Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        <Card sx={{ background: 'linear-gradient(145deg, #0f172a 0%, #131d35 100%)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                Overall Pass Rate
              </Typography>
              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981' }}>
              {passRate}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              SLA Quality Gate Target: &gt; 95%
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(145deg, #0f172a 0%, #131d35 100%)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                Scenarios Executed
              </Typography>
              <LayersIcon sx={{ color: '#06b6d4', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc' }}>
              {latestRun?.total_tests || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Multi-layer test coverage
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(145deg, #0f172a 0%, #131d35 100%)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                Failures / Blockers
              </Typography>
              <ErrorIcon
                sx={{ color: (latestRun?.failed_tests || 0) > 0 ? '#f43f5e' : '#94a3b8', fontSize: 20 }}
              />
            </Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: (latestRun?.failed_tests || 0) > 0 ? '#f43f5e' : '#f8fafc' }}
            >
              {latestRun?.failed_tests || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Critical defects detected
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: 'linear-gradient(145deg, #0f172a 0%, #131d35 100%)' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                Latest Duration
              </Typography>
              <TimerOutlinedIcon sx={{ color: '#a855f7', fontSize: 20 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#a855f7' }}>
              {latestRun ? `${(latestRun.duration_ms / 1000).toFixed(2)}s` : '0.00s'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Playwright Sequential Worker
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Complexity Modes Breakdown */}
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              Testing Paradigms by Web Application Complexity
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Choose the right testing strategy based on application depth, team velocity, and reliability needs:
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {/* Level 1 */}
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <TuneIcon sx={{ color: '#10b981' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#10b981' }}>
                    Level 1: Low Complexity
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                  <strong>Zero-Code Data-Driven Testing:</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                  Perfect for marketing websites, landing pages, and status endpoints. Configure target URLs, expected titles, and SLA budgets in JSON without writing code.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => onNavigate('config')}
              >
                Open Config Tests
              </Button>
            </Paper>

            {/* Level 2 */}
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(245, 158, 11, 0.05)',
                borderColor: 'rgba(245, 158, 11, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <TravelExploreIcon sx={{ color: '#f59e0b' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                    Level 2: Medium Complexity
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                  <strong>Universal Web Crawler Engine:</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                  Deep diagnostic audit of any URL: scans all hyperlinks for 404 broken links, catches unhandled JavaScript console errors, measures TTFB, and takes visual snapshots.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{ color: '#f59e0b', borderColor: '#f59e0b' }}
                endIcon={<ArrowForwardIcon />}
                onClick={() => onNavigate('crawler')}
              >
                Open Web Crawler
              </Button>
            </Paper>

            {/* Level 3 */}
            <Paper
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                borderColor: 'rgba(6, 182, 212, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <ScienceIcon sx={{ color: '#06b6d4' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#06b6d4' }}>
                    Level 3: High Complexity
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 1 }}>
                  <strong>Codegen Studio & Multi-Layer Suites:</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
                  Interactive browser recording for no-code tests, plus full Page Object Model (POM) UI journeys, REST contract SLAs, and PostgreSQL relational invariants.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => onNavigate('explorer')}
              >
                Explore Code Suites
              </Button>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Two Column Section: Recent Test Runs & Database Integrity */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Recent Runs Table */}
        <Card sx={{ backgroundColor: '#0f172a' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 1.5 }}>
              Recent Platform Test Runs (PostgreSQL Telemetry)
            </Typography>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Run ID</TableCell>
                    <TableCell>Suite</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">Duration</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {runs.slice(0, 6).map((run) => (
                    <TableRow key={run.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#06b6d4' }}>
                        {run.run_id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{run.suite_name}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={run.status.toUpperCase()}
                          color={run.status === 'passed' ? 'success' : 'error'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {run.passed_tests}/{run.total_tests}
                      </TableCell>
                      <TableCell align="center">
                        {`${(run.duration_ms / 1000).toFixed(2)}s`}
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                        {new Date(run.created_at).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {runs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: '#64748b' }}>
                        No test run executions recorded yet. Click "Run All Suites" to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </CardContent>
        </Card>

        {/* Database Health Card */}
        <Card sx={{ backgroundColor: '#0f172a', height: '100%' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <StorageIcon sx={{ color: '#10b981' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Database Entity Health
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2 }}>
              Live record counts queried directly from PostgreSQL (`qa_reliability_db`):
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a101f' }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Registered Users</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#06b6d4' }}>
                  {dbMetrics?.users || 0}
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a101f' }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Catalog Products</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#10b981' }}>
                  {dbMetrics?.products || 0}
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a101f' }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Processed Orders</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#a855f7' }}>
                  {dbMetrics?.orders || 0}
                </Typography>
              </Paper>
              <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a101f' }}>
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Immutable Audit Logs</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                  {dbMetrics?.auditLogs || 0}
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
