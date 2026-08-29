import { Navigate, Route, Routes } from 'react-router';

import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { StudentLayout } from '../layouts/StudentLayout';
import { AdminPlaceholderPage } from '../pages/admin/AdminPlaceholderPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';
import { StudentResultsPage } from '../pages/student/StudentResultsPage';
import { StudentTranscriptPage } from '../pages/student/StudentTranscriptPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="results" element={<StudentResultsPage />} />
        <Route path="transcript" element={<StudentTranscriptPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminPlaceholderPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
