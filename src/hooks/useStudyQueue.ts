import { useState, useCallback } from 'react';

const STORAGE_KEY = 'jsb_study_queue';

function loadStudied(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persist(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function useStudyQueue() {
  const [studiedIds, setStudiedIds] = useState<Set<string>>(loadStudied);

  const markStudied = useCallback((id: string) => {
    setStudiedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persist(next);
      return next;
    });
  }, []);

  const unmarkStudied = useCallback((id: string) => {
    setStudiedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      persist(next);
      return next;
    });
  }, []);

  const isStudied = useCallback((id: string) => studiedIds.has(id), [studiedIds]);

  const toggleStudied = useCallback((id: string) => {
    setStudiedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      persist(next);
      return next;
    });
  }, []);

  return { studiedIds, markStudied, unmarkStudied, isStudied, toggleStudied };
}
