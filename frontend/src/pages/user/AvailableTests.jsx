import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getAvailableTests } from '../../services/testService';
import { getCategories } from '../../services/userService';
import { BookOpen, Search, Filter, Clock, HelpCircle, PlayCircle, Layers } from 'lucide-react';

const AvailableTests = () => {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, catsData] = await Promise.all([
          getAvailableTests({ category: selectedCategory, search: searchTerm }),
          getCategories()
        ]);
        setTests(testsData || []);
        setCategories(catsData || []);
      } catch (err) {
        console.error('Error fetching tests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCategory, searchTerm]);

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-indigo-600" /> Available Mock Tests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select an exam series to take practice mock tests with section-wise timers.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search test title..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-700"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Exams
          </button>
          {['SSC', 'Banking', 'Railway', 'Defence', 'UPSC', 'TNPSC'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Test Cards List */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center text-slate-400">
            Loading tests...
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Tests Found</h3>
            <p className="text-sm text-slate-500">There are no published tests matching your criteria right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-lg uppercase tracking-wider border border-indigo-100">
                      {test.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> {test.totalDuration} Mins
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{test.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{test.description || 'Full pattern mock test.'}</p>

                  {/* Section Breakdown Pills */}
                  {test.sections && test.sections.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Exam Sections ({test.sections.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {test.sections.map((secName, idx) => (
                          <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-medium">
                            {secName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-2 border-t border-slate-100 mb-4">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-4 h-4 text-slate-400" /> Total Questions: <strong className="text-slate-900">{test.totalQuestions}</strong>
                    </span>
                    <span>Timing: <strong className="text-slate-900">Sectional</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/tests/${test._id}/instructions`)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4.5 h-4.5" /> Take Test Now
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default AvailableTests;
