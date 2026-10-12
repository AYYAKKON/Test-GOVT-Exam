# Central Government Exam Test Platform

A full-stack web application designed for conducting online mock tests and practice examinations for Central Government competitive exams such as **SSC, Banking, Railway, Defence, UPSC, TNPSC**, and other government recruitment tests.

---

## 🌟 Key Features

### 👤 Role-Based Authorization
- **Admin**: Full platform management, user management, category setup, test creation, question PDF processing, inline preview editing, test publishing/unpublishing, and analytics dashboard.
- **User / Student**: Candidate dashboard, test browsing by exam categories, test instructions, interactive examination interface with section-wise timers, automatic evaluation, scorecard, test history, and detailed answer key reviews.

### 📄 PDF-Based Test Creation & Workflow
- Upload question paper PDFs containing multiple sections, section-wise timing headers, questions, options A-D, answers, and explanations.
- Structured extraction automatically parses:
  - Test Title & Category
  - Sections & Section-wise Durations
  - Question Numbers & Question Statements
  - Option Choice Cards (A, B, C, D)
  - Correct Answer Keys & Explanations
- **Extracted Question Preview**: Admin reviews and edits questions, options, section durations, adds or deletes questions *before* publishing.
- **Publish Control**: Tests remain in `Draft` until explicitly published by Admin.

### ⏱️ Section-Wise Timing & Secure Exam Interface
- Real-time countdown timer strictly tracked per section.
- Automatic transition to the next section when time expires.
- **Security**: Correct answers are **never** sent to the client browser while the user is taking the test. The server evaluates student attempts upon submission.
- **Question Palette**: Live color indicators for *Not Visited*, *Visited*, *Answered*, and *Marked for Review*.

### 📊 Scorecard & Analytical History
- Instant score computation (Score, Percentage, Correct, Wrong, Unanswered, Time Taken).
- Section-wise score breakdown table.
- Detailed solution review with explanations.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs password hashing.
- **Database**: MongoDB & Mongoose (with automated fallback to `mongodb-memory-server` if local MongoDB daemon is not running).
- **PDF Processing**: `pdf-parse`, `pdfkit`, custom regex structure parser.

---

## 📁 Directory Structure

```text
Exam Website/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & memory fallback
│   ├── controllers/
│   │   ├── attemptController.js  # Evaluation & results controller
│   │   ├── authController.js     # Login & registration controller
│   │   ├── categoryController.js # Exam category controller
│   │   ├── pdfController.js      # PDF upload & parser controller
│   │   ├── questionController.js # Question management
│   │   ├── testController.js     # Mock test controller
│   │   └── userController.js     # Admin user management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & admin authorization
│   │   ├── errorMiddleware.js    # Express error handler
│   │   └── uploadMiddleware.js   # Multer PDF file upload
│   ├── models/
│   │   ├── Category.js
│   │   ├── Question.js
│   │   ├── Section.js
│   │   ├── Test.js
│   │   ├── TestAttempt.js
│   │   └── User.js
│   ├── routes/
│   │   ├── attemptRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── pdfRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── testRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   └── pdfParserService.js   # PDF question extraction algorithm
│   ├── uploads/                  # Temp storage for PDFs
│   ├── utils/
│   │   ├── generateSamplePdf.js  # Generates test PDF
│   │   └── seedData.js           # Database seeder
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminSettings.jsx
│   │   │   │   ├── AdminTestResults.jsx
│   │   │   │   ├── CreateTest.jsx
│   │   │   │   ├── EditTest.jsx
│   │   │   │   ├── ManageCategories.jsx
│   │   │   │   ├── ManageTests.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   ├── PreviewExtractedQuestions.jsx
│   │   │   │   └── UploadPdfTest.jsx
│   │   │   ├── user/
│   │   │   │   ├── AvailableTests.jsx
│   │   │   │   ├── ReviewAnswersPage.jsx
│   │   │   │   ├── TakeTest.jsx
│   │   │   │   ├── TestHistory.jsx
│   │   │   │   ├── TestInstructions.jsx
│   │   │   │   ├── TestResultPage.jsx
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── attemptService.js
│   │   │   ├── testService.js
│   │   │   └── userService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Quick Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed     # Seeds default admin, student user, categories, and 40-question mock test
npm run dev      # Starts Express backend on http://localhost:5000
```

### 2. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## 🔑 Admin Login Credentials

### 🛡️ Admin Account (Stored in Firebase Firestore)
- **Email**: `admin@examtest.com`
- **Password**: `Pass@123`

### 👤 Student Candidates
Students register their own account on the registration page (`/register`) with their own credentials.

---

## 📜 Sample PDF Format for Question Upload

Admin can upload PDFs formatted as follows:

```text
TEST NAME: SSC CGL MOCK TEST 01
CATEGORY: SSC

SECTION 1: ENGLISH
TIME: 15 MINUTES

Q1. Choose the correct synonym of "Rapid".
A. Slow
B. Fast
C. Weak
D. Small
ANSWER: B
EXPLANATION: Rapid means fast or swift.

Q2. Select the correctly spelt word.
A. Accomodate
B. Accommodate
C. Acomodate
D. Accommoodate
ANSWER: B

SECTION 2: REASONING
TIME: 15 MINUTES

Q1. Find the missing number: 2, 4, 8, 16, ?
A. 24
B. 30
C. 32
D. 64
ANSWER: C
```

---

## 🔌 API Endpoints Summary

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Mock Tests
- `GET /api/tests` (Published tests for students)
- `GET /api/tests/:id/take` (Sanitized test for taking exam without answers)
- `GET /api/tests/admin/all` (Admin view)
- `POST /api/tests`
- `PUT /api/tests/:id`
- `DELETE /api/tests/:id`
- `POST /api/tests/:id/publish`

### PDF Processing
- `POST /api/tests/upload-pdf`
- `POST /api/tests/process-text`
- `POST /api/tests/save-parsed-test`

### Attempt Evaluation
- `POST /api/attempts/submit`
- `GET /api/attempts/history`
- `GET /api/attempts/:id`
- `GET /api/attempts/admin/all`
- `GET /api/attempts/admin/stats`
