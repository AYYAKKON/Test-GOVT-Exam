import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { getAdminDashboardStats } from '../../services/attemptService';
import {
  Users,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle2,
  BarChart3,
  UploadCloud,
  PlusCircle,
  Eye,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" /> System Administration Control Panel
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage candidates, mock tests, PDF uploads, exam questions, and test score analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/upload-pdf"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow transition flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Upload Question PDF
            </Link>
            <Link
              to="/admin/create-test"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 border border-slate-700"
            >
              <PlusCircle className="w-4 h-4" /> Create Test
            </Link>
          </div>
        </div>

        {/* Dashboard Statistics Cards (Section 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            color="indigo"
            subtitle="Registered candidates"
          />
          <StatCard
            title="Total Tests"
            value={stats?.totalTests ?? 0}
            icon={FileSpreadsheet}
            color="blue"
            subtitle="Mock exam titles"
          />
          <StatCard
            title="Total Questions"
            value={stats?.totalQuestions ?? 0}
            icon={HelpCircle}
            color="purple"
            subtitle="In database"
          />
          <StatCard
            title="Tests Completed"
            value={stats?.testsCompleted ?? 0}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Student attempts"
          />
          <StatCard
            title="Average Score"
            value={`${stats?.averageScore ?? 0}%`}
            icon={BarChart3}
            color="amber"
            subtitle="Platform average"
          />
        </div>

        {/* Recent Attempts & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Candidate Test Submissions (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Recent Test Attempts
              </h2>
              <Link to="/admin/results" className="text-xs font-bold text-indigo-600 hover:underline">
                View All Results &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading activity...</div>
            ) : !stats?.recentAttempts || stats.recentAttempts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">No test attempts recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Test Title</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentAttempts.map((att) => (
                      <tr key={att._id} className="hover:bg-slate-50/80 transition text-xs">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {att.userId?.name || 'Student'}
                          <div className="text-[10px] text-slate-400 font-normal">{att.userId?.email}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {att.testId?.title || 'Mock Test'}
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900">
                          {att.score} / {att.maxScore}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            att.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/results/${att._id}`)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="View Scorecard"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Exam Category Distribution (1 Column) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Exam Categories</span>
              <Link to="/admin/categories" className="text-xs font-bold text-indigo-600 hover:underline">Manage</Link>
            </h2>

            {!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No categories configured.</div>
            ) : (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold">
                    <span className="text-slate-800 font-bold uppercase">{cat._id}</span>
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full font-black">
                      {cat.count} Tests
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/admin/upload-pdf"
                className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" /> PDF Question Importer
              </Link>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
