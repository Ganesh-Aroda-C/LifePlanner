import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { taskService } from '../services/taskService';
import { StatCard } from '../components/StatCard';
import { CategoryBadge, PriorityBadge } from '../components/Badge';
import { Button } from '../components/Button';
import { formatDate, formatTime, isOverdue } from '../utils/dateUtils';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Calendar,
  ListTodo,
  ArrowRight,
  Plus,
  RefreshCw,
  Bell,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsData, upcomingData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getUpcoming(),
        dashboardService.getActivity(),
      ]);

      setStats(statsData.stats);
      setUpcomingTasks(upcomingData.upcomingTasks || []);
      setUpcomingReminders(upcomingData.upcomingReminders || []);
      setRecentTasks(activityData.recentTasks || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Listen for global task updates
    const handleUpdate = () => fetchDashboardData(true);
    window.addEventListener('lifeos_tasks_updated', handleUpdate);
    return () => window.removeEventListener('lifeos_tasks_updated', handleUpdate);
  }, [fetchDashboardData]);

  const handleQuickToggleComplete = async (taskId) => {
    try {
      await taskService.toggleComplete(taskId);
      fetchDashboardData(true);
      window.dispatchEvent(new CustomEvent('lifeos_tasks_updated'));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Gathering your daily overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Today is <span className="font-semibold text-slate-700">{todayDateString}</span>. Here is your productivity pulse.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="text-slate-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Link to="/tasks">
            <Button size="sm" variant="dark">
              <ListTodo className="w-3.5 h-3.5 mr-1" />
              Manage All Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress & Highlights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Daily Progress Banner (Takes 1.5 cols on large screens) */}
        <div className="lg:col-span-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Daily Execution Rate
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                {stats?.completionRate === 100
                  ? 'All tasks accomplished! Exceptional focus today.'
                  : stats?.completionRate > 50
                  ? 'Solid momentum today. Keep pushing forward!'
                  : 'Let’s tackle your high-impact priorities.'}
              </h2>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                You have completed <span className="font-semibold text-white">{stats?.completedTasks || 0}</span> out of <span className="font-semibold text-white">{stats?.totalTasks || 0}</span> total responsibilities registered in your system.
              </p>
            </div>

            {/* Circular Progress & Mini stats */}
            <div className="flex items-center gap-6 self-start md:self-center">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-700"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-indigo-400 transition-all duration-700 ease-out"
                      strokeDasharray={`${stats?.completionRate || 0}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-bold text-white">
                    {stats?.completionRate || 0}%
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="text-slate-300">
                    <span className="font-semibold text-emerald-400">{stats?.completedTasks || 0}</span> done
                  </div>
                  <div className="text-slate-300">
                    <span className="font-semibold text-amber-400">{stats?.pendingTasks || 0}</span> pending
                  </div>
                  {stats?.overdueTasks > 0 && (
                    <div className="text-rose-300 font-semibold">
                      {stats.overdueTasks} overdue
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real MongoDB Stat Cards */}
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          subtitle="All active & completed"
          icon={ListTodo}
          color="indigo"
        />

        <StatCard
          title="Completed"
          value={stats?.completedTasks || 0}
          subtitle={`${stats?.completionRate || 0}% completion velocity`}
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Pending / Active"
          value={(stats?.pendingTasks || 0) + (stats?.inProgressTasks || 0)}
          subtitle={`${stats?.inProgressTasks || 0} in progress right now`}
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Critical Tasks"
          value={stats?.criticalTasks || 0}
          subtitle={
            stats?.overdueTasks > 0
              ? `${stats.overdueTasks} overdue deadline(s)`
              : 'Zero overdue items'
          }
          icon={stats?.overdueTasks > 0 ? AlertTriangle : Flame}
          color={stats?.overdueTasks > 0 || stats?.criticalTasks > 0 ? 'rose' : 'blue'}
        />
      </div>

      {/* Main Grid: Upcoming Deadlines + Today's Agenda + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Deadlines & Priority Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Upcoming Deadlines (Next 7 Days)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    High priority commitments requiring your attention
                  </p>
                </div>
              </div>

              <Link
                to="/tasks"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No approaching deadlines within the next 7 days.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingTasks.map((task) => {
                  const overdue = isOverdue(task.deadline, task.status);
                  return (
                    <div
                      key={task._id}
                      className="py-3.5 flex items-center justify-between gap-3 group hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleQuickToggleComplete(task._id)}
                          className="w-5 h-5 rounded-lg border border-slate-300 flex items-center justify-center text-transparent hover:text-indigo-600 hover:border-indigo-400 transition"
                          title="Mark complete"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryBadge category={task.category} />
                            <PriorityBadge priority={task.priority} />
                            {task.isMandatory && (
                              <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-xs font-semibold block ${
                            overdue ? 'text-red-600' : 'text-slate-600'
                          }`}
                        >
                          {formatDate(task.deadline)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatTime(task.deadline)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent System Activity */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">
                Recent Task Activity
              </h3>
              <span className="text-xs text-slate-400">Real-time DB records</span>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No recent task modifications.
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((t) => (
                  <div
                    key={t._id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500'
                            : t.status === 'In Progress'
                            ? 'bg-indigo-500'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-medium text-slate-800 truncate">
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-slate-400 text-[11px]">
                        {t.status}
                      </span>
                      <CategoryBadge category={t.category} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Reminders & Assistant Quick Prompt */}
        <div className="space-y-6">
          {/* Active Reminders Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-slate-800 text-sm">
                  Active Reminders
                </h3>
              </div>
              <Link
                to="/reminders"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Open Center
              </Link>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No pending reminders scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map((rem) => (
                  <div
                    key={rem._id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">
                        {rem.title}
                      </span>
                      <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {rem.status}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(rem.remindAt)} at {formatTime(rem.remindAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* LifeOS Copilot Preview Teaser */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl p-5 border border-indigo-100 text-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>LifeOS AI Assistant</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-200/60 font-bold text-indigo-800">
                Phase 6 Preview
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              In upcoming releases, LifeOS will automatically parse your incoming emails, WhatsApp announcements, and calendar commitments to build your daily timeline for you.
            </p>

            <Link to="/assistant" className="block pt-1">
              <Button size="sm" variant="secondary" className="w-full text-indigo-700 bg-white border-indigo-200">
                Explore Copilot Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
