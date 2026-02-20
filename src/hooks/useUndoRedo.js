import { useRef, useCallback } from 'react';

const MAX_HISTORY = 50;

export function useUndoRedo(tasks, setTasks) {
  const historyRef = useRef([]);
  const futureRef = useRef([]);
  const skipRef = useRef(false);

  const pushSnapshot = useCallback((snapshot) => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    historyRef.current = [
      ...historyRef.current.slice(-MAX_HISTORY),
      snapshot,
    ];
    futureRef.current = [];
  }, []);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, tasks];
    skipRef.current = true;
    setTasks(prev);
  }, [tasks, setTasks]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    historyRef.current = [...historyRef.current, tasks];
    skipRef.current = true;
    setTasks(next);
  }, [tasks, setTasks]);

  return { pushSnapshot, undo, redo };
}
