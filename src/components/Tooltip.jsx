


export default function Tooltip({ task, anchorRect, chartRect }) {
  if (!task || !anchorRect || !chartRect) return null;

  const left = anchorRect.left - chartRect.left + anchorRect.width / 2;
  const top = anchorRect.top - chartRect.top - 8;

  const startStr = new Date(task.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endStr = new Date(task.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const days =
    Math.round(
      (new Date(task.endDate) - new Date(task.startDate)) / 86400000
    ) + 1;

  return (
    <div
      className="task-tooltip"
      style={{
        left,
        top,
      }}
    >
      <div className="tooltip-header">
        <span
          className="tooltip-color"
          style={{ backgroundColor: task.color }}
        />
        <span className="tooltip-name">{task.name}</span>
      </div>
      <div className="tooltip-row">
        <span className="tooltip-label">Dates</span>
        <span className="tooltip-value">
          {task.milestone ? startStr : `${startStr} — ${endStr}`}
        </span>
      </div>
      {!task.milestone && (
        <>
          <div className="tooltip-row">
            <span className="tooltip-label">Duration</span>
            <span className="tooltip-value">
              {days} day{days !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Progress</span>
            <span className="tooltip-value">{task.progress}%</span>
          </div>
          <div className="tooltip-progress-bar">
            <div
              className="tooltip-progress-fill"
              style={{
                width: `${task.progress}%`,
                backgroundColor: task.color,
              }}
            />
          </div>
        </>
      )}
      <div className="tooltip-row">
        <span className="tooltip-label">Group</span>
        <span className="tooltip-value">{task.group}</span>
      </div>
      {task.dependencies?.length > 0 && (
        <div className="tooltip-row">
          <span className="tooltip-label">Dependencies</span>
          <span className="tooltip-value">{task.dependencies.length}</span>
        </div>
      )}
    </div>
  );
}
