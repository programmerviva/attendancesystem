import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SERVER_URL = 'http://localhost:5000';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    }
    
    // Subtle animation for background elements
    const interval = setInterval(() => {
      const elements = document.querySelectorAll('.floating');
      elements.forEach(el => {
        const randomX = Math.random() * 10 - 5;
        const randomY = Math.random() * 10 - 5;
        el.style.transform = `translate(${randomX}px, ${randomY}px)`;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${SERVER_URL}/api/v1/auth/login`, {
        email,
        password
      });

      const data = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Store user data in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Handle admin login
        if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        setError('Invalid user data received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.03] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        <div className="floating absolute top-[40%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.04] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        <div className="floating absolute bottom-[15%] left-[25%] w-72 h-72 rounded-full bg-gradient-to-r from-[#f97316] to-[#fb923c] opacity-[0.03] blur-3xl transition-transform duration-7000 ease-in-out"></div>
        
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
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-400">Sign in to your account</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-start">
                  <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd"></path>
                  </svg>
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white block w-full pl-10 pr-3 py-3.5 rounded-xl focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none transition-all duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#f97316] hover:text-[#fb923c] transition-colors">
                      Forgot?
                    </a>
                  </div>
                </div>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border border-white/10 text-white block w-full pl-10 pr-3 py-3.5 rounded-xl focus:ring-2 focus:ring-[#f97316] focus:border-transparent outline-none transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-white/5 border-white/10 rounded text-[#f97316] focus:ring-[#f97316] focus:ring-offset-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

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
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#f97316] hover:text-[#fb923c] transition-colors">
              Create account
            </Link>
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;