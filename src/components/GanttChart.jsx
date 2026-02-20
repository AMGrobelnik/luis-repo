import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import GanttTimeline from './GanttTimeline';
import GanttGrid from './GanttGrid';
import GanttTaskBar from './GanttTaskBar';
import DependencyLines from './DependencyLines';
import Tooltip from './Tooltip';
import { useGanttDrag } from '../hooks/useGanttDrag';
import { getTimelineRange, generateDateRange, isSameDay } from '../utils/dateUtils';
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
  onEditTask,
  collapsedGroups,
  scrollToToday,
}) {
  const chartRef = useRef(null);
  const { dayWidth } = ZOOM_CONFIG[zoom];

  const [hoveredTask, setHoveredTask] = useState(null);
  const [hoverRect, setHoverRect] = useState(null);
  const [chartRect, setChartRect] = useState(null);

  const { start: timelineStart, end: timelineEnd } = useMemo(
    () => getTimelineRange(tasks),
    [tasks]
  );

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

  const { isDragging, dragTaskId, handleDragStart } = useGanttDrag({
    tasks,
    onTaskUpdate,
    dayWidth,
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
  }, [scrollToToday, zoom, timelineStart, timelineEnd, dayWidth]);

  // Track chart position for tooltip
  useEffect(() => {
    if (!chartRef.current) return;
    const update = () => {
      if (chartRef.current) setChartRect(chartRef.current.getBoundingClientRect());
    };
    update();
    chartRef.current.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleHover = useCallback((task, rect) => {
    setHoveredTask(task);
    setHoverRect(rect);
  }, []);

  const handleDoubleClick = useCallback(
    (taskId) => {
      onEditTask(taskId);
    },
    [onEditTask]
  );

  // Click on empty space to deselect
  const handleChartClick = useCallback(() => {
    onSelectTask(null);
  }, [onSelectTask]);

  const dates = generateDateRange(timelineStart, timelineEnd);
  const totalWidth = dates.length * dayWidth;

  return (
    <div className="gantt-chart" ref={chartRef} onClick={handleChartClick}>
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
            totalWidth={totalWidth}
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
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
              onDoubleClick={handleDoubleClick}
              onHover={handleHover}
            />
          ))}
          {visibleTasks.length === 0 && (
            <div className="gantt-empty">
              <div className="gantt-empty-icon">&#128197;</div>
              <div className="gantt-empty-text">No tasks visible</div>
              <div className="gantt-empty-hint">Add a task or expand a group to get started</div>
            </div>
          )}
        </div>
      </div>
      {hoveredTask && !isDragging && (
        <Tooltip task={hoveredTask} anchorRect={hoverRect} chartRect={chartRect} />
      )}
    </div>
  );
}
