# College Complaint Management System

A full-stack MERN application for managing college complaints with role-based access control.

## 🚀 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Session-based authentication (HTTP-only signed cookies)
- bcrypt for password hashing
- Multer for file uploads

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- @react-oauth/google for OAuth
- Axios with credentials

## 📁 Project Structure

```
VoiceBox/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── complaintController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # Session validation
│   │   ├── roleMiddleware.js  # Role-based access
│   │   └── uploadMiddleware.js# File upload handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── adminRoutes.js
│   ├── uploads/               # File storage
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js       # Axios instance
    │   ├── components/
    │   │   ├── common/        # Navbar, Sidebar, Button, Modal
    │   │   ├── auth/          # ProtectedRoute, GoogleLoginButton
    │   │   └── complaint/     # ComplaintCard, ComplaintForm, FeedbackForm
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── AlertContext.jsx
    │   │   └── ComplaintContext.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   └── useComplaints.js
    │   ├── pages/
    │   │   ├── auth/          # Login, Register
    │   │   ├── student/       # Dashboard, SubmitComplaint, MyComplaints
    │   │   ├── admin/         # AdminDashboard
    │   │   └── coordinator/   # CoordinatorDashboard
    │   ├── utils/
    │   │   └── constants.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | Submit complaints, view own complaints, give feedback |
| **Faculty** | Same as student |
| **Coordinator** | View department complaints, update status (ASSIGNED → IN_PROGRESS → RESOLVED) |
| **Admin** | View all complaints, assign department, promote faculty, close complaints |

## 🔄 Complaint Lifecycle

```
NEW → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running on localhost:27017

### Backend Setup
```bash
cd backend
npm install
# Configure .env file
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Configure .env file
npm run dev
```

### Environment Variables

**Backend (.env)**
```
MONGO_URI=mongodb://localhost:27017/complaint_management
COOKIE_SECRET=your_secret_key
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📝 Categories

- Academic
- Infrastructure
- Hostel
- Library
- IT/Portal

## 🏢 Departments

- CE (Computer Engineering)
- IT (Information Technology)
- EC (Electronics & Communication)

## 📎 File Upload

- Maximum 3 files per complaint
- Maximum 5MB per file
- Supported: Images, PDF, DOC, TXT

## ⭐ Feedback System

- Available after complaint is RESOLVED
- Rating: 1-10
- Text comment required
- Admin can close complaint after feedback
