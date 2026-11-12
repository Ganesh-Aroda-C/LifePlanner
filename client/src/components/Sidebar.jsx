import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Bell,
  Sparkles,
  Settings,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare },
    { name: 'Calendar', to: '/calendar', icon: Calendar },
    { name: 'Reminders', to: '/reminders', icon: Bell },
    {
      name: 'LifePlanner Copilot',
      to: '/assistant',
      icon: Sparkles,
      badge: 'Preview',
    },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col h-full shadow-sm">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        {/* Custom Brain / Circuit Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a4 4 0 0 1 4 4c0 .5-.1 1-.3 1.4A4 4 0 0 1 18 11a4 4 0 0 1-1.7 3.3A4 4 0 0 1 16 18a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1-.3-3.7A4 4 0 0 1 6 11a4 4 0 0 1 2.3-3.6A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
            <path d="M12 2v20" />
            <path d="M8 6h8" />
            <path d="M6 11h12" />
            <path d="M8 18h8" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
            LifePlanner
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              v1.0
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-tight">
            Intelligent Life Assistant
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace
        </div>

        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Profile & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || 'Account'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
