import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FilePlus,
  UploadCloud,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  History,
  FolderKanban,
  Settings,
  LogOut,
  UserCheck,
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Create Test', path: '/admin/create-test', icon: FilePlus },
    { name: 'Upload Question PDF', path: '/admin/upload-pdf', icon: UploadCloud, highlight: true },
    { name: 'Manage Tests', path: '/admin/tests', icon: FileSpreadsheet },
    { name: 'Exam Categories', path: '/admin/categories', icon: FolderKanban },
    { name: 'Test Results', path: '/admin/results', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Available Tests', path: '/tests', icon: BookOpen },
    { name: 'Test History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: UserCheck },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] border-r border-slate-800 p-4 hidden md:block shrink-0">
      <div className="mb-6 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700">
        <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Role Panel</div>
        <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-between">
          <span>{isAdmin ? 'ADMINISTRATOR' : 'STUDENT CANDIDATE'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin' || link.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : link.highlight
                    ? 'text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 border border-indigo-900/60 bg-indigo-950/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
