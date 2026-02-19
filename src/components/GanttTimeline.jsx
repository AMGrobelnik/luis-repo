import { generateDateRange, isWeekend, isSameDay, getMonthName, formatDateShort, getMonday } from '../utils/dateUtils';

export default function GanttTimeline({ timelineStart, timelineEnd, dayWidth, zoom }) {
  const dates = generateDateRange(timelineStart, timelineEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (zoom === 'month') {
    // Group by month
    const months = [];
    let currentMonth = null;
    for (const date of dates) {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!currentMonth || currentMonth.key !== key) {
        currentMonth = {
          key,
          label: getMonthName(date),
          startIndex: dates.indexOf(date),
          days: 0,
        };
        months.push(currentMonth);
      }
      currentMonth.days++;
    }

    return (
      <div className="gantt-timeline" style={{ width: dates.length * dayWidth }}>
        <div className="timeline-row timeline-months">
          {months.map((month) => (
            <div
              key={month.key}
              className="timeline-cell month-cell"
              style={{ width: month.days * dayWidth }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (zoom === 'week') {
    // Group by week
    const weeks = [];
    let currentWeek = null;
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const monday = getMonday(date);
      const key = monday.toISOString();
      if (!currentWeek || currentWeek.key !== key) {
        currentWeek = { key, startDate: date, days: 0, startIndex: i };
        weeks.push(currentWeek);
      }
      currentWeek.days++;
    }

    // Also get months for top row
    const months = [];
    let cm = null;
    for (const date of dates) {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!cm || cm.key !== key) {
        cm = { key, label: getMonthName(date), days: 0 };
        months.push(cm);
      }
      cm.days++;
    }

    return (
      <div className="gantt-timeline" style={{ width: dates.length * dayWidth }}>
        <div className="timeline-row timeline-months">
          {months.map((m) => (
            <div key={m.key} className="timeline-cell month-cell" style={{ width: m.days * dayWidth }}>
              {m.label}
            </div>
          ))}
        </div>
        <div className="timeline-row timeline-weeks">
          {weeks.map((week) => (
            <div
              key={week.key}
              className="timeline-cell week-cell"
              style={{ width: week.days * dayWidth }}
            >
              {formatDateShort(week.startDate)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Day view
  const months = [];
  let cm = null;
  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!cm || cm.key !== key) {
      cm = { key, label: getMonthName(date), days: 0 };
      months.push(cm);
    }
    cm.days++;
  }

  return (
    <div className="gantt-timeline" style={{ width: dates.length * dayWidth }}>
      <div className="timeline-row timeline-months">
        {months.map((m) => (
          <div key={m.key} className="timeline-cell month-cell" style={{ width: m.days * dayWidth }}>
            {m.label}
          </div>
        ))}
      </div>
      <div className="timeline-row timeline-days">
        {dates.map((date, i) => {
          const isToday = isSameDay(date, today);
          const weekend = isWeekend(date);
          return (
            <div
              key={i}
              className={`timeline-cell day-cell ${isToday ? 'today' : ''} ${weekend ? 'weekend' : ''}`}
              style={{ width: dayWidth }}
            >
              <span className="day-number">{date.getDate()}</span>
              <span className="day-name">
                {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
