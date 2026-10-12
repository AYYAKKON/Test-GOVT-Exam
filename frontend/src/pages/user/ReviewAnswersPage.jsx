import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getAttemptDetails } from '../../services/attemptService';
import { CheckCircle, XCircle, HelpCircle, ArrowLeft, BookOpen, Layers } from 'lucide-react';

const ReviewAnswersPage = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('All');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await getAttemptDetails(attemptId);
        setData(res);
      } catch (err) {
        console.error('Error fetching review:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Loading detailed review...</main>
      </div>
    );
  }

  if (!data || !data.reviewData) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Review data not found.</main>
      </div>
    );
  }

  const { attempt, reviewData } = data;
  const testTitle = attempt?.testId?.title || 'Mock Test';

  const sectionsList = ['All', ...new Set(reviewData.map(q => q.sectionName))];

  const filteredQuestions = selectedSection === 'All'
    ? reviewData
    : reviewData.filter(q => q.sectionName === selectedSection);

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Top bar */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Link to={`/results/${attempt._id}`} className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Scorecard
            </Link>
            <h1 className="text-2xl font-black">{testTitle} &mdash; Answer Review</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Score: <strong>{attempt.score}/{attempt.maxScore}</strong> ({attempt.percentage}%)
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
            {sectionsList.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedSection === sec
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Questions Review List */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const isCorrect = q.isCorrect;
            const userChoice = q.userSelectedOption;
            const correctOpt = q.correctAnswer;

            return (
              <div
                key={q._id || idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      Q{q.questionNumber || idx + 1}.
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded">
                      {q.sectionName}
                    </span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Correct (+1)
                      </span>
                    ) : userChoice ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-extrabold rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-extrabold rounded-full">
                        <HelpCircle className="w-3.5 h-3.5" /> Unanswered
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-base font-bold text-slate-900">
                  {q.questionText}
                </div>

                {/* Options List with Color Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {q.options && q.options.map((opt) => {
                    const isUserPick = userChoice === opt.key;
                    const isRightOption = correctOpt === opt.key;

                    let optionBg = 'bg-white border-slate-200 text-slate-800';

                    if (isRightOption) {
                      optionBg = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500';
                    } else if (isUserPick && !isRightOption) {
                      optionBg = 'bg-red-50 border-red-400 text-red-900 font-bold';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`p-3.5 rounded-xl border flex items-center justify-between ${optionBg}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isRightOption
                              ? 'bg-emerald-600 text-white'
                              : isUserPick
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="text-sm">{opt.text}</span>
                        </div>

                        {isUserPick && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Solution Explanation Box */}
                {q.explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <strong className="font-extrabold uppercase tracking-wider text-indigo-800 block">Explanation:</strong>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
};

export default ReviewAnswersPage;
