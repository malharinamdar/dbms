# 🎓 Student Result Management System (SRMS)

A comprehensive web-based Student Result Management System built as part of DBMS coursework for Semester 5, ENTC Department, PICT, Pune.

## 📌 Project Overview

The Student Result Management System is a full-stack web application designed to digitize and streamline the process of managing student examination results. The system provides role-based access control with separate interfaces for Students, Teachers, and Administrators.

### 🎯 Key Features

- **Multi-Role Authentication System**
  - Student Portal
  - Teacher Portal
  - Admin Portal

- **Student Features**
  - View personal profile and academic details
  - Access semester-wise examination results
  - View subject information and credits
  - Track performance with average marks and CGPA
  - Real-time result updates

- **Teacher Features**
  - Upload student results (Internal & External marks)
  - View assigned subjects and divisions
  - Bulk result upload capability
  - Grade calculation automation

- **Admin Features**
  - Complete user management (Students, Teachers)
  - Subject and division management
  - Teacher-subject assignment
  - System-wide analytics and statistics
  - Result verification and approval

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI Library
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcrypt.js** - Password hashing

## 📁 Project Structure
```plaintext
STUDENT_RESULT_SYSTEM/
│
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── resultController.js  # Result management
│   │   ├── teacherController.js # Teacher operations
│   │   └── adminController.js   # Admin operations
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   └── index.js             # API route definitions
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server setup
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/                  # Reusable UI components
    │   │   └── ...                  # Other shared components
    │   ├── context/
    │   │   └── AuthContext.jsx      # Authentication context
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── StudentDashboard.jsx
    │   │   ├── TeacherDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   └── api.js               # API service layer
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🗄️ Database Schema

### Core Tables

1. **users** - Store user credentials and basic info
2. **students** - Student-specific information
3. **subjects** - Subject details (code, name, credits, semester)
4. **divisions** - Class divisions
5. **results** - Examination results (internal, external, total marks)
6. **teacher_subjects** - Teacher-subject-division assignments

### Key Relationships
- Users → Students (1:1)
- Students → Results (1:N)
- Subjects → Results (1:N)
- Teachers → Subjects (N:M through teacher_subjects)

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone https://github.com/malharinamdar/dbms.git
cd dbms
```
