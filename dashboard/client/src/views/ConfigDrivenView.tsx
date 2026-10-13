import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  Alert,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TuneIcon from '@mui/icons-material/Tune';
import { WebTarget, RunnerStatus } from '../types';

interface ConfigDrivenViewProps {
  status: RunnerStatus;
  onRunConfigSuite: () => void;
}

export const ConfigDrivenView: React.FC<ConfigDrivenViewProps> = ({
  status,
  onRunConfigSuite,
}) => {
  const [targets, setTargets] = useState<WebTarget[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newTarget, setNewTarget] = useState({
    name: '',
    url: '',
    expectedTitle: '',
    slaBudgetMs: 3000,
    checkSsl: true,
  });

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/config-targets');
      if (res.ok) {
        const data = await res.json();
        setTargets(data);
      }
    } catch (e) {
      console.error('Failed to load targets:', e);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleSaveTargets = async (updated: WebTarget[]) => {
    setTargets(updated);
    try {
      await fetch('/api/config-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.error('Failed to save targets:', e);
    }
  };

  const handleToggle = (id: string) => {
    const updated = targets.map((t) =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    handleSaveTargets(updated);
  };

  const handleDelete = (id: string) => {
    const updated = targets.filter((t) => t.id !== id);
    handleSaveTargets(updated);
  };

  const handleAddTarget = () => {
    if (!newTarget.name || !newTarget.url) return;
    const targetItem: WebTarget = {
      id: `target-${Date.now()}`,
      name: newTarget.name,
      url: newTarget.url,
      expectedTitle: newTarget.expectedTitle,
      slaBudgetMs: Number(newTarget.slaBudgetMs) || 3000,
      checkSsl: newTarget.checkSsl,
      enabled: true,
    };
    const updated = [...targets, targetItem];
    handleSaveTargets(updated);
    setOpenModal(false);
    setNewTarget({
      name: '',
      url: '',
      expectedTitle: '',
      slaBudgetMs: 3000,
      checkSsl: true,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Informational Banner */}
      <Alert
        icon={<TuneIcon fontSize="inherit" />}
        severity="info"
        sx={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#34d399',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          borderWidth: 1,
          borderStyle: 'solid',
          '& .MuiAlert-icon': { color: '#10b981' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Zero-Code Web Application Testing
        </Typography>
        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
          Add any web application URL below. Our test engine automatically loops through each entry in <code>config/web-targets.json</code>, verifies availability, checks SSL integrity, validates page title rendering, and asserts response latency SLAs—<strong>without writing any TypeScript code!</strong>
        </Typography>
      </Alert>

      {/* Targets Table Card */}
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Configured Web Targets ({targets.length})
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Stored in <code>config/web-targets.json</code>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.2)', color: '#f1f5f9' }}
              >
                Add Target Site
              </Button>

              <Button
                variant="contained"
                color="secondary"
                disabled={status.isRunning || targets.filter((t) => t.enabled).length === 0}
                startIcon={<PlayArrowIcon />}
                onClick={onRunConfigSuite}
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                Run Config Suite ({targets.filter((t) => t.enabled).length} Active)
              </Button>
            </Box>
          </Box>

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Target Name</TableCell>
                  <TableCell>Application URL</TableCell>
                  <TableCell>Expected Title / Heading</TableCell>
                  <TableCell align="center">SLA Latency Cap</TableCell>
                  <TableCell align="center">SSL Required</TableCell>
                  <TableCell align="center">Active</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {targets.map((t) => (
                  <TableRow key={t.id} hover sx={{ opacity: t.enabled ? 1 : 0.5 }}>
                    <TableCell sx={{ fontWeight: 600, color: '#f8fafc' }}>
                      {t.name}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#06b6d4' }}>
                          {t.url}
                        </Typography>
                        <Tooltip title="Open in new tab">
                          <IconButton
                            size="small"
                            onClick={() => window.open(t.url, '_blank')}
                            sx={{ color: '#64748b' }}
                          >
                            <OpenInNewIcon fontSize="inherit" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {t.expectedTitle ? (
                        <Chip
                          size="small"
                          label={t.expectedTitle}
                          sx={{ backgroundColor: '#1e293b', color: '#cbd5e1' }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          (Any valid title)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={`< ${t.slaBudgetMs}ms`}
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {t.checkSsl ? (
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#64748b' }}>Optional</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={t.enabled}
                        onChange={() => handleToggle(t.id)}
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Target">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(t.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {targets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No web targets configured yet. Click "Add Target Site" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* Add Target Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)' } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#f8fafc' }}>
          Add New Web Target (Zero-Code)
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Application Name"
            placeholder="e.g. My Next.js Blog"
            value={newTarget.name}
            onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
            fullWidth
            size="small"
          />

          <TextField
            label="Target URL"
            placeholder="https://example.com or http://localhost:3000"
            value={newTarget.url}
            onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
            fullWidth
            size="small"
          />

          <TextField
            label="Expected Page Title (Optional)"
            placeholder="e.g. Home, Dashboard, or Welcome"
            value={newTarget.expectedTitle}
            onChange={(e) => setNewTarget({ ...newTarget, expectedTitle: e.target.value })}
            fullWidth
            size="small"
          />

          <TextField
            label="Response Latency SLA Budget (ms)"
            type="number"
            value={newTarget.slaBudgetMs}
            onChange={(e) => setNewTarget({ ...newTarget, slaBudgetMs: Number(e.target.value) })}
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddTarget}
            disabled={!newTarget.name || !newTarget.url}
            sx={{ fontWeight: 700 }}
          >
            Save Target
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
