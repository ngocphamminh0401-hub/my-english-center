import React, { useState } from 'react';
import { Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/teacher/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'schedule',
    label: 'Thời khóa biểu',
    path: '/teacher/schedule',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'classes',
    label: 'Quản lý lớp',
    path: '/teacher/classes',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const menuItems = [
  { key: 'logout', label: 'Đăng xuất' },
];

const BellIcon = () => (
  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
  </svg>
);

export default function TeacherLayout({ children, teacherName }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
  };

  const displayName = teacherName || user?.full_name || 'Giáo viên';

  const isActive = (path) =>
    path === '/teacher/classes'
      ? location.pathname.startsWith('/teacher/classes')
      : location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">TC</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">Teacher Portal</span>
            </div>
          )}
          {collapsed && (
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
              <span className="text-xs font-bold text-white">TC</span>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="absolute left-12 top-5 hidden sm:flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
              style={{ marginLeft: 2 }}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 mt-4 flex flex-col gap-1 px-2">
          {navigation.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className={active ? 'text-indigo-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="p-2">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div />
          <div className="flex items-center gap-4">
            <button type="button" className="relative p-1">
              <BellIcon />
            </button>
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar size={32} style={{ backgroundColor: '#4338ca' }}>
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {displayName}
                </span>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
