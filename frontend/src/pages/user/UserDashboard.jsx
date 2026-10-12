import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import { getAvailableTests } from '../../services/testService';
import { getUserHistory } from '../../services/attemptService';
import { BookOpen, History, CheckCircle2, Clock, PlayCircle, Eye, Award } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, historyData] = await Promise.all([
          getAvailableTests(),
          getUserHistory()
        ]);
        setTests(testsData || []);
        setHistory(historyData || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCompleted = history.length;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / history.length)
    : 0;

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" /> Candidate Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Welcome, {user?.name}!</h1>
            <p className="text-slate-400 text-sm mt-1">
              Ready to attempt Central Government online mock tests and analyze your performance.
            </p>
          </div>
          <Link
            to="/tests"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm shadow-md transition flex items-center gap-2 shrink-0"
          >
            <PlayCircle className="w-4 h-4" /> Browse Available Tests
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Available Tests"
            value={tests.length}
            icon={BookOpen}
            color="indigo"
            subtitle="Ready to take"
          />
          <StatCard
            title="Tests Completed"
            value={totalCompleted}
            icon={CheckCircle2}
            color="emerald"
            subtitle="Attempts recorded"
          />
          <StatCard
            title="Average Score"
            value={`${avgScore}%`}
            icon={History}
            color="amber"
            subtitle="Across completed tests"
          />
        </div>

        {/* Available Tests Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Available Tests
              </h2>
              <p className="text-xs text-slate-500">Practice mock exams designed according to official government patterns</p>
            </div>
            <Link to="/tests" className="text-xs font-bold text-indigo-600 hover:underline">View All &rarr;</Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading available tests...</div>
          ) : tests.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No tests published yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.slice(0, 4).map((test) => (
                <div key={test._id} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-md uppercase tracking-wider">
                        {test.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {test.totalDuration} Minutes
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{test.title}</h3>
                    {test.sections && test.sections.length > 0 && (
                      <p className="text-xs text-slate-600 mb-3">
                        <strong className="text-slate-700">Sections:</strong> {test.sections.join(' | ')}
                      </p>
                    )}
                    <div className="text-xs text-slate-500 mb-4">
                      <span>Questions: <strong>{test.totalQuestions}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/tests/${test._id}/instructions`)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" /> Start Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test History Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" /> Test History & Performance
              </h2>
              <p className="text-xs text-slate-500">Your recent test attempts and scorecard history</p>
            </div>
            <Link to="/history" className="text-xs font-bold text-indigo-600 hover:underline">Full History &rarr;</Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">You have not taken any tests yet. Click "Start Test" above to begin your first test!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4">Test Name</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.slice(0, 5).map((att) => (
                    <tr key={att._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {att.testId?.title || 'Mock Test'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(att.completedAt || att.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {att.score} / {att.maxScore}
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/results/${att._id}`)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Result
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

export default UserDashboard;
