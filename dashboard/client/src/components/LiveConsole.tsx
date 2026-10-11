import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

interface LiveConsoleProps {
  logs: string[];
  onClear: () => void;
}

export const LiveConsole: React.FC<LiveConsoleProps> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="live-console-box">
      <div className="console-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={15} color="#06b6d4" />
          <span>Real-Time Execution Logs (Playwright Stream)</span>
        </div>
        <button
          className="btn"
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          onClick={onClear}
        >
          <Trash2 size={13} />
          <span>Clear Console</span>
        </button>
      </div>

      <div className="console-body" ref={scrollRef}>
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px' }}>
            Awaiting test execution trigger... Click "Run All" or any suite button above to stream live output.
          </div>
        ) : (
          logs.map((line, idx) => {
            let className = 'console-line';
            if (line.includes('passed') || line.includes('Passed') || line.includes('✓')) {
              className += ' success';
            } else if (line.includes('failed') || line.includes('Failed') || line.includes('Error:')) {
              className += ' error';
            } else if (line.includes('Starting') || line.includes('TestOps') || line.includes('Ingested')) {
              className += ' info';
            }

            return (
              <div key={idx} className={className}>
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
