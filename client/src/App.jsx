import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import OutdoorDutyPage from './pages/OutdoorDutyPage';
import OutdoorDutyApprovalPage from './pages/OutdoorDutyApprovalPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DirectResetPage from './pages/DirectResetPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/direct-reset" element={<DirectResetPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/outdoor-duty" element={<OutdoorDutyPage />} />
        <Route path="/admin/outdoor-duty-approval" element={<div className="p-8 text-center">
          <h2 className="text-xl mb-4">Outdoor Duty Approval</h2>
          <p className="mb-4">This page is currently under maintenance.</p>
          <a href="/admin/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Return to Dashboard
          </a>
        </div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;