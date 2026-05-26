import React, { useState } from 'react';
import { Alert, Button, Form, Input } from 'antd';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/studentApi';

const ROLE_HOME = {
  manager: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

const RoleIcon = ({ role }) => {
  if (role === 'manager') return (
    <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1">
      <div className="h-2 w-2 rounded-full bg-rose-500" />
      <span className="text-xs font-semibold text-rose-700">Quản trị viên</span>
    </div>
  );
  if (role === 'teacher') return (
    <div className="flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1">
      <div className="h-2 w-2 rounded-full bg-indigo-500" />
      <span className="text-xs font-semibold text-indigo-700">Giáo viên</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1">
      <div className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="text-xs font-semibold text-emerald-700">Học viên</span>
    </div>
  );
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [form] = Form.useForm();

  // Already logged in → redirect
  if (user && !loggedInUser) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  }

  const handleLogin = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', values);
      const { user: u, token } = res.data;
      login(u, token);
      setLoggedInUser(u);
      // Brief success state then redirect
      setTimeout(() => {
        navigate(ROLE_HOME[u.role] ?? '/login', { replace: true });
      }, 600);
    } catch (e) {
      setError(e?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="font-black text-white text-base">EC</span>
          </div>
          <span className="text-lg font-bold">EngCenter</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight">
            Hệ thống quản lý<br />Trung tâm Anh ngữ
          </h1>
          <p className="mt-4 text-emerald-100 text-base leading-relaxed">
            Quản lý toàn diện học viên, giáo viên, lịch học và bài tập
            trên một nền tảng thống nhất.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { role: 'manager', label: 'Quản trị viên', desc: 'Báo cáo, người dùng, danh mục, lịch tổng' },
              { role: 'teacher', label: 'Giáo viên', desc: 'Quản lý lớp, điểm danh, chấm bài tập' },
              { role: 'student', label: 'Học viên', desc: 'Theo dõi tiến độ, lịch học, bài tập' },
            ].map((item) => (
              <div key={item.role} className="flex items-start gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <RoleIcon role={item.role} />
                <p className="text-sm text-emerald-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-emerald-300">
          © {new Date().getFullYear()} EngCenter. All rights reserved.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <span className="font-black text-white text-base">EC</span>
            </div>
            <span className="text-lg font-bold text-slate-800">EngCenter</span>
          </div>

          {/* Success state */}
          {loggedInUser ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">Chào mừng, {loggedInUser.full_name}!</p>
                <p className="text-sm text-slate-500 mt-1">Đang chuyển hướng đến trang của bạn...</p>
              </div>
              <RoleIcon role={loggedInUser.role} />
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Nhập thông tin tài khoản được cấp để tiếp tục.
                </p>
              </div>

              {error && (
                <Alert
                  type="error"
                  message={error}
                  className="mb-5"
                  showIcon
                  closable
                  onClose={() => setError('')}
                />
              )}

              <Form form={form} layout="vertical" onFinish={handleLogin} requiredMark={false}>
                <Form.Item
                  name="email"
                  label={<span className="text-sm font-medium text-slate-700">Email</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập email.' },
                    { type: 'email', message: 'Email không hợp lệ.' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="email@example.com"
                    autoComplete="email"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-sm font-medium text-slate-700">Mật khẩu</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu.' }]}
                >
                  <Input.Password
                    size="large"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  className="mt-2 rounded-xl h-11"
                  style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                >
                  Đăng nhập
                </Button>
              </Form>

              <p className="text-center text-xs text-slate-400 mt-8">
                Chưa có tài khoản? Liên hệ quản trị viên để được cấp.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
