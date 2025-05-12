import React from 'react';
import { Link } from 'react-router-dom'; // Import Link

function HomePage() {
  return (
    <div>
      <h1>Attendance System</h1>
      <p>Welcome to the attendance management system.</p>
      <div>
        <Link to="/login">Log In</Link> | <Link to="/signup">Sign Up</Link>
      </div>
      {/* You can add more content or links as needed */}
    </div>
  );
}

export default HomePage;