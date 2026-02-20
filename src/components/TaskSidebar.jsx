import { useState } from 'react';
import { GROUPS } from '../utils/sampleData';

export default function TaskSidebar({
  tasks,
  collapsedGroups,
  onToggleGroup,
  onSelectTask,
  selectedTaskId,
  onEditTask,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const groups = [...new Set(tasks.map((t) => t.group))];
  const orderedGroups = [
    ...GROUPS.filter((g) => groups.includes(g)),
    ...groups.filter((g) => !GROUPS.includes(g)),
  ];

  const filteredTasks = searchQuery.trim()
    ? tasks.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <div className="task-sidebar">
      <div className="sidebar-search">
        <span className="search-icon">&#128269;</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => setSearchQuery('')}
          >
            &times;
          </button>
        )}
      </div>
      <div className="sidebar-header">
        <span className="sidebar-title">Task Name</span>
        <span className="sidebar-col">Progress</span>
      </div>
      <div className="sidebar-body">
        {orderedGroups.map((group) => {
          const groupTasks = filteredTasks.filter((t) => t.group === group);
          if (searchQuery.trim() && groupTasks.length === 0) return null;

          const isCollapsed = searchQuery.trim()
            ? false
            : collapsedGroups.has(group);
          const totalTasks = tasks.filter((t) => t.group === group).length;

          return (
            <div key={group} className="task-group">
              <div
                className="group-header"
                onClick={() => !searchQuery.trim() && onToggleGroup(group)}
              >
                <span
                  className={`group-chevron ${isCollapsed ? '' : 'open'}`}
                >
                  &#9654;
                </span>
                <span className="group-name">{group}</span>
                <span className="group-count">
                  {searchQuery.trim()
                    ? `${groupTasks.length}/${totalTasks}`
                    : totalTasks}
                </span>
              </div>
              {!isCollapsed &&
                groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`sidebar-task ${
                      selectedTaskId === task.id ? 'selected' : ''
                    }`}
                    onClick={() => onSelectTask(task.id)}
                    onDoubleClick={() => onEditTask(task.id)}
                  >
                    <div className="task-name-cell">
                      {task.milestone ? (
                        <span className="milestone-icon">&#9670;</span>
                      ) : (
                        <span
                          className="task-color-dot"
                          style={{ backgroundColor: task.color }}
                        />
                      )}
                      <span className="task-name-text">{task.name}</span>
                    </div>
                    <div className="task-progress-cell">
                      <div className="progress-mini">
                        <div
                          className="progress-mini-fill"
                          style={{
                            width: `${task.progress}%`,
                            backgroundColor: task.color,
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
        {filteredTasks.length === 0 && searchQuery.trim() && (
          <div className="sidebar-empty">
            No tasks match "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
