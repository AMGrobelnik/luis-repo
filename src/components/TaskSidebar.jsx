import { GROUPS } from '../utils/sampleData';

export default function TaskSidebar({
  tasks,
  collapsedGroups,
  onToggleGroup,
  onSelectTask,
  selectedTaskId,
  onDeleteTask,
}) {
  const groups = [...new Set(tasks.map((t) => t.group))];
  // Preserve known group order, append any new groups
  const orderedGroups = [
    ...GROUPS.filter((g) => groups.includes(g)),
    ...groups.filter((g) => !GROUPS.includes(g)),
  ];

  return (
    <div className="task-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Task Name</span>
        <span className="sidebar-col">Progress</span>
      </div>
      <div className="sidebar-body">
        {orderedGroups.map((group) => {
          const groupTasks = tasks.filter((t) => t.group === group);
          const isCollapsed = collapsedGroups.has(group);

          return (
            <div key={group} className="task-group">
              <div
                className="group-header"
                onClick={() => onToggleGroup(group)}
              >
                <span className={`group-chevron ${isCollapsed ? '' : 'open'}`}>
                  &#9654;
                </span>
                <span className="group-name">{group}</span>
                <span className="group-count">{groupTasks.length}</span>
              </div>
              {!isCollapsed &&
                groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`sidebar-task ${selectedTaskId === task.id ? 'selected' : ''}`}
                    onClick={() => onSelectTask(task.id)}
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
                      <span className="progress-text">{task.progress}%</span>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
