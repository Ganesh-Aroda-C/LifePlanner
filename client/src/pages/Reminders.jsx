import React, { useState, useEffect, useCallback } from 'react';
import { reminderService } from '../services/reminderService';
import { taskService } from '../services/taskService';
import { ReminderModal } from '../components/ReminderModal';
import { BrowserNotificationPrompt } from '../components/BrowserNotificationPrompt';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatTime } from '../utils/dateUtils';
import {
  Bell,
  Clock,
  Plus,
  CheckCircle,
  Moon,
  Trash2,
  AlertCircle,
  Repeat,
  Check,
} from 'lucide-react';

export const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const [remData, taskData] = await Promise.all([
        reminderService.getReminders({ status: statusFilter }),
        taskService.getTasks({ limit: 100 }),
      ]);
      setReminders(remData.reminders || []);
      setTasks(taskData.tasks || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleCreateReminder = async (formData) => {
    await reminderService.createReminder(formData);
    fetchReminders();
  };

  const handleAcknowledge = async (id) => {
    try {
      await reminderService.acknowledgeReminder(id);
      fetchReminders();
    } catch (err) {
      console.error('Failed to acknowledge reminder:', err);
    }
  };

  const handleSnooze = async (id, minutes = 15) => {
    try {
      await reminderService.snoozeReminder(id, minutes);
      fetchReminders();
    } catch (err) {
      console.error('Failed to snooze reminder:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this scheduled reminder?')) {
      try {
        await reminderService.deleteReminder(id);
        fetchReminders();
      } catch (err) {
        console.error('Failed to delete reminder:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reminders & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure automated alerts and maintain proactive focus on what matters.
          </p>
        </div>

        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Schedule Reminder
        </Button>
      </div>

      {/* Browser Notification Permission Card with Limitations Explanation */}
      <BrowserNotificationPrompt />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'All Reminders', val: 'all' },
          { label: 'Scheduled', val: 'scheduled' },
          { label: 'Triggered', val: 'triggered' },
          { label: 'Snoozed', val: 'snoozed' },
          { label: 'Acknowledged', val: 'acknowledged' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.val
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 mt-2">Loading reminders...</p>
        </div>
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders in this view"
          description="Schedule a reminder to be prompted for upcoming meetings, study sessions, or critical chores."
          actionLabel="Schedule Reminder"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => {
            const isAck = rem.status === 'acknowledged';
            const isTriggered = rem.status === 'triggered';
            const isSnoozed = rem.status === 'snoozed';

            return (
              <div
                key={rem._id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-150 shadow-xs hover:shadow-sm space-y-3 ${
                  isAck
                    ? 'border-slate-200/60 opacity-80 bg-slate-50/50'
                    : isTriggered
                    ? 'border-indigo-300 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isAck
                          ? 'bg-emerald-50 text-emerald-600'
                          : isTriggered
                          ? 'bg-indigo-600 text-white animate-bounce'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-semibold text-slate-800 truncate ${
                          isAck ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {rem.title}
                      </h4>
                      {rem.taskId?.title && (
                        <p className="text-xs text-indigo-600 font-medium truncate">
                          Task: {rem.taskId.title}
                        </p>
                      )}
                      {rem.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {rem.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                      isAck
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isTriggered
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse'
                        : isSnoozed
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {rem.status}
                  </span>
                </div>

                {/* Date & Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {formatDate(rem.remindAt)} at {formatTime(rem.remindAt)}
                    </span>
                  </div>

                  {rem.repeatInterval !== 'none' && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Repeat className="w-3 h-3 text-indigo-600" />
                      <span className="capitalize">{rem.repeatInterval}</span>
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    {!isAck && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAcknowledge(rem._id)}
                        className="text-xs py-1 px-2.5 text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Acknowledge
                      </Button>
                    )}

                    {!isAck && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSnooze(rem._id, 15)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Snooze 15 minutes"
                        >
                          +15m
                        </button>
                        <button
                          onClick={() => handleSnooze(rem._id, 60)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Snooze 1 hour"
                        >
                          +1h
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(rem._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Cancel reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Create Modal */}
      <ReminderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateReminder}
        tasks={tasks}
      />
    </div>
  );
};
