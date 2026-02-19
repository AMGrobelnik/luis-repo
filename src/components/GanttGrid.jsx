import { generateDateRange, isWeekend, isSameDay } from '../utils/dateUtils';

export default function GanttGrid({ timelineStart, timelineEnd, dayWidth, rowCount, rowHeight }) {
  const dates = generateDateRange(timelineStart, timelineEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalWidth = dates.length * dayWidth;
  const totalHeight = rowCount * rowHeight;

  return (
    <div className="gantt-grid" style={{ width: totalWidth, height: totalHeight }}>
      {/* Column lines */}
      {dates.map((date, i) => {
        const isT = isSameDay(date, today);
        const weekend = isWeekend(date);
        return (
          <div
            key={i}
            className={`grid-col ${weekend ? 'weekend' : ''} ${isT ? 'today-col' : ''}`}
            style={{
              left: i * dayWidth,
              width: dayWidth,
              height: totalHeight,
            }}
          />
        );
      })}
      {/* Row lines */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={`row-${i}`}
          className="grid-row-line"
          style={{ top: (i + 1) * rowHeight }}
        />
      ))}
      {/* Today marker */}
      {dates.some((d) => isSameDay(d, today)) && (
        <div
          className="today-marker"
          style={{
            left:
              dates.findIndex((d) => isSameDay(d, today)) * dayWidth +
              dayWidth / 2,
            height: totalHeight,
          }}
        />
      )}
    </div>
  );
}
