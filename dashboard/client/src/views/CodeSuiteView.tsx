import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TestResult } from '../types';

interface CodeSuiteViewProps {
  tests: TestResult[];
}

export const CodeSuiteView: React.FC<CodeSuiteViewProps> = ({ tests }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectTest, setInspectTest] = useState<TestResult | null>(null);

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.test_title.toLowerCase().includes(search.toLowerCase()) ||
      t.file_path.toLowerCase().includes(search.toLowerCase());
    const matchesLayer = selectedLayer === 'ALL' || t.layer.toUpperCase() === selectedLayer.toUpperCase();
    const matchesStatus = selectedStatus === 'ALL' || t.status.toUpperCase() === selectedStatus.toUpperCase();
    return matchesSearch && matchesLayer && matchesStatus;
  });

  const getLayerColor = (layer: string) => {
    switch (layer.toUpperCase()) {
      case 'UI':
        return '#a855f7';
      case 'API':
        return '#3b82f6';
      case 'DATABASE':
        return '#10b981';
      case 'SMOKE':
        return '#f59e0b';
      case 'CONFIG':
        return '#14b8a6';
      default:
        return '#06b6d4';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header & Filter Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Multi-Layer Code Suites Explorer ({tests.length} Total)
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Showing {filteredTests.length} matching scenarios from latest execution
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search tests or files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ minWidth: 220 }}
              />

              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Layer</InputLabel>
                <Select
                  value={selectedLayer}
                  label="Layer"
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="ALL">All Layers</MenuItem>
                  <MenuItem value="UI">UI (POM)</MenuItem>
                  <MenuItem value="API">API Contracts</MenuItem>
                  <MenuItem value="DATABASE">Database</MenuItem>
                  <MenuItem value="SMOKE">Smoke</MenuItem>
                  <MenuItem value="CONFIG">Config</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{ color: '#f8fafc' }}
                >
                  <MenuItem value="ALL">All Statuses</MenuItem>
                  <MenuItem value="PASSED">Passed</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Test Scenarios Table */}
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Test Scenario</TableCell>
                  <TableCell align="center">Layer</TableCell>
                  <TableCell>Spec File</TableCell>
                  <TableCell align="center">Duration</TableCell>
                  <TableCell align="center">Diagnostics</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTests.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell align="center">
                      <Chip
                        icon={t.status === 'passed' ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                        label={t.status.toUpperCase()}
                        color={t.status === 'passed' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600, color: '#f8fafc', maxWidth: 350 }}>
                      {t.test_title}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={t.layer}
                        size="small"
                        sx={{
                          backgroundColor: `${getLayerColor(t.layer)}22`,
                          color: getLayerColor(t.layer),
                          borderColor: getLayerColor(t.layer),
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell sx={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {t.file_path}
                    </TableCell>

                    <TableCell align="center" sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                      {t.duration_ms}ms
                    </TableCell>

                    <TableCell align="center">
                      {t.status === 'failed' ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<BugReportIcon />}
                          onClick={() => setInspectTest(t)}
                        >
                          Inspect
                        </Button>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Passed ✓
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No tests match your filter criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* Failure Diagnostic Modal */}
      <Dialog
        open={Boolean(inspectTest)}
        onClose={() => setInspectTest(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { backgroundColor: '#0f172a', border: '1px solid rgba(244, 63, 94, 0.3)' } } }}
      >
        <DialogTitle sx={{ color: '#f43f5e', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugReportIcon />
            <span>Failure Diagnostic Trace</span>
          </Box>
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (inspectTest?.error_message) navigator.clipboard.writeText(inspectTest.error_message);
            }}
            sx={{ color: '#94a3b8' }}
          >
            Copy Trace
          </Button>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#f8fafc', fontWeight: 600 }}>
            {inspectTest?.test_title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
            {inspectTest?.file_path}
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              borderRadius: 1.5,
              backgroundColor: '#070c18',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f87171',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              overflowX: 'auto',
              maxHeight: '350px',
            }}
          >
            {inspectTest?.error_message || 'No stack trace recorded.'}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setInspectTest(null)} sx={{ color: '#94a3b8' }}>
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
