import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CVE } from '../../db/schema';
import type { ThemeMode } from '../../types';
import IntelCard from './drawer/IntelCard';
import TechDeepDive from './drawer/TechDeepDive';
import AttackChain from './drawer/AttackChain';
import DefenseDetection from './drawer/DefenseDetection';
import KnowledgeAnchors from './drawer/KnowledgeAnchors';

interface CVEDrawerProps {
  cve: CVE | null;
  theme: ThemeMode;
  isMobile?: boolean;
  onClose: () => void;
  onSelectSimilar?: (id: string) => void;
}

const TIER_LABEL: Record<number, string> = {
  0: 'CRITICAL', 1: 'HIGH', 2: 'ELEVATED', 3: 'WATCH', 4: 'MONITOR',
};
const TIER_COLOR: Record<number, string> = {
  0: '#ff4444', 1: '#ff8800', 2: '#ffd700', 3: '#00ff9f', 4: '#4a5568',
};

const DRAWER_WIDTH = 480;

export default function CVEDrawer({ cve, theme, isMobile = false, onClose, onSelectSimilar }: CVEDrawerProps) {
  const isDark = theme === 'dark';
  const bgPanel     = isDark ? 'rgba(8,8,12,0.98)' : '#ffffff';
  const borderColor = isDark ? 'rgba(0,255,159,0.15)' : '#e2e8f0';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const textColor   = isDark ? '#c8d6e5' : '#334155';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {cve && (
        <>
          {/* Mobile backdrop */}
          {isMobile && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 499,
              }}
            />
          )}
        <motion.div
          key="drawer"
          initial={isMobile ? { y: '100%' } : { x: DRAWER_WIDTH }}
          animate={isMobile ? { y: 0 } : { x: 0 }}
          exit={isMobile ? { y: '100%' } : { x: DRAWER_WIDTH }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            position: 'fixed',
            ...(isMobile
              ? { top: 0, left: 0, right: 0, bottom: 0, width: '100vw', borderLeft: 'none', borderTop: `1px solid ${borderColor}` }
              : { top: 64, right: 0, width: DRAWER_WIDTH, bottom: 0, borderLeft: `1px solid ${borderColor}` }
            ),
            background: bgPanel,
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            boxShadow: isDark ? '-8px 0 32px rgba(0,0,0,0.5)' : '-4px 0 24px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: `1px solid ${borderColor}`,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#00ff9f' : '#059669', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {cve.cve_id}
                </div>
                {cve.affected_software && (
                  <div style={{ fontSize: '12px', color: textColor }}>
                    <span style={{ color: mutedColor }}>$ affected: </span>{cve.affected_software}
                    {cve.affected_versions ? ` ${cve.affected_versions}` : ''}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: mutedColor,
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '0 4px',
                  flexShrink: 0,
                }}
                title="Close (Esc)"
              >
                ×
              </button>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: TIER_COLOR[cve.tier],
                border: `1px solid ${TIER_COLOR[cve.tier]}55`,
                borderRadius: '2px', padding: '2px 7px',
              }}>
                T{cve.tier} {TIER_LABEL[cve.tier]}
              </span>
              {cve.in_kev && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ff4444', border: '1px solid #ff444466', borderRadius: '2px', padding: '2px 7px' }}>
                  CISA KEV
                </span>
              )}
              {cve.poc_available && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ff8800', border: '1px solid #ff880066', borderRadius: '2px', padding: '2px 7px' }}>
                  PoC Public
                </span>
              )}
              {cve.vuln_type && (
                <span style={{ fontSize: '10px', color: mutedColor, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRadius: '2px', padding: '2px 7px' }}>
                  {cve.vuln_type}
                </span>
              )}
              {cve.ecosystem && (
                <span style={{ fontSize: '10px', color: mutedColor, border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, borderRadius: '2px', padding: '2px 7px' }}>
                  {cve.ecosystem}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <IntelCard cve={cve} theme={theme} />
            <TechDeepDive cve={cve} theme={theme} />
            <AttackChain cve={cve} theme={theme} onSelectCVE={onSelectSimilar} />
            <DefenseDetection cve={cve} theme={theme} />
            <KnowledgeAnchors cve={cve} theme={theme} />

            {/* Fallback if no enrichment yet */}
            {!cve.attack_narrative && !cve.root_cause && !cve.patch_info && !cve.interview_questions?.length && (
              <div style={{ color: mutedColor, fontSize: '12px', fontFamily: "'SF Mono', 'Fira Code', monospace", padding: '12px 0' }}>
                <div>{'> enrichment pending — pipeline will populate this shortly'}</div>
                <div style={{ marginTop: '6px', color: isDark ? '#8899aa' : '#94a3b8', fontSize: '11px' }}>
                  CVE data is current. AI enrichment (attack narrative, interview Qs, MITRE mapping) generates on the next Lambda run.
                </div>
              </div>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
