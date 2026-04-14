import React from 'react';

const SIZE = 80;
const STROKE = 7;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function scoreColor(score) {
  if (score >= 70) return '#00ff88';
  if (score >= 40) return '#ffcc00';
  return '#ff3366';
}

export function ScoreGauge({ score = 0, label, size = SIZE }) {
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = pct * CIRC;
  const gap = CIRC - dash;
  const color = scoreColor(score);
  const scale = size / SIZE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        {/* Progress */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 4px ${color})`,
            transition: 'stroke-dasharray 0.6s ease',
          }}
        />
        {/* Score text — rotate back */}
        <text
          x={SIZE / 2}
          y={SIZE / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={18 * (1 / scale) * scale}
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          style={{ transform: `rotate(90deg)`, transformOrigin: '50% 50%' }}
        >
          {score}
        </text>
      </svg>
      {label && (
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
      )}
    </div>
  );
}

export function MiniScoreBar({ label, score }) {
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
        <span>{label}</span>
        <span style={{ color }}>{score}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: color,
          boxShadow: `0 0 6px ${color}`,
          transition: 'width 0.6s ease',
          borderRadius: 2,
        }} />
      </div>
    </div>
  );
}
