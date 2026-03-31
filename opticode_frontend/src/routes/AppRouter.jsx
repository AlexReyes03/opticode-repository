import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import AuthLayout from '../components/auth/AuthLayout';
import AppLayout from '../components/layout/AppLayout';

/* Auth views */
import Login from '../features/auth/views/Login';
import Register from '../features/auth/views/Register';
import ForgotPassword from '../features/auth/views/ForgotPassword';
import ResetPassword from '../features/auth/views/ResetPassword';

/* Client views */
import UserDashboard from '../features/clients/views/UserDashboard';
import FileUpload from '../features/clients/views/FileUpload';
import ProjectDashboard from '../features/clients/views/ProjectDashboard';
import FileReport from '../features/clients/views/FileReport';
import ErrorDetail from '../features/clients/views/ErrorDetail';
import UserProfile from '../features/clients/views/UserProfile';

/* Admin views */
import AdminDashboard from '../features/admin/views/AdminDashboard';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — Auth layout (split brand + form) */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          {/* Centered card layout for password recovery */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Private routes — cliente (dashboard, proyectos) */}
        <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/projects/:projectId" element={<ProjectDashboard />} />
            <Route path="/projects/:projectId/upload" element={<FileUpload />} />
            <Route path="/projects/:projectId/files/:fileId" element={<FileReport />} />
            <Route path="/projects/:projectId/files/:fileId/errors" element={<ErrorDetail />} />
          </Route>
        </Route>

        {/* Private routes — solo admin */}
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
