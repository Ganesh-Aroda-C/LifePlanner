import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { Button } from '../components/Button';
import { CategoryBadge, PriorityBadge } from '../components/Badge';
import { formatDate, formatTime, getCalendarMonthDays, isToday } from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ListTodo,
} from 'lucide-react';

export const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'
  const [selectedDay, setSelectedDay] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getTasks({ limit: 200 });
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Failed to load tasks for calendar:', err);
      }
    };
    loadTasks();
  }, []);

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() - 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() - 1);
      setCurrentDate(next);
      setSelectedDay(next);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
      setSelectedDay(next);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now);
  };

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  // Month days
  const calendarDays = getCalendarMonthDays(year, month);

  // Get tasks for a given date
  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.deadline) return false;
      const tDate = new Date(task.deadline);
      return (
        tDate.getDate() === date.getDate() &&
        tDate.getMonth() === date.getMonth() &&
        tDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Week days generator
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay();
    const sunday = new Date(curr);
    sunday.setDate(curr.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const selectedDayTasks = getTasksForDate(selectedDay);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Navigation & Views */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Schedule & Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phase 1 Calendar: View task commitments and deadlines across time horizons.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-center">
          {['month', 'week', 'day'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-800">{monthName}</h2>
          <Button size="sm" variant="secondary" onClick={handleToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50 text-center py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.date);
              const isCellToday = isToday(cell.date);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDay(cell.date);
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? 'bg-white hover:bg-slate-50/70'
                      : 'bg-slate-50/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center ${
                        isCellToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-full border border-indigo-100">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Micro Task Badges in Cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t._id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded bg-indigo-50/90 text-indigo-800 font-medium border border-indigo-100"
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-medium pl-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-slate-100">
            {getWeekDays().map((day, idx) => {
              const dayTasks = getTasksForDate(day);
              const isDayToday = isToday(day);

              return (
                <div key={idx} className="min-h-[300px] p-3 flex flex-col">
                  <div className="text-center pb-3 border-b border-slate-100 mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase block">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
                    </span>
                    <span
                      className={`inline-block mt-1 text-sm font-bold w-7 h-7 leading-7 rounded-full ${
                        isDayToday ? 'bg-indigo-600 text-white' : 'text-slate-800'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayTasks.map((t) => (
                      <div
                        key={t._id}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                      >
                        <p className="font-semibold text-slate-800 truncate">{t.title}</p>
                        <span className="text-[10px] text-slate-500 block">
                          {formatTime(t.deadline)}
                        </span>
                        <CategoryBadge category={t.category} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY AGENDA VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">
              Agenda for {formatDate(selectedDay, { weekday: 'long' })}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedDayTasks.length} task deadline(s) scheduled for this day
            </p>
          </div>

          {selectedDayTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tasks scheduled for this day. Enjoy your free time!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedDayTasks.map((t) => (
                <div key={t._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-800">{t.title}</h4>
                    {t.description && (
                      <p className="text-xs text-slate-500">{t.description}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <CategoryBadge category={t.category} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>

                  <div className="text-right text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTime(t.deadline)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Day Quick Inspector (shown beneath month grid) */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              Selected Date: {formatDate(selectedDay, { weekday: 'long' })}
            </h3>
            <span className="text-xs text-slate-400">
              {selectedDayTasks.length} scheduled item(s)
            </span>
          </div>

          {selectedDayTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No task deadlines or schedules registered for this date.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDayTasks.map((t) => (
                <div
                  key={t._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                >
                  <p className="font-semibold text-slate-800">{t.title}</p>
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{formatTime(t.deadline)}</span>
                    <CategoryBadge category={t.category} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
