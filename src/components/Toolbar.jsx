import { useRef } from 'react';
import { formatDate } from '../utils/dateUtils';

const ZOOM_LABELS = { day: 'Day', week: 'Week', month: 'Month' };

export default function Toolbar({
  zoom,
  onZoomChange,
  onAddTask,
  onToday,
  projectName,
  onProjectNameChange,
  onUndo,
  onRedo,
  onExport,
  onImport,
  taskCount,
}) {
  const fileRef = useRef(null);

  const handleImportClick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onImport(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
        <span className="toolbar-task-count">{taskCount} tasks</span>
      </div>

      <div className="toolbar-center">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
        >
          &#8630;
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          &#8631;
        </button>
        <div className="toolbar-divider" />
        <button className="btn btn-primary" onClick={onAddTask}>
          <span className="btn-icon">+</span> Add Task
        </button>
        <button className="btn btn-secondary" onClick={onToday}>
          Today
        </button>
      </div>

      <div className="toolbar-right">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onExport}
          title="Export project as JSON"
        >
          &#8615; Export
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleImportClick}
          title="Import project from JSON"
        >
          &#8613; Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="toolbar-divider" />
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
