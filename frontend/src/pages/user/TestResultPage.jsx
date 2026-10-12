import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getAttemptDetails } from '../../services/attemptService';
import { Award, CheckCircle, XCircle, HelpCircle, Clock, Eye, RotateCcw, BarChart3, Layers } from 'lucide-react';

const TestResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getAttemptDetails(attemptId);
        setAttemptData(data);
      } catch (err) {
        console.error('Error loading attempt result:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Evaluating scorecard...</main>
      </div>
    );
  }

  if (!attemptData || !attemptData.attempt) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Attempt result not found.</main>
      </div>
    );
  }

  const { attempt } = attemptData;
  const testInfo = attempt.testId || {};

  const formatSeconds = (sec) => {
    if (!sec) return 'N/A';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Banner Header */}
        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" /> Test Completed Successfully
            </div>
            <h1 className="text-2xl md:text-3xl font-black">{testInfo.title || 'Examination Result'}</h1>
            <p className="text-slate-400 text-xs">
              Submitted on {new Date(attempt.completedAt || attempt.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/review/${attempt._id}`}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-md transition flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Review Detailed Answers
            </Link>
          </div>
        </div>

        {/* Score Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Score</p>
            <h2 className="text-3xl font-black text-slate-900">{attempt.score} <span className="text-sm font-normal text-slate-400">/ {attempt.maxScore}</span></h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Percentage</p>
            <h2 className={`text-3xl font-black ${
              attempt.percentage >= 70 ? 'text-emerald-600' : attempt.percentage >= 40 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {attempt.percentage}%
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
            <h2 className="text-3xl font-black text-indigo-600">
              {attempt.correctCount + attempt.wrongCount > 0
                ? `${Math.round((attempt.correctCount / (attempt.correctCount + attempt.wrongCount)) * 100)}%`
                : '0%'}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Time Taken</p>
            <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-slate-400" /> {formatSeconds(attempt.timeTakenSeconds)}
            </h2>
          </div>
        </div>

        {/* Detailed Count Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs text-emerald-800 font-bold uppercase">Correct Answers</div>
              <div className="text-2xl font-black text-emerald-900">{attempt.correctCount}</div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <div className="text-xs text-red-800 font-bold uppercase">Wrong Answers</div>
              <div className="text-2xl font-black text-red-900">{attempt.wrongCount}</div>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-slate-500 shrink-0" />
            <div>
              <div className="text-xs text-slate-700 font-bold uppercase">Unanswered</div>
              <div className="text-2xl font-black text-slate-900">{attempt.unansweredCount}</div>
            </div>
          </div>
        </div>

        {/* Section-Wise Score Breakdown */}
        {attempt.sectionResults && attempt.sectionResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-indigo-600" /> Section-Wise Score Analysis
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Section Name</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Correct</th>
                    <th className="py-3 px-4">Wrong</th>
                    <th className="py-3 px-4">Unanswered</th>
                    <th className="py-3 px-4 text-right">Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attempt.sectionResults.map((sec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-800">{sec.sectionName}</td>
                      <td className="py-3 px-4 font-extrabold text-indigo-600">{sec.score} / {sec.maxScore}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{sec.correctCount}</td>
                      <td className="py-3 px-4 text-red-600 font-bold">{sec.wrongCount}</td>
                      <td className="py-3 px-4 text-slate-500 font-bold">{sec.unansweredCount}</td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500 font-semibold">{formatSeconds(sec.timeSpentSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <Link
            to="/history"
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
          >
            &larr; Return to Test History
          </Link>
          <Link
            to={`/review/${attempt._id}`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider shadow transition flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Review Solutions & Explanations
          </Link>
        </div>

      </main>
    </div>
  );
};

export default TestResultPage;
