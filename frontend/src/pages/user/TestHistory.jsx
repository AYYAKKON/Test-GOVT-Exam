import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getUserHistory } from '../../services/attemptService';
import { History, Eye, Award, Clock, BookOpen } from 'lucide-react';

const TestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUserHistory();
        setHistory(data || []);
      } catch (err) {
        console.error('Error fetching test history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <History className="w-7 h-7 text-indigo-600" /> Completed Test History
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Permanent record of all online mock test attempts, scores, and review logs.
            </p>
          </div>
          <Link
            to="/tests"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider shadow transition text-center"
          >
            Take Another Test
          </Link>
        </div>

        {/* Table container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700">No Test History Yet</h3>
              <p className="text-sm text-slate-500">You haven't completed any mock tests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Completed Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {att.testId?.title || 'Mock Test'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md uppercase">
                          {att.testId?.category || 'Govt Exam'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                        {new Date(att.completedAt || att.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {att.score} / {att.maxScore}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          att.percentage >= 70
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.percentage >= 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/results/${att._id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Result
                        </button>
                        <button
                          onClick={() => navigate(`/review/${att._id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                        >
                          Review Answers
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

export default TestHistory;
