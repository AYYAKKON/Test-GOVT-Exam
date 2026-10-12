import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { uploadPdf, processText } from '../../services/testService';
import { UploadCloud, FileText, ArrowRight, AlertCircle, CheckCircle, Sparkles, HelpCircle } from 'lucide-react';

const UploadPdfTest = () => {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'text'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf)');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdfFile', file);

      const res = await uploadPdf(formData);
      // Store extracted data in sessionStorage for preview step
      sessionStorage.setItem('extracted_test_data', JSON.stringify(res.parsedData));
      navigate('/admin/preview-extracted-test');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process PDF file. Try pasting raw text below.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextProcess = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Please paste question text before processing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await processText(rawText);
      sessionStorage.setItem('extracted_test_data', JSON.stringify(res.parsedData));
      navigate('/admin/preview-extracted-test');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse text.');
    } finally {
      setLoading(false);
    }
  };

  // Preset sample test loader
  const fillSampleFormatText = () => {
    const sample = `TEST NAME: SSC CGL MOCK TEST 01
CATEGORY: SSC

SECTION 1: ENGLISH
TIME: 15 MINUTES

Q1. Choose the correct synonym of "Rapid".
A. Slow
B. Fast
C. Weak
D. Small
ANSWER: B
EXPLANATION: Rapid means fast or swift.

Q2. Select the correctly spelt word.
A. Accomodate
B. Accommodate
C. Acomodate
D. Accommoodate
ANSWER: B

SECTION 2: REASONING
TIME: 15 MINUTES

Q1. Find the missing number: 2, 4, 8, 16, ?
A. 24
B. 30
C. 32
D. 64
ANSWER: C
EXPLANATION: Multiply by 2.

SECTION 3: MATHEMATICS
TIME: 20 MINUTES

Q1. What is 25% of 200?
A. 25
B. 40
C. 50
D. 75
ANSWER: C
EXPLANATION: (25/100) * 200 = 50.`;

    setRawText(sample);
    setActiveTab('text');
  };

  return (
    <div className="flex bg-slate-100 min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <UploadCloud className="w-4 h-4" /> PDF Question Extractor
            </div>
            <h1 className="text-2xl font-black">Upload Question PDF</h1>
            <p className="text-slate-400 text-xs mt-1">
              Automated PDF parser extracts sections, timings, questions, options, and correct answers into editable preview.
            </p>
          </div>

          <button
            onClick={fillSampleFormatText}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 shadow transition shrink-0"
          >
            <Sparkles className="w-4 h-4" /> Load Quick Sample Format
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Workflow Steps Indicator */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-around text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2 text-indigo-600">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
            <span>Upload PDF / Text</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">2</span>
            <span>Automatic Question Parsing</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">3</span>
            <span>Review Preview & Publish</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`py-2.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition ${
              activeTab === 'pdf'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Option A: Upload PDF File
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`py-2.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Option B: Paste Raw Question Text
          </button>
        </div>

        {/* PDF Upload Form */}
        {activeTab === 'pdf' && (
          <form onSubmit={handlePdfUpload} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition bg-slate-50/50">
              <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base mb-1">Select Question PDF File</h3>
              <p className="text-xs text-slate-500 mb-4">Supports structured exam question papers up to 15MB</p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-file-input"
              />
              <label
                htmlFor="pdf-file-input"
                className="inline-block py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow transition"
              >
                Choose PDF File
              </label>

              {file && (
                <div className="mt-4 p-3 bg-indigo-50 rounded-xl inline-flex items-center gap-2 text-indigo-900 font-bold text-xs border border-indigo-200">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !file}
                className={`py-3 px-8 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow flex items-center gap-2 ${
                  loading || !file
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {loading ? 'Parsing PDF Questions...' : 'Process PDF & Show Preview'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Raw Text Parser Form */}
        {activeTab === 'text' && (
          <form onSubmit={handleTextProcess} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Paste Structured Exam Question Text
              </label>
              <textarea
                rows={12}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste question paper text here..."
                className="w-full p-4 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Supports section names, time headers, Q1, options A/B/C/D, answers & explanations.
              </span>

              <button
                type="submit"
                disabled={loading || !rawText.trim()}
                className={`py-3 px-8 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow flex items-center gap-2 ${
                  loading || !rawText.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {loading ? 'Parsing Text...' : 'Parse Text & Show Preview'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

      </main>
    </div>
  );
};

export default UploadPdfTest;
