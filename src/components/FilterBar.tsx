import { useState, useRef, useEffect } from 'react';
import type { FilterState } from '../../hooks/useFilterState';
import { ECOSYSTEMS, VULN_TYPES } from '../../db/schema';
import type { TierLevel } from '../../db/schema';
import type { ThemeMode } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (f: Partial<FilterState>) => void;
  onClearAll: () => void;
  isActive: boolean;
  totalCount: number;
  filteredCount: number;
  theme: ThemeMode;
}

const TIER_OPTIONS = [
  { value: 0, label: 'T0 Critical' },
  { value: 1, label: 'T1 High' },
  { value: 2, label: 'T2 Elevated' },
  { value: 3, label: 'T3 Watch' },
  { value: 4, label: 'T4 Monitor' },
];

function MultiDropdown<T extends string | number>({
  label, options, selected, onToggle, theme,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (v: T) => void;
  theme: ThemeMode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const accent    = isDark ? '#00ff9f' : '#059669';
  const bg        = isDark ? 'rgba(10,10,15,0.98)' : '#ffffff';
  const border    = isDark ? 'rgba(0,255,159,0.2)' : '#e2e8f0';
  const textColor = isDark ? '#c8d6e5' : '#334155';
  const mutedColor = isDark ? '#8899aa' : '#94a3b8';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: selected.length > 0 ? (isDark ? 'rgba(0,255,159,0.06)' : '#f0fdf4') : 'transparent',
          border: `1px solid ${selected.length > 0 ? border : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0')}`,
          borderRadius: '2px',
          color: selected.length > 0 ? accent : mutedColor,
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          fontSize: '11px',
          padding: '4px 10px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {label}{selected.length > 0 ? ` [${selected.length}]` : ''} ▾
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: '4px',
          zIndex: 200,
          minWidth: '160px',
          boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {options.map(opt => {
            const isChecked = selected.includes(opt.value);
            return (
              <div
                key={String(opt.value)}
                onClick={() => onToggle(opt.value)}
                style={{
                  padding: '7px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  color: isChecked ? accent : textColor,
                  background: isChecked ? (isDark ? 'rgba(0,255,159,0.06)' : '#f0fdf4') : 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = isChecked ? (isDark ? 'rgba(0,255,159,0.06)' : '#f0fdf4') : 'transparent')}
              >
                <span style={{ fontSize: '10px', color: isChecked ? accent : mutedColor, minWidth: '10px' }}>
                  {isChecked ? '✓' : '○'}
                </span>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({
  filters, onFiltersChange, onClearAll, isActive, totalCount, filteredCount, theme,
}: FilterBarProps) {
  const isDark = theme === 'dark';
  const accent      = isDark ? '#00ff9f' : '#059669';
  const mutedColor  = isDark ? '#8899aa' : '#94a3b8';
  const textColor   = isDark ? '#c8d6e5' : '#334155';
  const borderColor = isDark ? 'rgba(0,255,159,0.15)' : '#e2e8f0';
  const bgPanel     = isDark ? 'rgba(10,10,15,0.8)' : '#ffffff';

  const toggleTier = (v: number) => {
    const tiers = filters.tiers.includes(v as TierLevel)
      ? filters.tiers.filter(t => t !== v)
      : [...filters.tiers, v as TierLevel];
    onFiltersChange({ tiers });
  };

  const toggleEco = (v: string) => {
    const ecosystems = filters.ecosystems.includes(v)
      ? filters.ecosystems.filter(e => e !== v)
      : [...filters.ecosystems, v];
    onFiltersChange({ ecosystems });
  };

  const toggleType = (v: string) => {
    const vulnTypes = filters.vulnTypes.includes(v)
      ? filters.vulnTypes.filter(t => t !== v)
      : [...filters.vulnTypes, v];
    onFiltersChange({ vulnTypes });
  };

  const activeChips: { label: string; onRemove: () => void }[] = [
    ...filters.tiers.map(t => ({
      label: `T${t}`,
      onRemove: () => onFiltersChange({ tiers: filters.tiers.filter(x => x !== t) }),
    })),
    ...filters.ecosystems.map(e => ({
      label: e,
      onRemove: () => onFiltersChange({ ecosystems: filters.ecosystems.filter(x => x !== e) }),
    })),
    ...filters.vulnTypes.map(v => ({
      label: v,
      onRemove: () => onFiltersChange({ vulnTypes: filters.vulnTypes.filter(x => x !== v) }),
    })),
    ...(filters.kevOnly ? [{ label: 'KEV only', onRemove: () => onFiltersChange({ kevOnly: false }) }] : []),
    ...(filters.unstudiedOnly ? [{ label: 'unstudied', onRemove: () => onFiltersChange({ unstudiedOnly: false }) }] : []),
  ];

  return (
    <div style={{
      background: bgPanel,
      borderBottom: `1px solid ${borderColor}`,
      padding: '10px 20px',
      fontFamily: "'SF Mono', 'Fira Code', monospace",
    }}>
      {/* Row 1: search + filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px', maxWidth: '320px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: mutedColor, fontSize: '11px', pointerEvents: 'none' }}>
            $
          </span>
          <input
            type="text"
            value={filters.search}
            onChange={e => onFiltersChange({ search: e.target.value })}
            placeholder='grep -r "..."'
            style={{
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              border: `1px solid ${borderColor}`,
              borderRadius: '2px',
              color: textColor,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: '11px',
              padding: '5px 10px 5px 24px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <MultiDropdown
          label="tier"
          options={TIER_OPTIONS}
          selected={filters.tiers}
          onToggle={toggleTier}
          theme={theme}
        />
        <MultiDropdown
          label="ecosystem"
          options={ECOSYSTEMS.map(e => ({ value: e, label: e }))}
          selected={filters.ecosystems}
          onToggle={toggleEco}
          theme={theme}
        />
        <MultiDropdown
          label="type"
          options={VULN_TYPES.map(v => ({ value: v, label: v }))}
          selected={filters.vulnTypes}
          onToggle={toggleType}
          theme={theme}
        />

        {/* Toggle pills */}
        {(['kevOnly', 'unstudiedOnly'] as const).map(key => {
          const active = filters[key];
          const label = key === 'kevOnly' ? 'KEV only' : 'unstudied';
          return (
            <button
              key={key}
              onClick={() => onFiltersChange({ [key]: !active })}
              style={{
                background: active ? (isDark ? 'rgba(255,68,68,0.1)' : '#fef2f2') : 'transparent',
                border: `1px solid ${active ? (key === 'kevOnly' ? '#ff444466' : (isDark ? 'rgba(0,255,159,0.3)' : '#bbf7d0')) : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0')}`,
                borderRadius: '2px',
                color: active ? (key === 'kevOnly' ? '#ff4444' : accent) : mutedColor,
                fontFamily: "'SF Mono', 'Fira Code', monospace",
                fontSize: '11px',
                padding: '4px 10px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          );
        })}

        {/* Count + clear */}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: mutedColor, whiteSpace: 'nowrap' }}>
          {isActive ? (
            <span>
              <span style={{ color: accent }}>{filteredCount}</span>
              <span> / {totalCount} CVEs  </span>
              <button
                onClick={onClearAll}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, fontFamily: 'inherit', fontSize: '11px', textDecoration: 'underline', padding: 0 }}
              >
                clear
              </button>
            </span>
          ) : (
            <span><span style={{ color: accent }}>{totalCount}</span> CVEs</span>
          )}
        </span>
      </div>

      {/* Row 2: active chips */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {activeChips.map((chip, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: isDark ? 'rgba(0,255,159,0.06)' : '#f0fdf4',
                border: `1px solid ${isDark ? 'rgba(0,255,159,0.2)' : '#bbf7d0'}`,
                borderRadius: '2px',
                fontSize: '10px',
                color: accent,
                padding: '2px 6px',
                fontFamily: "'SF Mono', 'Fira Code', monospace",
              }}
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, padding: 0, lineHeight: 1, fontSize: '11px' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
