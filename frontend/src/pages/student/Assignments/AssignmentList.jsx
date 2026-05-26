import React from 'react';
import { Button } from 'antd';

const labels = {
  pending: 'Làm bài',
  submitted: 'Xem lại bài nộp',
  graded: 'Xem điểm & Phản hồi',
};

const emptyText = {
  pending: 'Không có bài tập cần làm.',
  submitted: 'Chưa có bài tập đã nộp.',
  graded: 'Chưa có bài tập đã chấm.',
};

const formatDate = (value) => {
  if (!value) return 'Chưa có hạn nộp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có hạn nộp';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function AssignmentList({ items, variant, onAction }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        {emptyText[variant]}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.assignmentId}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-800">
                {item.title}
              </h3>
              {variant === 'pending' && item.isDueSoon && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">
                  Sắp đến hạn
                </span>
              )}
              {variant === 'graded' && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  Đã chấm
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Hạn nộp: {formatDate(item.dueDate)}
            </div>
            {item.submittedAt && variant !== 'pending' && (
              <div className="mt-1 text-xs text-slate-400">
                Đã nộp: {formatDate(item.submittedAt)}
              </div>
            )}
            {variant === 'graded' && item.grade !== null && (
              <div className="mt-2 text-sm font-semibold text-emerald-700">
                Điểm: {item.grade}
              </div>
            )}
          </div>
          <Button type="primary" onClick={() => onAction(item)}>
            {labels[variant]}
          </Button>
        </div>
      ))}
    </div>
  );
}
