import React from 'react';
import { Menu, Plus, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export const Navbar = ({ onOpenMobileMenu, onOpenNewTask }) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Date Widget */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200/50">
          <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>{todayFormatted}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <Link
          to="/reminders"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Reminders"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
        </Link>

        {onOpenNewTask && (
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenNewTask}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        )}
      </div>
    </header>
  );
};
