import { motion } from 'framer-motion';
import type { CVE } from '../../db/schema';
import type { ThemeMode } from '../../types';
import { formatAge } from '../../utils/time';

interface CVECardProps {
  cve: CVE;
  isStudied: boolean;
  isSelected: boolean;
  onSelect: (cve: CVE) => void;
  onToggleStudied: (id: string) => void;
  theme: ThemeMode;
}

const TIER_ACCENT: Record<number, string> = {
  0: '#ff4444',
  1: '#ff8800',
  2: '#00ff9f',
  3: '#00a8ff',
  4: '#4a5568',
};

function cvssColor(score: number | null): string {
  if (score === null) return '#4a5568';
  if (score >= 9) return '#ff4444';
  if (score >= 7) return '#ff8800';
  if (score >= 4) return '#ffd700';
  return '#4a9eff';
}

export default function CVECard({ cve, isStudied, isSelected, onSelect, onToggleStudied, theme }: CVECardProps) {
  const isDark = theme === 'dark';
  const accent       = TIER_ACCENT[cve.tier] ?? '#4a5568';
  const textColor    = isDark ? '#c8d6e5' : '#334155';
  const mutedColor   = isDark ? '#8899aa' : '#94a3b8';
  const bgPanel      = isDark ? 'rgba(10,10,15,0.95)' : '#ffffff';
  const borderColor  = isSelected
    ? accent
    : isDark ? 'rgba(0,255,159,0.12)' : '#e2e8f0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(cve)}
      style={{
        background: bgPanel,
        border: `1px solid ${borderColor}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: '4px',
        padding: '12px 14px',
        marginBottom: '6px',
        cursor: 'pointer',
        position: 'relative',
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        boxShadow: isSelected
          ? isDark ? `0 0 0 1px ${accent}33, 0 4px 20px rgba(0,0,0,0.4)` : `0 0 0 1px ${accent}44`
          : isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Row 1: CVE ID + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span style={{ color: mutedColor, fontSize: '11px' }}>{'>'}</span>
        <span style={{ color: isDark ? '#00ff9f' : '#059669', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px' }}>
          {cve.cve_id}
        </span>

        {cve.in_kev && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#ff4444', border: '1px solid #ff444466', borderRadius: '2px', padding: '1px 5px', letterSpacing: '0.5px' }}>
            KEV
          </span>
        )}
        {cve.poc_available && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#ff8800', border: '1px solid #ff880066', borderRadius: '2px', padding: '1px 5px', letterSpacing: '0.5px' }}>
            PoC
          </span>
        )}
        {cve.vuln_type && (
          <span style={{ fontSize: '10px', color: mutedColor, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, borderRadius: '2px', padding: '1px 5px' }}>
            {cve.vuln_type}
          </span>
        )}

        {/* Studied toggle — right side */}
        <button
          onClick={e => { e.stopPropagation(); onToggleStudied(cve.id); }}
          title={isStudied ? 'Mark as unread (saved in your browser)' : 'Mark as studied (saved in your browser)'}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            color: isStudied ? (isDark ? '#00ff9f' : '#059669') : mutedColor,
            padding: '0 2px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {isStudied ? '✓' : '○'}
        </button>
      </div>

      {/* Row 2: affected software */}
      {cve.affected_software && (
        <div style={{ fontSize: '12px', color: textColor, marginBottom: '6px' }}>
          <span style={{ color: mutedColor }}>$ affected: </span>
          <span>{cve.affected_software}{cve.affected_versions ? ` ${cve.affected_versions}` : ''}</span>
        </div>
      )}

      {/* Row 3: scores + meta */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '11px', flexWrap: 'wrap' }}>
        {cve.cvss_score !== null && (
          <span>
            <span style={{ color: mutedColor }}>CVSS </span>
            <span style={{ color: cvssColor(cve.cvss_score), fontWeight: 700 }}>{cve.cvss_score.toFixed(1)}</span>
          </span>
        )}
        {cve.epss_score !== null && (
          <span>
            <span style={{ color: mutedColor }}>EPSS </span>
            <span style={{ color: cve.epss_score > 0.5 ? '#ff8800' : textColor, fontWeight: cve.epss_score > 0.5 ? 700 : 400 }}>
              {(cve.epss_score * 100).toFixed(1)}%
            </span>
          </span>
        )}
        {formatAge(cve.days_since_disclosure) !== null && (
          <span style={{ color: mutedColor }}>
            {formatAge(cve.days_since_disclosure)}
          </span>
        )}
        {cve.ecosystem && (
          <span style={{ color: mutedColor }}>{cve.ecosystem}</span>
        )}
        {cve.difficulty && (
          <span style={{
            color: cve.difficulty === 'nation-state' ? '#ff4444' : cve.difficulty === 'skilled' ? '#ff8800' : mutedColor,
          }}>
            {cve.difficulty}
          </span>
        )}
      </div>
    </motion.div>
  );
}
