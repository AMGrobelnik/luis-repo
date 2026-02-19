import { formatDate } from '../utils/dateUtils';

const ZOOM_LABELS = { day: 'Day', week: 'Week', month: 'Month' };

export default function Toolbar({
  zoom,
  onZoomChange,
  onAddTask,
  onToday,
  projectName,
  onProjectNameChange,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <input
          className="project-name-input"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="Project Name"
        />
        <span className="toolbar-date">{formatDate(new Date())}</span>
      </div>

      <div className="toolbar-center">
        <button className="btn btn-primary" onClick={onAddTask}>
          <span className="btn-icon">+</span> Add Task
        </button>
        <button className="btn btn-secondary" onClick={onToday}>
          Today
        </button>
      </div>

      <div className="toolbar-right">
        <div className="zoom-controls">
          <span className="zoom-label">Zoom:</span>
          {Object.entries(ZOOM_LABELS).map(([key, label]) => (
            <button
              key={key}
              className={`btn btn-sm ${zoom === key ? 'btn-active' : 'btn-ghost'}`}
              onClick={() => onZoomChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
