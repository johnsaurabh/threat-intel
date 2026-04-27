import type { ReactNode } from 'react';
import type { CVE } from '../../../db/schema';
import type { ThemeMode } from '../../../types';
import { formatAge } from '../../../utils/time';

interface Props { cve: CVE; theme: ThemeMode; }

const DIFFICULTY_COLOR: Record<string, string> = {
  'script-kiddie': '#4a9eff',
  'skilled': '#ff8800',
  'nation-state': '#ff4444',
};

export default function IntelCard({ cve, theme }: Props) {
  const isDark = theme === 'dark';
  const accent      = isDark ? '#00ff9f' : '#059669';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const textColor   = isDark ? '#c8d6e5' : '#334155';
  const bgCode      = isDark ? 'rgba(0,255,159,0.04)' : '#f8fafc';
  const borderColor = isDark ? 'rgba(0,255,159,0.1)' : '#e2e8f0';

  const rows: [string, ReactNode][] = [
    ['CVSS', cve.cvss_score !== null ? (
      <span style={{ color: cve.cvss_score >= 9 ? '#ff4444' : cve.cvss_score >= 7 ? '#ff8800' : '#ffd700', fontWeight: 700 }}>
        {cve.cvss_score.toFixed(1)}
      </span>
    ) : null],
    ['EPSS', cve.epss_score !== null ? (
      <span style={{ color: cve.epss_score > 0.5 ? '#ff8800' : textColor }}>
        {(cve.epss_score * 100).toFixed(2)}%
      </span>
    ) : null],
    ['KEV',          cve.in_kev ? <span style={{ color: '#ff4444', fontWeight: 700 }}>YES — confirmed exploitation</span> : <span style={{ color: mutedColor }}>No</span>],
    ['PoC',          cve.poc_available ? <span style={{ color: '#ff8800', fontWeight: 700 }}>Available</span> : <span style={{ color: mutedColor }}>Not public</span>],
    ['Disclosure',   formatAge(cve.days_since_disclosure) !== null ? <span>{formatAge(cve.days_since_disclosure)}</span> : null],
    ['Difficulty',   cve.difficulty ? <span style={{ color: DIFFICULTY_COLOR[cve.difficulty] ?? textColor, fontWeight: 600, textTransform: 'capitalize' }}>{cve.difficulty}</span> : null],
    ['Threat Actors', cve.threat_actors?.length ? <span>{cve.threat_actors.join(', ')}</span> : null],
  ].filter(([, val]) => val !== null) as [string, React.ReactNode][];

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: mutedColor, fontSize: '11px', marginBottom: '8px' }}>$ cat intel_card.txt</div>
      <div style={{ background: bgCode, border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '12px' }}>
        {rows.map(([label, val]) => (
          <div key={label} style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '12px', fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
            <span style={{ color: accent, minWidth: '110px', flexShrink: 0 }}>{label}</span>
            <span style={{ color: textColor }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
