import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { problemApi } from '../api/problemApi';
import { testCaseApi } from '../api/testCaseApi';
import { PlusCircle, ArrowLeft, Edit2, Trash2, X } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

export const AdminManageTestCasesPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [inputData, setInputData] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [testCaseOrder, setTestCaseOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [probRes, tcRes] = await Promise.all([
        problemApi.getProblemById(id),
        testCaseApi.getTestCases(id, true),
      ]);
      setProblem(probRes.data);
      setTestCases(tcRes.data);
    } catch (err) {
      console.error('Failed to load test cases', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCase(null);
    setInputData('');
    setExpectedOutput('');
    setIsHidden(false);
    setTestCaseOrder(testCases.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (tc) => {
    setEditingCase(tc);
    setInputData(tc.inputData || '');
    setExpectedOutput(tc.expectedOutput || '');
    setIsHidden(Boolean(tc.isHidden));
    setTestCaseOrder(tc.testCaseOrder || 1);
    setModalOpen(true);
  };

  const handleDelete = async (tcId) => {
    if (window.confirm('Delete this test case?')) {
      try {
        await testCaseApi.deleteTestCase(tcId);
        setTestCases(testCases.filter((tc) => tc.id !== tcId));
      } catch (err) {
        alert('Failed to delete test case: ' + err.message);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCase) {
        const res = await testCaseApi.updateTestCase(editingCase.id, {
          inputData,
          expectedOutput,
          isHidden,
          testCaseOrder
        });
        setTestCases(testCases.map((tc) => (tc.id === editingCase.id ? res.data : tc)));
      } else {
        const res = await testCaseApi.createTestCase(id, {
          inputData,
          expectedOutput,
          isHidden,
          testCaseOrder
        });
        setTestCases([...testCases, res.data]);
      }
      setModalOpen(false);
    } catch (err) {
      alert('Failed to save test case: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Manage Test Cases">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/admin/problems"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Problems
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-[#0D684D]">Test Cases</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {problem?.title || 'Problem Test Cases'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage automated judge and student-facing test cases.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-sm font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Test Case</span>
            </button>
          </div>
        </div>

        {/* TEST CASES CARD */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-[#0D684D] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading test cases...</p>
            </div>
          ) : testCases.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-700">No test cases found</p>
              <p className="text-xs text-slate-500 mt-1">
                Add at least one test case so students can submit their solutions.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-[#0D684D] text-white text-xs font-semibold"
              >
                Add Test Case
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
                <div className="col-span-1">ORDER</div>
                <div className="col-span-4">INPUT DATA</div>
                <div className="col-span-4">EXPECTED OUTPUT</div>
                <div className="col-span-2">VISIBILITY</div>
                <div className="col-span-1 text-right">ACTION</div>
              </div>

              {testCases.map((tc, idx) => (
                <div
                  key={tc.id}
                  className="grid grid-cols-12 items-center py-3.5 border-b border-slate-100 last:border-b-0 text-xs"
                >
                  <div className="col-span-1 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </div>
                  <div className="col-span-4 pr-3">
                    <pre className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px] overflow-x-auto max-h-20">
                      {tc.inputData || '(Empty input)'}
                    </pre>
                  </div>
                  <div className="col-span-4 pr-3">
                    <pre className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-slate-800 text-[11px] overflow-x-auto max-h-20">
                      {tc.expectedOutput || '(Empty output)'}
                    </pre>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        tc.isHidden
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {tc.isHidden ? 'Hidden' : 'Public'}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(tc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCase ? 'Edit Test Case' : 'Add Test Case'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Input Data
                  </label>
                  <textarea
                    rows={4}
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    placeholder="Standard input"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-[#0D684D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Expected Output
                  </label>
                  <textarea
                    rows={4}
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(e.target.value)}
                    placeholder="Expected output"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-[#0D684D]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modalHidden"
                    checked={isHidden}
                    onChange={(e) => setIsHidden(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                  />
                  <label htmlFor="modalHidden" className="text-xs font-semibold text-slate-700 select-none">
                    Hidden Test Case (Judge Only - hidden from problem description)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Save Test Case'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
