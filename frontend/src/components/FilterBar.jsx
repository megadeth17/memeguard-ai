import React from 'react';
import { TrendingUp, Eye, XCircle, LayoutGrid } from 'lucide-react';

const REC_OPTIONS = [
  { label: 'All',   value: '',      Icon: LayoutGrid },
  { label: 'Enter', value: 'ENTER', Icon: TrendingUp },
  { label: 'Watch', value: 'WATCH', Icon: Eye },
  { label: 'Avoid', value: 'AVOID', Icon: XCircle },
];

const SCORE_OPTIONS = [
  { label: 'All scores', value: 0 },
  { label: '70+',        value: 70 },
  { label: '50+',        value: 50 },
  { label: '30+',        value: 30 },
];

const TIME_OPTIONS = [
  { label: '24h', value: 24 },
  { label: '12h', value: 12 },
  { label: '6h',  value: 6 },
  { label: '1h',  value: 1 },
];

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: active ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
        border: active ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 4,
        color: active ? 'var(--neon-blue)' : 'var(--text-secondary)',
        padding: '4px 11px',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        fontWeight: active ? 600 : 400,
        letterSpacing: '0.04em',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: 'var(--border-dim)', flexShrink: 0 }} />;
}

export function FilterBar({ filters, onChange, resultCount }) {
  const { recommendation, minScore, maxHours } = filters;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 6,
      padding: '8px 0 10px',
      borderBottom: '1px solid var(--border-dim)',
      marginBottom: 12,
    }}>
      <span style={{
        fontSize: 9,
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginRight: 2,
        flexShrink: 0,
      }}>
        Filter
      </span>

      {REC_OPTIONS.map(({ label, value, Icon }) => (
        <Pill key={value} active={recommendation === value} onClick={() => onChange({ ...filters, recommendation: value })}>
          <Icon size={10} strokeWidth={2} />
          {label}
        </Pill>
      ))}

      <Divider />

      {SCORE_OPTIONS.map(({ label, value }) => (
        <Pill key={value} active={minScore === value} onClick={() => onChange({ ...filters, minScore: value })}>
          {label}
        </Pill>
      ))}

      <Divider />

      {TIME_OPTIONS.map(({ label, value }) => (
        <Pill key={value} active={maxHours === value} onClick={() => onChange({ ...filters, maxHours: value })}>
          {label}
        </Pill>
      ))}

      {resultCount !== undefined && (
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }}>
          {resultCount} token{resultCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
