# Attendance System

## Overview
The Attendance System is a robust and scalable solution designed to streamline employee attendance management for organizations. It provides a secure, user-friendly interface for employees to mark their attendance and for administrators to monitor and manage attendance records efficiently.

---

## Features

### 1. **User Authentication**
   - Secure login and registration for employees and administrators.
   - Role-based access control to ensure only authorized users can access specific features.
   - Passwords are hashed and stored securely in the database.

### 2. **Attendance Management**
   - Employees can mark their attendance with a single click.
   - Automatic timestamp recording for check-in and check-out.
   - Admins can view, edit, and manage attendance records.

### 3. **Real-Time Notifications**
   - Notify employees about attendance status, reminders, or updates.
   - Admins receive alerts for irregular attendance patterns.

### 4. **Dashboard**
   - Admin dashboard with visual analytics to monitor attendance trends.
   - Employee activity logs for better tracking and reporting.

### 5. **Reporting**
   - Generate detailed attendance reports for specific time periods.
   - Export reports in formats like PDF or Excel for further analysis.

### 6. **Mobile-Friendly Interface**
   - Fully responsive design for seamless use on desktops, tablets, and mobile devices.

### 7. **Data Security**
   - Secure storage of user data with encryption.
   - Role-based access ensures sensitive data is protected.

### 8. **Customizable Working Hours**
   - Admins can define working hours and holidays.
   - System validates attendance entries against predefined rules.

---

## Logic Overview

### 1. **Authentication Logic**
   - **Login**: Validate user credentials against the database.
   - **Registration**: Hash passwords using bcrypt before storing them.
   - **Session Management**: Use JWT (JSON Web Tokens) for secure and stateless session handling.

### 2. **Attendance Marking**
   - Employees mark attendance by clicking a button on the dashboard.
   - System records the timestamp and validates it against working hours.
   - Late arrivals or early departures are flagged for admin review.

### 3. **Admin Controls**
   - Admins can:
     - View all employee attendance records in a tabular format.
     - Edit incorrect entries or add missing attendance records.
     - Generate reports for specific employees or departments.

### 4. **Notification System**
   - Use WebSocket or push notifications to send real-time updates to users.
   - Notifications include reminders for marking attendance and alerts for irregularities.

### 5. **Data Flow**
   - **Frontend**: Sends requests to the backend via REST APIs.
   - **Backend**: Processes requests, interacts with the database, and sends responses.
   - **Database**: Stores user, attendance, and activity data.

---

## How to Use

### 1. **Setup**
   - Clone the repository:
     ```bash
     git clone <repository-url>
     ```
   - Navigate to the project directory:
     ```bash
     cd attendancesystem
     ```

### 2. **Environment Variables**
   - Create a `.env` file in both the  and  directories.
   - Add the following variables:
     - **Server**:
       ```env
       PORT=5000
       MONGO_URI=<your-mongodb-connection-string>
       JWT_SECRET=<your-jwt-secret>
       ```
     - **Client**:
       ```env
       VITE_API_URL=http://localhost:5000
       ```

### 3. **Run the Application**
   - Start the backend server:
     ```bash
     cd server
     npm install
     npm start
     ```
   - Start the frontend client:
     ```bash
     cd client
     npm install
     npm run dev
     ```
   - Open the application in your browser at `http://localhost:5173`.

---

## Tech Stack

### Frontend
- **Framework**: React.js
- **State Management**: Context API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite.js

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Communication**: WebSocket (optional)

---

## Folder Structure

### Client