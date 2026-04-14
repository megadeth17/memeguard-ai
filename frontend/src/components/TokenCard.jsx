import React from 'react';
import { ScoreGauge, MiniScoreBar } from './ScoreGauge';

const FLAG_LABELS = {
  high_concentration: '⚠ High Concentration',
  unverified_contract: '⚠ Unverified',
  creator_rug_history: '🚨 Rug History',
  low_liquidity: '⚠ Low Liquidity',
  strong_narrative: '🔥 Hot Narrative',
  clean_creator: '✓ Clean Creator',
  healthy_distribution: '✓ Healthy Dist',
  high_liquidity: '✓ Deep Liquidity',
  moderate_concentration: '~ Moderate Conc',
  suspicious_name: '⚠ Suspicious',
};

function borderColor(score) {
  if (score >= 70) return 'var(--border-glow-green)';
  if (score >= 40) return 'var(--border-glow-yellow)';
  return 'var(--border-glow-red)';
}

function recBadge(rec) {
  const map = {
    ENTER: { bg: 'rgba(0,255,136,0.12)', color: 'var(--neon-green)', label: '⚡ ENTER' },
    WATCH: { bg: 'rgba(255,204,0,0.12)', color: 'var(--neon-yellow)', label: '👁 WATCH' },
    AVOID: { bg: 'rgba(255,51,102,0.12)', color: 'var(--neon-red)', label: '🚫 AVOID' },
  };
  return map[rec] || map.WATCH;
}

export function TokenCard({ token, onClick }) {
  const score = token.overall_score ?? 0;
  const rec = recBadge(token.recommendation || 'WATCH');
  const flags = Array.isArray(token.flags) ? token.flags : [];

  return (
    <div
      onClick={() => onClick && onClick(token)}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${borderColor(score)}`,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background var(--transition), transform var(--transition)',
        boxShadow: `0 0 16px ${borderColor(score)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-card-hover)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            ${token.symbol}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {token.name}
          </div>
        </div>
        <ScoreGauge score={score} size={60} />
      </div>

      {/* Sub-scores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <MiniScoreBar label="Safety" score={token.safety_score ?? 0} />
        <MiniScoreBar label="Alpha" score={token.alpha_score ?? 0} />
        <MiniScoreBar label="Narrative" score={token.narrative_score ?? 0} />
      </div>

      {/* Recommendation badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          background: rec.bg,
          color: rec.color,
          border: `1px solid ${rec.color}`,
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}>
          {rec.label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {token.liquidity_bnb?.toFixed(1)} BNB liq
        </span>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {flags.slice(0, 3).map((f) => (
            <span key={f} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-dim)',
              borderRadius: 3,
              padding: '1px 6px',
              fontSize: 10,
              color: 'var(--text-secondary)',
            }}>
              {FLAG_LABELS[f] || f}
            </span>
          ))}
          {flags.length > 3 && (
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>+{flags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
