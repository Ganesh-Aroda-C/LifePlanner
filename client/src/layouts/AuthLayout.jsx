import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, ShieldCheck, Zap, BellRing } from 'lucide-react';

export const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Brand Hero Panel (Desktop) */}
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-slate-900 text-white p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        {/* Background circuit glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/40">
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
            <h2 className="text-xl font-bold tracking-tight">LifePlanner</h2>
            <p className="text-xs text-slate-400">Personal AI Life Assistant</p>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="my-auto py-10 z-10 space-y-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Your Day, Under Control
            </span>
            <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-2 leading-tight">
              Your life, organized intelligently.
            </h3>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed max-w-md">
              A modern operating system for personal productivity. Manage responsibilities, prioritize commitments, and anticipate deadlines with automated intelligence.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span>Priority & deadline classification (Critical, High, Medium, Low)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <BellRing className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span>Proactive background reminder engine with snooze support</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span>Strict user data isolation and encrypted session tokens</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span>Integrated calendar view & multi-dimensional productivity tracking</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} LifePlanner. Designed for modern productivity.
        </div>
      </div>

      {/* Auth Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="flex md:hidden items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4c0 .5-.1 1-.3 1.4A4 4 0 0 1 18 11a4 4 0 0 1-1.7 3.3A4 4 0 0 1 16 18a4 4 0 0 1-4 4 4 4 0 0 1-.3-3.7A4 4 0 0 1 6 11a4 4 0 0 1 2.3-3.6A4 4 0 0 1 8 6a4 4 0 0 1 4-4z" />
                <path d="M12 2v20" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">LifePlanner</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
