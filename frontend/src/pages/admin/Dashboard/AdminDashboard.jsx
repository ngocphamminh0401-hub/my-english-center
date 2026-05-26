import React, { useEffect, useMemo, useState } from 'react';
import { Skeleton } from 'antd';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import AdminMasterLayout from '../../../layouts/AdminLayout';
import { getAdminAnalytics } from '../../../services/adminApi';

const COLORS = ['#10b981', '#f43f5e', '#6366f1', '#f59e0b'];

const KpiCard = ({ label, value, color, icon }) => (
  <div className={`rounded-2xl border p-5 shadow-sm ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium opacity-70">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
      </div>
      <div className="opacity-20 text-5xl font-black">{icon}</div>
    </div>
  </div>
);

const formatMonth = (v) =>
  v ? new Intl.DateTimeFormat('vi-VN', { month: 'short', year: '2-digit' }).format(new Date(v)) : '';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    getAdminAnalytics()
      .then((r) => { if (mounted) setData(r); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const overview = data?.overview ?? { activeStudents: 0, totalTeachers: 0, openClasses: 0, pendingSubmissions: 0 };
  const attendanceData = useMemo(() => {
    if (!data?.attendanceRate) return [];
    return [
      { name: 'Có mặt', value: data.attendanceRate.present },
      { name: 'Vắng mặt', value: data.attendanceRate.absent },
    ];
  }, [data]);
  const gradeTrend = data?.gradeTrends ?? [];
  const academic = useMemo(
    () => (data?.academicPerformance ?? []).slice(0, 10),
    [data]
  );

  return (
    <AdminMasterLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-500 mt-1">Tổng quan hoạt động toàn trung tâm.</p>
        </div>

        {/* KPI cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} active />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Học viên đang học"
              value={overview.activeStudents}
              color="border-emerald-100 bg-emerald-50 text-emerald-800"
              icon="S"
            />
            <KpiCard
              label="Giáo viên"
              value={overview.totalTeachers}
              color="border-indigo-100 bg-indigo-50 text-indigo-800"
              icon="T"
            />
            <KpiCard
              label="Lớp đang mở"
              value={overview.openClasses}
              color="border-violet-100 bg-violet-50 text-violet-800"
              icon="C"
            />
            <KpiCard
              label="Bài chờ chấm"
              value={overview.pendingSubmissions}
              color="border-amber-100 bg-amber-50 text-amber-800"
              icon="A"
            />
          </div>
        )}

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Attendance Pie */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Chuyên cần tháng này</h2>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {attendanceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Grade trend Line */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Xu hướng điểm trung bình (6 tháng)</h2>
            {loading ? <Skeleton active /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={gradeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [Number(v).toFixed(2), 'Điểm TB']} labelFormatter={formatMonth} />
                  <Line type="monotone" dataKey="averageGrade" name="Điểm TB" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts row 2 - Academic by course */}
        {academic.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Điểm trung bình theo khóa học</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={academic} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="courseName" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip formatter={(v) => [Number(v).toFixed(2), 'Điểm TB']} />
                  <Bar dataKey="averageGrade" name="Điểm TB" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Tỷ lệ hoàn thành bài tập (%)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={academic} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <YAxis type="category" dataKey="courseName" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Hoàn thành']} />
                  <Bar dataKey="completionRate" name="Hoàn thành" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </AdminMasterLayout>
  );
}
