import React from 'react';
import {
  TrendingUp, Eye, XCircle, AlertTriangle, CheckCircle,
  Flame, Droplets, Shield, Zap
} from 'lucide-react';
import { ScoreGauge, MiniScoreBar } from './ScoreGauge';

const FLAG_META = {
  high_concentration:  { icon: AlertTriangle, label: 'High Conc.', color: '#ffd700' },
  unverified_contract: { icon: AlertTriangle, label: 'Unverified', color: '#ffd700' },
  creator_rug_history: { icon: XCircle,       label: 'Rug History', color: '#ff3366' },
  low_liquidity:       { icon: Droplets,      label: 'Low Liq.',    color: '#ff8c00' },
  strong_narrative:    { icon: Flame,         label: 'Hot Narrative', color: '#00ff88' },
  clean_creator:       { icon: CheckCircle,   label: 'Clean Creator', color: '#00ff88' },
  healthy_distribution:{ icon: Shield,        label: 'Healthy Dist', color: '#00d4ff' },
  high_liquidity:      { icon: Droplets,      label: 'Deep Liq.',   color: '#00d4ff' },
  moderate_concentration:{ icon: AlertTriangle, label: 'Mod. Conc.', color: '#ff8c00' },
  suspicious_name:     { icon: AlertTriangle, label: 'Suspicious',  color: '#ff3366' },
};

const REC_META = {
  ENTER: { Icon: TrendingUp, label: 'ENTER', color: '#00ff88', bg: 'rgba(0,255,136,0.1)',  border: 'rgba(0,255,136,0.3)' },
  WATCH: { Icon: Eye,        label: 'WATCH',  color: '#ffd700', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.3)' },
  AVOID: { Icon: XCircle,    label: 'AVOID',  color: '#ff3366', bg: 'rgba(255,51,102,0.08)',border: 'rgba(255,51,102,0.3)' },
};

function borderGlow(score) {
  if (score >= 70) return { border: '1px solid rgba(0,255,136,0.22)', boxShadow: '0 0 18px rgba(0,255,136,0.06)' };
  if (score >= 40) return { border: '1px solid rgba(255,215,0,0.18)',  boxShadow: '0 0 18px rgba(255,215,0,0.04)' };
  return           { border: '1px solid rgba(255,51,102,0.18)',         boxShadow: '0 0 18px rgba(255,51,102,0.04)' };
}

export function TokenCard({ token, onClick }) {
  const score = token.overall_score ?? 0;
  const rec = REC_META[token.recommendation] ?? REC_META.WATCH;
  const { Icon: RecIcon } = rec;
  const flags = Array.isArray(token.flags) ? token.flags : [];
  const glow = borderGlow(score);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${token.symbol} — score ${score}. Click for details.`}
      onClick={() => onClick?.(token)}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(token)}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'background var(--transition), transform var(--transition), box-shadow var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animation: 'fade-in 0.3s ease',
        ...glow,
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            ${token.symbol}
          </div>
          <div style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            marginTop: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {token.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
            {token.liquidity_bnb?.toFixed(1)} BNB &middot; {token.holder_count ?? '?'} holders
          </div>
        </div>
        <ScoreGauge score={score} size={58} />
      </div>

      {/* Sub-scores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <MiniScoreBar label="Safety"    score={token.safety_score    ?? 0} />
        <MiniScoreBar label="Alpha"     score={token.alpha_score     ?? 0} />
        <MiniScoreBar label="Narrative" score={token.narrative_score ?? 0} />
      </div>

      {/* Recommendation + flags */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Rec badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: rec.bg,
          color: rec.color,
          border: `1px solid ${rec.border}`,
          borderRadius: 4,
          padding: '3px 9px',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          flexShrink: 0,
        }}>
          <RecIcon size={10} strokeWidth={2.5} />
          {rec.label}
        </span>

        {/* Top flags */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {flags.slice(0, 2).map((f) => {
            const meta = FLAG_META[f];
            if (!meta) return null;
            const { icon: FlagIcon, label, color } = meta;
            return (
              <span key={f} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 3,
                padding: '2px 6px',
                fontSize: 9,
                color,
                letterSpacing: '0.04em',
              }}>
                <FlagIcon size={8} strokeWidth={2} />
                {label}
              </span>
            );
          })}
          {flags.length > 2 && (
            <span style={{ fontSize: 9, color: 'var(--text-dim)', alignSelf: 'center' }}>
              +{flags.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
