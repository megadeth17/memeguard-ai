import React from 'react';

const BTN = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-dim)',
  borderRadius: 4,
  color: 'var(--text-secondary)',
  padding: '4px 12px',
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  transition: 'all 150ms ease',
};

const BTN_ACTIVE = {
  ...BTN,
  background: 'rgba(0,212,255,0.1)',
  border: '1px solid var(--neon-blue)',
  color: 'var(--neon-blue)',
};

export function FilterBar({ filters, onChange }) {
  const { recommendation, minScore, maxHours } = filters;

  const recOptions = [
    { label: 'All', value: '' },
    { label: '⚡ ENTER', value: 'ENTER' },
    { label: '👁 WATCH', value: 'WATCH' },
    { label: '🚫 AVOID', value: 'AVOID' },
  ];

  const scoreOptions = [
    { label: 'All scores', value: 0 },
    { label: '70+', value: 70 },
    { label: '50+', value: 50 },
    { label: '30+', value: 30 },
  ];

  const timeOptions = [
    { label: '24h', value: 24 },
    { label: '12h', value: 12 },
    { label: '6h', value: 6 },
    { label: '1h', value: 1 },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      padding: '10px 0',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter:</span>

      {/* Recommendation */}
      <div style={{ display: 'flex', gap: 4 }}>
        {recOptions.map((o) => (
          <button
            key={o.value}
            style={recommendation === o.value ? BTN_ACTIVE : BTN}
            onClick={() => onChange({ ...filters, recommendation: o.value })}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-dim)' }} />

      {/* Min score */}
      <div style={{ display: 'flex', gap: 4 }}>
        {scoreOptions.map((o) => (
          <button
            key={o.value}
            style={minScore === o.value ? BTN_ACTIVE : BTN}
            onClick={() => onChange({ ...filters, minScore: o.value })}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-dim)' }} />

      {/* Time range */}
      <div style={{ display: 'flex', gap: 4 }}>
        {timeOptions.map((o) => (
          <button
            key={o.value}
            style={maxHours === o.value ? BTN_ACTIVE : BTN}
            onClick={() => onChange({ ...filters, maxHours: o.value })}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
