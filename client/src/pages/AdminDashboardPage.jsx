import React from 'react';
import UserManagement from '../components/Admin/UserManagement';
import LeaveApproval from '../components/Admin/LeaveApproval';

function AdminDashboardPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UserManagement />
      <LeaveApproval />
    </div>
  );
}

export default AdminDashboardPage;