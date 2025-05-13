// App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AttendancePage from './pages/AttendancePage';
import LeavePage from './pages/LeavePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import './App.css';

function App() {
    return (
        <div className="app">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

                {/* Disable ProtectedRoute */}
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/leave" element={<LeavePage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            </Routes>
        </div>
    );
}

export default App;