import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { toDateTimeLocalString } from '../utils/dateUtils';
import { Bell, Calendar, Clock, AlertCircle } from 'lucide-react';

const CATEGORIES = ['College', 'Work', 'Personal', 'Finance', 'Health', 'Other'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Work',
    priority: 'Medium',
    status: 'Pending',
    deadline: '',
    estimatedDuration: 30,
    isMandatory: false,
    reminderPreference: {
      enabled: false,
      remindBeforeMinutes: 30,
      type: 'browser',
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'Work',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending',
        deadline: toDateTimeLocalString(initialData.deadline),
        estimatedDuration: initialData.estimatedDuration || 30,
        isMandatory: initialData.isMandatory || false,
        reminderPreference: {
          enabled: initialData.reminderPreference?.enabled || false,
          remindBeforeMinutes: initialData.reminderPreference?.remindBeforeMinutes || 30,
          type: initialData.reminderPreference?.type || 'browser',
        },
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Work',
        priority: 'Medium',
        status: 'Pending',
        deadline: '',
        estimatedDuration: 30,
        isMandatory: false,
        reminderPreference: {
          enabled: false,
          remindBeforeMinutes: 30,
          type: 'browser',
        },
      });
    }
    setError('');
  }, [initialData, isEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      subtitle={isEdit ? 'Update details and schedule' : 'Add a task to your LifeOS queue'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Finalize Q4 Budget Report"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add any relevant context, notes, or checklists..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status (when editing) & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Duration (mins)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={formData.estimatedDuration}
              onChange={(e) =>
                setFormData({ ...formData, estimatedDuration: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Deadline Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Deadline (Date & Time)
          </label>
          <input
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
          />
        </div>

        {/* Flags & Reminder Configuration */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isMandatory}
              onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <span className="text-xs font-medium text-slate-700">
              Mark as non-negotiable / mandatory commitment
            </span>
          </label>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={formData.reminderPreference.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderPreference: {
                      ...formData.reminderPreference,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                Schedule automated reminder before deadline
              </span>
            </label>

            {formData.reminderPreference.enabled && (
              <div className="pl-6 pt-1 flex items-center gap-3">
                <label className="text-xs text-slate-500">Alert me:</label>
                <select
                  value={formData.reminderPreference.remindBeforeMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reminderPreference: {
                        ...formData.reminderPreference,
                        remindBeforeMinutes: Number(e.target.value),
                      },
                    })
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                >
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                  <option value={60}>1 hour before</option>
                  <option value={1440}>1 day before</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
