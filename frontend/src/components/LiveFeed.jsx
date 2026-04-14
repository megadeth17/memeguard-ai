import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

function scoreColor(score) {
  if (score >= 70) return 'var(--neon-green)';
  if (score >= 40) return 'var(--neon-yellow)';
  return 'var(--neon-red)';
}

function timeAgo(isoString) {
  if (!isoString) return 'just now';
  const normalized = /[Zz]|[+-]\d{2}:\d{2}$/.test(isoString) ? isoString : isoString + 'Z';
  const diff = Math.floor((Date.now() - new Date(normalized).getTime()) / 1000);
  if (diff < 0) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function LiveFeed({ tokens, liveToken, onSelect }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (liveToken && listRef.current) listRef.current.scrollTop = 0;
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
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-dim)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: 'var(--neon-green)',
          boxShadow: '0 0 8px var(--neon-green)',
          animation: 'pulse-dot 2s infinite',
          color: 'var(--neon-green)',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 9,
          letterSpacing: '0.14em',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
        }}>
          Live Feed
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 10,
          color: 'var(--text-dim)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {tokens.length}
        </span>
      </div>

      {/* List */}
      <div ref={listRef} style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.map((token) => {
          const isNew = liveToken?.address === token.address;
          const score = token.overall_score ?? null;
          const color = score !== null ? scoreColor(score) : 'var(--text-dim)';

          return (
            <div
              key={token.address}
              role="button"
              tabIndex={0}
              aria-label={`${token.symbol}, score ${score ?? 'pending'}`}
              onClick={() => onSelect?.(token)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect?.(token)}
              style={{
                padding: '9px 14px',
                borderBottom: '1px solid var(--border-dim)',
                cursor: 'pointer',
                background: isNew ? 'rgba(0,255,136,0.03)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                transition: 'background var(--transition-fast)',
                animation: isNew ? 'slide-in-left 0.3s ease' : 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={(e) => e.currentTarget.style.background = isNew ? 'rgba(0,255,136,0.03)' : 'transparent'}
            >
              {/* Score dot */}
              <div style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 5px ${color}`,
                flexShrink: 0,
              }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                }}>
                  ${token.symbol}
                  {isNew && (
                    <span style={{
                      marginLeft: 6,
                      fontSize: 8,
                      color: 'var(--neon-green)',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      NEW
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {timeAgo(token.created_at)}
                </div>
              </div>

              {/* Score */}
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: score !== null ? color : 'var(--text-dim)',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>
                {score !== null ? score : '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
