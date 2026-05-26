import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton, Tabs } from 'antd';
import MasterLayout from '../../../layouts/MasterLayout';
import { getStudentCourses, getStudentDashboard } from '../../../services/studentApi';

const MAX_SESSIONS = 30;

function SessionProgress({ attended, max }) {
  const pct = Math.min(100, Math.round((attended / max) * 100));
  const color =
    pct >= 100
      ? 'from-emerald-400 to-emerald-600'
      : pct >= 70
      ? 'from-teal-400 to-emerald-500'
      : pct >= 40
      ? 'from-blue-400 to-teal-500'
      : 'from-slate-300 to-slate-400';

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">Tiến độ buổi học</span>
        <span className="text-xs font-semibold text-slate-700">
          {attended}/{max} buổi
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-slate-400">{pct}% hoàn thành</div>
    </div>
  );
}

function CourseCard({ course }) {
  const max = course.maxSessions || MAX_SESSIONS;
  const pct = Math.min(100, Math.round((course.attendedSessions / max) * 100));

  const statusBadge = course.isCompleted
    ? { label: 'Hoàn thành', cls: 'bg-emerald-100 text-emerald-700' }
    : pct >= 80
    ? { label: 'Gần xong', cls: 'bg-teal-100 text-teal-700' }
    : { label: 'Đang học', cls: 'bg-blue-100 text-blue-700' };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800 leading-tight">{course.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{course.className}</p>
        </div>
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge.cls}`}>
          {statusBadge.label}
        </span>
      </div>

      {/* Teacher */}
      {course.teacherName && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          GV: {course.teacherName}
        </div>
      )}

      {/* Progress */}
      <SessionProgress attended={course.attendedSessions} max={max} />

      {/* Session dots — visual 30-dot grid */}
      <div className="mt-3 flex flex-wrap gap-1">
        {Array.from({ length: Math.min(max, 30) }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < course.attendedSessions
                ? 'bg-emerald-500'
                : i < course.totalSessions
                ? 'bg-slate-200'
                : 'bg-slate-100'
            }`}
            title={`Buổi ${i + 1}`}
          />
        ))}
      </div>

      {/* Absent note */}
      {course.absentSessions > 0 && (
        <p className="mt-2 text-xs text-rose-500">
          Vắng {course.absentSessions} buổi
        </p>
      )}

      {/* Ràng buộc: KHÔNG có nút "Chuyển lớp" */}
      <p className="mt-3 text-[11px] text-slate-400 italic">
        * Để chuyển lớp, vui lòng liên hệ Admin.
      </p>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
        </svg>
      </div>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getStudentCourses(), getStudentDashboard()])
      .then(([res, dash]) => {
        if (!mounted) return;
        setCourses(res.courses || []);
        setStudentName(dash.name || '');
        setStreak(dash.streak || 0);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const activeCourses = useMemo(() => courses.filter((c) => !c.isCompleted), [courses]);
  const completedCourses = useMemo(() => courses.filter((c) => c.isCompleted), [courses]);

  const tabItems = [
    {
      key: 'active',
      label: `Đang học (${activeCourses.length})`,
      children: loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} active />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeCourses.length === 0
            ? <EmptyState label="Bạn chưa đang học khóa nào." />
            : activeCourses.map((c) => (
                <CourseCard key={`${c.courseId}-${c.classId}`} course={c} />
              ))}
        </div>
      ),
    },
    {
      key: 'completed',
      label: `Đã hoàn thành (${completedCourses.length})`,
      children: loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton active />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {completedCourses.length === 0
            ? <EmptyState label="Chưa có khóa học hoàn thành." />
            : completedCourses.map((c) => (
                <CourseCard key={`${c.courseId}-${c.classId}`} course={c} />
              ))}
        </div>
      ),
    },
  ];

  return (
    <MasterLayout studentName={studentName} streak={streak}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Khóa học của tôi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Các khóa học bạn đang tham gia. Mỗi khóa tối đa {MAX_SESSIONS} buổi.
          </p>
        </div>

        <Tabs items={tabItems} />
      </div>
    </MasterLayout>
  );
}
