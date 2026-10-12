import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getTestForAttempt } from '../../services/testService';
import { AlertTriangle, Clock, HelpCircle, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';

const TestInstructions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getTestForAttempt(testId);
        setTestData(data);
      } catch (err) {
        console.error('Error fetching test details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [testId]);

  if (loading) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Loading instructions...</main>
      </div>
    );
  }

  if (!testData || !testData.test) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Test details unavailable.</main>
      </div>
    );
  }

  const { test, sections } = testData;

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Title Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
          <span className="px-2.5 py-1 bg-indigo-500 text-white text-xs font-bold rounded-md uppercase tracking-wider">
            {test.category} Examination
          </span>
          <h1 className="text-2xl md:text-3xl font-black mt-2">{test.title}</h1>
          <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-indigo-400" /> Total Questions: <strong>{test.totalQuestions}</strong></span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-400" /> Total Duration: <strong>{test.totalDuration} Minutes</strong></span>
            <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-400" /> Section Timers: <strong>Enforced</strong></span>
          </div>
        </div>

        {/* Section breakdown table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900">Section-Wise Timings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Section Name</th>
                  <th className="py-2.5 px-4">Allocated Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sections.map((sec, idx) => (
                  <tr key={sec._id || idx}>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{sec.name}</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600">{sec.duration} Minutes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions Rules */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 text-sm text-slate-700">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" /> General Examination Instructions
          </h2>

          <ul className="list-disc pl-5 space-y-2 leading-relaxed">
            <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete each section.</li>
            <li>When the timer for a section reaches zero, the test will automatically lock that section and move to the next section. You cannot return to a section once its time has expired.</li>
            <li>You can click on a question number in the Question Palette at the right of your screen to go to that question directly.</li>
            <li>
              <strong>Question Status Palette:</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 font-normal text-xs">
                <div className="flex items-center gap-2 bg-slate-100 p-2 rounded">
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2 bg-red-50 p-2 rounded">
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white font-bold flex items-center justify-center text-[10px]">2</span>
                  <span>Visited (Not Answered)</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 p-2 rounded">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
                  <span>Marked for Review</span>
                </div>
              </div>
            </li>
            <li>To save your answer, click on <strong>Save & Next</strong>.</li>
            <li>Do not close or refresh your browser window during the test.</li>
          </ul>

          <div className="pt-4 border-t border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300"
              />
              <span className="text-xs text-slate-800 leading-snug">
                I have read and understood all the instructions. I declare that I am not in possession of any prohibited material and agree to abide by the exam regulations.
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={!agreed}
              onClick={() => navigate(`/tests/${test._id}/take`)}
              className={`py-3 px-8 rounded-xl font-extrabold text-sm uppercase tracking-wider transition shadow flex items-center gap-2 ${
                agreed
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>I am Ready to Begin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default TestInstructions;
