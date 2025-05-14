 
import LeaveRequestForm from '../components/Leave/LeaveRequestForm';
import LeaveRequestStatus from '../components/Leave/LeaveRequestStatus';

function LeavePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Leave Management</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <LeaveRequestForm />
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mt-6">
        <LeaveRequestStatus />
      </div>
    </div>
  );
}

export default LeavePage;