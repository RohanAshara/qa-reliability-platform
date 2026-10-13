import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TuneIcon from '@mui/icons-material/Tune';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import ScienceIcon from '@mui/icons-material/Science';
import BarChartIcon from '@mui/icons-material/BarChart';
import TerminalIcon from '@mui/icons-material/Terminal';
import ShieldIcon from '@mui/icons-material/Shield';
import CircleIcon from '@mui/icons-material/Circle';
import { NavTab, SystemHealth, RunnerStatus } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  health: SystemHealth | null;
  status: RunnerStatus;
}

const DRAWER_WIDTH = 270;

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  health,
  status,
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#0a101f',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
          }}
        >
          <ShieldIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#fff' }}>
            QA Reliability
          </Typography>
          <Typography variant="caption" sx={{ color: '#06b6d4', fontWeight: 600, letterSpacing: 0.5 }}>
            Enterprise TestOps
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, py: 1.5, px: 1.5, overflowY: 'auto' }}>
        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'overview'}
              onClick={() => onSelectTab('overview')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  borderLeft: '3px solid #06b6d4',
                  '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'overview' ? '#06b6d4' : '#94a3b8' }}>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.88rem', fontWeight: activeTab === 'overview' ? 700 : 500, color: '#f1f5f9' }}>
                    Overview
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            pt: 2.5,
            pb: 1,
            display: 'block',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
          }}
        >
          Modes by Complexity
        </Typography>

        <List disablePadding>
          {/* Level 1: Low Complexity */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'config'}
              onClick={() => onSelectTab('config')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  borderLeft: '3px solid #10b981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'config' ? '#10b981' : '#94a3b8' }}>
                <TuneIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: activeTab === 'config' ? 700 : 500, color: '#f1f5f9' }}>
                    Level 1: Config Tests
                  </Typography>
                }
                secondary={
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Low Complexity (Zero-Code)
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>

          {/* Level 2: Medium Complexity */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'crawler'}
              onClick={() => onSelectTab('crawler')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  borderLeft: '3px solid #f59e0b',
                  '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'crawler' ? '#f59e0b' : '#94a3b8' }}>
                <TravelExploreIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: activeTab === 'crawler' ? 700 : 500, color: '#f1f5f9' }}>
                    Level 2: Web Crawler
                  </Typography>
                }
                secondary={
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Medium (Broken Links & SLA)
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>

          {/* Level 3: Codegen Studio */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'studio'}
              onClick={() => onSelectTab('studio')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  borderLeft: '3px solid #a855f7',
                  '&:hover': { backgroundColor: 'rgba(168, 85, 247, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'studio' ? '#a855f7' : '#94a3b8' }}>
                <VideoCameraFrontIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: activeTab === 'studio' ? 700 : 500, color: '#f1f5f9' }}>
                    Level 3: Codegen Studio
                  </Typography>
                }
                secondary={
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    No-Code Test Recorder
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>

          {/* Code Explorer */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'explorer'}
              onClick={() => onSelectTab('explorer')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  borderLeft: '3px solid #06b6d4',
                  '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'explorer' ? '#06b6d4' : '#94a3b8' }}>
                <ScienceIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: activeTab === 'explorer' ? 700 : 500, color: '#f1f5f9' }}>
                    Code Suites Explorer
                  </Typography>
                }
                secondary={
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b' }}>
                    High Complexity (POM, API, DB)
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            pt: 2.5,
            pb: 1,
            display: 'block',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '0.08em',
            fontSize: '0.68rem',
            textTransform: 'uppercase',
          }}
        >
          Observability & Logs
        </Typography>

        <List disablePadding>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'grafana'}
              onClick={() => onSelectTab('grafana')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(249, 115, 22, 0.12)',
                  borderLeft: '3px solid #f97316',
                  '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'grafana' ? '#f97316' : '#94a3b8' }}>
                <BarChartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: activeTab === 'grafana' ? 700 : 500, color: '#f1f5f9' }}>
                    Grafana TestOps
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={activeTab === 'console'}
              onClick={() => onSelectTab('console')}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  borderLeft: '3px solid #06b6d4',
                  '&:hover': { backgroundColor: 'rgba(6, 182, 212, 0.18)' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: activeTab === 'console' ? '#06b6d4' : '#94a3b8' }}>
                <Badge color="primary" variant="dot" invisible={!status.isRunning}>
                  <TerminalIcon fontSize="small" />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: activeTab === 'console' ? 700 : 500, color: '#f1f5f9' }}>
                    Live Logs Console
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Footer System Status Pills */}
      <Box sx={{ p: 2, backgroundColor: '#070c18', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1 }}>
          SYSTEM HEALTH
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>PostgreSQL 5432</Typography>
            <CircleIcon sx={{ fontSize: 9, color: health?.database === 'healthy' ? '#10b981' : '#f43f5e' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Target API 5000</Typography>
            <CircleIcon sx={{ fontSize: 9, color: '#06b6d4' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Grafana 3001</Typography>
            <CircleIcon sx={{ fontSize: 9, color: '#10b981' }} />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
