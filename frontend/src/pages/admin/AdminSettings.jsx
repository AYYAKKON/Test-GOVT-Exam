import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Settings, ShieldCheck, Database, FileText, CheckCircle2, Server } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-7 h-7 text-indigo-600" /> Platform System Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System configuration, database connectivity, and security parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* System Security Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Security Enforcements
            </h2>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>JWT Authentication & Role-Based API Authorization Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Password Hashing: bcrypt (Salt Factor 10)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Answer Key Security: Correct answers strictly stripped from student test payloads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Section-wise Timer Enforced at Server & Client</span>
              </div>
            </div>
          </div>

          {/* Database & API info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" /> Environment Details
            </h2>
            <div className="space-y-2 text-xs text-slate-700 font-medium">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Backend Port:</span>
                <strong className="text-slate-900">5000</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Database System:</span>
                <strong className="text-slate-900">MongoDB / Mongoose</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">PDF Upload Max Limit:</span>
                <strong className="text-slate-900">15 MB</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">System Mode:</span>
                <strong className="text-emerald-600">Production Ready</strong>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminSettings;
