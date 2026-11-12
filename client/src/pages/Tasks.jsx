import React, { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { TaskModal } from '../components/TaskModal';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatTime, isOverdue } from '../utils/dateUtils';
import {
  Search,
  Filter,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  AlertTriangle,
  Flame,
  ArrowUpDown,
} from 'lucide-react';

const CATEGORIES = ['All', 'College', 'Work', 'Personal', 'Finance', 'Health', 'Other'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortOption, setSortOption] = useState('deadline_asc');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskService.getTasks({
        category: selectedCategory,
        priority: selectedPriority,
        status: selectedStatus,
        search: search.trim() || undefined,
        sort: sortOption,
      });
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedPriority, selectedStatus, search, sortOption]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    const handleGlobalUpdate = () => fetchTasks();
    window.addEventListener('lifeplanner_tasks_updated', handleGlobalUpdate);
    return () => window.removeEventListener('lifeplanner_tasks_updated', handleGlobalUpdate);
  }, [fetchTasks]);

  const handleCreateOrUpdate = async (taskData) => {
    if (editingTask) {
      await taskService.updateTask(editingTask._id, taskData);
    } else {
      await taskService.createTask(taskData);
    }
    fetchTasks();
    window.dispatchEvent(new CustomEvent('lifeplanner_tasks_updated'));
  };

  const handleToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      fetchTasks();
      window.dispatchEvent(new CustomEvent('lifeplanner_tasks_updated'));
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchTasks();
        window.dispatchEvent(new CustomEvent('lifeplanner_tasks_updated'));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Task Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize, prioritize, and track all your personal, academic, and professional duties.
          </p>
        </div>

        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1" /> Create Task
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title or notes..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase hidden sm:inline">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.filter(p => p !== 'All').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase hidden sm:inline">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="All">All Statuses</option>
              {STATUSES.filter(s => s !== 'All').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="deadline_asc">Deadline (Earliest)</option>
              <option value="deadline_desc">Deadline (Latest)</option>
              <option value="priority">Priority Order</option>
              <option value="created_desc">Recently Created</option>
              <option value="title_asc">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List / Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 mt-2">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No tasks found"
          description={
            search || selectedCategory !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All'
              ? 'Try adjusting your filters or search keywords.'
              : 'You do not have any tasks yet. Create your first task to get organized!'
          }
          actionLabel="Create Task"
          onAction={openCreateModal}
        />
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between">
            <span>Showing {tasks.length} of {total} tasks</span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => {
              const isDone = task.status === 'Completed';
              const overdue = isOverdue(task.deadline, task.status);

              return (
                <div
                  key={task._id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-150 shadow-xs hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone
                      ? 'border-slate-200/60 opacity-75 bg-slate-50/50'
                      : overdue
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Left: Checkbox + Title + Meta */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleComplete(task._id)}
                      className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 text-transparent hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                      title={isDone ? 'Reopen task' : 'Mark task complete'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={`text-sm sm:text-base font-semibold text-slate-800 ${
                            isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.isMandatory && (
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            Required
                          </span>
                        )}

                        {overdue && (
                          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 flex-wrap text-xs text-slate-500">
                        <CategoryBadge category={task.category} />
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />

                        {task.estimatedDuration && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.estimatedDuration}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Deadline + Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      {task.deadline ? (
                        <>
                          <div
                            className={`text-xs font-semibold flex items-center sm:justify-end gap-1 ${
                              overdue ? 'text-red-600' : 'text-slate-700'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.deadline)}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {formatTime(task.deadline)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No deadline set</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
        isEdit={Boolean(editingTask)}
      />
    </div>
  );
};
