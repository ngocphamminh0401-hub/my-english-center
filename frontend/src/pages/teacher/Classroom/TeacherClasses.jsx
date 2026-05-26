import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../layouts/TeacherLayout';
import { getTeacherClasses } from '../../../services/teacherApi';

const STATUS_CONFIG = {
  current: { label: 'Đang dạy', cls: 'bg-emerald-100 text-emerald-700' },
  upcoming: { label: 'Sắp tới', cls: 'bg-blue-100 text-blue-700' },
  past: { label: 'Đã xong', cls: 'bg-slate-100 text-slate-500' },
};

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'current', label: 'Đang dạy' },
  { key: 'upcoming', label: 'Sắp tới' },
  { key: 'past', label: 'Đã xong' },
];

function ClassCard({ cls }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[cls.status] ?? STATUS_CONFIG.past;

  const fmt = (d) =>
    d ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(d)) : '—';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">{cls.class_name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{cls.course_title}</p>
        </div>
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.cls}`}>
          {cfg.label}
        </span>
      </div>

      {/* Meta */}
      <div className="space-y-1.5 text-xs text-slate-500">
        {cls.branch_name && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {cls.branch_name}{cls.room_name ? ` • ${cls.room_name}` : ''}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fmt(cls.start_date)} – {fmt(cls.end_date)}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1 text-slate-600">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{cls.student_count} học viên</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{cls.session_count} buổi</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate(`/teacher/classes/${cls.class_id}`)}
          className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
        >
          Vào lớp
        </button>
        <button
          type="button"
          onClick={() => navigate(`/teacher/classes/${cls.class_id}/assignments`)}
          className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:border-indigo-300 hover:text-indigo-700 transition-colors"
        >
          Bài tập
        </button>
      </div>
    </div>
  );
}

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    getTeacherClasses()
      .then((data) => { if (mounted) setClasses(data.classes || []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return classes;
    return classes.filter((c) => c.status === filter);
  }, [classes, filter]);

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Quản lý lớp học</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách các lớp bạn đang phụ trách.</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && !loading && (
                <span className="ml-1.5 text-[11px] opacity-70">
                  ({classes.filter((c) => c.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} active />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <p className="text-slate-400">Không có lớp học nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cls) => (
              <ClassCard key={cls.class_id} cls={cls} />
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
