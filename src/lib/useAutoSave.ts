import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  debounceMs = 1200
): { trigger: (data: T) => void; status: 'idle' | 'saving' | 'saved' | 'error' } {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Maintain reference to the latest save function
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  const trigger = useCallback((data: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
      try {
        await saveFnRef.current(data);
        setStatus('saved');
        statusTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 2500);
      } catch (error) {
        console.error('AutoSave failed:', error);
        setStatus('error');
        statusTimerRef.current = setTimeout(() => {
          setStatus('idle');
        }, 2500);
      }
    }, debounceMs);
  }, [debounceMs]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  return { trigger, status };
}
