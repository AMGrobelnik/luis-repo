export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDays(start, end) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(str) {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return startOfDay(d);
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getMonthName(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function generateDateRange(start, end) {
  const dates = [];
  let current = startOfDay(new Date(start));
  const last = startOfDay(new Date(end));
  while (current <= last) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

export function getTimelineRange(tasks, paddingDays = 7) {
  if (tasks.length === 0) {
    const today = startOfDay(new Date());
    return { start: addDays(today, -7), end: addDays(today, 30) };
  }

  let minDate = new Date(tasks[0].startDate);
  let maxDate = new Date(tasks[0].endDate);

  for (const task of tasks) {
    const s = new Date(task.startDate);
    const e = new Date(task.endDate);
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  }

  return {
    start: addDays(startOfDay(minDate), -paddingDays),
    end: addDays(startOfDay(maxDate), paddingDays),
  };
}
