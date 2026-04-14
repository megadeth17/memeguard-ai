import React, { useState, useMemo } from 'react';
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
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-dim)',
      borderRadius: 8,
      minWidth: 100,
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: color || 'var(--neon-blue)' }}>
        {value ?? '—'}
      </span>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
        {label}
      </span>
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
        gap: 24,
        padding: '0 24px',
        height: 60,
        borderBottom: '1px solid var(--border-dim)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 900,
            color: 'var(--neon-green)',
            textShadow: '0 0 12px var(--neon-green)',
            letterSpacing: '0.05em',
          }}>
            MemeGuard AI
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
            BSC · Four.Meme
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
          <StatPill label="Scanned today" value={stats?.scanned_today ?? 0} color="var(--neon-blue)" />
          <StatPill label="Avg score" value={stats?.avg_score ? `${stats.avg_score}` : '—'} color="var(--neon-green)" />
          <StatPill label="Alerts sent" value={stats?.alerts_today ?? 0} color="var(--neon-yellow)" />
          <StatPill label="Total tokens" value={stats?.total_tokens ?? 0} color="var(--text-secondary)" />
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
          <FilterBar filters={filters} onChange={setFilters} />

          {loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.1em' }}>
                Scanning BSC…
              </span>
            </div>
          )}

          {error && (
            <div style={{ padding: 16, color: 'var(--neon-red)', fontSize: 13 }}>
              ⚠ {error} — Is the backend running?
            </div>
          )}

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
              {filtered.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', paddingTop: 60, color: 'var(--text-dim)', fontSize: 13 }}>
                  No tokens match the current filters.
                </div>
              )}
              {filtered.map((token) => (
                <TokenCard key={token.address} token={token} onClick={setSelected} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Token detail modal */}
      {selected && <TokenDetail token={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
