// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// const LoginPage = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVisible, setIsVisible] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setIsVisible(true);
    
//     // Subtle animation for background elements
//     const interval = setInterval(() => {
//       const elements = document.querySelectorAll('.floating');
//       elements.forEach(el => {
//         const randomX = Math.random() * 10 - 5;
//         const randomY = Math.random() * 10 - 5;
//         el.style.transform = `translate(${randomX}px, ${randomY}px)`;
//       });
//     }, 3000);
    
//     return () => clearInterval(interval);
//   }, []);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/v1/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

      
//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));

//         if (data.user.role === 'admin') {
//           navigate('/admin/dashboard');
//         } else {
//           navigate('/employee/dashboard');
//         }
//       } else {
//         setError(data.message || 'Login failed');
//       }
//     } catch (err) {
//       setError('Error connecting to server');
//       console.error('Login error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//       {/* Premium Decorative Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="floating absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.03] blur-3xl transition-transform duration-7000 ease-in-out"></div>
//         <div className="floating absolute top-[40%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.04] blur-3xl transition-transform duration-7000 ease-in-out"></div>
//         <div className="floating absolute bottom-[15%] left-[25%] w-72 h-72 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.03] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        
//         {/* Grid Pattern Overlay */}
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXYxaC0xdi0xem0yLTJoMXYxaC0xdi0xem0tMiAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
//       </div>
      
//       <div className={`w-full max-w-md transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
//         {/* Logo */}
//         <div className="flex justify-center mb-8">
//           <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] flex items-center justify-center shadow-lg shadow-[#f97316]/20">
//             <span className="text-white text-2xl font-bold">PF</span>
//           </div>
//         </div>
        
//         {/* Card */}
//         <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
//           {/* Card Highlight */}
//           <div className="absolute inset-0 overflow-hidden">
//             <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f97316] opacity-[0.03] rounded-full blur-3xl"></div>
//             <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#f97316] opacity-[0.03] rounded-full blur-3xl"></div>
//           </div>
          
//           <div className="relative px-8 pt-10 pb-8">
//             <div className="text-center mb-8">
//               <h2 className="text-3xl font-bold text-white tracking-tight">
//                 Welcome Back
//               </h2>
//               <p className="mt-2 text-gray-400">Sign in to your account</p>
//             </div>
            
//             <form onSubmit={handleLogin} className="space-y-6">
//               {error && (
//                 <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start">
//                   <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd"></path>
//                   </svg>
//                   <p className="text-sm text-red-200">{error}</p>
//                 </div>
//               )}
              
//               <div className="space-y-1">
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-300">
//                   Email Address
//                 </label>
//                 <div className="mt-1 relative rounded-xl shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                     </svg>
//                   </div>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="bg-white/5 border border-white/10 text-white block w-full pl-10 pr-3 py-3.5 rounded-xl focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none transition-all duration-300"
//                     placeholder="you@example.com"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <div className="flex items-center justify-between">
//                   <label htmlFor="password" className="block text-sm font-medium text-gray-300">
//                     Password
//                   </label>
//                   <div className="text-sm">
//                     <a href="#" className="font-medium text-[#f97316] hover:text-[#fb923c] transition-colors">
//                       Forgot?
//                     </a>
//                   </div>
//                 </div>
//                 <div className="mt-1 relative rounded-xl shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <input
//                     id="password"
//                     name="password"
//                     type="password"
//                     autoComplete="current-password"
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="bg-white/5 border border-white/10 text-white block w-full pl-10 pr-3 py-3.5 rounded-xl focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none transition-all duration-300"
//                     placeholder="••••••••"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 bg-white/5 border-white/10 rounded text-[#f97316] focus:ring-[#f97316] focus:ring-offset-gray-900"
//                 />
//                 <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
//                   Remember me
//                 </label>
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-gradient-to-r from-[#f97316] to-[#fb923c] hover:from-[#ea580c] hover:to-[#f97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f97316] focus:ring-offset-gray-900 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
//                 >
//                   {isLoading ? (
//                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                   ) : null}
//                   {isLoading ? 'Signing in...' : 'Sign in'}
//                 </button>
//               </div>
//             </form>
            
//             <div className="mt-8 flex items-center justify-center">
//               <div className="h-px bg-white/10 w-full"></div>
//               <div className="px-4 text-sm text-gray-400">or</div>
//               <div className="h-px bg-white/10 w-full"></div>
//             </div>
            
//             <div className="mt-6 grid grid-cols-2 gap-3">
//               <button
//                 type="button"
//                 className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all duration-300"
//               >
//                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
//                   <path d="M12 23C14.97 23 17.46 22 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.19 18.63 6.8 16.69 5.95 14.1H2.27V16.94C4.08 20.45 7.76 23 12 23Z" fill="#34A853"/>
//                   <path d="M5.95 14.1C5.75 13.47 5.63 12.79 5.63 12.09C5.63 11.39 5.75 10.71 5.95 10.09V7.25H2.27C1.46 8.68 1 10.35 1 12.09C1 13.83 1.46 15.5 2.27 16.94L5.95 14.1Z" fill="#FBBC05"/>
//                   <path d="M12 5.55C13.57 5.55 14.97 6.08 16.08 7.14L19.22 4C17.46 2.4 14.97 1.4 12 1.4C7.76 1.4 4.08 3.95 2.27 7.45L5.95 10.29C6.8 7.7 9.19 5.55 12 5.55Z" fill="#EA4335"/>
//                 </svg>
//                 Google
//               </button>
//               <button
//                 type="button"
//                 className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all duration-300"
//               >
//                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M13.397 20.997V12.801H16.162L16.573 9.592H13.397V7.548C13.397 6.622 13.655 5.989 14.984 5.989H16.668V3.127C15.8487 3.03961 15.0251 2.99856 14.201 3.001C11.757 3.001 10.079 4.492 10.079 7.231V9.586H7.332V12.795H10.085V20.997H13.397Z" />
//                 </svg>
//                 Facebook
//               </button>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-400">
//             Don't have an account?{' '}
//             <Link to="/register" className="font-medium text-[#f97316] hover:text-[#fb923c] transition-colors">
//               Create account
//             </Link>
//           </p>
//         </div>
        
//         <div className="mt-8 text-center">
//           <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
//             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
//             </svg>
//             Back to home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


/* ---------------------------------------------------------------------------- */
 
 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // यदि आप AuthContext का उपयोग कर रहे हैं
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function LeaveRequestForm() {
  const [leaveType, setLeaveType] = useState('full'); // 'full', 'half', 'short'
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const { token, user } = useAuth(); // यदि आप AuthContext का उपयोग कर रहे हैं
  const navigate = useNavigate();

  useEffect(() => {
    // यदि उपयोगकर्ता लॉग इन नहीं है, तो लॉगिन पृष्ठ पर रीडायरेक्ट करें
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        '/api/v1/leaves', // Backend API एंडपॉइंट (आपको इसे परिभाषित करना होगा)
        {
          leaveType,
          startDate,
          endDate,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // यदि आप AuthContext का उपयोग कर रहे हैं
          },
        }
      );

      console.log('Leave request submitted:', response.data);
      // सफलता संदेश दिखाएँ और फ़ॉर्म रीसेट करें
      setLeaveType('full');
      setStartDate(dayjs().format('YYYY-MM-DD'));
      setEndDate(dayjs().format('YYYY-MM-DD'));
      setReason('');
      setError(null);
      alert('Leave request submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit leave request.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 md:p-10 max-w-lg w-full transition-all hover:shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-blue-600">Leave Application</h2>
          <p className="text-gray-600 mt-2">Fill your leave details carefully</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14h4v4h-4zm0-8h4v4h-4z" />
            </svg>
            <span className="text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Leave Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['full', 'half', 'short'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLeaveType(type)}
                  className={`p-3 rounded-lg border transition-all ${leaveType === type 
                    ? 'border-blue-500 bg-blue-100 shadow-inner' 
                    : 'border-gray-300 hover:border-blue-300'}`}
                >
                  <span className={`font-medium ${leaveType === type ? 'text-blue-600' : 'text-gray-600'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all min-h-[140px]"
              placeholder="Briefly describe your reason..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Submit Application
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default LeaveRequestForm;



