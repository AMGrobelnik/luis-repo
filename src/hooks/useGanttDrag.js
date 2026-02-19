import { useState, useCallback, useRef, useEffect } from 'react';
import { addDays, startOfDay } from '../utils/dateUtils';

export function useGanttDrag({ tasks, onTaskUpdate, dayWidth, timelineStart }) {
  const [dragState, setDragState] = useState(null);
  const dragRef = useRef(null);

  const getDateFromX = useCallback(
    (x) => {
      const dayOffset = Math.round(x / dayWidth);
      return addDays(timelineStart, dayOffset);
    },
    [dayWidth, timelineStart]
  );

  const handleDragStart = useCallback(
    (e, taskId, type) => {
      e.preventDefault();
      e.stopPropagation();

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const startX = e.clientX;
      const state = {
        taskId,
        type, // 'move', 'resize-left', 'resize-right'
        startX,
        originalStart: new Date(task.startDate),
        originalEnd: new Date(task.endDate),
      };

      dragRef.current = state;
      setDragState(state);
    },
    [tasks]
  );

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e) => {
      const state = dragRef.current;
      if (!state) return;

      const deltaX = e.clientX - state.startX;
      const dayDelta = Math.round(deltaX / dayWidth);

      const task = tasks.find((t) => t.id === state.taskId);
      if (!task) return;

      let newStart, newEnd;

      if (state.type === 'move') {
        newStart = addDays(state.originalStart, dayDelta);
        newEnd = addDays(state.originalEnd, dayDelta);
      } else if (state.type === 'resize-left') {
        newStart = addDays(state.originalStart, dayDelta);
        newEnd = new Date(state.originalEnd);
        if (newStart >= newEnd) {
          newStart = addDays(newEnd, -1);
        }
      } else if (state.type === 'resize-right') {
        newStart = new Date(state.originalStart);
        newEnd = addDays(state.originalEnd, dayDelta);
        if (newEnd <= newStart) {
          newEnd = addDays(newStart, 1);
        }
      }

      onTaskUpdate(state.taskId, {
        startDate: startOfDay(newStart),
        endDate: startOfDay(newEnd),
      });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, tasks, dayWidth, onTaskUpdate]);

  return {
    isDragging: !!dragState,
    dragTaskId: dragState?.taskId,
    dragType: dragState?.type,
    handleDragStart,
  };
}
