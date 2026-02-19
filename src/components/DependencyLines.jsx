import { diffDays, startOfDay } from '../utils/dateUtils';

export default function DependencyLines({
  tasks,
  visibleTasks,
  timelineStart,
  dayWidth,
  rowHeight,
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

      const path =
        fromRow === toRow
          ? `M ${fromX} ${fromY} L ${toX} ${toY}`
          : `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;

      lines.push(
        <g key={`${depId}-${task.id}`}>
          <path
            d={path}
            fill="none"
            stroke="#8993a4"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
    }
  }

  if (lines.length === 0) return null;

  const totalWidth = 5000;
  const totalHeight = visibleTasks.length * rowHeight;

  return (
    <svg
      className="dependency-lines"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: totalWidth,
        height: totalHeight,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#8993a4" />
        </marker>
      </defs>
      {lines}
    </svg>
  );
}
