import React, { useEffect, useRef } from 'react';

function scoreColor(score) {
  if (score >= 70) return 'var(--neon-green)';
  if (score >= 40) return 'var(--neon-yellow)';
  return 'var(--neon-red)';
}

function timeAgo(isoString) {
  if (!isoString) return 'just now';
  // Ensure UTC parsing — append Z if no timezone designator present
  const normalized = /[Zz]|[+-]\d{2}:\d{2}$/.test(isoString) ? isoString : isoString + 'Z';
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);
  if (diff < 0) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function LiveFeed({ tokens, liveToken, onSelect }) {
  const listRef = useRef(null);

  // Scroll to top when new live token arrives
  useEffect(() => {
    if (liveToken && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [liveToken]);

  const sorted = [...tokens].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-dim)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--neon-green)',
          boxShadow: '0 0 6px var(--neon-green)',
          animation: 'pulse 2s infinite',
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
        }}>
          Live Feed
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          color: 'var(--text-dim)',
        }}>
          {tokens.length} tokens
        </span>
      </div>

      {/* Feed list */}
      <div ref={listRef} style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.map((token, i) => {
          const isNew = liveToken?.address === token.address;
          const score = token.overall_score ?? null;
          const color = score !== null ? scoreColor(score) : 'var(--text-dim)';

          return (
            <div
              key={token.address}
              onClick={() => onSelect && onSelect(token)}
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-dim)',
                cursor: 'pointer',
                background: isNew ? 'rgba(0,255,136,0.04)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background var(--transition)',
                animation: isNew ? 'slideIn 0.3s ease' : 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = isNew ? 'rgba(0,255,136,0.04)' : 'transparent'}
            >
              {/* Score dot */}
              <div style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 6px ${color}`,
                flexShrink: 0,
              }} />

              {/* Token info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ${token.symbol}
                  {isNew && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--neon-green)', fontWeight: 400 }}>NEW</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {token.name}
                </div>
              </div>

              {/* Score + time */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {score !== null ? (
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{score}</div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>…</div>
                )}
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                  {timeAgo(token.created_at)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideIn {
          from { transform: translateX(-8px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
