import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getAdminTestResults } from '../../services/attemptService';
import { BarChart3, Search, Eye, Award, CheckCircle } from 'lucide-react';

const AdminTestResults = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await getAdminTestResults();
        setAttempts(data || []);
      } catch (err) {
        console.error('Failed to load admin test results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filtered = attempts.filter(att => {
    const userMatch = att.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      att.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const testMatch = att.testId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return userMatch || testMatch;
  });

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" /> Candidate Examination Results
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete list of all candidate mock test attempts, scores, and accuracy percentages.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by candidate or test title..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">Total Attempts: <strong>{filtered.length}</strong></span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading attempt results...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No test attempts recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4">Candidate Name</th>
                    <th className="py-3.5 px-4">Test Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Completed Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {att.userId?.name || 'Candidate'}
                        <div className="text-[11px] text-slate-400 font-normal">{att.userId?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {att.testId?.title || 'Mock Test'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-extrabold rounded uppercase">
                          {att.testId?.category || 'Exam'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {att.score} / {att.maxScore}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          att.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {new Date(att.completedAt || att.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/results/${att._id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Scorecard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminTestResults;
