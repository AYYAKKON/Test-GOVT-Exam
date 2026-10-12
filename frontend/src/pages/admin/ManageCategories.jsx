import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { getCategories, createCategory, deleteCategory } from '../../services/userService';
import { FolderKanban, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCats = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      await createCategory({ name: name.trim(), description });
      setName('');
      setDescription('');
      fetchCats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await deleteCategory(id);
      fetchCats();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-indigo-600" /> Exam Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Categorize examinations into SSC, Banking, Railway, Defence, UPSC, TNPSC, etc.
          </p>
        </div>

        {/* Add Form & List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Create Form */}
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 h-fit">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Create Category</h2>

            {error && <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{error}</div>}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. TNPSC or Railway"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>

          {/* List */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-2">Active Categories ({categories.length})</h2>

            {loading ? (
              <div className="py-8 text-center text-slate-400">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No categories created yet.</div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{cat.name}</h4>
                      {cat.description && <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default ManageCategories;
