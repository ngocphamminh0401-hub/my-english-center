import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import LoginPage from './pages/Login/LoginPage';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard';
import { MasterSchedule, SystemBroadcast } from './pages/admin/MasterOps';
import UserManagement from './pages/admin/Users/UserManagement';
import CatalogManagement from './pages/admin/Catalog/CatalogManagement';

// Student pages
import StudentDashboard from './pages/student/Dashboard/StudentDashboard';
import AssignmentSpace from './pages/student/Assignments/AssignmentSpace';
import MyCourses from './pages/student/MyCourses/MyCourses';
import StudentSchedule from './pages/student/Schedule/StudentSchedule';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard/TeacherDashboard';
import ScheduleManager from './pages/teacher/Schedule/ScheduleManager';
import TeacherClasses from './pages/teacher/Classroom/TeacherClasses';
import ClassDetail from './pages/teacher/Classroom/ClassDetail';
import AssignmentManager from './pages/teacher/AcademicTools/AssignmentManager';
import GradingWorkspace from './pages/teacher/AcademicTools/GradingWorkspace';

const ROLE_HOME = {
  manager: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root → smart redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* ─── Student Portal ─── */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/student/courses" element={
          <ProtectedRoute role="student"><MyCourses /></ProtectedRoute>
        } />
        <Route path="/student/schedule" element={
          <ProtectedRoute role="student"><StudentSchedule /></ProtectedRoute>
        } />
        <Route path="/student/assignments" element={
          <ProtectedRoute role="student"><AssignmentSpace /></ProtectedRoute>
        } />

        {/* ─── Teacher Portal ─── */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/teacher/schedule" element={
          <ProtectedRoute role="teacher"><ScheduleManager /></ProtectedRoute>
        } />
        <Route path="/teacher/classes" element={
          <ProtectedRoute role="teacher"><TeacherClasses /></ProtectedRoute>
        } />
        <Route path="/teacher/classes/:class_id" element={
          <ProtectedRoute role="teacher"><ClassDetail /></ProtectedRoute>
        } />
        <Route path="/teacher/classes/:class_id/assignments" element={
          <ProtectedRoute role="teacher"><AssignmentManager /></ProtectedRoute>
        } />
        <Route path="/teacher/assignments/:assignment_id/grading" element={
          <ProtectedRoute role="teacher"><GradingWorkspace /></ProtectedRoute>
        } />

        {/* ─── Admin Portal ─── */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="manager"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute role="manager"><UserManagement /></ProtectedRoute>
        } />
        <Route path="/admin/catalog" element={
          <ProtectedRoute role="manager"><CatalogManagement /></ProtectedRoute>
        } />
        <Route path="/admin/master-schedule" element={
          <ProtectedRoute role="manager"><MasterSchedule /></ProtectedRoute>
        } />
        <Route path="/admin/broadcast" element={
          <ProtectedRoute role="manager"><SystemBroadcast /></ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
