import { useRef, useEffect, useMemo } from 'react';
import GanttTimeline from './GanttTimeline';
import GanttGrid from './GanttGrid';
import GanttTaskBar from './GanttTaskBar';
import DependencyLines from './DependencyLines';
import { useGanttDrag } from '../hooks/useGanttDrag';
import { getTimelineRange, generateDateRange, isSameDay, diffDays, startOfDay } from '../utils/dateUtils';
import { GROUPS } from '../utils/sampleData';

const ZOOM_CONFIG = {
  day: { dayWidth: 40 },
  week: { dayWidth: 20 },
  month: { dayWidth: 8 },
};

const ROW_HEIGHT = 44;

export default function GanttChart({
  tasks,
  onTaskUpdate,
  zoom,
  selectedTaskId,
  onSelectTask,
  collapsedGroups,
  scrollToToday,
}) {
  const chartRef = useRef(null);
  const { dayWidth } = ZOOM_CONFIG[zoom];

  const { start: timelineStart, end: timelineEnd } = useMemo(
    () => getTimelineRange(tasks),
    [tasks]
  );

  // Build visible tasks respecting group collapse
  const visibleTasks = useMemo(() => {
    const groups = [...new Set(tasks.map((t) => t.group))];
    const orderedGroups = [
      ...GROUPS.filter((g) => groups.includes(g)),
      ...groups.filter((g) => !GROUPS.includes(g)),
    ];

    const result = [];
    for (const group of orderedGroups) {
      if (collapsedGroups.has(group)) continue;
      const groupTasks = tasks.filter((t) => t.group === group);
      result.push(...groupTasks);
    }
    return result;
  }, [tasks, collapsedGroups]);

  const { isDragging, dragTaskId, dragType, handleDragStart } = useGanttDrag({
    tasks,
    onTaskUpdate,
    dayWidth,
    timelineStart,
  });

  // Scroll to today
  useEffect(() => {
    if (!chartRef.current) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = generateDateRange(timelineStart, timelineEnd);
    const todayIndex = dates.findIndex((d) => isSameDay(d, today));
    if (todayIndex >= 0) {
      const scrollX = todayIndex * dayWidth - chartRef.current.clientWidth / 3;
      chartRef.current.scrollLeft = Math.max(0, scrollX);
    }
  }, [scrollToToday, zoom]);

  const dates = generateDateRange(timelineStart, timelineEnd);
  const totalWidth = dates.length * dayWidth;

  return (
    <div className="gantt-chart" ref={chartRef}>
      <div className="gantt-chart-inner" style={{ width: totalWidth }}>
        <GanttTimeline
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          dayWidth={dayWidth}
          zoom={zoom}
        />
        <div className="gantt-body" style={{ position: 'relative' }}>
          <GanttGrid
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            dayWidth={dayWidth}
            rowCount={visibleTasks.length}
            rowHeight={ROW_HEIGHT}
          />
          <DependencyLines
            tasks={tasks}
            visibleTasks={visibleTasks}
            timelineStart={timelineStart}
            dayWidth={dayWidth}
            rowHeight={ROW_HEIGHT}
          />
          {visibleTasks.map((task, index) => (
            <GanttTaskBar
              key={task.id}
              task={task}
              rowIndex={index}
              timelineStart={timelineStart}
              dayWidth={dayWidth}
              rowHeight={ROW_HEIGHT}
              onDragStart={handleDragStart}
              isDragging={isDragging && dragTaskId === task.id}
              dragType={dragTaskId === task.id ? dragType : null}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
