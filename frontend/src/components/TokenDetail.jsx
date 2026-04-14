import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreGauge, MiniScoreBar } from './ScoreGauge';

const FLAG_LABELS = {
  high_concentration: '⚠ High Concentration',
  unverified_contract: '⚠ Unverified Contract',
  creator_rug_history: '🚨 Rug History',
  low_liquidity: '⚠ Low Liquidity',
  strong_narrative: '🔥 Strong Narrative',
  clean_creator: '✓ Clean Creator',
  healthy_distribution: '✓ Healthy Distribution',
  high_liquidity: '✓ Deep Liquidity',
  moderate_concentration: '~ Moderate Concentration',
  suspicious_name: '⚠ Suspicious Name',
};

function flagStyle(flag) {
  if (flag.startsWith('✓')) return { color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' };
  if (flag.startsWith('🚨')) return { color: 'var(--neon-red)', border: '1px solid rgba(255,51,102,0.3)' };
  if (flag.startsWith('⚠')) return { color: 'var(--neon-yellow)', border: '1px solid rgba(255,204,0,0.3)' };
  return { color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' };
}

function recBadge(rec) {
  const map = {
    ENTER: { bg: 'rgba(0,255,136,0.12)', color: 'var(--neon-green)', label: '⚡ ENTER' },
    WATCH: { bg: 'rgba(255,204,0,0.12)', color: 'var(--neon-yellow)', label: '👁 WATCH' },
    AVOID: { bg: 'rgba(255,51,102,0.12)', color: 'var(--neon-red)', label: '🚫 AVOID' },
  };
  return map[rec] || map.WATCH;
}

function shortAddr(addr) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const HOLDER_COLORS = ['#ff3366', '#ffcc00', '#00d4ff', '#b44dff', '#00ff88'];

export function TokenDetail({ token, onClose }) {
  if (!token) return null;

  const flags = Array.isArray(token.flags) ? token.flags : [];
  const rec = recBadge(token.recommendation || 'WATCH');

  // Mock holder distribution for display
  const holderData = [
    { name: 'Top 10', value: token.top10_concentration || 50 },
    { name: 'Others', value: 100 - (token.top10_concentration || 50) },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 24,
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glow-blue)',
          borderRadius: 16,
          boxShadow: '0 0 40px rgba(0,212,255,0.15)',
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 900, color: 'var(--neon-blue)' }}>
              ${token.symbol}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{token.name}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--border-dim)',
              borderRadius: 4, color: 'var(--text-dim)', cursor: 'pointer',
              padding: '4px 10px', fontSize: 18, fontFamily: 'var(--font-mono)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Score gauges */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
          <ScoreGauge score={token.overall_score ?? 0} label="Overall" size={90} />
          <ScoreGauge score={token.safety_score ?? 0} label="Safety" size={70} />
          <ScoreGauge score={token.alpha_score ?? 0} label="Alpha" size={70} />
          <ScoreGauge score={token.narrative_score ?? 0} label="Narrative" size={70} />
        </div>

        {/* Recommendation */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{
            background: rec.bg, color: rec.color,
            border: `1px solid ${rec.color}`,
            borderRadius: 6, padding: '6px 20px',
            fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
          }}>
            {rec.label}
          </span>
        </div>

        {/* AI Analysis */}
        <div style={{
          background: 'rgba(0,212,255,0.04)',
          border: '1px solid var(--border-glow-blue)',
          borderRadius: 8, padding: '14px 16px',
        }}>
          <div style={{ fontSize: 10, color: 'var(--neon-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            AI Analysis
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{token.analysis_text || 'Analysis pending…'}"
          </div>
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Risk Flags
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {flags.map((f) => {
                const label = FLAG_LABELS[f] || f;
                const style = flagStyle(label);
                return (
                  <span key={f} style={{
                    ...style,
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 4, padding: '3px 10px',
                    fontSize: 12,
                  }}>
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Holder distribution chart */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Holder Distribution
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 120, height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={holderData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value">
                    {holderData.map((_, i) => (
                      <Cell key={i} fill={HOLDER_COLORS[i % HOLDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${v.toFixed(1)}%`]}
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 6, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ color: HOLDER_COLORS[0] }}>Top 10: {token.top10_concentration?.toFixed(1) ?? '?'}%</div>
              <div style={{ color: HOLDER_COLORS[1] }}>Others: {(100 - (token.top10_concentration || 0)).toFixed(1)}%</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Holders: {token.holder_count ?? '?'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Liquidity: {token.liquidity_bnb?.toFixed(2) ?? '?'} BNB</div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            flex: 1, textAlign: 'center',
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 6, padding: '8px',
            fontSize: 12, color: 'rgba(0,255,136,0.5)',
            cursor: 'default',
          }}>
            Four.Meme ↗
          </div>
          <div style={{
            flex: 1, textAlign: 'center',
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 6, padding: '8px',
            fontSize: 12, color: 'rgba(0,212,255,0.5)',
            cursor: 'default',
          }}>
            BSCScan ↗
          </div>
          <div style={{
            flex: 1, textAlign: 'center',
            background: 'rgba(180,77,255,0.08)',
            border: '1px solid rgba(180,77,255,0.25)',
            borderRadius: 6, padding: '8px',
            fontSize: 11, color: 'var(--neon-purple)',
          }}>
            DEMO MODE
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center' }}>
          Contract: {token.address ? `${token.address.slice(0, 14)}…${token.address.slice(-6)}` : '—'}
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center' }}>
          ⚠ DYOR — Not financial advice. MemeGuard AI provides analysis only.
        </div>
      </div>
    </div>
  );
}
