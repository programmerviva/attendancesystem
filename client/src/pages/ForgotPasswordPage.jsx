import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState('employee'); // 'employee' or 'admin'
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      let payload = {};
      if (mode === 'admin') {
        payload.email = email;
      } else {
        payload.userId = userId;
      }
      // Check if user exists (verify only, no email send)
      const res = await axios.post(`${apiUrl}/api/v1/auth/checkEmail`, payload);
      if (res.data && res.data.exists) {
        // Save email/userId in sessionStorage and redirect to direct reset page
        if (mode === 'admin') {
          sessionStorage.setItem('resetEmail', email);
        } else {
          // For employee, get email by userId (API should support this, else use userId directly)
          // For now, assume userId is email for direct reset
          sessionStorage.setItem('resetEmail', userId);
        }
        navigate('/direct-reset');
        return;
      } else {
        setError('No user found with this credential.');
      }
    } catch {
      setError('No user found with this credential.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-96 h-96 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.03] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        <div className="absolute top-[40%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.04] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        <div className="absolute bottom-[15%] left-[25%] w-72 h-72 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.03] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXYxaC0xdi0xem0yLTJoMXYxaC0xdi0xem0tMiAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>
      
      <div className={`w-full max-w-md transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] flex items-center justify-center shadow-lg shadow-[#f97316]/20">
            <span className="text-white text-2xl font-bold">PF</span>
          </div>
        </div>
        
        {/* Card */}
        <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          {/* Card Highlight */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f97316] opacity-[0.03] rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f97316] opacity-[0.03] rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Reset Password
              </h2>
              <p className="mt-2 text-gray-400">Enter your email to verify your account</p>
            </div>
            
            {message && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-green-200">{message}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            <div className="flex justify-center mb-4">
              <button type="button" onClick={() => setMode('employee')} className={`px-4 py-2 rounded-l-xl ${mode==='employee' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Employee</button>
              <button type="button" onClick={() => setMode('admin')} className={`px-4 py-2 rounded-r-xl ${mode==='admin' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Admin</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'admin' ? (
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">Admin Email</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white block w-full pl-3 pr-3 py-3.5 rounded-xl focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none transition-all duration-300"
                      placeholder="admin@example.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-300">Employee User ID</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <input
                      id="userId"
                      name="userId"
                      type="text"
                      required
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      className="bg-white/5 border border-white/10 text-white block w-full pl-3 pr-3 py-3.5 rounded-xl focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none transition-all duration-300"
                      placeholder="PFuser123"
                    />
                  </div>
                </div>
              )}

              {mode === 'employee' && (
                <div className="text-xs text-orange-200 mb-2">Note: If you do not receive an email, please contact admin to update your email address in the system.</div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] hover:from-[#ea580c] hover:to-[#f97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] focus:ring-offset-gray-900 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;