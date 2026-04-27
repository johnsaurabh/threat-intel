import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useCVEFeed } from '../hooks/useCVEFeed';
import { useCVEHallOfFame } from '../hooks/useCVEHallOfFame';
import { useStudyQueue } from '../hooks/useStudyQueue';
import { useFilterState } from '../hooks/useFilterState';
import useIsMobile from '../hooks/useIsMobile';
import MenuBar from '../components/MenuBar';
import StatBar from '../components/threat-intel/StatBar';
import FilterBar from '../components/threat-intel/FilterBar';
import TierSection from '../components/threat-intel/TierSection';
import CVECard from '../components/threat-intel/CVECard';
import CVEDrawer from '../components/threat-intel/CVEDrawer';
import type { CVE, TierLevel } from '../db/schema';

const TIERS: TierLevel[] = [0, 1, 2, 3, 4];
const HOF_CATEGORIES = ['RCE', 'Memory Corruption', 'Auth Bypass', 'Crypto & Network', 'Supply Chain', 'Injection', 'LPE'];

function LoadingState({ theme }: { theme: string }) {
  const isDark = theme === 'dark';
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: '40px 20px', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '13px', color: isDark ? '#8899aa' : '#94a3b8' }}>
      <div style={{ color: isDark ? '#00ff9f' : '#059669', marginBottom: '8px' }}>{'> initializing threat feed' + dots}</div>
      <div>{'> connecting to intelligence database' + dots}</div>
    </div>
  );
}

function ErrorState({ error, onRetry, theme }: { error: string; onRetry: () => void; theme: string }) {
  const isDark = theme === 'dark';
  return (
    <div style={{ padding: '40px 20px', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '13px' }}>
      <div style={{ color: '#ff4444', marginBottom: '6px' }}>{'> ERROR: failed to connect to intelligence feed'}</div>
      <div style={{ color: isDark ? '#8899aa' : '#94a3b8', marginBottom: '16px', fontSize: '12px' }}>{error}</div>
      <button
        onClick={onRetry}
        style={{
          background: 'none',
          border: `1px solid ${isDark ? 'rgba(0,255,159,0.3)' : '#bbf7d0'}`,
          borderRadius: '2px',
          color: isDark ? '#00ff9f' : '#059669',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: '12px',
          padding: '5px 14px',
          cursor: 'pointer',
        }}
      >
        {'$ retry'}
      </button>
    </div>
  );
}

interface TabBarProps {
  activeTab: 'feed' | 'hof';
  onSwitch: (tab: 'feed' | 'hof') => void;
  theme: string;
}

function TabBar({ activeTab, onSwitch, theme }: TabBarProps) {
  const isDark = theme === 'dark';
  const accent = isDark ? '#00ff9f' : '#059669';
  const muted = isDark ? '#8899aa' : '#94a3b8';
  const border = isDark ? 'rgba(0,255,159,0.15)' : '#e2e8f0';
  const font = "'SF Mono', 'Fira Code', monospace";

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
    color: active ? accent : muted,
    fontFamily: font,
    fontSize: '12px',
    padding: '10px 20px',
    cursor: 'pointer',
    letterSpacing: '0.05em',
    transition: 'color 0.15s, border-color 0.15s',
  });

  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, background: isDark ? '#050508' : '#F7F7F5', flexShrink: 0 }}>
      <button style={tabStyle(activeTab === 'feed')} onClick={() => onSwitch('feed')}>
        {activeTab === 'feed' ? '> ' : '  '}LIVE FEED
      </button>
      <button style={tabStyle(activeTab === 'hof')} onClick={() => onSwitch('hof')}>
        {activeTab === 'hof' ? '> ' : '  '}★ HALL OF FAME
      </button>
    </div>
  );
}

interface CategoryStripProps {
  active: string | null;
  onSelect: (cat: string | null) => void;
  theme: string;
}

function CategoryStrip({ active, onSelect, theme }: CategoryStripProps) {
  const isDark = theme === 'dark';
  const accent = isDark ? '#00ff9f' : '#059669';
  const muted = isDark ? '#8899aa' : '#94a3b8';
  const border = isDark ? 'rgba(0,255,159,0.15)' : '#e2e8f0';
  const activeBg = isDark ? 'rgba(0,255,159,0.08)' : 'rgba(5,150,105,0.06)';
  const font = "'SF Mono', 'Fira Code', monospace";

  const btnStyle = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? activeBg : 'none',
    border: `1px solid ${isActive ? accent : border}`,
    borderRadius: '2px',
    color: isActive ? accent : muted,
    fontFamily: font,
    fontSize: '11px',
    padding: '4px 10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ display: 'flex', gap: '6px', padding: '10px 20px', borderBottom: `1px solid ${border}`, flexWrap: 'wrap', flexShrink: 0 }}>
      <button style={btnStyle(active === null)} onClick={() => onSelect(null)}>ALL</button>
      {HOF_CATEGORIES.map(cat => (
        <button key={cat} style={btnStyle(active === cat)} onClick={() => onSelect(active === cat ? null : cat)}>
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function ThreatIntelPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();

  // Feed state
  const { cves, loading, error, refetch } = useCVEFeed();
  const { cves: hofCVEs, loading: hofLoading, error: hofError, refetch: hofRefetch } = useCVEHallOfFame();
  const { studiedIds, toggleStudied } = useStudyQueue();
  const { filters, setFilters, clearFilters, isActive, applyFilters } = useFilterState();
  const [selectedCVE, setSelectedCVE] = useState<CVE | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'hof'>('feed');
  const [hofCategory, setHofCategory] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const lastUpdated = useRef<Date | null>(null);

  if (!loading && cves.length > 0 && !lastUpdated.current) {
    lastUpdated.current = new Date();
  }

  const filteredCVEs = useMemo(
    () => applyFilters(cves, studiedIds),
    [cves, applyFilters, studiedIds]
  );

  const cvesByTier = useMemo(() => {
    const map: Record<TierLevel, CVE[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
    filteredCVEs.forEach(cve => { map[cve.tier]?.push(cve); });
    return map;
  }, [filteredCVEs]);

  const filteredHOF = useMemo(() => {
    return hofCategory ? hofCVEs.filter(c => c.hof_category === hofCategory) : hofCVEs;
  }, [hofCVEs, hofCategory]);

  const stats = useMemo(() => ({
    total: cves.length,
    studied: studiedIds.size,
    kev: cves.filter(c => c.in_kev).length,
    tier0: cves.filter(c => c.tier === 0).length,
  }), [cves, studiedIds]);

  const handleSelectCVE = useCallback((cve: CVE) => {
    setSelectedCVE(prev => prev?.id === cve.id ? null : cve);
  }, []);

  const handleSelectSimilar = useCallback((cveId: string) => {
    const allCVEs = [...cves, ...hofCVEs];
    const match = allCVEs.find(c => c.cve_id === cveId);
    if (match) setSelectedCVE(match);
  }, [cves, hofCVEs]);

  const handleTabSwitch = useCallback((tab: 'feed' | 'hof') => {
    setActiveTab(tab);
    setSelectedCVE(null);
    if (tab === 'feed') setHofCategory(null);
  }, []);

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!selectedCVE) return;
      if (!(e.target instanceof Node)) return;
      const drawer = document.getElementById('cve-drawer');
      if (drawer && !drawer.contains(e.target)) {
        const target = e.target as HTMLElement;
        if (!target.closest('[data-cve-card]')) setSelectedCVE(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedCVE]);

  const drawerOpen = !!selectedCVE;
  const bgColor = isDark ? '#050508' : '#F7F7F5';
  const accent   = isDark ? '#00ff9f' : '#059669';
  const muted    = isDark ? '#8899aa' : '#94a3b8';
  const border   = isDark ? 'rgba(0,255,159,0.15)' : '#e2e8f0';
  const font     = "'SF Mono', 'Fira Code', monospace";

  // ── Mobile layout ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100dvh', background: bgColor, display: 'flex', flexDirection: 'column', fontFamily: font, overflowX: 'hidden' }}>

        {/* Sticky top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: isDark ? 'rgba(5,5,8,0.95)' : 'rgba(247,247,245,0.95)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${border}`,
          padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: muted, fontSize: 12, textDecoration: 'none', fontFamily: font }}>← home</a>
            <span style={{ color: muted }}>|</span>
            <span style={{ color: accent, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>THREAT INTEL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {stats.kev > 0 && (
              <span style={{ fontSize: 11, color: '#ff4444', fontWeight: 700 }}>{stats.kev} KEV</span>
            )}
            {stats.tier0 > 0 && (
              <span style={{ fontSize: 11, color: '#ff4444', fontWeight: 700 }}>{stats.tier0} ⚠</span>
            )}
            <span style={{ fontSize: 11, color: muted }}>{stats.total} CVEs</span>
            <button
              onClick={toggleTheme}
              style={{ background: 'none', border: `1px solid ${border}`, borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 10, color: accent, fontFamily: font }}
            >
              {isDark ? 'LIGHT' : 'DARK'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          {(['feed', 'hof'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              style={{
                flex: 1, background: 'none', border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${accent}` : '2px solid transparent',
                color: activeTab === tab ? accent : muted,
                fontFamily: font, fontSize: 11, padding: '10px 0', cursor: 'pointer', letterSpacing: '0.05em',
              }}
            >
              {tab === 'feed' ? 'LIVE FEED' : '★ HALL OF FAME'}
            </button>
          ))}
        </div>

        {/* Search bar (feed only) */}
        {activeTab === 'feed' && (
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: muted, fontSize: 11, pointerEvents: 'none' }}>$</span>
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters({ search: e.target.value })}
                placeholder='search CVEs...'
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  border: `1px solid ${border}`, borderRadius: 4,
                  color: isDark ? '#c8d6e5' : '#334155',
                  fontFamily: font, fontSize: 12,
                  padding: '8px 12px 8px 24px', outline: 'none',
                }}
              />
            </div>
          </div>
        )}

        {/* HOF category strip */}
        {activeTab === 'hof' && (
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: `1px solid ${border}`, overflowX: 'auto', flexShrink: 0 }}>
            {[null, ...HOF_CATEGORIES].map(cat => (
              <button
                key={cat ?? 'all'}
                onClick={() => setHofCategory(cat)}
                style={{
                  background: hofCategory === cat ? (isDark ? 'rgba(0,255,159,0.08)' : 'rgba(5,150,105,0.06)') : 'none',
                  border: `1px solid ${hofCategory === cat ? accent : border}`,
                  borderRadius: 2, color: hofCategory === cat ? accent : muted,
                  fontFamily: font, fontSize: 11, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {cat === null ? 'ALL' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* CVE list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {activeTab === 'feed' && (
            <>
              {loading && <LoadingState theme={theme} />}
              {error && !loading && <ErrorState error={error} onRetry={refetch} theme={theme} />}
              {!loading && !error && TIERS.map(tier => (
                <div key={tier} data-cve-card>
                  <TierSection
                    tier={tier}
                    cves={cvesByTier[tier]}
                    selectedId={selectedCVE?.id ?? null}
                    studiedIds={studiedIds}
                    onSelectCVE={handleSelectCVE}
                    onToggleStudied={toggleStudied}
                    theme={theme}
                    defaultCollapsed={tier === 4}
                  />
                </div>
              ))}
            </>
          )}
          {activeTab === 'hof' && (
            <>
              {hofLoading && <LoadingState theme={theme} />}
              {hofError && !hofLoading && <ErrorState error={hofError} onRetry={hofRefetch} theme={theme} />}
              {!hofLoading && !hofError && filteredHOF.length === 0 && (
                <div style={{ padding: '40px 0', fontSize: 12, color: muted }}>
                  {hofCVEs.length === 0 ? '> no Hall of Fame CVEs loaded yet' : `> no CVEs in: ${hofCategory}`}
                </div>
              )}
              {!hofLoading && !hofError && filteredHOF.map(cve => (
                <div key={cve.cve_id} data-cve-card>
                  <CVECard
                    cve={cve}
                    isStudied={studiedIds.has(cve.cve_id)}
                    isSelected={selectedCVE?.id === cve.id}
                    onSelect={handleSelectCVE}
                    onToggleStudied={toggleStudied}
                    theme={theme}
                  />
                </div>
              ))}
            </>
          )}
        </div>

        {/* Fullscreen drawer */}
        <CVEDrawer
          cve={selectedCVE}
          theme={theme}
          isMobile={true}
          onClose={() => setSelectedCVE(null)}
          onSelectSimilar={handleSelectSimilar}
        />

        {stats.tier0 > 0 && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #ff4444, transparent)', zIndex: 999, pointerEvents: 'none' }} />
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: bgColor, overflow: 'hidden' }}>
      <MenuBar theme={theme} onToggleTheme={toggleTheme} onLogoClick={() => {}} />
      <StatBar
        totalCVEs={stats.total}
        studiedCount={stats.studied}
        kevCount={stats.kev}
        tier0Count={stats.tier0}
        lastUpdated={lastUpdated.current}
        theme={theme}
      />

      <TabBar activeTab={activeTab} onSwitch={handleTabSwitch} theme={theme} />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Feed column */}
        <motion.div
          ref={feedRef}
          animate={{ marginRight: drawerOpen && !isMobile ? 480 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'feed' ? (
              <motion.div
                key="feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <FilterBar
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearAll={clearFilters}
                  isActive={isActive}
                  totalCount={cves.length}
                  filteredCount={filteredCVEs.length}
                  theme={theme}
                />
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                  {loading && <LoadingState theme={theme} />}
                  {error && !loading && <ErrorState error={error} onRetry={refetch} theme={theme} />}

                  {!loading && !error && filteredCVEs.length === 0 && cves.length > 0 && (
                    <div style={{ padding: '40px 0', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '12px', color: isDark ? '#8899aa' : '#94a3b8' }}>
                      <div>{'> no CVEs match active filters'}</div>
                      <button
                        onClick={clearFilters}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#00ff9f' : '#059669', fontFamily: 'inherit', fontSize: '12px', padding: '8px 0', textDecoration: 'underline' }}
                      >
                        {'$ clear-filters'}
                      </button>
                    </div>
                  )}

                  {!loading && !error && (
                    TIERS.map(tier => (
                      <div key={tier} data-cve-card>
                        <TierSection
                          tier={tier}
                          cves={cvesByTier[tier]}
                          selectedId={selectedCVE?.id ?? null}
                          studiedIds={studiedIds}
                          onSelectCVE={handleSelectCVE}
                          onToggleStudied={toggleStudied}
                          theme={theme}
                          defaultCollapsed={tier === 4}
                        />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="hof"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <CategoryStrip active={hofCategory} onSelect={setHofCategory} theme={theme} />
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                  {hofLoading && <LoadingState theme={theme} />}
                  {hofError && !hofLoading && <ErrorState error={hofError} onRetry={hofRefetch} theme={theme} />}

                  {!hofLoading && !hofError && filteredHOF.length === 0 && (
                    <div style={{ padding: '40px 0', fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: '12px', color: isDark ? '#8899aa' : '#94a3b8' }}>
                      {hofCVEs.length === 0
                        ? '> no Hall of Fame CVEs loaded yet — run the seed script'
                        : `> no CVEs in category: ${hofCategory}`}
                    </div>
                  )}

                  {!hofLoading && !hofError && filteredHOF.map(cve => (
                    <div key={cve.cve_id} data-cve-card>
                      <CVECard
                        cve={cve}
                        isStudied={studiedIds.has(cve.cve_id)}
                        isSelected={selectedCVE?.id === cve.id}
                        onSelect={handleSelectCVE}
                        onToggleStudied={toggleStudied}
                        theme={theme}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Drawer */}
        <div id="cve-drawer" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, pointerEvents: drawerOpen ? 'auto' : 'none' }}>
          <CVEDrawer
            cve={selectedCVE}
            theme={theme}
            isMobile={isMobile}
            onClose={() => setSelectedCVE(null)}
            onSelectSimilar={handleSelectSimilar}
          />
        </div>
      </div>

      {/* Page border accent for Tier 0 CVEs */}
      {stats.tier0 > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #ff4444, transparent)',
          zIndex: 999, pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}
