import { useState, useCallback, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import TaskSidebar from './components/TaskSidebar';
import GanttChart from './components/GanttChart';
import TaskModal from './components/TaskModal';
import { createSampleData, generateId } from './utils/sampleData';
import { useUndoRedo } from './hooks/useUndoRedo';
import { formatDateInput } from './utils/dateUtils';
import './App.css';

const STORAGE_KEY = 'gantt-project-data';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      ...data,
      tasks: data.tasks.map((t) => ({
        ...t,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
      })),
    };
  } catch {
    return null;
  }
}

function saveToStorage(projectName, tasks) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        projectName,
        tasks: tasks.map((t) => ({
          ...t,
          startDate: t.startDate instanceof Date ? t.startDate.toISOString() : t.startDate,
          endDate: t.endDate instanceof Date ? t.endDate.toISOString() : t.endDate,
        })),
      })
    );
  } catch {
    // storage full or unavailable
  }
}

const SAVED_DATA = loadFromStorage();

export default function App() {
  const [tasks, setTasks] = useState(() =>
    SAVED_DATA ? SAVED_DATA.tasks : createSampleData()
  );
  const [projectName, setProjectName] = useState(
    () => SAVED_DATA?.projectName || 'My Project'
  );
  const [zoom, setZoom] = useState('day');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [scrollToToday, setScrollToToday] = useState(0);

  const { pushSnapshot, undo, redo } = useUndoRedo(tasks, setTasks);

  // Auto-save on change
  useEffect(() => {
    saveToStorage(projectName, tasks);
  }, [projectName, tasks]);

  const handleTaskUpdate = useCallback(
    (taskId, updates) => {
      pushSnapshot(tasks);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    },
    [tasks, pushSnapshot]
  );

  const handleToggleGroup = useCallback((group) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }, []);

  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const handleEditTaskById = useCallback(
    (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setEditingTask(task);
        setModalOpen(true);
      }
    },
    [tasks]
  );

  const handleOpenEdit = useCallback(() => {
    if (!selectedTaskId) return;
    handleEditTaskById(selectedTaskId);
  }, [selectedTaskId, handleEditTaskById]);

  const handleSaveTask = useCallback(
    (data) => {
      pushSnapshot(tasks);
      if (editingTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t))
        );
      } else {
        const newTask = { ...data, id: generateId() };
        setTasks((prev) => [...prev, newTask]);
      }
      setModalOpen(false);
      setEditingTask(null);
    },
    [editingTask, tasks, pushSnapshot]
  );

  const handleDeleteTask = useCallback(
    (taskId) => {
      pushSnapshot(tasks);
      setTasks((prev) =>
        prev
          .filter((t) => t.id !== taskId)
          .map((t) => ({
            ...t,
            dependencies: t.dependencies.filter((d) => d !== taskId),
          }))
      );
      setSelectedTaskId(null);
      setModalOpen(false);
      setEditingTask(null);
    },
    [tasks, pushSnapshot]
  );

  const handleToday = useCallback(() => setScrollToToday((n) => n + 1), []);

  const handleExport = useCallback(() => {
    const data = {
      projectName,
      exportedAt: new Date().toISOString(),
      tasks: tasks.map((t) => ({
        ...t,
        startDate: formatDateInput(new Date(t.startDate)),
        endDate: formatDateInput(new Date(t.endDate)),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}-gantt.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [projectName, tasks]);

  const handleImport = useCallback(
    (data) => {
      if (!data.tasks || !Array.isArray(data.tasks)) {
        return;
      }
      pushSnapshot(tasks);
      const imported = data.tasks.map((t) => ({
        ...t,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        dependencies: t.dependencies || [],
        progress: t.progress ?? 0,
        milestone: t.milestone ?? false,
      }));
      setTasks(imported);
      if (data.projectName) setProjectName(data.projectName);
    },
    [tasks, pushSnapshot]
  );

  // Keyboard shortcuts (declared after all handlers)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'Z' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenAdd();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTaskId) {
          e.preventDefault();
          handleDeleteTask(selectedTaskId);
        }
      } else if (e.key === 'Escape') {
        if (modalOpen) {
          setModalOpen(false);
          setEditingTask(null);
        } else {
          setSelectedTaskId(null);
        }
      } else if (e.key === 'Enter' && selectedTaskId) {
        e.preventDefault();
        handleEditTaskById(selectedTaskId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedTaskId, modalOpen, undo, redo, handleOpenAdd, handleDeleteTask, handleEditTaskById]);

  return (
    <div className="app">
      <Toolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onAddTask={handleOpenAdd}
        onToday={handleToday}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExport}
        onImport={handleImport}
        taskCount={tasks.length}
      />

      <div className="main-content">
        <TaskSidebar
          tasks={tasks}
          collapsedGroups={collapsedGroups}
          onToggleGroup={handleToggleGroup}
          onSelectTask={handleSelectTask}
          selectedTaskId={selectedTaskId}
          onEditTask={handleEditTaskById}
        />

        <GanttChart
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          zoom={zoom}
          selectedTaskId={selectedTaskId}
          onSelectTask={handleSelectTask}
          onEditTask={handleEditTaskById}
          collapsedGroups={collapsedGroups}
          scrollToToday={scrollToToday}
        />
      </div>

      {selectedTaskId && !modalOpen && (
        <div className="selection-actions">
          <span className="selection-task-name">
            {tasks.find((t) => t.id === selectedTaskId)?.name}
          </span>
          <button className="btn btn-sm btn-primary" onClick={handleOpenEdit}>
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteTask(selectedTaskId)}
          >
            Delete
          </button>
          <span className="selection-hint">Enter to edit &middot; Del to delete &middot; Esc to deselect</span>
        </div>
      )}

      <TaskModal
        task={editingTask}
        tasks={tasks}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
