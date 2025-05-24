# 🕒 Attendance System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange)

> A secure, scalable, and intuitive attendance management system built with **React, Node.js, Express, and MongoDB**.

---

## 📚 Table of Contents

- [🕒 Attendance System](#-attendance-system)
  - [📚 Table of Contents](#-table-of-contents)
  - [📸 Screenshots](#-screenshots)
    - [🖥️ Admin Dashboard](#️-admin-dashboard)
    - [📱 Mobile View](#-mobile-view)
    - [📈 Attendance Report](#-attendance-report)
  - [✨ Features](#-features)
  - [🧠 System Architecture](#-system-architecture)
  - [⚙️ Technologies Used](#️-technologies-used)
    - [🖥️ Frontend](#️-frontend)
    - [⚙️ Backend](#️-backend)
    - [🧪 Dev Tools](#-dev-tools)
  - [📁 Folder Structure](#-folder-structure)
    - [`client/`](#client)
    - [`server/`](#server)
  - [🚀 Getting Started](#-getting-started)
    - [1. Clone Repository](#1-clone-repository)
    - [2. Add Environment Variables](#2-add-environment-variables)
      - [Backend `.env`](#backend-env)
      - [Frontend `.env`](#frontend-env)
    - [3. Install \& Run](#3-install--run)
      - [Backend](#backend)
      - [Frontend](#frontend)
  - [🔐 Authentication \& Authorization](#-authentication--authorization)
  - [📊 Attendance Logic](#-attendance-logic)
  - [🔔 Notification System](#-notification-system)
  - [🛡️ Data Security](#️-data-security)
  - [📌 Future Enhancements](#-future-enhancements)
  - [📞 Contact](#-contact)
    - [❤️ Developed with passion by Vikas Vaibhav](#️-developed-with-passion-by-vikas-vaibhav)

---

## 📸 Screenshots

> *Note: Replace the image paths with actual screenshots from your project.*

### 🖥️ Admin Dashboard

![Admin Dashboard](./assets/admin_dashboard.png)

### 📱 Mobile View

![Mobile Interface](./assets/mobile_view.png)

### 📈 Attendance Report

![Attendance Report](./assets/attendance_report.png)

---

## ✨ Features

* 🔐 **Secure Authentication**: JWT, bcrypt, role-based access.
* 📅 **Easy Attendance Marking**: One-click check-in/check-out.
* 🧮 **Reports & Analytics**: Generate PDFs/Excels with filters.
* 📲 **Real-Time Alerts**: Push reminders & alerts for admins/employees.
* 📱 **Mobile-Responsive**: Works smoothly across devices.
* 🛠️ **Custom Rules**: Define shifts, holidays, and validate entries.
* 📂 **Admin Panel**: View/edit/manage records centrally.

---

## 🧠 System Architecture

```plaintext
Client (React)
   ↓
REST API (Express.js)
   ↓
MongoDB (Data Storage)
   ↑
JWT Auth + Role Check
```

![Architecture](./assets/system_architecture.png)

---

## ⚙️ Technologies Used

### 🖥️ Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Vite
* Axios
* Chart.js
* FullCalendar
* Face-api.js
* QRCode
* React Toastify

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB (via Mongoose)
* JWT & bcryptjs
* Socket.io
* Multer
* Nodemailer
* PDFKit
* XLSX
* Twilio
* GeoIP-lite
* Helmet
* Validator

### 🧪 Dev Tools

* Nodemon
* Prettier
* ESLint
* Vite

---

## 📁 Folder Structure

### `client/`

```
client/
├── src/
│   ├── components/     # Reusable UI Components
│   ├── pages/          # Route-based views
│   ├── context/        # Global state
│   ├── hooks/          # Custom logic
│   ├── assets/         # Images, icons
│   └── config.js       # API endpoints
```

### `server/`

```
server/
├── controllers/        # Route logic
├── models/             # DB Schemas
├── routes/             # API Endpoints
├── utils/              # Helpers
├── server.js           # Entry file
└── .env                # Environment configs
```

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone <repo-url>
cd attendancesystem
```

### 2. Add Environment Variables

#### Backend `.env`

```env
PORT=5000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
```

#### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

### 3. Install & Run

#### Backend

```bash
cd server
npm install
npm start
```

#### Frontend

```bash
cd client
npm install
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication & Authorization

* Users log in with email & password.
* Passwords hashed via **bcryptjs**.
* JWT Tokens issued with role payload (employee/admin).
* Routes are protected based on roles.

---

## 📊 Attendance Logic

1. **Check-in/Check-out** buttons → send timestamp to server.
2. System compares time with office hours.
3. Late/Early departures are flagged.
4. Admin can manually adjust entries.

---

## 🔔 Notification System

* Uses **Socket.io** for:

  * Missed check-ins
  * Shift updates
  * Irregular patterns
* Employees get real-time alerts.

---

## 🛡️ Data Security

* Passwords → bcryptjs
* Tokens → JWT
* Roles & Permissions → Admin/Employee split
* MongoDB secured via .env secrets

---

## 📌 Future Enhancements

* 🔒 Biometric Attendance (Fingerprint / Face ID)
* 🕘 Shift Scheduling (Night, Rotational)
* 🌐 Multi-language UI
* 📝 Leave Requests & Approvals
* 📍 Geolocation Check-in & check-out

---

## 📞 Contact

For any questions, suggestions, or contributions:

**📧 Email**: [sd.vikasvaibhav@company.com](mailto:sd.vikasvaibhav@company.com)

---

### ❤️ Developed with passion by Vikas Vaibhav

> “Streamlining attendance tracking for a smarter workspace.”

---