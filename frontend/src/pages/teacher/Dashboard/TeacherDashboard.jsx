import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../layouts/TeacherLayout';
import { getTeacherDashboardStats, getTeacherSchedules } from '../../../services/teacherApi';

const getTodayRange = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const date = `${yyyy}-${mm}-${dd}`;
  return `${date},${date}`;
};

const fmtTime = (v) => (v ? String(v).slice(0, 5) : '');

const fmtDate = (v) =>
  v ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(v)) : '';

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${min} phút trước`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ currentClasses: 0, pendingSubmissions: 0, announcements: [] });
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getTeacherDashboardStats(),
      getTeacherSchedules({ date_range: getTodayRange() }),
    ]).then(([s, sched]) => {
      if (!mounted) return;
      setStats(s);
      setTodaySchedules(sched.schedules || []);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const announcements = useMemo(() => (stats.announcements || []).slice(0, 5), [stats]);

  const today = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <TeacherLayout teacherName={stats.teacherName}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <p className="text-sm text-indigo-200 capitalize">{today}</p>
          <h1 className="mt-1 text-2xl font-bold">
            Xin chào{stats.teacherName ? `, ${stats.teacherName}` : ''}!
          </h1>
          <p className="mt-1 text-sm text-indigo-100">
            {todaySchedules.length > 0
              ? `Hôm nay bạn có ${todaySchedules.length} ca dạy.`
              : 'Hôm nay bạn không có ca dạy.'}
          </p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            <Skeleton active />
            <Skeleton active />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate('/teacher/classes')}
              className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-left hover:shadow-md transition-shadow"
            >
              <p className="text-3xl font-bold text-emerald-600">{stats.currentClasses}</p>
              <p className="mt-1 text-sm text-emerald-700">Lớp đang phụ trách</p>
              <p className="mt-2 text-xs text-emerald-500">Xem danh sách →</p>
            </button>
            <button
              type="button"
              onClick={() => navigate('/teacher/classes')}
              className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-left hover:shadow-md transition-shadow"
            >
              <p className="text-3xl font-bold text-amber-600">{stats.pendingSubmissions}</p>
              <p className="mt-1 text-sm text-amber-700">Bài chờ chấm</p>
              <p className="mt-2 text-xs text-amber-500">Chấm ngay →</p>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Today's schedule */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Lịch dạy hôm nay</h2>
            {loading ? (
              <Skeleton active />
            ) : todaySchedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Không có ca dạy hôm nay.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((item) => (
                  <button
                    key={item.schedule_id}
                    type="button"
                    onClick={() => navigate(`/teacher/classes/${item.class_id}`)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.class_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.room_name || 'Chưa có phòng'}
                          {item.branch_name ? ` • ${item.branch_name}` : ''}
                        </p>
                      </div>
                      <div className="flex-shrink-0 rounded-lg bg-indigo-100 px-2 py-1 text-center">
                        <p className="text-[11px] font-bold text-indigo-700 leading-none">
                          {fmtTime(item.start_time)}
                        </p>
                        <p className="text-[10px] text-indigo-400 leading-none mt-0.5">
                          {fmtTime(item.end_time)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Thông báo gần đây</h2>
            {loading ? (
              <Skeleton active />
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-slate-400">Không có thông báo mới.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {announcements.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <span className="flex-shrink-0 text-xs text-slate-400">
                        {item.created_at ? timeAgo(item.created_at) : ''}
                      </span>
                    </div>
                    {item.content && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{item.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
