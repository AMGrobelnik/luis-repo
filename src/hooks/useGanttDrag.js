import { useState, useCallback, useRef } from 'react';
import { addDays, startOfDay } from '../utils/dateUtils';

const DRAG_THRESHOLD = 4;

export function useGanttDrag({ tasks, onTaskUpdate, dayWidth }) {
  const [dragState, setDragState] = useState(null);
  const pendingRef = useRef(null);

  const handleDragStart = useCallback(
    (e, taskId, type) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const pending = {
        taskId,
        type,
        startX: e.clientX,
        originalStart: new Date(task.startDate),
        originalEnd: new Date(task.endDate),
        activated: false,
      };
      pendingRef.current = pending;

      const onMove = (me) => {
        const p = pendingRef.current;
        if (!p) return;

        const dx = me.clientX - p.startX;

        if (!p.activated) {
          if (Math.abs(dx) < DRAG_THRESHOLD) return;
          p.activated = true;
          setDragState({ taskId: p.taskId, type: p.type });
        }

        const dayDelta = Math.round(dx / dayWidth);
        let newStart, newEnd;

        if (p.type === 'move') {
          newStart = addDays(p.originalStart, dayDelta);
          newEnd = addDays(p.originalEnd, dayDelta);
        } else if (p.type === 'resize-left') {
          newStart = addDays(p.originalStart, dayDelta);
          newEnd = new Date(p.originalEnd);
          if (newStart >= newEnd) newStart = addDays(newEnd, -1);
        } else if (p.type === 'resize-right') {
          newStart = new Date(p.originalStart);
          newEnd = addDays(p.originalEnd, dayDelta);
          if (newEnd <= newStart) newEnd = addDays(newStart, 1);
        }

        onTaskUpdate(p.taskId, {
          startDate: startOfDay(newStart),
          endDate: startOfDay(newEnd),
        });
      };

      const onUp = () => {
        pendingRef.current = null;
        setDragState(null);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [tasks, dayWidth, onTaskUpdate]
  );

  return {
    isDragging: !!dragState,
    dragTaskId: dragState?.taskId ?? null,
    dragType: dragState?.type ?? null,
    handleDragStart,
  };
}
