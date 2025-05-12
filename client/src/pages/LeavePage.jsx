import React from 'react';
import LeaveRequestForm from '../components/Leave/LeaveRequestForm';
import LeaveRequestStatus from '../components/Leave/LeaveRequestStatus';

function LeavePage() {
  return (
    <div>
      <h1>Leave Management</h1>
      <LeaveRequestForm />
      <LeaveRequestStatus />
    </div>
  );
}

export default LeavePage;