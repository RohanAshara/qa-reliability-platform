import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TerminalIcon from '@mui/icons-material/Terminal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { GeneratedTest } from '../types';

export const TestStudioView: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState<string>('https://www.saucedemo.com');
  const [testName, setTestName] = useState<string>('user_checkout_journey');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedTest[]>([]);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<{ filename: string; content: string } | null>(null);

  const fetchGenerated = async () => {
    try {
      const res = await fetch('/api/generated-tests');
      if (res.ok) {
        const data = await res.json();
        setGeneratedFiles(data);
      }
    } catch (e) {
      console.error('Failed to fetch generated tests:', e);
    }
  };

  useEffect(() => {
    fetchGenerated();
  }, []);

  const handleLaunchCodegen = async () => {
    if (!targetUrl || !testName) return;
    try {
      const res = await fetch('/api/codegen/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, testName }),
      });
      const data = await res.json();
      setLaunchMessage(`🚀 Launched Playwright Codegen! A browser and recorder window are opening on your screen. Interact with the website, and your actions will be recorded into tests/generated/${data.outputFile}.`);
      setTimeout(fetchGenerated, 5000);
    } catch (e: any) {
      setLaunchMessage(`❌ Failed to launch codegen: ${e.message}`);
    }
  };

  const handleViewFile = async (filename: string) => {
    try {
      const res = await fetch(`/api/generated-tests/${filename}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedFileContent(data);
      }
    } catch (e) {
      console.error('Failed to fetch test content:', e);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Informational Banner */}
      <Alert
        icon={<VideoCameraFrontIcon fontSize="inherit" />}
        severity="info"
        sx={{
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          color: '#c084fc',
          borderColor: 'rgba(168, 85, 247, 0.3)',
          borderWidth: 1,
          borderStyle: 'solid',
          '& .MuiAlert-icon': { color: '#a855f7' },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Level 3: Interactive No-Code Test Recorder (Playwright Codegen)
        </Typography>
        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
          No manual coding required! Enter a URL and click <strong>"Launch Interactive Recorder"</strong>. Playwright will pop up a live browser window: as you click buttons, type text, or navigate, it automatically records and generates production-ready TypeScript Playwright test code directly into your repository!
        </Typography>
      </Alert>

      {/* Launcher Card */}
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', mb: 2 }}>
            Record New Test Scenario
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
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
            />

            <TextField
              label="Test Scenario File Name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. login_flow"
            />

            <Button
              variant="contained"
              fullWidth
              startIcon={<VideoCameraFrontIcon />}
              onClick={handleLaunchCodegen}
              sx={{
                py: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                color: '#fff',
              }}
            >
              Launch Recorder
            </Button>
          </Box>

          {launchMessage && (
            <Alert severity="success" sx={{ mt: 2.5 }}>
              {launchMessage}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recorded Specs Table */}
      <Card sx={{ backgroundColor: '#0f172a' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Recorded & Generated Test Specs ({generatedFiles.length})
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Stored in <code>tests/generated/</code>
              </Typography>
            </Box>

            <Button size="small" variant="outlined" onClick={fetchGenerated} sx={{ color: '#cbd5e1' }}>
              Refresh Files
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Directory</TableCell>
                  <TableCell align="center">Size</TableCell>
                  <TableCell>Last Recorded</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generatedFiles.map((file) => (
                  <TableRow key={file.filename} hover>
                    <TableCell sx={{ fontFamily: 'monospace', color: '#a855f7', fontWeight: 600 }}>
                      {file.filename}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>tests/generated/</TableCell>
                    <TableCell align="center">
                      <Chip label={`${file.sizeBytes} B`} size="small" sx={{ backgroundColor: '#1e293b' }} />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                      {new Date(file.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Recorded Code">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewFile(file.filename)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {generatedFiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748b' }}>
                      No recorded tests yet. Click "Launch Recorder" above to create your first recorded scenario!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* Code Viewer Dialog */}
      <Dialog
        open={Boolean(selectedFileContent)}
        onClose={() => setSelectedFileContent(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { backgroundColor: '#0b1120', border: '1px solid rgba(255, 255, 255, 0.1)' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#f8fafc' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TerminalIcon sx={{ color: '#a855f7' }} />
            <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
              {selectedFileContent?.filename}
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              if (selectedFileContent) navigator.clipboard.writeText(selectedFileContent.content);
            }}
            sx={{ color: '#94a3b8' }}
          >
            Copy
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Box
            component="pre"
            sx={{
              p: 2,
              borderRadius: 1.5,
              backgroundColor: '#070c18',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              overflowX: 'auto',
              maxHeight: '450px',
            }}
          >
            {selectedFileContent?.content}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedFileContent(null)} sx={{ color: '#94a3b8' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
