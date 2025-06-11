
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string; // Tailwind color class e.g., 'bg-green-500'
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label, color = 'bg-sky-500' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="w-full">
      {label && <div className="text-sm text-slate-300 mb-1">{label} ({Math.round(value)}/{max})</div>}
      <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
        <div
          className={`${color} h-4 rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
