import React from 'react';

export default function CircularProgress({ score = 0, size = 200, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreClamped = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (scoreClamped / 100) * circumference;

  let colorConfig = {
    stroke: '#ef4444',
    bgGlow: 'rgba(239, 68, 68, 0.15)',
    badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    label: 'Poor Match',
  };

  if (scoreClamped >= 80) {
    colorConfig = {
      stroke: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.2)',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      label: 'Strong Match',
    };
  } else if (scoreClamped >= 60) {
    colorConfig = {
      stroke: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.2)',
      badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      label: 'Good Match',
    };
  } else if (scoreClamped >= 40) {
    colorConfig = {
      stroke: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.2)',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      label: 'Needs Improvement',
    };
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glow effect behind circle */}
        <div
          className="absolute inset-0 rounded-full blur-xl transition-all duration-700"
          style={{ background: colorConfig.bgGlow }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            {scoreClamped}%
          </span>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">
            Match Score
          </span>
        </div>
      </div>

      {/* Score Badge */}
      <div className={`mt-4 px-4 py-1.5 rounded-full border text-sm font-semibold tracking-wide ${colorConfig.badgeBg}`}>
        {colorConfig.label}
      </div>
    </div>
  );
}
