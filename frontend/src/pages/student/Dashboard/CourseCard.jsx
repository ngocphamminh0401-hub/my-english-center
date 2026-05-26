import React from 'react';

export default function CourseCard({ title, progressText, progressPercent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
          {progressText}
        </span>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Tiến độ học tập: {progressPercent}% hoàn thành
        </div>
      </div>
    </div>
  );
}
