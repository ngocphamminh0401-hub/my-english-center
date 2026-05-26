import React from 'react';

export default function UpcomingSchedule({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
        Chưa có buổi học sắp tới.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-base font-semibold text-slate-800">Lịch học sắp tới</h3>
      <div className="mt-4 space-y-4">
        {items.slice(0, 3).map((item, index) => (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {index < items.length - 1 && (
                <span className="mt-1 h-full w-px bg-emerald-100" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {item.title}
              </div>
              <div className="text-xs text-slate-500">
                {item.date} • {item.time}
              </div>
              <div className="text-xs text-slate-400">{item.room}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
