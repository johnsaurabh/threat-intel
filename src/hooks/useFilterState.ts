import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CVE, TierLevel } from '../db/schema';

export interface FilterState {
  tiers: TierLevel[];
  ecosystems: string[];
  vulnTypes: string[];
  kevOnly: boolean;
  unstudiedOnly: boolean;
  search: string;
}

const EMPTY: FilterState = {
  tiers: [], ecosystems: [], vulnTypes: [],
  kevOnly: false, unstudiedOnly: false, search: '',
};

function parseIntArray(val: string | null): number[] {
  if (!val) return [];
  return val.split(',').map(Number).filter(n => !isNaN(n));
}

function parseStringArray(val: string | null): string[] {
  if (!val) return [];
  return val.split(',').filter(Boolean);
}

export function useFilterState() {
  const [params, setParams] = useSearchParams();

  const filters: FilterState = {
    tiers:        parseIntArray(params.get('tier')) as TierLevel[],
    ecosystems:   parseStringArray(params.get('eco')),
    vulnTypes:    parseStringArray(params.get('type')),
    kevOnly:      params.get('kev') === 'true',
    unstudiedOnly: params.get('unstudied') === 'true',
    search:       params.get('q') ?? '',
  };

  const setFilters = useCallback((next: Partial<FilterState>) => {
    setParams(prev => {
      const p = new URLSearchParams(prev);
      const current: FilterState = {
        tiers:         parseIntArray(prev.get('tier')) as TierLevel[],
        ecosystems:    parseStringArray(prev.get('eco')),
        vulnTypes:     parseStringArray(prev.get('type')),
        kevOnly:       prev.get('kev') === 'true',
        unstudiedOnly: prev.get('unstudied') === 'true',
        search:        prev.get('q') ?? '',
      };
      const merged = { ...current, ...next };

      if (merged.tiers.length > 0) p.set('tier', merged.tiers.join(','));
      else p.delete('tier');

      if (merged.ecosystems.length > 0) p.set('eco', merged.ecosystems.join(','));
      else p.delete('eco');

      if (merged.vulnTypes.length > 0) p.set('type', merged.vulnTypes.join(','));
      else p.delete('type');

      if (merged.kevOnly) p.set('kev', 'true'); else p.delete('kev');
      if (merged.unstudiedOnly) p.set('unstudied', 'true'); else p.delete('unstudied');
      if (merged.search) p.set('q', merged.search); else p.delete('q');

      return p;
    }, { replace: true });
  }, [setParams]);

  const clearFilters = useCallback(() => {
    setParams({}, { replace: true });
  }, [setParams]);

  const isActive = (
    filters.tiers.length > 0 || filters.ecosystems.length > 0 ||
    filters.vulnTypes.length > 0 || filters.kevOnly ||
    filters.unstudiedOnly || filters.search !== ''
  );

  const applyFilters = useCallback((cves: CVE[], studiedIds?: Set<string>): CVE[] => {
    return cves.filter(cve => {
      if (filters.tiers.length > 0 && !filters.tiers.includes(cve.tier)) return false;
      if (filters.ecosystems.length > 0 && (!cve.ecosystem || !filters.ecosystems.includes(cve.ecosystem))) return false;
      if (filters.vulnTypes.length > 0 && (!cve.vuln_type || !filters.vulnTypes.includes(cve.vuln_type))) return false;
      if (filters.kevOnly && !cve.in_kev) return false;
      if (filters.unstudiedOnly && studiedIds?.has(cve.id)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = [cve.cve_id, cve.affected_software, cve.vuln_type].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return { filters, setFilters, clearFilters, isActive, applyFilters, EMPTY };
}
