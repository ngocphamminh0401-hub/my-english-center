import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  manager: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  }

  return children;
}
