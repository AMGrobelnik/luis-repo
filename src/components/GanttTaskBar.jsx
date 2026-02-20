import { useRef, useCallback } from 'react';
import { diffDays, startOfDay } from '../utils/dateUtils';

export default function GanttTaskBar({
  task,
  rowIndex,
  timelineStart,
  dayWidth,
  rowHeight,
  onDragStart,
  isDragging,
  isSelected,
  onSelect,
  onDoubleClick,
  onHover,
}) {
  const barRef = useRef(null);
  const startDay = diffDays(startOfDay(timelineStart), startOfDay(new Date(task.startDate)));
  const duration = diffDays(startOfDay(new Date(task.startDate)), startOfDay(new Date(task.endDate))) + 1;

  const left = startDay * dayWidth;
  const width = Math.max(duration * dayWidth, dayWidth);
  const top = rowIndex * rowHeight;
  const barHeight = rowHeight - 16;
  const barTop = 8;

  const handleMouseEnter = useCallback(() => {
    if (barRef.current && onHover) {
      onHover(task, barRef.current.getBoundingClientRect());
    }
  }, [task, onHover]);

  const handleMouseLeave = useCallback(() => {
    if (onHover) onHover(null, null);
  }, [onHover]);

  if (task.milestone) {
    const size = 18;
    const centerX = left + dayWidth / 2;
    const centerY = barTop + barHeight / 2;
    return (
      <div
        ref={barRef}
        className={`gantt-milestone ${isSelected ? 'selected' : ''}`}
        style={{
          position: 'absolute',
          left: centerX - size / 2,
          top: top + centerY - size / 2,
          width: size,
          height: size,
          transform: 'rotate(45deg)',
          backgroundColor: task.color,
          cursor: 'pointer',
          zIndex: isDragging ? 10 : 3,
        }}
        onMouseDown={(e) => onDragStart(e, task.id, 'move')}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(task.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick(task.id);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  return (
    <div
      ref={barRef}
      className={`gantt-task-bar ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left,
        top: top + barTop,
        width,
        height: barHeight,
        zIndex: isDragging ? 10 : 3,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(task.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick(task.id);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="resize-handle resize-left"
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e, task.id, 'resize-left');
        }}
      />

      <div
        className="bar-body"
        style={{ backgroundColor: task.color }}
        onMouseDown={(e) => onDragStart(e, task.id, 'move')}
      >
        <div
          className="bar-progress"
          style={{
            width: `${task.progress}%`,
            backgroundColor: 'rgba(0,0,0,0.18)',
          }}
        />

        {width > 50 && <span className="bar-label">{task.name}</span>}
      </div>

      <div
        className="resize-handle resize-right"
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e, task.id, 'resize-right');
        }}
      />
    </div>
  );
}
