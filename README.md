# 🏥 MediCare Pro HMS — Hospital Management System

A modern, full-stack **Hospital Management System** built with React + Node.js + MongoDB. Features a beautiful UI with dark/light mode, prescription uploads, real-time notifications, and much more.

![MediCare HMS](https://img.shields.io/badge/Stack-MERN-38bda8?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-6c5ce7?style=flat-square)
![Status](https://img.shields.io/badge/Status-Live-27ae60?style=flat-square)

---

## ✨ Features

- 🌙 **Dark / Light Mode** — Midnight indigo dark theme + clean white light theme, persists in localStorage
- 🔔 **Smart Notifications** — Bell icon shows today's scheduled appointments in real-time
- 📊 **Interactive Dashboard** — Animated counters, donut charts, weekly bar chart, quick actions
- 👥 **Patient Management** — Avatar initials with deterministic colors, blood group color-coded badges
- 🩺 **Doctor Management** — Specialization list, experience tracking, availability toggle
- 📅 **Appointments** — Status filter tabs (Scheduled / Completed / Cancelled), booking system
- 💊 **Prescriptions** — Write digital prescriptions + **upload existing ones** (drag & drop image/PDF)
- 📎 **Prescription Uploads** — Doctor review workflow: Pending → Contacted → Resolved + doctor reply
- 🔐 **Authentication** — JWT-based login/register with animated feature panel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Custom CSS (dark/light mode via CSS variables) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer (images + PDFs up to 10MB) |
| Icons | React Icons (Feather set) |
| Toasts | React Hot Toast |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/MdFirdous0123/Hospital-management-System.git
cd Hospital-management-System
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your_secret_key_here
PORT=5000
```

Start the backend:
```bash
npm start
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 📁 Project Structure

```
Hospital-management-System/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Sidebar, Header, Layout, ProtectedRoute
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # Dashboard, Patients, Doctors, Appointments, Prescriptions
│   │   ├── services/        # Axios API instance
│   │   └── index.css        # Global styles + dark/light theme variables
│   └── vite.config.js
├── server/                  # Express backend
│   ├── models/              # Mongoose models (User, Patient, Doctor, Appointment, Prescription)
│   ├── routes/              # REST API routes
│   ├── middleware/          # JWT auth middleware
│   ├── uploads/             # Uploaded prescription files
│   └── server.js
└── README.md
```

---

## 🎨 What Makes This Different

| Feature | Typical HMS | MediCare Pro |
|---------|------------|--------------|
| Theme | White only | Dark (midnight indigo) + Light |
| Stat Cards | Plain boxes | Gradient top-stripe, animated counts |
| Patients | Plain list | Avatar initials + blood group color badges |
| Prescriptions | Write only | Write + Upload (drag & drop) with doctor review |
| Dashboard | Basic stats | Weekly bar chart + donut charts + quick actions |
| Notifications | None | Live bell with today's appointment count |
| Auth Page | Plain form | Animated feature panel + floating blobs |

---

## 👤 Author

**Md Firdous** — [GitHub](https://github.com/MdFirdous0123)
