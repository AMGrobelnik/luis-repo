import { useState, useEffect } from 'react';
import { formatDateInput, parseDate, addDays } from '../utils/dateUtils';
import { COLORS, GROUPS } from '../utils/sampleData';

export default function TaskModal({
  task,
  tasks,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) {
  const isNew = !task;
  const [form, setForm] = useState({
    name: '',
    startDate: formatDateInput(new Date()),
    endDate: formatDateInput(addDays(new Date(), 5)),
    progress: 0,
    color: COLORS[0],
    group: GROUPS[0],
    milestone: false,
    dependencies: [],
  });

  useEffect(() => {
    if (task) {
      setForm({
        name: task.name,
        startDate: formatDateInput(new Date(task.startDate)),
        endDate: formatDateInput(new Date(task.endDate)),
        progress: task.progress,
        color: task.color,
        group: task.group,
        milestone: task.milestone,
        dependencies: task.dependencies || [],
      });
    } else {
      setForm({
        name: '',
        startDate: formatDateInput(new Date()),
        endDate: formatDateInput(addDays(new Date(), 5)),
        progress: 0,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        group: GROUPS[0],
        milestone: false,
        dependencies: [],
      });
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    onSave({
      name: form.name.trim(),
      startDate: parseDate(form.startDate),
      endDate: form.milestone ? parseDate(form.startDate) : parseDate(form.endDate),
      progress: Number(form.progress),
      color: form.color,
      group: form.group,
      milestone: form.milestone,
      dependencies: form.dependencies,
    });
  };

  const otherTasks = tasks.filter((t) => !task || t.id !== task.id);
  const allGroups = [...new Set([...GROUPS, ...tasks.map((t) => t.group)])];

  const handleDepToggle = (depId) => {
    setForm((prev) => ({
      ...prev,
      dependencies: prev.dependencies.includes(depId)
        ? prev.dependencies.filter((d) => d !== depId)
        : [...prev.dependencies, depId],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isNew ? 'Add Task' : 'Edit Task'}</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Task Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter task name..."
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Group / Phase</label>
              <select
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
              >
                {allGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.milestone}
                  onChange={(e) =>
                    setForm({ ...form, milestone: e.target.checked })
                  }
                />
                Milestone
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{form.milestone ? 'Date' : 'Start Date'}</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </div>
            {!form.milestone && (
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          {!form.milestone && (
            <div className="form-group">
              <label>Progress: {form.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) =>
                  setForm({ ...form, progress: Number(e.target.value) })
                }
                className="progress-slider"
              />
            </div>
          )}

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${form.color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setForm({ ...form, color: c })}
                />
              ))}
            </div>
          </div>

          {otherTasks.length > 0 && (
            <div className="form-group">
              <label>Dependencies (depends on)</label>
              <div className="dep-list">
                {otherTasks.map((t) => (
                  <label key={t.id} className="dep-item">
                    <input
                      type="checkbox"
                      checked={form.dependencies.includes(t.id)}
                      onChange={() => handleDepToggle(t.id)}
                    />
                    <span
                      className="dep-color"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            {!isNew && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isNew ? 'Add Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
