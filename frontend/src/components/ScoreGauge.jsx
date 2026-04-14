import React from 'react';

const SIZE = 80;
const STROKE = 6;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function scoreColor(score) {
  if (score >= 70) return '#00ff88';
  if (score >= 40) return '#ffd700';
  return '#ff3366';
}

function scoreGlow(score) {
  if (score >= 70) return 'drop-shadow(0 0 5px rgba(0,255,136,0.7))';
  if (score >= 40) return 'drop-shadow(0 0 5px rgba(255,215,0,0.7))';
  return 'drop-shadow(0 0 5px rgba(255,51,102,0.7))';
}

export function ScoreGauge({ score = 0, label, size = SIZE }) {
  const clamped = Math.max(0, Math.min(100, score));
  const pct = clamped / 100;
  const dash = pct * CIRC;
  const gap = CIRC - dash;
  const color = scoreColor(clamped);
  const scale = size / SIZE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-label={`${label ?? 'Score'}: ${clamped} out of 100`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={STROKE}
        />
        {/* Progress */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          style={{
            filter: scoreGlow(clamped),
            transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
        {/* Score text */}
        <text
          x={SIZE / 2} y={SIZE / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={17}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}
        >
          {clamped}
        </text>
      </svg>
      {label && (
        <span style={{
          fontSize: 9,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          fontWeight: 500,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

export function MiniScoreBar({ label, score }) {
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
        <span style={{ letterSpacing: '0.04em' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{score}</span>
      </div>
      <div style={{
        height: 2,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}66`,
          transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
          borderRadius: 1,
        }} />
      </div>
    </div>
  );
}
