import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import MasterLayout from '../../../layouts/MasterLayout';
import EvaluationTrigger from './EvaluationTrigger';
import {
  getStudentDashboard,
  getStudentCourses,
  getStudentAnnouncements,
} from '../../../services/studentApi';

const MAX_SESSIONS = 30;

const FireIcon = () => (
  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const BookIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13" />
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(d);
};

function UpcomingCard({ session }) {
  const today = new Date();
  const sessionDate = new Date(session.sessionDate);
  const isToday = sessionDate.toDateString() === today.toDateString();
  const isTomorrow =
    sessionDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();

  const badge = isToday ? 'Hôm nay' : isTomorrow ? 'Ngày mai' : formatDate(session.sessionDate);
  const badgeColor = isToday
    ? 'bg-emerald-100 text-emerald-700'
    : isTomorrow
    ? 'bg-blue-100 text-blue-700'
    : 'bg-slate-100 text-slate-600';

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
        <CalendarIcon />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{session.courseTitle}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {session.startTime} – {session.endTime}
        </p>
        {session.roomName && (
          <p className="text-xs text-slate-400">
            {session.roomName}{session.branchName ? ` • ${session.branchName}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

function AnnouncementItem({ item }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  return (
    <div className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</p>
        <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(item.createdAt)}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.content}</p>
      <p className="text-xs text-slate-400 mt-1">{item.className} • {item.authorName}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [dash, coursesRes, announcementsRes] = await Promise.all([
          getStudentDashboard(),
          getStudentCourses(),
          getStudentAnnouncements().catch(() => ({ announcements: [] })),
        ]);
        if (!mounted) return;
        setDashboard(dash);
        setCourses(coursesRes.courses || []);
        setAnnouncements(announcementsRes.announcements || []);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const upcoming = useMemo(
    () => dashboard?.upcomingSchedules || [],
    [dashboard]
  );

  const activeCourses = useMemo(
    () => courses.filter((c) => !c.isCompleted),
    [courses]
  );

  const totalAttended = useMemo(
    () => courses.reduce((sum, c) => sum + c.attendedSessions, 0),
    [courses]
  );

  const name = dashboard?.name || 'Học viên';
  const streak = dashboard?.streak || 0;
  const pendingCount = dashboard?.pendingAssignments || 0;

  return (
    <MasterLayout studentName={name} streak={streak}>
      <EvaluationTrigger />

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* ─── Welcome Banner ─── */}
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white overflow-hidden shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-white/10" />

          <div className="relative">
            <p className="text-sm text-emerald-100">Xin chào,</p>
            <h1 className="mt-1 text-2xl font-bold">{name} 👋</h1>
            <p className="mt-1 text-sm text-emerald-100">
              {streak > 0
                ? `Bạn đang có chuỗi ${streak} ngày học tập liên tiếp. Tiếp tục phát huy!`
                : 'Hãy bắt đầu hành trình học tập của bạn ngay hôm nay!'}
            </p>

            {/* Streak display */}
            {streak > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-orange-300">
                  <FireIcon />
                </span>
                <div>
                  <span className="text-2xl font-bold">{streak}</span>
                  <span className="text-sm ml-1 text-emerald-100">ngày streak</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate('/student/courses')}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <BookIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{activeCourses.length}</p>
                <p className="text-xs text-slate-500">Khóa học đang học</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">{totalAttended} buổi đã tham dự</div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/student/schedule')}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{upcoming.length}</p>
                <p className="text-xs text-slate-500">Buổi học sắp tới</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {upcoming[0]
                ? `Tiếp theo: ${formatDate(upcoming[0].sessionDate)}`
                : 'Không có lịch sắp tới'}
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/student/assignments')}
            className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-rose-200 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <ClipboardIcon />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                <p className="text-xs text-slate-500">Bài tập chưa nộp</p>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {pendingCount > 0 ? 'Cần hoàn thành sớm' : 'Đã hoàn thành tất cả'}
            </div>
          </button>
        </div>

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">Khóa học đang tham gia</h2>
              <button
                type="button"
                onClick={() => navigate('/student/courses')}
                className="text-xs text-emerald-600 hover:underline font-medium"
              >
                Xem tất cả →
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton active />
                <Skeleton active />
              </div>
            ) : activeCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <p className="text-slate-400 text-sm">Bạn chưa đăng ký khóa học nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeCourses.slice(0, 4).map((course) => {
                  const pct = Math.min(
                    100,
                    Math.round((course.attendedSessions / (course.maxSessions || MAX_SESSIONS)) * 100)
                  );
                  return (
                    <button
                      key={`${course.courseId}-${course.classId}`}
                      type="button"
                      onClick={() => navigate('/student/courses')}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all text-left"
                    >
                      {/* Color bar */}
                      <div className="h-1 w-full rounded-full bg-slate-100 mb-3">
                        <div
                          className="h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{course.className}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {course.attendedSessions}/{course.maxSessions || MAX_SESSIONS} buổi
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            pct >= 80
                              ? 'bg-emerald-100 text-emerald-700'
                              : pct >= 50
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Upcoming + Announcements */}
          <div className="space-y-5">
            {/* Upcoming sessions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Lịch học sắp tới</h3>
                <button
                  type="button"
                  onClick={() => navigate('/student/schedule')}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Xem lịch
                </button>
              </div>

              {loading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : upcoming.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có buổi học sắp tới.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((s) => (
                    <UpcomingCard key={s.scheduleId} session={s} />
                  ))}
                </div>
              )}
            </div>

            {/* Announcements */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Thông báo từ giáo viên</h3>

              {loading ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : announcements.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Chưa có thông báo mới.</p>
              ) : (
                <div className="space-y-2">
                  {announcements.slice(0, 3).map((a) => (
                    <AnnouncementItem key={a.id} item={a} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
}
