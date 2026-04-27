import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../db/client';
import type { CVE } from '../db/schema';

interface UseCVEHallOfFameResult {
  cves: CVE[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useCVEHallOfFame(): UseCVEHallOfFameResult {
  const [cves, setCves] = useState<CVE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedAt = useRef<number>(0);

  const fetchCVEs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sbError } = await supabase
        .from('cves')
        .select('*')
        .eq('hall_of_fame', true)
        .order('cvss_score', { ascending: false, nullsFirst: false });

      if (sbError) throw new Error(sbError.message);
      setCves((data as CVE[]) ?? []);
      lastFetchedAt.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Hall of Fame');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCVEs();
  }, [fetchCVEs]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const stale = Date.now() - lastFetchedAt.current > REFRESH_INTERVAL_MS;
        if (stale) fetchCVEs();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchCVEs]);

  return { cves, loading, error, refetch: fetchCVEs };
}
