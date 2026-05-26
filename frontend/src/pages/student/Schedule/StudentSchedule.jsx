import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import MasterLayout from '../../../layouts/MasterLayout';
import {
  getStudentSchedule,
  getStudentDashboard,
} from '../../../services/studentApi';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

function sessionStatus(session) {
  if (session.attendanceStatus === 'present') return 'completed';
  if (session.attendanceStatus === 'absent') return 'absent';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(session.sessionDate);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'today';
  if (d < today) return 'missed';
  return 'upcoming';
}

function SessionCard({ session, isLast }) {
  const status = sessionStatus(session);
  const d = new Date(session.sessionDate);
  const weekday = WEEKDAYS[d.getDay()];
  const dayNum = d.getDate();

  const statusConfig = {
    completed: {
      dot: 'bg-emerald-500 border-emerald-500',
      ring: 'border-emerald-200',
      badge: { label: 'Đã học', cls: 'bg-emerald-100 text-emerald-700' },
      card: 'border-emerald-100',
    },
    today: {
      dot: 'bg-blue-500 border-blue-500 animate-pulse',
      ring: 'border-blue-300',
      badge: { label: 'Hôm nay', cls: 'bg-blue-100 text-blue-700' },
      card: 'border-blue-200 shadow-blue-50 shadow-md',
    },
    upcoming: {
      dot: 'bg-white border-slate-300',
      ring: 'border-slate-200',
      badge: { label: 'Sắp tới', cls: 'bg-slate-100 text-slate-600' },
      card: 'border-slate-100',
    },
    absent: {
      dot: 'bg-rose-400 border-rose-400',
      ring: 'border-rose-200',
      badge: { label: 'Vắng', cls: 'bg-rose-100 text-rose-600' },
      card: 'border-rose-100',
    },
    missed: {
      dot: 'bg-slate-300 border-slate-300',
      ring: 'border-slate-100',
      badge: { label: 'Chưa điểm danh', cls: 'bg-slate-100 text-slate-400' },
      card: 'border-slate-100',
    },
  };

  const cfg = statusConfig[status];

  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div
          className={`h-5 w-5 rounded-full border-2 flex-shrink-0 z-10 ${cfg.dot}`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-slate-100 mt-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 mb-4 rounded-2xl border bg-white p-4 shadow-sm ${cfg.card}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">
                {weekday}, {dayNum}/{d.getMonth() + 1}
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${cfg.badge.cls}`}>
                {cfg.badge.label}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-800 leading-tight">
              {session.courseTitle}
            </p>
            <p className="text-xs text-slate-500">{session.className}</p>
          </div>

          {/* Session number badge */}
          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400 leading-none">Buổi</span>
            <span className="text-sm font-bold text-slate-700 leading-none">{session.sessionNumber}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {session.startTime} – {session.endTime}
          </span>
          {session.roomName && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {session.roomName}
              {session.branchName ? ` • ${session.branchName}` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentSchedule() {
  const [sessions, setSessions] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'completed'

  useEffect(() => {
    let mounted = true;
    Promise.all([getStudentSchedule(), getStudentDashboard()])
      .then(([schedRes, dash]) => {
        if (!mounted) return;
        setSessions(schedRes.sessions || []);
        setStudentName(dash.name || '');
        setStreak(dash.streak || 0);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'upcoming') return sessions.filter((s) => !s.attendanceStatus && new Date(s.sessionDate) >= new Date());
    if (filter === 'completed') return sessions.filter((s) => s.attendanceStatus === 'present');
    return sessions;
  }, [sessions, filter]);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map();
    filtered.forEach((s) => {
      const d = new Date(s.sessionDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) map.set(key, { year: d.getFullYear(), month: d.getMonth(), sessions: [] });
      map.get(key).sessions.push(s);
    });
    return Array.from(map.values());
  }, [filtered]);

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.attendanceStatus === 'present').length;
    const absent = sessions.filter((s) => s.attendanceStatus === 'absent').length;
    const upcoming = sessions.filter((s) => !s.attendanceStatus && new Date(s.sessionDate) >= new Date()).length;
    return { completed, absent, upcoming, total: sessions.length };
  }, [sessions]);

  return (
    <MasterLayout studentName={studentName} streak={streak}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Thời khóa biểu của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">Toàn bộ lịch học theo từng buổi.</p>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-xs text-emerald-700 mt-0.5">Đã học</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              <p className="text-xs text-blue-700 mt-0.5">Sắp tới</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-center">
              <p className="text-2xl font-bold text-rose-500">{stats.absent}</p>
              <p className="text-xs text-rose-600 mt-0.5">Vắng mặt</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'upcoming', label: 'Sắp tới' },
            { key: 'completed', label: 'Đã học' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} active />)}
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-400">Không có buổi học nào.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={`${group.year}-${group.month}`}>
                {/* Month header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold text-slate-500 px-2">
                    {MONTH_NAMES[group.month]} {group.year}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Sessions in this month */}
                {group.sessions.map((session, idx) => (
                  <SessionCard
                    key={session.scheduleId}
                    session={session}
                    isLast={idx === group.sessions.length - 1}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </MasterLayout>
  );
}
