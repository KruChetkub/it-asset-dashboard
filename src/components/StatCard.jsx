import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-200">
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
      <p className="text-slate-400 text-xs mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

export default StatCard;
