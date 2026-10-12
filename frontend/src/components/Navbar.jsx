import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, LogOut, Menu, X, Award, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md border-b border-slate-800">
      {/* Top Govt Bar */}
      <div className="bg-slate-950 text-slate-400 text-xs py-1 px-4 border-b border-slate-800 flex justify-between items-center">
        <span>Central Government Competitive Examination Portal</span>
        <span className="font-semibold text-amber-400">Official Mock Test System</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg text-lg tracking-wider border border-indigo-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block text-white">GOVT EXAM TEST PLATFORM</span>
                <span className="text-xs text-indigo-300 block -mt-1 font-medium">SSC • Banking • Railway • Defence</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {isAdmin ? (
                <>
                  <Link to="/admin" className="text-slate-300 hover:text-white text-sm font-medium transition">Dashboard</Link>
                  <Link to="/admin/tests" className="text-slate-300 hover:text-white text-sm font-medium transition">Manage Tests</Link>
                  <Link to="/admin/upload-pdf" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition flex items-center gap-1 bg-indigo-950/80 px-3 py-1.5 rounded-md border border-indigo-700/50">
                    <FileText className="w-4 h-4" /> Upload PDF
                  </Link>
                  <Link to="/admin/users" className="text-slate-300 hover:text-white text-sm font-medium transition">Users</Link>
                  <Link to="/admin/results" className="text-slate-300 hover:text-white text-sm font-medium transition">Results</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm font-medium transition">Dashboard</Link>
                  <Link to="/tests" className="text-slate-300 hover:text-white text-sm font-medium transition">Available Tests</Link>
                  <Link to="/history" className="text-slate-300 hover:text-white text-sm font-medium transition">Test History</Link>
                  <Link to="/profile" className="text-slate-300 hover:text-white text-sm font-medium transition">Profile</Link>
                </>
              )}
            </div>
          )}

          {/* User Profile / Logout */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-700">
                <div className="w-8 h-8 rounded-full bg-indigo-700 text-white font-semibold flex items-center justify-center text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-100">{user.name}</div>
                  <div className="text-slate-400 capitalize flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <span className="text-amber-400 font-bold flex items-center gap-0.5"><Shield className="w-3 h-3" /> Admin</span>
                    ) : (
                      <span>Student</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="ml-2 text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-slate-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-300 hover:text-white px-3 py-1.5 rounded-md text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition shadow">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-md focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="py-2 border-b border-slate-800 text-xs text-slate-400">
                Logged in as <strong className="text-slate-200">{user.name}</strong> ({user.role})
              </div>
              {isAdmin ? (
                <>
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Dashboard</Link>
                  <Link to="/admin/tests" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Manage Tests</Link>
                  <Link to="/admin/upload-pdf" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-indigo-400 font-semibold text-sm">Upload Question PDF</Link>
                  <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Manage Users</Link>
                  <Link to="/admin/results" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Test Results</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Dashboard</Link>
                  <Link to="/tests" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Available Tests</Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Test History</Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white text-sm">Profile</Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-red-400 font-medium text-sm border-t border-slate-800 mt-2"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-slate-200 bg-slate-800 rounded">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-white bg-indigo-600 rounded">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
