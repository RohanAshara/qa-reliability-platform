import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BarChartIcon from '@mui/icons-material/BarChart';

export const GrafanaTabView: React.FC = () => {
  const grafanaUrl = 'http://localhost:3001/d/qa-platform-main?kiosk';
  const directUrl = 'http://localhost:3001/d/qa-platform-main';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BarChartIcon sx={{ color: '#f97316' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Grafana TestOps Observability Dashboard
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Connected to PostgreSQL Telemetry Warehouse (`test_runs` & `test_results`)
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            endIcon={<OpenInNewIcon />}
            onClick={() => window.open(directUrl, '_blank')}
            sx={{ borderColor: '#f97316', color: '#f97316' }}
          >
            Open in Grafana Standalone
          </Button>
        </CardContent>
      </Card>

      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 220px)',
          minHeight: '650px',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#0a101f',
        }}
      >
        <iframe
          src={grafanaUrl}
          title="Grafana QA Platform Dashboard"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>
    </Box>
  );
};
