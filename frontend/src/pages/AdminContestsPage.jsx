import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { contestApi } from '../api/contestApi';
import { problemApi } from '../api/problemApi';
import { testCaseApi } from '../api/testCaseApi';
import { AppLayout } from '../components/AppLayout';
import { 
  Trophy, 
  Plus, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar, 
  Eye, 
  Upload, 
  Sparkles, 
  AlertCircle,
  X,
  FileCode,
  Layers,
  Flame,
  ArrowRight
} from 'lucide-react';

const POPULAR_TOPICS = [
  'Arrays',
  'Strings',
  'Hash Table',
  'Dynamic Programming',
  'Math',
  'Sorting',
  'Trees',
  'Binary Search',
  'Two Pointers',
  'Stack',
  'Graph'
];

export const AdminContestsPage = () => {
  const [contests, setContests] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();

  // Create Contest Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(120); // 2 Hours
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Create New Problem Form State (Inside Contest Admin)
  const [probTitle, setProbTitle] = useState('');
  const [probDifficulty, setProbDifficulty] = useState('EASY');
  const [probTopic, setProbTopic] = useState('Arrays');
  const [probDescription, setProbDescription] = useState('');
  const [probConstraints, setProbConstraints] = useState('');
  const [probSampleInput, setProbSampleInput] = useState('');
  const [probSampleOutput, setProbSampleOutput] = useState('');
  const [probStarterCode, setProbStarterCode] = useState('');
  const [probSubmitting, setProbSubmitting] = useState(false);
  const [probError, setProbError] = useState('');

  useEffect(() => {
    fetchInitialData();
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [contestRes, probRes] = await Promise.all([
        contestApi.getAllContests(),
        problemApi.getProblems()
      ]);
      setContests(contestRes.data || []);
      const problemsList = probRes.data || [];
      setAllProblems(problemsList);

      // Pre-select first 5 problems by default
      if (problemsList.length >= 5) {
        setSelectedProblemIds(problemsList.slice(0, 5).map(p => p.id));
      } else {
        setSelectedProblemIds(problemsList.map(p => p.id));
      }
    } catch (err) {
      console.error('Failed to load admin contest data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (selectedProblemIds.length === 0) {
      setActionError('Please select at least 1 problem for the contest.');
      return;
    }

    try {
      // Send local formatted ISO datetime (YYYY-MM-DDTHH:mm:ss) without UTC distortion so contest starts at exact scheduled local time
      const formattedStartTime = startTime.length === 16 ? `${startTime}:00` : startTime;

      await contestApi.createContest({
        title,
        description,
        startTime: formattedStartTime,
        durationMinutes: parseInt(durationMinutes) || 120,
        problemIds: selectedProblemIds
      });

      setActionSuccess(`Contest "${title}" created successfully with ${selectedProblemIds.length} problems!`);
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Failed to create contest.');
    }
  };

  const handlePublish = async (contestId) => {
    try {
      await contestApi.publishContest(contestId);
      setActionSuccess('Contest published and opened for contestants!');
      fetchInitialData();
    } catch (err) {
      console.error(err);
      setActionError('Failed to publish contest.');
    }
  };

  const toggleProblemSelection = (id) => {
    setActionError('');
    if (selectedProblemIds.includes(id)) {
      setSelectedProblemIds(selectedProblemIds.filter(pid => pid !== id));
    } else {
      setSelectedProblemIds([...selectedProblemIds, id]);
    }
  };

  const selectFirst5 = () => {
    setActionError('');
    setSelectedProblemIds(allProblems.slice(0, 5).map(p => p.id));
  };

  const clearAllProblems = () => {
    setSelectedProblemIds([]);
  };

  const resetNewProblemForm = () => {
    setProbTitle('');
    setProbDifficulty('EASY');
    setProbTopic('Arrays');
    setProbDescription('');
    setProbConstraints('');
    setProbSampleInput('');
    setProbSampleOutput('');
    setProbStarterCode('');
    setProbError('');
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    if (!probTitle.trim() || !probDescription.trim()) {
      setProbError('Title and description are required.');
      return;
    }

    setProbSubmitting(true);
    setProbError('');
    try {
      const payload = {
        title: probTitle.trim(),
        description: probDescription.trim(),
        difficulty: probDifficulty,
        topic: probTopic.trim() || 'General',
        problemConstraints: probConstraints.trim(),
        sampleInput: probSampleInput.trim(),
        sampleOutput: probSampleOutput.trim(),
        starterCode: probStarterCode.trim() || `class Solution:\n    def solve(self, n: int) -> int:\n        # Write your solution here\n        pass`
      };

      const res = await problemApi.createProblem(payload);
      const createdProblem = res.data;

      // If sample input and output are provided, auto-generate initial test case
      if (probSampleInput.trim() && probSampleOutput.trim() && createdProblem?.id) {
        try {
          await testCaseApi.addTestCase(createdProblem.id, {
            inputData: probSampleInput.trim(),
            expectedOutput: probSampleOutput.trim(),
            isHidden: false,
            testCaseOrder: 1
          });
        } catch (tcErr) {
          console.warn('Initial test case creation warning:', tcErr);
        }
      }

      // Refresh problem list from backend
      const updatedProbsRes = await problemApi.getProblems();
      const updatedList = updatedProbsRes.data || [];
      setAllProblems(updatedList);

      // Auto-select this newly created problem for the contest!
      if (createdProblem?.id) {
        setSelectedProblemIds((prev) => [...prev.filter(id => id !== createdProblem.id), createdProblem.id]);
      }

      setShowProblemModal(false);
      resetNewProblemForm();
      setActionSuccess(`Problem "${createdProblem.title}" created successfully and added to the platform problem list!`);
    } catch (err) {
      console.error('Failed to create problem:', err);
      setProbError(err.response?.data?.message || err.message || 'Failed to create problem.');
    } finally {
      setProbSubmitting(false);
    }
  };

  return (
    <AppLayout title="Manage Contests">
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Contests
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, publish, and monitor 2-hour competitive coding contests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0D684D] text-xs font-bold">
              {contests.length} Contests
            </span>
            <button
              onClick={() => {
                resetNewProblemForm();
                setShowProblemModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all shrink-0"
            >
              <Plus className="w-4 h-4 text-[#0D684D]" />
              <span>Add New Problem</span>
            </button>
            <button
              onClick={() => {
                if (allProblems.length >= 5 && selectedProblemIds.length === 0) {
                  setSelectedProblemIds(allProblems.slice(0, 5).map(p => p.id));
                }
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white font-semibold text-sm shadow-md transition-all hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Contest</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')}><X className="w-4 h-4 text-emerald-600" /></button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError('')}><X className="w-4 h-4 text-rose-600" /></button>
          </div>
        )}

        {/* CONTESTS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Contests List</h3>
            <span className="text-xs text-slate-500 font-medium">Total: {contests.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Contest Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4 text-center">Problems</th>
                  <th className="py-3 px-4 text-center">Participants</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Loading contests...
                    </td>
                  </tr>
                ) : contests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No contests created yet. Click "Create New Contest" above to launch one.
                    </td>
                  </tr>
                ) : (
                  contests.map((c) => {
                    const now = currentTime;
                    const startMs = c.startTime ? Date.parse(c.startTime) : 0;
                    const endMs = c.endTime ? Date.parse(c.endTime) : 0;
                    const isDraft = c.status === 'DRAFT';
                    const isFinished = c.status === 'COMPLETED' || (endMs > 0 && now >= endMs);
                    const isLive = !isDraft && !isFinished && (c.status === 'LIVE' || (startMs > 0 && now >= startMs));
                    const isUpcoming = !isDraft && !isFinished && !isLive;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">{c.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{c.description}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLive
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : isUpcoming
                              ? 'bg-blue-100 text-blue-700'
                              : isFinished
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isLive ? 'LIVE' : isUpcoming ? 'PUBLISHED' : isFinished ? 'COMPLETED' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 font-mono">
                          {c.durationMinutes} min (2h)
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {new Date(c.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-700">{c.totalProblems || 5}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-700">{c.totalParticipants}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isDraft && (
                              <button
                                onClick={() => handlePublish(c.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                              >
                                Publish
                              </button>
                            )}

                            <Link
                              to={`/admin/contests/${c.id}/monitor`}
                              className="px-3.5 py-1.5 rounded-lg bg-[#0D684D] hover:bg-[#0A543E] text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Monitor</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE CONTEST MODAL (Mounted at document.body for full-screen edge-to-edge blur) */}
        {showModal && createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0D684D] text-white flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Create Coding Contest</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateContest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Contest Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. CodeXa Weekly Sprint #2"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the contest rules and topics..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Contest duration in minutes (e.g. 120)</p>
                  </div>
                </div>

                {/* PROBLEM PICKER */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Select Contest Problems ({selectedProblemIds.length} Selected)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          resetNewProblemForm();
                          setShowProblemModal(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0D684D] hover:bg-emerald-100 text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Question</span>
                      </button>
                      <button
                        type="button"
                        onClick={selectFirst5}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Select First 5
                      </button>
                      <button
                        type="button"
                        onClick={clearAllProblems}
                        className="text-xs text-slate-400 hover:text-slate-600 underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded-2xl max-h-56 overflow-y-auto bg-slate-50/70 p-1.5 space-y-1">
                    {allProblems.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                        <p>Loading problems...</p>
                        <button
                          type="button"
                          onClick={fetchInitialData}
                          className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-semibold"
                        >
                          Retry Loading Problems
                        </button>
                      </div>
                    ) : (
                      allProblems.map((p, idx) => {
                        const isSelected = selectedProblemIds.includes(p.id);
                        const selectedIndex = selectedProblemIds.indexOf(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => toggleProblemSelection(p.id)}
                            className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs transition-all select-none border ${
                              isSelected
                                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-semibold shadow-xs'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                              />
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                                    {String.fromCharCode(65 + (selectedIndex < 26 ? selectedIndex : 0))}
                                  </span>
                                )}
                                <span className="text-sm font-semibold text-slate-900">{p.title}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                p.difficulty === 'EASY'
                                  ? 'bg-emerald-100/60 text-emerald-800 border-emerald-200'
                                  : p.difficulty === 'MEDIUM'
                                  ? 'bg-amber-100/60 text-amber-800 border-amber-200'
                                  : 'bg-rose-100/60 text-rose-800 border-rose-200'
                              }`}>
                                {p.difficulty}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500 font-normal">{p.topic}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Click any problem to toggle selection. Selected problems will be assigned contest letters (Problem A, B, C...).
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                  >
                    Create & Add Problems
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* ADD NEW PROBLEM MODAL (Mounted at document.body with higher z-index) */}
        {showProblemModal && createPortal(
          <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Add New Problem</h2>
                    <p className="text-xs text-slate-500">Adds problem to platform catalog & automatically selects it for contests.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {probError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{probError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProblem} className="space-y-4">
                {/* Title & Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Problem Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={probTitle}
                      onChange={(e) => setProbTitle(e.target.value)}
                      placeholder="e.g. Invert Binary Tree"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Difficulty *
                    </label>
                    <select
                      value={probDifficulty}
                      onChange={(e) => setProbDifficulty(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                </div>

                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Topic / Category
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {POPULAR_TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setProbTopic(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          probTopic === t
                            ? 'bg-[#0D684D] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={probTopic}
                    onChange={(e) => setProbTopic(e.target.value)}
                    placeholder="Or enter custom topic"
                    className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Problem Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={probDescription}
                    onChange={(e) => setProbDescription(e.target.value)}
                    placeholder="Explain the problem statement, inputs, and expected task clearly..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
                  />
                </div>

                {/* Problem Constraints */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Constraints
                  </label>
                  <input
                    type="text"
                    value={probConstraints}
                    onChange={(e) => setProbConstraints(e.target.value)}
                    placeholder="e.g. 1 <= nums.length <= 10^5, -10^4 <= nums[i] <= 10^4"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                </div>

                {/* Sample Input / Output */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Sample / Test Input
                    </label>
                    <textarea
                      rows={2}
                      value={probSampleInput}
                      onChange={(e) => setProbSampleInput(e.target.value)}
                      placeholder="e.g. [2,7,11,15], target = 9"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Sample / Expected Output
                    </label>
                    <textarea
                      rows={2}
                      value={probSampleOutput}
                      onChange={(e) => setProbSampleOutput(e.target.value)}
                      placeholder="e.g. [0,1]"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Starter Code (Optional) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Starter Code Template (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={probStarterCode}
                    onChange={(e) => setProbStarterCode(e.target.value)}
                    placeholder="class Solution:\n    def solve(self, ...):"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowProblemModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={probSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                  >
                    {probSubmitting ? (
                      <span>Saving Problem...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Save & Add to Problem List</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  );
};
