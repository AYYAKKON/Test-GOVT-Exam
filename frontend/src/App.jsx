import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import AvailableTests from './pages/user/AvailableTests';
import TestInstructions from './pages/user/TestInstructions';
import TakeTest from './pages/user/TakeTest';
import TestResultPage from './pages/user/TestResultPage';
import TestHistory from './pages/user/TestHistory';
import ReviewAnswersPage from './pages/user/ReviewAnswersPage';
import UserProfile from './pages/user/UserProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import CreateTest from './pages/admin/CreateTest';
import UploadPdfTest from './pages/admin/UploadPdfTest';
import PreviewExtractedQuestions from './pages/admin/PreviewExtractedQuestions';
import ManageTests from './pages/admin/ManageTests';
import EditTest from './pages/admin/EditTest';
import ManageCategories from './pages/admin/ManageCategories';
import AdminTestResults from './pages/admin/AdminTestResults';
import AdminSettings from './pages/admin/AdminSettings';

const AppRoutes = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Root Redirect */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><AvailableTests /></ProtectedRoute>} />
          <Route path="/tests/:testId/instructions" element={<ProtectedRoute><TestInstructions /></ProtectedRoute>} />
          <Route path="/tests/:testId/take" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
          <Route path="/results/:attemptId" element={<ProtectedRoute><TestResultPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />
          <Route path="/review/:attemptId" element={<ProtectedRoute><ReviewAnswersPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/create-test" element={<ProtectedRoute adminOnly><CreateTest /></ProtectedRoute>} />
          <Route path="/admin/upload-pdf" element={<ProtectedRoute adminOnly><UploadPdfTest /></ProtectedRoute>} />
          <Route path="/admin/preview-extracted-test" element={<ProtectedRoute adminOnly><PreviewExtractedQuestions /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute adminOnly><ManageTests /></ProtectedRoute>} />
          <Route path="/admin/edit-test/:id" element={<ProtectedRoute adminOnly><EditTest /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><ManageCategories /></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute adminOnly><AdminTestResults /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
