import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function HomePage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#f97316] opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-80 h-80 bg-[#f97316] opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-[#f97316] opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXYxaC0xdi0xem0yLTJoMXYxaC0xdi0xem0tMiAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>
        
        <div className="relative w-full max-w-7xl mx-auto px-4 py-16 md:px-6 md:py-24 lg:py-32">
          <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-extrabold text-white mb-6 tracking-tighter leading-tight">
              Welcome to <span className="text-[#f97316] inline-block relative">
                PeckForce
                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#f97316] rounded-full opacity-70"></span>
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl lg:text-3xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
              Streamline your workforce, automate attendance, and empower your team with the future of intelligent HR management.
            </p>
            
            <div className="flex justify-center">
              <Link
                to="/login"
                className="group relative bg-gradient-to-r from-[#f97316] to-[#fb923c] text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#ea580c] to-[#f97316] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full bg-transparent py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <p className="text-gray-500 text-sm md:text-base">
              © {new Date().getFullYear()} PeckForce. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
