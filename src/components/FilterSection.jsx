import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FilterSection = ({ title, options, selected, onChange, isOpenDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 py-3">
      <button 
        className="flex items-center justify-between w-full text-left font-medium text-slate-700 dark:text-slate-200 mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isOpen && (
        <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
          {options.length > 0 ? (
            options.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selected.includes(option)}
                  onChange={() => onChange(option)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors break-words w-56">
                  {option}
                </span>
              </label>
            ))
          ) : (
             <p className="text-xs text-slate-400 italic pl-6">ไม่พบข้อมูลตัวเลือก</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterSection;
