import type { ThemeMode } from '../../types';

interface StatBarProps {
  totalCVEs: number;
  studiedCount: number;
  kevCount: number;
  tier0Count: number;
  lastUpdated: Date | null;
  theme: ThemeMode;
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function StatBar({ totalCVEs, studiedCount, kevCount, tier0Count, lastUpdated, theme }: StatBarProps) {
  const isDark = theme === 'dark';
  const accent     = isDark ? '#00ff9f' : '#059669';
  const mutedColor = isDark ? '#8899aa' : '#94a3b8';
  const borderColor = isDark ? 'rgba(0,255,159,0.1)' : '#e2e8f0';

  const sep = <span style={{ color: mutedColor, margin: '0 10px' }}>|</span>;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      padding: '6px 20px',
      borderBottom: `1px solid ${borderColor}`,
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      fontSize: '11px',
      gap: '2px',
      background: isDark ? 'rgba(5,5,8,0.9)' : '#fafafa',
    }}>
      <span style={{ color: mutedColor }}>TOTAL: </span>
      <span style={{ color: accent, fontWeight: 700 }}>{totalCVEs}</span>

      {sep}

      <span style={{ color: mutedColor }}>STUDIED: </span>
      <span style={{ color: studiedCount > 0 ? accent : mutedColor }}>
        {studiedCount} / {totalCVEs}
      </span>
      <span style={{ color: mutedColor, fontSize: '10px', marginLeft: '3px' }} title="Stored in your browser only — private to you">
        (local)
      </span>

      {sep}

      <span style={{ color: mutedColor }}>KEV: </span>
      <span style={{ color: kevCount > 0 ? '#ff8800' : mutedColor, fontWeight: kevCount > 0 ? 700 : 400 }}>
        {kevCount}
      </span>

      {sep}

      <span style={{ color: mutedColor }}>CRITICAL: </span>
      <span style={{
        color: tier0Count > 0 ? '#ff4444' : mutedColor,
        fontWeight: tier0Count > 0 ? 700 : 400,
      }}>
        {tier0Count}
        {tier0Count > 0 && ' ⚠'}
      </span>

      {sep}

      <span style={{ color: mutedColor }}>
        UPDATED: {lastUpdated ? relativeTime(lastUpdated) : '—'}
      </span>
    </div>
  );
}
