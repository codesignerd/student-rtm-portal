import { Navigate, Route, Routes } from 'react-router';

import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { StudentLayout } from '../layouts/StudentLayout';

import { AdminCoursesPage } from '../pages/admin/AdminCoursesPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminResultsPage } from '../pages/admin/AdminResultsPage';
import { AdminSemestersPage } from '../pages/admin/AdminSemestersPage';
import { AdminSessionsPage } from '../pages/admin/AdminSessionsPage';
import { AdminStudentsPage } from '../pages/admin/AdminStudentsPage';
import { AdminTranscriptsPage } from '../pages/admin/AdminTranscriptsPage';

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

      {/* Student Portal Subroutes */}
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

      {/* Administrator Portal Subroutes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="sessions" element={<AdminSessionsPage />} />
        <Route path="semesters" element={<AdminSemestersPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="results" element={<AdminResultsPage />} />
        <Route path="transcripts" element={<AdminTranscriptsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
