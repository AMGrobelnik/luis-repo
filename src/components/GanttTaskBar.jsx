import { diffDays, startOfDay, formatDate } from '../utils/dateUtils';

export default function GanttTaskBar({
  task,
  rowIndex,
  timelineStart,
  dayWidth,
  rowHeight,
  onDragStart,
  isDragging,
  dragType,
  isSelected,
  onSelect,
}) {
  const startDay = diffDays(startOfDay(timelineStart), startOfDay(new Date(task.startDate)));
  const duration = diffDays(startOfDay(new Date(task.startDate)), startOfDay(new Date(task.endDate))) + 1;

  const left = startDay * dayWidth;
  const width = duration * dayWidth;
  const top = rowIndex * rowHeight;
  const barHeight = task.milestone ? rowHeight - 16 : rowHeight - 16;
  const barTop = 8;

  if (task.milestone) {
    const size = 18;
    const centerX = left + dayWidth / 2;
    const centerY = barTop + barHeight / 2;
    return (
      <div
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
        title={`${task.name}\n${formatDate(new Date(task.startDate))}`}
      />
    );
  }

  return (
    <div
      className={`gantt-task-bar ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left,
        top: top + barTop,
        width: Math.max(width, dayWidth),
        height: barHeight,
        zIndex: isDragging ? 10 : 3,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(task.id);
      }}
    >
      {/* Resize handle left */}
      <div
        className="resize-handle resize-left"
        onMouseDown={(e) => onDragStart(e, task.id, 'resize-left')}
      />

      {/* Bar body */}
      <div
        className="bar-body"
        style={{ backgroundColor: task.color }}
        onMouseDown={(e) => onDragStart(e, task.id, 'move')}
        title={`${task.name}\n${formatDate(new Date(task.startDate))} — ${formatDate(new Date(task.endDate))}\nProgress: ${task.progress}%`}
      >
        {/* Progress fill */}
        <div
          className="bar-progress"
          style={{
            width: `${task.progress}%`,
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        />

        {/* Label */}
        {width > 60 && (
          <span className="bar-label">{task.name}</span>
        )}
      </div>

      {/* Resize handle right */}
      <div
        className="resize-handle resize-right"
        onMouseDown={(e) => onDragStart(e, task.id, 'resize-right')}
      />
    </div>
  );
}
