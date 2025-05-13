import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] flex items-center justify-center px-6 py-12 font-sans">
      <div className="bg-white shadow-2xl rounded-3xl p-10 md:p-16 max-w-4xl w-full text-center animate-fade-in-up">
        
        {/* Animated Welcome Text */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#0f172a] mb-6">
          Welcome to <span className="text-[#f97316]">PeckForce</span> 👋
        </h1>
        <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
          Streamline your workforce, automate attendance, and empower your team with the future of intelligent HR management.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link
            to="/login"
            className="bg-[#f97316] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#ea580c] transition-all shadow-md"
          >
            Get Started
          </Link>
          {/* <Link
            to="/signup"
            className="text-[#f97316] text-lg font-medium hover:underline"
          >
            Create Account
          </Link> */}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
