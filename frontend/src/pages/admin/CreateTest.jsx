import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { createTest } from '../../services/testService';
import { getCategories } from '../../services/userService';
import { FilePlus, UploadCloud, ArrowRight, Save } from 'lucide-react';

const CreateTest = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SSC');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Test title is required');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newTest = await createTest({
        title: title.trim(),
        category,
        description,
        status: 'Draft'
      });
      navigate(`/admin/edit-test/${newTest._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create test.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FilePlus className="w-7 h-7 text-indigo-600" /> Create New Test
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter test metadata or use the automated PDF Question Importer.
            </p>
          </div>

          <Link
            to="/admin/upload-pdf"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow transition flex items-center gap-2 shrink-0"
          >
            <UploadCloud className="w-4 h-4" /> Upload Question PDF Instead
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Manual Test Setup Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Test Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SSC CGL Mock Test 02"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Exam Category *
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter mock exam instructions or overview..."
              className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Link to="/admin/tests" className="text-xs font-bold text-slate-500 hover:text-slate-800">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating Test...' : 'Create & Add Questions'}</span>
            </button>
          </div>
        </form>

      </main>
    </div>
  );
};

export default CreateTest;
