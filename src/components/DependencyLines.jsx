import { diffDays, startOfDay } from '../utils/dateUtils';

export default function DependencyLines({
  tasks,
  visibleTasks,
  timelineStart,
  dayWidth,
  rowHeight,
  totalWidth,
}) {
  const taskIndexMap = {};
  visibleTasks.forEach((t, i) => {
    taskIndexMap[t.id] = i;
  });

  const lines = [];

  for (const task of visibleTasks) {
    if (!task.dependencies) continue;
    for (const depId of task.dependencies) {
      const depTask = tasks.find((t) => t.id === depId);
      if (!depTask || taskIndexMap[depId] === undefined) continue;

      const fromRow = taskIndexMap[depId];
      const toRow = taskIndexMap[task.id];

      const fromEndDay = diffDays(startOfDay(timelineStart), startOfDay(new Date(depTask.endDate)));
      const toStartDay = diffDays(startOfDay(timelineStart), startOfDay(new Date(task.startDate)));

      const fromX = (fromEndDay + 1) * dayWidth;
      const fromY = fromRow * rowHeight + rowHeight / 2;
      const toX = toStartDay * dayWidth;
      const toY = toRow * rowHeight + rowHeight / 2;

      const midX = fromX + 12;

      let path;
      if (fromRow === toRow) {
        path = `M ${fromX} ${fromY} L ${toX} ${toY}`;
      } else {
        path = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
      }

      lines.push(
        <path
          key={`${depId}-${task.id}`}
          d={path}
          fill="none"
          stroke="#6b7a90"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          markerEnd="url(#dep-arrow)"
        />
      );
    }
  }

  if (lines.length === 0) return null;

  const svgHeight = visibleTasks.length * rowHeight;

  return (
    <svg
      className="dependency-lines"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: totalWidth,
        height: svgHeight,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <defs>
        <marker
          id="dep-arrow"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#6b7a90" />
        </marker>
      </defs>
      {lines}
    </svg>
  );
}
