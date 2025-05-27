import React, { useState, useEffect } from 'react';
import OutdoorDutyApproval from '../components/Admin/OutdoorDutyApproval';

function OutdoorDutyApprovalPage() {
  // Force component to render even if there's an error in child components
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Add error boundary
    const handleError = (event) => {
      console.error("Error in OutdoorDutyApprovalPage:", event.error || event.message);
      setErrorMessage(event.error?.message || event.message || 'An unknown error occurred');
      setHasError(true);
      // Prevent the white screen
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl text-red-600 mb-4">Something went wrong</h2>
        <p className="mb-4 text-gray-700">{errorMessage}</p>
        <button 
          onClick={() => window.location.href = '/admin/dashboard'} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <OutdoorDutyApproval />
    </div>
  );
}

export default OutdoorDutyApprovalPage;