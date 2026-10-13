import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PublicIcon from '@mui/icons-material/Public';
import StorageIcon from '@mui/icons-material/Storage';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import { RunnerStatus, NavTab } from '../types';

interface TopNavProps {
  status: RunnerStatus;
  activeTab: NavTab;
  onTriggerRun: (suite: 'all' | 'smoke' | 'api' | 'database' | 'ui' | 'config' | 'crawler') => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Overview & TestOps Metrics',
    subtitle: 'Unified command center across all multi-layer test engines and complexity levels',
  },
  config: {
    title: 'Level 1: Config-Driven Web Testing',
    subtitle: 'Zero-code data-driven verification: manage targets in JSON and test instantly',
  },
  crawler: {
    title: 'Level 2: Universal Automated Web Crawler',
    subtitle: 'Deep diagnostic audit: scan broken links (404), console errors, and page load SLA',
  },
  studio: {
    title: 'Level 3: Playwright Codegen Interactive Studio',
    subtitle: 'No-code browser test recorder: record user interactions and generate code specs',
  },
  explorer: {
    title: 'Multi-Layer Code Suites Explorer',
    subtitle: 'High complexity automated validations: Page Object Model UI, REST APIs & DB invariants',
  },
  grafana: {
    title: 'Grafana TestOps Analytics',
    subtitle: 'Real-time telemetry warehouse, pass-rate gauges, and execution speed distributions',
  },
  console: {
    title: 'Live Runner Console',
    subtitle: 'Real-time Server-Sent Events (SSE) log stream from active Playwright worker',
  },
};

export const TopNav: React.FC<TopNavProps> = ({ status, activeTab, onTriggerRun }) => {
  const meta = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(10, 16, 31, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: 3, py: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.15rem' }}>
            {meta.title}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            {meta.subtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {status.isRunning && (
            <Chip
              icon={<CircularProgress size={14} sx={{ color: '#06b6d4' }} />}
              label={`Running: ${status.currentSuite.toUpperCase()}`}
              sx={{
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: '#22d3ee',
                borderColor: '#06b6d4',
                fontWeight: 600,
              }}
              variant="outlined"
            />
          )}

          <Tooltip title="Run full multi-layer test suite across all engines">
            <Button
              variant="contained"
              color="primary"
              disabled={status.isRunning}
              startIcon={<PlayArrowIcon />}
              onClick={() => onTriggerRun('all')}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
              }}
            >
              Run All Suites
            </Button>
          </Tooltip>

          <Button
            variant="outlined"
            disabled={status.isRunning}
            startIcon={<LocalFireDepartmentIcon sx={{ color: '#f59e0b' }} />}
            onClick={() => onTriggerRun('smoke')}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#f1f5f9' }}
          >
            Smoke
          </Button>

          <Button
            variant="outlined"
            disabled={status.isRunning}
            startIcon={<PublicIcon sx={{ color: '#3b82f6' }} />}
            onClick={() => onTriggerRun('api')}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#f1f5f9' }}
          >
            API
          </Button>

          <Button
            variant="outlined"
            disabled={status.isRunning}
            startIcon={<StorageIcon sx={{ color: '#10b981' }} />}
            onClick={() => onTriggerRun('database')}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#f1f5f9' }}
          >
            DB
          </Button>

          <Button
            variant="outlined"
            disabled={status.isRunning}
            startIcon={<DesktopWindowsIcon sx={{ color: '#a855f7' }} />}
            onClick={() => onTriggerRun('ui')}
            sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#f1f5f9' }}
          >
            UI
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
