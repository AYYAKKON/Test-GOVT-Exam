import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getTestByIdAdmin, updateTest, deleteQuestion } from '../../services/testService';
import { getCategories } from '../../services/userService';
import API from '../../services/api';
import { Edit3, Save, ArrowLeft, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

const EditTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    status: 'Draft'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, cats] = await Promise.all([
          getTestByIdAdmin(id),
          getCategories()
        ]);
        setTest(data.test);
        setSections(data.sections || []);
        setQuestions(data.questions || []);
        setCategories(cats || []);

        if (data.test) {
          setFormData({
            title: data.test.title,
            category: data.test.category,
            description: data.test.description || '',
            status: data.test.status || 'Draft'
          });
        }
      } catch (err) {
        console.error('Error fetching test:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdateTestMeta = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const updated = await updateTest(id, formData);
      setTest(updated);
      setMsg({ type: 'success', text: 'Test metadata updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question from database?')) return;
    try {
      await deleteQuestion(qId);
      setQuestions(prev => prev.filter(q => q._id !== qId));
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Loading test details...</main>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Link to="/admin/tests" className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests List
            </Link>
            <h1 className="text-2xl font-black">Edit Test: {formData.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Questions: <strong>{questions.length}</strong> | Total Sections: <strong>{sections.length}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
              formData.status === 'Published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
            }`}>
              {formData.status}
            </span>
          </div>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
            <span>{msg.text}</span>
          </div>
        )}

        {/* Metadata Form */}
        <form onSubmit={handleUpdateTestMeta} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Test Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 bg-white"
              >
                {categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Test Info
            </button>
          </div>
        </form>

        {/* Existing Questions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Test Questions ({questions.length})</h2>
          </div>

          {questions.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No questions found in this test yet.</div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-600 uppercase">
                      Q{idx + 1}. Correct Answer: Option {q.correctAnswer}
                    </span>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{q.questionText}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    {q.options && q.options.map(opt => (
                      <div key={opt.key} className={`p-2 rounded border ${opt.key === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 font-bold' : 'bg-white border-slate-200'}`}>
                        {opt.key}. {opt.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default EditTest;
