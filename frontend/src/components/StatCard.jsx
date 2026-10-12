import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 icon-bg-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 icon-bg-emerald-100',
    amber: 'bg-amber-50 border-amber-200 text-amber-700 icon-bg-amber-100',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 icon-bg-blue-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 icon-bg-purple-100',
    rose: 'bg-rose-50 border-rose-200 text-rose-700 icon-bg-rose-100'
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 rounded-xl border bg-white shadow-sm hover:shadow transition relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
