import React, { useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CircleIcon from '@mui/icons-material/Circle';
import { RunnerStatus } from '../types';

interface ConsoleViewProps {
  logs: string[];
  status: RunnerStatus;
  onClearLogs: () => void;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({ logs, status, onClearLogs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const getLineColor = (line: string) => {
    if (line.includes('passed') || line.includes('PASSED') || line.includes('✅')) return '#4ade80';
    if (line.includes('failed') || line.includes('FAILED') || line.includes('❌') || line.includes('[stderr]'))
      return '#f87171';
    if (line.includes('🚀') || line.includes('TestOps') || line.includes('Starting')) return '#38bdf8';
    if (line.includes('warning') || line.includes('⚠️')) return '#fbbf24';
    return '#cbd5e1';
  };

  return (
    <Card sx={{ backgroundColor: '#0f172a', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TerminalIcon sx={{ color: '#06b6d4' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
            Live Execution Terminal Console
          </Typography>
          <Chip
            size="small"
            icon={<CircleIcon sx={{ fontSize: 8, color: status.isRunning ? '#22d3ee' : '#64748b' }} />}
            label={status.isRunning ? 'RUNNER ACTIVE' : 'IDLE'}
            sx={{ backgroundColor: '#1e293b', fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => navigator.clipboard.writeText(logs.join('\n'))}
            sx={{ color: '#94a3b8' }}
          >
            Copy Logs
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onClearLogs}
          >
            Clear Console
          </Button>
        </Box>
      </CardContent>

      <Box
        ref={terminalRef}
        sx={{
          flexGrow: 1,
          mx: 2.5,
          mb: 2.5,
          p: 2,
          backgroundColor: '#070b14',
          borderRadius: 1.5,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontSize: '0.84rem',
          lineHeight: 1.6,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.4,
        }}
      >
        {logs.map((line, index) => (
          <Box key={index} sx={{ color: getLineColor(line), wordBreak: 'break-all' }}>
            {line}
          </Box>
        ))}
        {logs.length === 0 && (
          <Typography variant="body2" sx={{ color: '#64748b', fontStyle: 'italic' }}>
            Terminal idle. Trigger any test suite or diagnostic audit from the top navigation to stream live execution logs here.
          </Typography>
        )}
      </Box>
    </Card>
  );
};
