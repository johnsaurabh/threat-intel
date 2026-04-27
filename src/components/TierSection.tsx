import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CVECard from './CVECard';
import type { CVE, TierLevel } from '../../db/schema';
import type { ThemeMode } from '../../types';

interface TierSectionProps {
  tier: TierLevel;
  cves: CVE[];
  selectedId: string | null;
  studiedIds: Set<string>;
  onSelectCVE: (cve: CVE) => void;
  onToggleStudied: (id: string) => void;
  theme: ThemeMode;
  defaultCollapsed?: boolean;
}

const TIER_META: Record<number, { label: string; color: string; glow?: string }> = {
  0: { label: 'CRITICAL — Active Exploitation',   color: '#ff4444', glow: 'rgba(255,68,68,0.12)' },
  1: { label: 'HIGH — Exploit Available / KEV',   color: '#ff8800', glow: 'rgba(255,136,0,0.08)' },
  2: { label: 'ELEVATED — High CVSS + EPSS',      color: '#ffd700', glow: undefined },
  3: { label: 'WATCH — Research Value',           color: '#00ff9f', glow: undefined },
  4: { label: 'MONITOR — Low Signal',             color: '#4a5568', glow: undefined },
};

export default function TierSection({
  tier, cves, selectedId, studiedIds, onSelectCVE, onToggleStudied, theme, defaultCollapsed = false,
}: TierSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const isDark = theme === 'dark';
  const meta = TIER_META[tier];
  const studiedCount = cves.filter(c => studiedIds.has(c.id)).length;

  const headerBg = isDark
    ? meta.glow ? `linear-gradient(90deg, ${meta.glow}, transparent)` : 'transparent'
    : 'transparent';

  return (
    <div style={{ marginBottom: '8px' }}>
      {/* Tier header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          background: headerBg,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}`,
          borderLeft: `3px solid ${meta.color}`,
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          textAlign: 'left',
        }}
      >
        {/* Tier badge */}
        <span style={{ fontSize: '11px', fontWeight: 700, color: meta.color, minWidth: '14px' }}>
          T{tier}
        </span>

        {/* Label */}
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: meta.color,
          letterSpacing: '0.8px',
          flex: 1,
        }}>
          {meta.label}
        </span>

        {/* Count */}
        <span style={{
          fontSize: '10px',
          color: studiedCount === cves.length && cves.length > 0
            ? (isDark ? '#00ff9f' : '#059669')
            : isDark ? '#8899aa' : '#94a3b8',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
          borderRadius: '2px',
          padding: '1px 6px',
        }}>
          {cves.length === 0
            ? '0'
            : studiedCount === cves.length
            ? `${cves.length}/${cves.length} studied`
            : `${cves.length} CVEs`}
        </span>

        {/* Collapse arrow */}
        <span style={{
          fontSize: '10px',
          color: isDark ? '#8899aa' : '#94a3b8',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          marginLeft: '4px',
        }}>
          ▾
        </span>
      </button>

      {/* CVE list */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '4px' }}>
              {cves.length === 0 ? (
                <div style={{
                  padding: '12px 14px',
                  fontSize: '12px',
                  color: isDark ? '#8899aa' : '#94a3b8',
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                }}>
                  {'> no CVEs in this tier'}
                </div>
              ) : (
                cves.map(cve => (
                  <CVECard
                    key={cve.id}
                    cve={cve}
                    isStudied={studiedIds.has(cve.id)}
                    isSelected={selectedId === cve.id}
                    onSelect={onSelectCVE}
                    onToggleStudied={onToggleStudied}
                    theme={theme}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
