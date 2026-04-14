import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  X, TrendingUp, Eye, XCircle, AlertTriangle, CheckCircle,
  Flame, Droplets, Shield, AlertCircle, Info,
} from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';

const FLAG_META = {
  high_concentration:    { Icon: AlertTriangle, label: 'High Concentration',   color: '#ffd700' },
  unverified_contract:   { Icon: AlertTriangle, label: 'Unverified Contract',  color: '#ffd700' },
  creator_rug_history:   { Icon: XCircle,       label: 'Rug History',          color: '#ff3366' },
  low_liquidity:         { Icon: Droplets,      label: 'Low Liquidity',        color: '#ff8c00' },
  strong_narrative:      { Icon: Flame,         label: 'Strong Narrative',     color: '#00ff88' },
  clean_creator:         { Icon: CheckCircle,   label: 'Clean Creator',        color: '#00ff88' },
  healthy_distribution:  { Icon: Shield,        label: 'Healthy Distribution', color: '#00d4ff' },
  high_liquidity:        { Icon: Droplets,      label: 'Deep Liquidity',       color: '#00d4ff' },
  moderate_concentration:{ Icon: AlertTriangle, label: 'Moderate Concentration', color: '#ff8c00' },
  suspicious_name:       { Icon: AlertCircle,   label: 'Suspicious Name',      color: '#ff3366' },
};

const REC_META = {
  ENTER: { Icon: TrendingUp, label: 'ENTER', color: '#00ff88', bg: 'rgba(0,255,136,0.10)', border: 'rgba(0,255,136,0.35)' },
  WATCH: { Icon: Eye,        label: 'WATCH',  color: '#ffd700', bg: 'rgba(255,215,0,0.08)',  border: 'rgba(255,215,0,0.35)' },
  AVOID: { Icon: XCircle,    label: 'AVOID',  color: '#ff3366', bg: 'rgba(255,51,102,0.08)', border: 'rgba(255,51,102,0.35)' },
};

const HOLDER_COLORS = ['#ff3366', '#00d4ff'];

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9,
      color: 'var(--text-dim)',
      textTransform: 'uppercase',
      letterSpacing: '0.14em',
      marginBottom: 8,
      fontWeight: 500,
    }}>
      {children}
    </div>
  );
}

export function TokenDetail({ token, onClose }) {
  if (!token) return null;

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const flags = Array.isArray(token.flags) ? token.flags : [];
  const rec = REC_META[token.recommendation] ?? REC_META.WATCH;
  const { Icon: RecIcon } = rec;

  const holderData = [
    { name: 'Top 10', value: token.top10_concentration || 50 },
    { name: 'Others', value: Math.max(0, 100 - (token.top10_concentration || 50)) },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Token details for ${token.symbol}`}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-blue)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 0 50px rgba(0,212,255,0.12), 0 24px 60px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          animation: 'fade-in 0.2s ease',
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 900,
              color: 'var(--neon-blue)',
              letterSpacing: '0.04em',
              textShadow: '0 0 16px rgba(0,212,255,0.4)',
            }}>
              ${token.symbol}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{token.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
              {token.address ? `${token.address.slice(0, 10)}…${token.address.slice(-6)}` : '—'}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close token details"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-fast)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'var(--text-dim)';
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Score gauges */}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '4px 0 8px' }}>
          <ScoreGauge score={token.overall_score ?? 0} label="Overall" size={90} />
          <ScoreGauge score={token.safety_score ?? 0} label="Safety" size={70} />
          <ScoreGauge score={token.alpha_score ?? 0} label="Alpha" size={70} />
          <ScoreGauge score={token.narrative_score ?? 0} label="Narrative" size={70} />
        </div>

        {/* Recommendation */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: rec.bg,
            color: rec.color,
            border: `1px solid ${rec.border}`,
            borderRadius: 6,
            padding: '7px 24px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}>
            <RecIcon size={14} strokeWidth={2.5} />
            {rec.label}
          </span>
        </div>

        {/* AI Analysis */}
        <div style={{
          background: 'rgba(0,212,255,0.04)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8,
          }}>
            <Info size={10} color="var(--neon-blue)" strokeWidth={2} />
            <span style={{ fontSize: 9, color: 'var(--neon-blue)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              AI Analysis
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65, fontStyle: 'italic' }}>
            "{token.analysis_text || 'Analysis pending…'}"
          </div>
        </div>

        {/* Flags */}
        {flags.length > 0 && (
          <div>
            <SectionLabel>Risk Flags</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {flags.map((f) => {
                const meta = FLAG_META[f];
                if (!meta) return null;
                const { Icon: FlagIcon, label, color } = meta;
                return (
                  <span key={f} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}44`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 10px',
                    fontSize: 11,
                    color,
                    letterSpacing: '0.03em',
                  }}>
                    <FlagIcon size={10} strokeWidth={2} />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Holder distribution */}
        <div>
          <SectionLabel>Holder Distribution</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 110, height: 110, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={holderData}
                    cx="50%" cy="50%"
                    innerRadius={26} outerRadius={48}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {holderData.map((_, i) => (
                      <Cell key={i} fill={HOLDER_COLORS[i % HOLDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(1)}%`]}
                    contentStyle={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: 6,
                      fontSize: 11,
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: HOLDER_COLORS[0], flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>Top 10 wallets:</span>
                <span style={{ color: HOLDER_COLORS[0], fontWeight: 600 }}>
                  {token.top10_concentration?.toFixed(1) ?? '?'}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: HOLDER_COLORS[1], flexShrink: 0 }} />
                <span style={{ color: 'var(--text-secondary)' }}>Community:</span>
                <span style={{ color: HOLDER_COLORS[1], fontWeight: 600 }}>
                  {(100 - (token.top10_concentration || 0)).toFixed(1)}%
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--border-dim)', margin: '2px 0' }} />
              <div style={{ color: 'var(--text-secondary)' }}>
                Holders: <span style={{ color: 'var(--text-primary)' }}>{token.holder_count ?? '?'}</span>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Liquidity: <span style={{ color: 'var(--text-primary)' }}>{token.liquidity_bnb?.toFixed(2) ?? '?'} BNB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Links row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Four.Meme', color: '#00ff88' },
            { label: 'BSCScan',   color: '#00d4ff' },
          ].map(({ label, color }) => (
            <div key={label} style={{
              flex: 1, textAlign: 'center',
              background: `${color}0d`,
              border: `1px solid ${color}33`,
              borderRadius: 'var(--radius-md)',
              padding: '8px',
              fontSize: 11,
              color: `${color}80`,
              cursor: 'default',
              letterSpacing: '0.05em',
            }}>
              {label} ↗
            </div>
          ))}
          <div style={{
            flex: 1, textAlign: 'center',
            background: 'rgba(180,77,255,0.08)',
            border: '1px solid rgba(180,77,255,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            fontSize: 10,
            color: 'var(--neon-purple)',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}>
            DEMO MODE
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 10,
          color: 'var(--text-dim)',
        }}>
          <AlertTriangle size={10} strokeWidth={2} />
          DYOR — Not financial advice. MemeGuard AI provides analysis only.
        </div>
      </div>
    </div>
  );
}
