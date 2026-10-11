import React, { useState } from 'react';
import { Search, Filter, ExternalLink, Check, X, Clock } from 'lucide-react';
import { TestResult } from '../types';

interface TestExplorerProps {
  tests: TestResult[];
  onSelectTest: (test: TestResult) => void;
}

export const TestExplorer: React.FC<TestExplorerProps> = ({ tests, onSelectTest }) => {
  const [search, setSearch] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filtered = tests.filter((t) => {
    const matchesSearch =
      t.test_title.toLowerCase().includes(search.toLowerCase()) ||
      t.file_path.toLowerCase().includes(search.toLowerCase());
    const matchesLayer = selectedLayer === 'ALL' || t.layer === selectedLayer;
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchesSearch && matchesLayer && matchesStatus;
  });

  const getLayerBadge = (layer: string) => {
    switch (layer) {
      case 'API':
        return <span className="badge badge-layer-api">API Layer</span>;
      case 'Database':
        return <span className="badge badge-layer-db">Database SQL</span>;
      case 'UI':
        return <span className="badge badge-layer-ui">Browser E2E</span>;
      case 'Smoke':
        return <span className="badge badge-layer-smoke">Smoke</span>;
      default:
        return <span className="badge">{layer}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Test Suite Explorer</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {tests.length} automated test scenarios
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search tests or files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                minWidth: '240px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Layers</option>
              <option value="API">API</option>
              <option value="Database">Database</option>
              <option value="UI">UI E2E</option>
              <option value="Smoke">Smoke</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="test-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Test Scenario</th>
              <th>Layer</th>
              <th>Spec File</th>
              <th>Duration</th>
              <th>Diagnostic</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id || t.test_title}>
                <td>
                  {t.status === 'passed' ? (
                    <span className="badge badge-passed">
                      <Check size={11} /> PASSED
                    </span>
                  ) : (
                    <span className="badge badge-failed">
                      <X size={11} /> FAILED
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{t.test_title}</td>
                <td>{getLayerBadge(t.layer)}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.file_path.replace(/.*tests[\\/]/, 'tests/')}
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                    <Clock size={12} /> {t.duration_ms}ms
                  </span>
                </td>
                <td>
                  <button
                    className="btn"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => onSelectTest(t)}
                  >
                    <ExternalLink size={12} />
                    <span>Inspect</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
