import React from 'react';

export const CategoryBadge = ({ category }) => {
  const styles = {
    College: 'bg-purple-50 text-purple-700 border-purple-200/80',
    Work: 'bg-blue-50 text-blue-700 border-blue-200/80',
    Personal: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Finance: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Health: 'bg-rose-50 text-rose-700 border-rose-200/80',
    Other: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = styles[category] || styles.Other;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {category || 'Other'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    Critical: 'bg-red-50 text-red-700 border-red-200/80',
    High: 'bg-amber-50 text-amber-700 border-amber-200/80',
    Medium: 'bg-sky-50 text-sky-700 border-sky-200/80',
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const dots = {
    Critical: 'bg-red-500 animate-pulse',
    High: 'bg-amber-500',
    Medium: 'bg-sky-500',
    Low: 'bg-slate-400',
  };

  const style = styles[priority] || styles.Medium;
  const dot = dots[priority] || dots.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {priority || 'Medium'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-slate-100 text-slate-700 border-slate-200',
    'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200/80',
  };

  const style = styles[status] || styles.Pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      {status || 'Pending'}
    </span>
  );
};
