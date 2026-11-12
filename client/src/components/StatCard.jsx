import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  badge,
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      icon: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      icon: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      icon: 'text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      icon: 'text-rose-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      icon: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      icon: 'text-purple-600',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${scheme.bg} ${scheme.border} ${scheme.icon}`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {badge && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
