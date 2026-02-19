import { useState, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import TaskSidebar from './components/TaskSidebar';
import GanttChart from './components/GanttChart';
import TaskModal from './components/TaskModal';
import { createSampleData, generateId } from './utils/sampleData';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState(() => createSampleData());
  const [zoom, setZoom] = useState('day');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [scrollToToday, setScrollToToday] = useState(0);
  const [projectName, setProjectName] = useState('My Project');

  const handleTaskUpdate = useCallback((taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  }, []);

  const handleToggleGroup = useCallback((group) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId((prev) => (prev === taskId ? null : taskId));
  }, []);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedTaskId) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (task) {
      setEditingTask(task);
      setModalOpen(true);
    }
  };

  const handleSaveTask = (data) => {
    if (editingTask) {
      handleTaskUpdate(editingTask.id, data);
    } else {
      const newTask = { ...data, id: generateId() };
      setTasks((prev) => [...prev, newTask]);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
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
  };

  const handleToday = () => {
    setScrollToToday((n) => n + 1);
  };

  return (
    <div className="app">
      <Toolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onAddTask={handleOpenAdd}
        onToday={handleToday}
        projectName={projectName}
        onProjectNameChange={setProjectName}
      />

      <div className="main-content">
        <TaskSidebar
          tasks={tasks}
          collapsedGroups={collapsedGroups}
          onToggleGroup={handleToggleGroup}
          onSelectTask={(id) => {
            handleSelectTask(id);
          }}
          selectedTaskId={selectedTaskId}
          onDeleteTask={handleDeleteTask}
        />

        <GanttChart
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          zoom={zoom}
          selectedTaskId={selectedTaskId}
          onSelectTask={(id) => {
            handleSelectTask(id);
          }}
          collapsedGroups={collapsedGroups}
          scrollToToday={scrollToToday}
        />
      </div>

      {/* Double click selected task to edit */}
      {selectedTaskId && (
        <div className="selection-actions">
          <button className="btn btn-sm btn-primary" onClick={handleOpenEdit}>
            Edit Task
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteTask(selectedTaskId)}
          >
            Delete
          </button>
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
