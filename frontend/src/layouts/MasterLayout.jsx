import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  {
    key: 'dashboard',
    path: '/student/dashboard',
    label: 'Tổng quan',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'courses',
    path: '/student/courses',
    label: 'Khóa học của tôi',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    key: 'schedule',
    path: '/student/schedule',
    label: 'Thời khóa biểu',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'assignments',
    path: '/student/assignments',
    label: 'Bài tập',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

const FireIcon = () => (
  <svg className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
  </svg>
);

export default function MasterLayout({ children, studentName, streak }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const id = setInterval(() => setNotifCount((p) => (p % 5) + 1), 15000);
    return () => clearInterval(id);
  }, []);

  const initials = studentName
    ? studentName.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase()
    : 'ST';

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
  };

  const menuItems = [
    { key: 'logout', label: 'Đăng xuất' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">EC</span>
              </div>
              <span className="text-sm font-bold text-slate-800">EngCenter</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="text-slate-400 hover:text-slate-700 ml-auto"
            aria-label="Toggle sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 mt-3 flex flex-col gap-0.5 px-2">
          {navigation.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Streak badge */}
        {!collapsed && streak > 0 && (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 border border-orange-100">
            <FireIcon />
            <span className="text-sm font-semibold text-orange-600">{streak} ngày streak</span>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-5">
          <span className="text-sm font-semibold text-slate-700">Student Portal</span>

          <div className="flex items-center gap-4">
            {streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 border border-orange-200">
                <FireIcon />
                <span className="text-xs font-semibold text-orange-600">{streak} ngày streak</span>
              </div>
            )}

            <button type="button" className="relative text-slate-500 hover:text-slate-700">
              <BellIcon />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {notifCount}
                </span>
              )}
            </button>

            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar size={32} style={{ backgroundColor: '#059669', fontSize: 13 }}>
                  {initials}
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {studentName || 'Học viên'}
                </span>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
