import React, { useState, useMemo } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import './styles/globals.css';
import { useTokenData } from './hooks/useTokenData';
import { TokenCard } from './components/TokenCard';
import { LiveFeed } from './components/LiveFeed';
import { FilterBar } from './components/FilterBar';
import { TokenDetail } from './components/TokenDetail';

const DEFAULT_FILTERS = { recommendation: '', minScore: 0, maxHours: 24 };

function StatPill({ label, value, color }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '7px 18px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-dim)',
      borderRadius: 'var(--radius-md)',
      minWidth: 90,
      gap: 1,
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        fontWeight: 700,
        color: color || 'var(--neon-blue)',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
      }}>
        {value ?? '—'}
      </span>
      <span style={{
        fontSize: 9,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 16,
      border: '1px solid var(--border-dim)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {[90, 60, 70, 50].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 14 : 10,
          width: `${w}%`,
          borderRadius: 4,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
          backgroundSize: '400px 100%',
          animation: 'skeleton-shimmer 1.4s ease infinite',
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const { tokens, stats, loading, error, liveToken } = useTokenData();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const cutoff = Date.now() - filters.maxHours * 3600 * 1000;
    return tokens.filter((t) => {
      if (filters.recommendation && t.recommendation !== filters.recommendation) return false;
      if ((t.overall_score ?? 0) < filters.minScore) return false;
      if (t.created_at) {
        const normalized = /[Zz]|[+-]\d{2}:\d{2}$/.test(t.created_at) ? t.created_at : t.created_at + 'Z';
        if (new Date(normalized).getTime() < cutoff) return false;
      }
      return true;
    });
  }, [tokens, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '0 24px',
        height: 58,
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
        position: 'relative',
      }}>
        {/* Subtle accent line at top */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--neon-green), var(--neon-blue), transparent)',
          opacity: 0.4,
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Shield
            size={18}
            color="var(--neon-green)"
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 0 6px var(--neon-green))' }}
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 900,
              color: 'var(--neon-green)',
              textShadow: '0 0 14px rgba(0,255,136,0.35)',
              letterSpacing: '0.06em',
            }}>
              MemeGuard
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 900,
              color: 'var(--neon-blue)',
              letterSpacing: '0.06em',
            }}>
              AI
            </span>
          </div>
          <span style={{
            fontSize: 9,
            color: 'var(--text-dim)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginLeft: 2,
            paddingTop: 1,
          }}>
            BSC · Four.Meme
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
          <StatPill label="Scanned today"  value={stats?.scanned_today ?? 0}                           color="var(--neon-blue)" />
          <StatPill label="Avg score"      value={stats?.avg_score ? String(stats.avg_score) : '—'}    color="var(--neon-green)" />
          <StatPill label="Alerts sent"    value={stats?.alerts_today ?? 0}                            color="var(--neon-yellow)" />
          <StatPill label="Total tokens"   value={stats?.total_tokens ?? 0}                            color="var(--text-secondary)" />
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Live feed */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <LiveFeed tokens={tokens} liveToken={liveToken} onSelect={setSelected} />
        </div>

        {/* Center: Token grid */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 20px' }}>
          <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />

          {/* Error banner */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              marginBottom: 10,
              background: 'rgba(255,51,102,0.07)',
              border: '1px solid rgba(255,51,102,0.25)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--neon-red)',
              fontSize: 12,
              flexShrink: 0,
            }}>
              <AlertTriangle size={13} strokeWidth={2} />
              {error} — Is the backend running?
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
              paddingBottom: 20,
              alignContent: 'start',
            }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Token grid */}
          {!loading && (
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
              paddingBottom: 20,
              alignContent: 'start',
            }}>
              {filtered.length === 0 ? (
                <div style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  paddingTop: 80,
                  color: 'var(--text-dim)',
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Shield size={28} color="var(--text-dim)" strokeWidth={1.5} />
                  No tokens match the current filters.
                </div>
              ) : (
                filtered.map((token) => (
                  <TokenCard key={token.address} token={token} onClick={setSelected} />
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Token detail modal */}
      {selected && <TokenDetail token={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
