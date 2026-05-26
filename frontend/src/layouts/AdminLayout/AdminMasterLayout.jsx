import React, { useEffect, useState } from 'react';
import { Avatar, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
  { key: 'users', label: 'Quản lý người dùng', path: '/admin/users' },
  { key: 'catalog', label: 'Quản lý danh mục', path: '/admin/catalog' },
  { key: 'schedule', label: 'Thời khóa biểu tổng', path: '/admin/master-schedule' },
  { key: 'broadcast', label: 'Phát sóng thông báo', path: '/admin/broadcast' },
];

const menuItems = [
  { key: 'password', label: 'Đổi mật khẩu' },
  { key: 'logout', label: 'Đăng xuất' },
];

const BellIcon = () => (
  <svg
    className="h-5 w-5 text-slate-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0"
    />
  </svg>
);

export default function AdminMasterLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/login'); }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNotificationCount((prev) => (prev % 4) + 1);
    }, 12000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`bg-white border-r border-slate-200 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4">
          <span className="text-lg font-semibold text-slate-800">
            {collapsed ? 'AC' : 'Admin Center'}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="text-slate-500 hover:text-slate-700"
            aria-label="Toggle sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M4 6h16M4 12h10M4 18h16"
              />
            </svg>
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {navigation.map((item) => {
            const active = location.pathname === item.path ||
              (item.key !== 'dashboard' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-rose-50 text-rose-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${active ? 'bg-rose-500' : 'bg-rose-300'}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold text-slate-800">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="relative">
              <BellIcon />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                  {notificationCount}
                </span>
              )}
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            </button>

            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar size={32} style={{ backgroundColor: '#e11d48' }}>
                  {user?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-slate-700">
                  {user?.full_name ?? 'Admin'}
                </span>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
