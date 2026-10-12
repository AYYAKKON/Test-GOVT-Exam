import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { saveParsedTest } from '../../services/testService';
import { getCategories } from '../../services/userService';
import { CheckCircle2, Save, Trash2, Plus, Edit3, Clock, Layers, HelpCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const PreviewExtractedQuestions = () => {
  const navigate = useNavigate();

  const [testTitle, setTestTitle] = useState('');
  const [category, setCategory] = useState('SSC');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Read parsed data from sessionStorage
    const stored = sessionStorage.getItem('extracted_test_data');
    if (!stored) {
      navigate('/admin/upload-pdf');
      return;
    }

    try {
      const data = JSON.parse(stored);
      setTestTitle(data.testTitle || 'Imported Mock Test 01');
      setCategory(data.category || 'SSC');
      setSections(data.sections || []);
    } catch (e) {
      console.error('Failed to load session preview:', e);
      navigate('/admin/upload-pdf');
    }

    // Load available category list
    getCategories().then(setCategories).catch(console.error);
  }, [navigate]);

  // Section Duration / Name Handler
  const handleSectionChange = (secIdx, field, val) => {
    setSections(prev => {
      const copy = [...prev];
      copy[secIdx] = { ...copy[secIdx], [field]: val };
      return copy;
    });
  };

  // Question Field Edit Handler
  const handleQuestionChange = (secIdx, qIdx, field, val) => {
    setSections(prev => {
      const copy = [...prev];
      const qCopy = [...copy[secIdx].questions];
      qCopy[qIdx] = { ...qCopy[qIdx], [field]: val };
      copy[secIdx] = { ...copy[secIdx], questions: qCopy };
      return copy;
    });
  };

  // Option Edit Handler
  const handleOptionChange = (secIdx, qIdx, optKey, newText) => {
    setSections(prev => {
      const copy = [...prev];
      const qCopy = [...copy[secIdx].questions];
      const opts = qCopy[qIdx].options ? [...qCopy[qIdx].options] : [];
      const existingIdx = opts.findIndex(o => o.key === optKey);
      if (existingIdx >= 0) {
        opts[existingIdx] = { ...opts[existingIdx], text: newText };
      } else {
        opts.push({ key: optKey, text: newText });
      }
      qCopy[qIdx] = { ...qCopy[qIdx], options: opts };
      copy[secIdx] = { ...copy[secIdx], questions: qCopy };
      return copy;
    });
  };

  // Delete Question
  const handleDeleteQuestion = (secIdx, qIdx) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    setSections(prev => {
      const copy = [...prev];
      const qCopy = copy[secIdx].questions.filter((_, i) => i !== qIdx);
      copy[secIdx] = { ...copy[secIdx], questions: qCopy };
      return copy;
    });
  };

  // Add Question to Section
  const handleAddQuestion = (secIdx) => {
    setSections(prev => {
      const copy = [...prev];
      const newQ = {
        questionNumber: copy[secIdx].questions.length + 1,
        questionText: 'New Sample Question Text',
        options: [
          { key: 'A', text: 'Option A' },
          { key: 'B', text: 'Option B' },
          { key: 'C', text: 'Option C' },
          { key: 'D', text: 'Option D' }
        ],
        correctAnswer: 'A',
        explanation: ''
      };
      copy[secIdx] = { ...copy[secIdx], questions: [...copy[secIdx].questions, newQ] };
      return copy;
    });
  };

  // Submit & Save to Database (Publish or Save as Draft)
  const handleSaveTest = async (publishStatus = 'Published') => {
    if (!testTitle.trim()) {
      setError('Please enter a valid Test Title');
      return;
    }

    let totalQ = 0;
    sections.forEach(s => { totalQ += (s.questions || []).length; });

    if (totalQ === 0) {
      setError('Test must contain at least one question before publishing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: testTitle.trim(),
        category,
        description: description || `Mock Test with ${sections.length} sections and ${totalQ} questions.`,
        status: publishStatus,
        sections
      };

      await saveParsedTest(payload);
      sessionStorage.removeItem('extracted_test_data');
      alert(`Test successfully saved and ${publishStatus.toLowerCase()}!`);
      navigate('/admin/tests');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total questions & total duration
  let totalQuestionsCount = 0;
  let totalDurationCount = 0;
  sections.forEach(sec => {
    totalQuestionsCount += (sec.questions || []).length;
    totalDurationCount += (parseInt(sec.duration, 10) || 0);
  });

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Top Action Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-16 z-20">
          <div>
            <button
              onClick={() => navigate('/admin/upload-pdf')}
              className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Re-upload PDF
            </button>
            <h1 className="text-2xl font-black">Review Extracted Questions Preview</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify question wording, options, correct answers, sections, and section-wise timing before publishing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={loading}
              onClick={() => handleSaveTest('Draft')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition border border-slate-700"
            >
              Save as Draft
            </button>
            <button
              disabled={loading}
              onClick={() => handleSaveTest('Published')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> {loading ? 'Saving...' : 'Confirm & Publish Test'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Test Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Test Overview & Configuration</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Total Questions: {totalQuestionsCount} | Total Duration: {totalDurationCount} Mins
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Test Title
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Exam Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 bg-white"
              >
                {categories.length > 0 ? (
                  categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)
                ) : (
                  <>
                    <option value="SSC">SSC</option>
                    <option value="Banking">Banking</option>
                    <option value="Railway">Railway</option>
                    <option value="Defence">Defence</option>
                    <option value="UPSC">UPSC</option>
                    <option value="TNPSC">TNPSC</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Sections & Questions List */}
        <div className="space-y-8">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              
              {/* Section Header */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                    {secIdx + 1}
                  </span>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Section Name</label>
                    <input
                      type="text"
                      value={sec.name}
                      onChange={(e) => handleSectionChange(secIdx, 'name', e.target.value)}
                      className="px-3 py-1 border border-slate-300 rounded-lg text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Section Duration (Minutes)</label>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        value={sec.duration}
                        onChange={(e) => handleSectionChange(secIdx, 'duration', e.target.value)}
                        className="w-20 px-2 py-1 border border-slate-300 rounded-lg text-sm font-bold text-indigo-600 text-center"
                      />
                      <span className="text-xs font-semibold text-slate-500">Mins</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion(secIdx)}
                    className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition flex items-center gap-1 border border-indigo-200 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>
              </div>

              {/* Questions List inside Section */}
              <div className="space-y-6 pl-2">
                {sec.questions && sec.questions.map((q, qIdx) => (
                  <div key={qIdx} className="border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition bg-slate-50/30">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-xs text-indigo-600 uppercase tracking-wider">
                        Question #{qIdx + 1}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(secIdx, qIdx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Text Field */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Question Statement</label>
                      <textarea
                        rows={2}
                        value={q.questionText}
                        onChange={(e) => handleQuestionChange(secIdx, qIdx, 'questionText', e.target.value)}
                        className="w-full p-3 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Options Grid (A, B, C, D) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const optObj = (q.options || []).find(o => o.key === optKey) || { text: '' };
                        return (
                          <div key={optKey} className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {optKey}
                            </span>
                            <input
                              type="text"
                              value={optObj.text}
                              onChange={(e) => handleOptionChange(secIdx, qIdx, optKey, e.target.value)}
                              placeholder={`Option ${optKey} text`}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Correct Answer & Explanation */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-emerald-700 mb-1">Correct Answer Option</label>
                        <select
                          value={q.correctAnswer || 'A'}
                          onChange={(e) => handleQuestionChange(secIdx, qIdx, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-400 bg-emerald-50 text-xs font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Explanation (Optional)</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleQuestionChange(secIdx, qIdx, 'explanation', e.target.value)}
                          placeholder="Provide explanation for answer review"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Publish Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Click <strong>Confirm & Publish Test</strong> to make this test active for candidates.
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={loading}
              onClick={() => handleSaveTest('Draft')}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs uppercase"
            >
              Save as Draft
            </button>
            <button
              disabled={loading}
              onClick={() => handleSaveTest('Published')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider shadow"
            >
              Confirm & Publish Test
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default PreviewExtractedQuestions;
