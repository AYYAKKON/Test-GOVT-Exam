import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestForAttempt } from '../../services/testService';
import { submitTestAttempt } from '../../services/attemptService';
import { Clock, ShieldAlert, CheckCircle, ChevronLeft, ChevronRight, Bookmark, RotateCcw, AlertTriangle, Send, Grid, X } from 'lucide-react';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // User state: userAnswers[questionId] = { selectedOption: 'A', status: 'answered'|'visited'|'marked'|'not_visited' }
  const [userAnswers, setUserAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());

  // Timing state
  const [sectionTimeLeft, setSectionTimeLeft] = useState(0); // in seconds
  const [sectionTimeSpent, setSectionTimeSpent] = useState({}); // { sectionId: seconds }
  const [completedSections, setCompletedSections] = useState(new Set());
  const [startedAt] = useState(new Date().toISOString());

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);

  // 1. Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const data = await getTestForAttempt(testId);
        setTest(data.test);
        setSections(data.sections || []);
        setQuestions(data.questions || []);

        if (data.sections && data.sections.length > 0) {
          // Initialize first section time in seconds
          setSectionTimeLeft(data.sections[0].duration * 60);
        }
      } catch (err) {
        console.error('Error fetching test:', err);
        alert(err.response?.data?.message || 'Failed to load test.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, navigate]);

  // Current Active Section & Questions
  const currentSection = sections[currentSectionIndex];
  const sectionQuestions = currentSection
    ? questions.filter(q => q.sectionId.toString() === currentSection._id.toString())
    : [];

  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // Mark current question as visited when it opens
  useEffect(() => {
    if (currentQuestion) {
      setVisitedQuestions(prev => {
        const next = new Set(prev);
        next.add(currentQuestion._id.toString());
        return next;
      });
    }
  }, [currentQuestion]);

  // 2. Section Countdown Timer Effect
  useEffect(() => {
    if (loading || !currentSection || showSubmitModal) return;

    timerRef.current = setInterval(() => {
      setSectionTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSectionTimeExpired();
          return 0;
        }
        return prev - 1;
      });

      if (currentSection) {
        setSectionTimeSpent(prev => ({
          ...prev,
          [currentSection._id.toString()]: (prev[currentSection._id.toString()] || 0) + 1
        }));
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentSectionIndex, loading, currentSection, showSubmitModal]);

  // Handle when section timer reaches 0
  const handleSectionTimeExpired = () => {
    if (!currentSection) return;

    setCompletedSections(prev => new Set(prev).add(currentSection._id.toString()));

    if (currentSectionIndex < sections.length - 1) {
      const nextIdx = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIdx);
      setCurrentQuestionIndex(0);
      setSectionTimeLeft(sections[nextIdx].duration * 60);
      alert(`Time expired for section "${currentSection.name}". Automatically moving to "${sections[nextIdx].name}".`);
    } else {
      alert('Time expired for the final section! Submitting your test automatically.');
      handleSubmitTestFinal();
    }
  };

  // Option selection
  const handleOptionSelect = (optionKey) => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id.toString();

    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        selectedOption: optionKey,
        status: prev[qId]?.status === 'marked' ? 'marked' : 'answered'
      }
    }));
  };

  // Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id.toString();

    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  // Mark for Review
  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id.toString();

    setUserAnswers(prev => ({
      ...prev,
      [qId]: {
        ...(prev[qId] || {}),
        status: 'marked'
      }
    }));
    handleNextQuestion();
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (currentQuestion) {
      const qId = currentQuestion._id.toString();
      if (userAnswers[qId]?.selectedOption && userAnswers[qId]?.status !== 'marked') {
        setUserAnswers(prev => ({
          ...prev,
          [qId]: {
            ...prev[qId],
            status: 'answered'
          }
        }));
      }
    }
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Format Time MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Final Submit API Call
  const handleSubmitTestFinal = async () => {
    setSubmitting(true);
    try {
      const payload = {
        testId: test._id,
        answers: userAnswers,
        startedAt,
        sectionTimeSpent
      };

      const result = await submitTestAttempt(payload);
      navigate(`/results/${result.attemptId}`);
    } catch (err) {
      console.error('Submission failed:', err);
      alert(err.response?.data?.message || 'Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  };

  // Stats for confirmation modal
  const totalQCount = questions.length;
  let answeredCount = 0;
  let markedCount = 0;
  let unansweredCount = 0;

  questions.forEach(q => {
    const qId = q._id.toString();
    const ans = userAnswers[qId];
    if (ans?.selectedOption) {
      answeredCount++;
    } else if (ans?.status === 'marked') {
      markedCount++;
    } else {
      unansweredCount++;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-sm font-semibold">Setting up exam portal interface...</span>
      </div>
    );
  }

  // Component for rendering the Question Palette grid
  const renderPaletteContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
          Question Palette
        </h3>
        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
          {currentSection?.name}
        </span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center">N</span>
          <span className="text-slate-600">Not Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center">V</span>
          <span className="text-slate-600">Visited</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">A</span>
          <span className="text-slate-600">Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-white font-bold text-[9px] flex items-center justify-center">R</span>
          <span className="text-slate-600">Marked</span>
        </div>
      </div>

      {/* Grid Palette */}
      <div className="grid grid-cols-5 gap-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
        {sectionQuestions.map((q, idx) => {
          const qId = q._id.toString();
          const isCurrent = idx === currentQuestionIndex;
          const isVisited = visitedQuestions.has(qId);
          const userAns = userAnswers[qId];

          let colorClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

          if (userAns?.selectedOption) {
            colorClass = 'bg-emerald-600 text-white font-bold border-emerald-700';
          } else if (userAns?.status === 'marked') {
            colorClass = 'bg-amber-500 text-white font-bold border-amber-600';
          } else if (isVisited) {
            colorClass = 'bg-red-500 text-white font-bold border-red-600';
          }

          return (
            <button
              key={qId}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setShowMobilePalette(false);
              }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs flex items-center justify-center transition border ${colorClass} ${
                isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 font-black' : ''
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none pb-12 lg:pb-0">
      
      {/* Top Test Navigation Bar - Mobile Responsive */}
      <header className="bg-slate-900 text-white px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="truncate mr-2">
          <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate">
            <span className="truncate">{test?.title}</span>
            <span className="text-[10px] sm:text-xs bg-indigo-600 px-1.5 sm:px-2 py-0.5 rounded font-bold uppercase shrink-0">{test?.category}</span>
          </h1>
        </div>

        {/* Section Timer Display & Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="bg-slate-800 border border-slate-700 px-2.5 sm:px-4 py-1 rounded-xl flex items-center gap-1.5 shadow-inner">
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${sectionTimeLeft < 180 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden sm:block">Time Remaining</div>
              <div className={`text-sm sm:text-lg font-black font-mono tracking-wider ${sectionTimeLeft < 180 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatTime(sectionTimeLeft)}
              </div>
            </div>
          </div>

          {/* Palette button for Mobile screens */}
          <button
            onClick={() => setShowMobilePalette(true)}
            className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl border border-slate-700 transition flex items-center gap-1 text-xs font-bold"
            title="Question Palette"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Palette</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition shadow flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </header>

      {/* Section Switcher Tabs */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Sections:</span>
        {sections.map((sec, idx) => {
          const isCompleted = completedSections.has(sec._id.toString());
          const isActive = idx === currentSectionIndex;

          return (
            <button
              key={sec._id}
              disabled={isCompleted}
              onClick={() => {
                if (!isCompleted) {
                  setCurrentSectionIndex(idx);
                  setCurrentQuestionIndex(0);
                }
              }}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow'
                  : isCompleted
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{sec.name}</span>
              {isCompleted && <span className="text-[9px] bg-slate-300 px-1 rounded">Locked</span>}
            </button>
          );
        })}
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Question Area (Left Column on Desktop, Full Width on Mobile) */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden">
          
          {/* Question Header */}
          <div className="p-3 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs sm:text-sm">
            <div className="font-extrabold text-slate-800">
              Question {currentQuestionIndex + 1} of {sectionQuestions.length}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-semibold bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Marks: <span className="text-emerald-600 font-bold">+1.0</span> | Negative: <span className="text-red-500 font-bold">0.0</span>
            </div>
          </div>

          {/* Question Statement & Option Choices */}
          <div className="p-4 sm:p-8 flex-1 space-y-5 overflow-y-auto">
            {currentQuestion ? (
              <>
                <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion.questionText}
                </div>

                {/* Options List */}
                <div className="space-y-2.5 sm:space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const qId = currentQuestion._id.toString();
                    const selected = userAnswers[qId]?.selectedOption === opt.key;

                    return (
                      <label
                        key={opt.key}
                        onClick={() => handleOptionSelect(opt.key)}
                        className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition ${
                          selected
                            ? 'bg-indigo-50/80 border-indigo-600 shadow-sm text-slate-900'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                        }`}
                      >
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {opt.key}
                        </div>
                        <span className="text-xs sm:text-sm font-medium pt-0.5 leading-snug">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-12">No question available in this section.</div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="p-3 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkForReview}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1"
              >
                <Bookmark className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Mark for</span> Review
              </button>
              <button
                onClick={handleClearResponse}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear <span className="hidden sm:inline">Response</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={handlePrevQuestion}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-4 sm:px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Palette Sidebar (Visible directly on Desktop lg+) */}
        <div className="hidden lg:flex bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-col justify-between">
          {renderPaletteContent()}

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition"
            >
              Submit Final Test
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Palette Modal Drawer (< lg screens) */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-extrabold text-sm text-slate-900">Question Palette</span>
              <button onClick={() => setShowMobilePalette(false)} className="p-1 rounded bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderPaletteContent()}

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowMobilePalette(false);
                  setShowSubmitModal(true);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-xl"
              >
                Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Confirm Test Submission</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to submit your examination?</p>
            </div>

            {/* Answer Stats Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Total Questions:</span>
                <strong className="text-slate-900">{totalQCount}</strong>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>Answered Questions:</span>
                <strong>{answeredCount}</strong>
              </div>
              <div className="flex justify-between font-semibold text-amber-700">
                <span>Marked for Review:</span>
                <strong>{markedCount}</strong>
              </div>
              <div className="flex justify-between font-semibold text-slate-500">
                <span>Unanswered Questions:</span>
                <strong>{unansweredCount}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs uppercase rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmitTestFinal}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase rounded-xl shadow transition flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TakeTest;
