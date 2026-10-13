import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BugReportIcon from '@mui/icons-material/BugReport';
import SpeedIcon from '@mui/icons-material/Speed';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { CrawlerReport } from '../types';

export const UniversalCrawlerView: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState<string>('https://www.saucedemo.com');
  const [maxLinks, setMaxLinks] = useState<number>(15);
  const [slaMs, setSlaMs] = useState<number>(3500);
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<CrawlerReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartAudit = async () => {
    if (!targetUrl) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/crawler/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, maxLinksToCheck: maxLinks, slaMs }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Crawler audit failed');
      }

      const data: CrawlerReport = await res.json();
      setReport(data);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Informational Banner */}
      <Alert
        icon={<TravelExploreIcon fontSize="inherit" />}
        severity="warning"
        sx={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#fbbf24',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          borderWidth: 1,
          borderStyle: 'solid',
          '& .MuiAlert-icon': { color: '#f59e0b' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Level 2: Universal Automated Health & Broken Link Crawler Engine
        </Typography>
        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
          Enter any URL below. The crawler launches headless Chromium, navigates to the page, measures TTFB & load SLA, scans anchor tags for 404/500 broken links in parallel, detects silent JavaScript console exceptions, and captures high-resolution visual proof.
        </Typography>
      </Alert>

      {/* Audit Controller Card */}
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
            Run Deep Diagnostic Audit
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '3fr 1fr 1fr 1.5fr' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              label="Target Web Application URL"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              fullWidth
              size="small"
              placeholder="https://example.com"
              disabled={loading}
            />

            <TextField
              label="Max Links Scan"
              type="number"
              value={maxLinks}
              onChange={(e) => setMaxLinks(Number(e.target.value))}
              fullWidth
              size="small"
              disabled={loading}
            />

            <TextField
              label="SLA Budget (ms)"
              type="number"
              value={slaMs}
              onChange={(e) => setSlaMs(Number(e.target.value))}
              fullWidth
              size="small"
              disabled={loading}
            />

            <Button
              variant="contained"
              fullWidth
              disabled={loading || !targetUrl}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <TravelExploreIcon />}
              onClick={handleStartAudit}
              sx={{
                py: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#fff',
              }}
            >
              {loading ? 'Auditing...' : 'Start Audit'}
            </Button>
          </Box>

          {errorMsg && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMsg}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Audit Results View */}
      {report && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Audit Metrics Summary Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2.5,
            }}
          >
            <Paper sx={{ p: 2, backgroundColor: '#0f172a' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Health Verdict
                </Typography>
                {report.overallHealthy ? (
                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                ) : (
                  <ErrorIcon sx={{ color: '#f43f5e' }} />
                )}
              </Box>
              <Chip
                label={report.overallHealthy ? 'HEALTHY' : 'ISSUES DETECTED'}
                color={report.overallHealthy ? 'success' : 'error'}
                sx={{ fontWeight: 800 }}
              />
            </Paper>

            <Paper sx={{ p: 2, backgroundColor: '#0f172a' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Page Load Latency
                </Typography>
                <SpeedIcon sx={{ color: '#06b6d4' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: report.slaPassed ? '#06b6d4' : '#f43f5e' }}>
                {report.durationMs}ms
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                SLA Cap: {report.slaBudgetMs}ms {report.slaPassed ? '✓' : '⚠️'}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, backgroundColor: '#0f172a' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Broken Links (404/500)
                </Typography>
                <LinkOffIcon sx={{ color: report.metrics.brokenLinksCount > 0 ? '#f43f5e' : '#10b981' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: report.metrics.brokenLinksCount > 0 ? '#f43f5e' : '#10b981' }}>
                {report.metrics.brokenLinksCount} / {report.metrics.totalLinksScanned}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Scanned in parallel
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, backgroundColor: '#0f172a' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Console JS Errors
                </Typography>
                <BugReportIcon sx={{ color: report.metrics.consoleErrorsCount > 0 ? '#f43f5e' : '#94a3b8' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: report.metrics.consoleErrorsCount > 0 ? '#f43f5e' : '#f8fafc' }}>
                {report.metrics.consoleErrorsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Uncaught runtime exceptions
              </Typography>
            </Paper>
          </Box>

          {/* Broken Links details */}
          {report.brokenLinks.length > 0 && (
            <Card sx={{ backgroundColor: '#0f172a', borderColor: '#f43f5e' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f43f5e', mb: 1 }}>
                  Detected Broken Links ({report.brokenLinks.length})
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Anchor Text</TableCell>
                      <TableCell>Broken URL (href)</TableCell>
                      <TableCell align="center">HTTP Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.brokenLinks.map((b, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ color: '#f8fafc' }}>{b.text || 'Untitled'}</TableCell>
                        <TableCell sx={{ color: '#f43f5e', fontFamily: 'monospace' }}>{b.href}</TableCell>
                        <TableCell align="center">
                          <Chip label={b.status || 'Failed'} color="error" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Screenshot Preview & All Scanned Links */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: report.screenshotBase64 ? { xs: '1fr', md: '1fr 1.5fr' } : '1fr',
              gap: 2.5,
            }}
          >
            {report.screenshotBase64 && (
              <Card sx={{ backgroundColor: '#0f172a', height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CameraAltIcon sx={{ color: '#06b6d4' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                      Visual Page Snapshot
                    </Typography>
                  </Box>
                  <Box
                    component="img"
                    src={`data:image/png;base64,${report.screenshotBase64}`}
                    alt="Audited Page Snapshot"
                    sx={{
                      width: '100%',
                      borderRadius: 1.5,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                    }}
                  />
                </CardContent>
              </Card>
            )}

            <Card sx={{ backgroundColor: '#0f172a', height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f8fafc', mb: 1.5 }}>
                  All Scanned Links ({report.allLinks.length})
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 380, overflowY: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Link Text</TableCell>
                        <TableCell>URL</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Latency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {report.allLinks.map((l, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ color: '#cbd5e1', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {l.text || 'Link'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: l.isBroken ? '#f43f5e' : '#06b6d4' }}>
                            {l.href}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={l.status || 'ERR'}
                              size="small"
                              color={l.isBroken ? 'error' : 'success'}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            {l.durationMs}ms
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
};
