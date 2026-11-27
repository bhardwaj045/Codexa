import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { contestApi } from '../api/contestApi';
import { problemApi } from '../api/problemApi';
import { testCaseApi } from '../api/testCaseApi';
import { AppLayout } from '../components/AppLayout';
import { ProblemDescriptionEditor } from '../components/LeetCodeDescriptionEditor';
import { FunctionSignatureConfig } from '../components/LeetCodeFunctionSignatureConfig';
import { generateSlug, SUPPORTED_LANGUAGES, generateAllTemplates } from '../utils/codeSignatureGenerator';
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
  ArrowRight,
  Radio,
  CheckCircle2,
  Code2,
  Check,
  Lightbulb,
  FileText,
  Building,
  BookOpen,
  Trash2,
  HardDrive
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

  // Create New Problem Form State (Inside Contest Admin - Full LeetCode-style specification)
  const [probActiveSection, setProbActiveSection] = useState('A');
  const [probTitle, setProbTitle] = useState('');
  const [probSlug, setProbSlug] = useState('');
  const [probSlugCustomized, setProbSlugCustomized] = useState(false);
  const [probDifficulty, setProbDifficulty] = useState('EASY');
  const [probTopic, setProbTopic] = useState('Arrays');
  const [probCompanies, setProbCompanies] = useState('');

  // Section B: Description & Examples
  const [probDescription, setProbDescription] = useState('');
  const [probExamples, setProbExamples] = useState([
    {
      id: 1,
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    }
  ]);
  const [probConstraints, setProbConstraints] = useState('2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9');
  const [probFollowUp, setProbFollowUp] = useState('');

  // Section C: Function Signature & Starter Code
  const [probFunctionConfig, setProbFunctionConfig] = useState({
    functionName: 'twoSum',
    returnType: 'int[]',
    parameters: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' }
    ],
    templates: {},
    primaryStarterCode: ''
  });

  // Section D: Test Cases
  const [probTestCases, setProbTestCases] = useState([
    { inputData: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false }
  ]);

  // Section E: Hints & Editorial
  const [probHints, setProbHints] = useState(['A brute force approach checks all possible pairs, but an associative hash map enables an optimal single pass.']);
  const [probSolutionApproach, setProbSolutionApproach] = useState('One-pass Hash Table');
  const [probTimeComplexity, setProbTimeComplexity] = useState('O(n)');
  const [probSpaceComplexity, setProbSpaceComplexity] = useState('O(n)');
  const [probEditorial, setProbEditorial] = useState('');

  // Section F: Official Solutions
  const [probOfficialSolutions, setProbOfficialSolutions] = useState({
    JAVA: '',
    CPP: '',
    PYTHON: '',
    JAVASCRIPT: '',
    C: ''
  });
  const [probSolutionTab, setProbSolutionTab] = useState('JAVA');
  const [probManualSolutionEdit, setProbManualSolutionEdit] = useState({});

  const [probSubmitting, setProbSubmitting] = useState(false);
  const [probError, setProbError] = useState('');

  // Automatically update slug when title changes
  useEffect(() => {
    if (!probSlugCustomized && probTitle) {
      setProbSlug(generateSlug(probTitle));
    }
  }, [probTitle, probSlugCustomized]);

  // Automated fetch: sync generated signatures from Section C to Section F
  useEffect(() => {
    if (probFunctionConfig?.templates && Object.keys(probFunctionConfig.templates).length > 0) {
      setProbOfficialSolutions(prev => {
        let changed = false;
        const next = { ...prev };
        Object.entries(probFunctionConfig.templates).forEach(([lang, templateCode]) => {
          if (!probManualSolutionEdit[lang] || !next[lang] || next[lang].trim() === '') {
            if (next[lang] !== templateCode) {
              next[lang] = templateCode;
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [probFunctionConfig?.templates, probManualSolutionEdit]);

  // Example operations
  const handleAddExample = () => {
    setProbExamples(prev => [
      ...prev,
      { id: prev.length + 1, input: '', output: '', explanation: '' }
    ]);
  };

  const handleRemoveExample = (idx) => {
    if (probExamples.length === 1) return;
    setProbExamples(prev => prev.filter((_, i) => i !== idx).map((ex, newIdx) => ({ ...ex, id: newIdx + 1 })));
  };

  const handleExampleChange = (idx, field, val) => {
    setProbExamples(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleSyncExamplesToTestCases = () => {
    const newCases = probExamples
      .filter(ex => ex.input.trim() || ex.output.trim())
      .map((ex, idx) => ({
        inputData: ex.input.trim(),
        expectedOutput: ex.output.trim(),
        isHidden: idx > 0
      }));
    if (newCases.length > 0) {
      setProbTestCases(newCases);
    }
  };

  // Test Case operations
  const handleAddTestCase = () => {
    setProbTestCases(prev => [
      ...prev,
      { inputData: '', expectedOutput: '', isHidden: false }
    ]);
  };

  const handleRemoveTestCase = (idx) => {
    if (probTestCases.length === 1) return;
    setProbTestCases(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTestCaseChange = (idx, field, val) => {
    setProbTestCases(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Hints operations
  const handleAddHint = () => setProbHints(prev => [...prev, '']);
  const handleRemoveHint = (idx) => {
    if (probHints.length === 1) {
      setProbHints(['']);
      return;
    }
    setProbHints(prev => prev.filter((_, i) => i !== idx));
  };
  const handleHintChange = (idx, val) => {
    setProbHints(prev => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const resetNewProblemForm = () => {
    setProbActiveSection('A');
    setProbTitle('');
    setProbSlug('');
    setProbSlugCustomized(false);
    setProbDifficulty('EASY');
    setProbTopic('Arrays');
    setProbCompanies('');
    setProbDescription('');
    setProbExamples([
      { id: 1, input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' }
    ]);
    setProbConstraints('2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9');
    setProbFollowUp('');
    setProbFunctionConfig({
      functionName: 'twoSum',
      returnType: 'int[]',
      parameters: [
        { name: 'nums', type: 'int[]' },
        { name: 'target', type: 'int' }
      ],
      templates: {},
      primaryStarterCode: ''
    });
    setProbTestCases([
      { inputData: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false }
    ]);
    setProbHints(['A brute force approach checks all possible pairs, but an associative hash map enables an optimal single pass.']);
    setProbSolutionApproach('One-pass Hash Table');
    setProbTimeComplexity('O(n)');
    setProbSpaceComplexity('O(n)');
    setProbEditorial('');
    setProbOfficialSolutions({
      JAVA: '',
      CPP: '',
      PYTHON: '',
      JAVASCRIPT: '',
      C: ''
    });
    setProbSolutionTab('JAVA');
    setProbManualSolutionEdit({});
    setProbError('');
  };

  const handleCreateProblem = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!probTitle.trim() || !probDescription.trim()) {
      setProbError('Problem Title and Description are required.');
      return;
    }

    setProbSubmitting(true);
    setProbError('');
    try {
      const validHints = probHints.map(h => h.trim()).filter(Boolean);

      // Multi-language starter code templates stored as JSON
      const starterCodePayload = probFunctionConfig.templates && Object.keys(probFunctionConfig.templates).length > 0
        ? JSON.stringify(probFunctionConfig.templates)
        : probFunctionConfig.primaryStarterCode || '';

      // Official solutions stored as JSON
      const officialSolPayload = JSON.stringify(probOfficialSolutions);

      // Examples stored as JSON array in sampleInput for multi-example rendering
      const sampleInputPayload = JSON.stringify(probExamples);
      const primarySampleOutput = probExamples[0]?.output || '';

      // Format approach with complexity
      const fullApproach = `${probSolutionApproach.trim()} | Time: ${probTimeComplexity.trim()} | Space: ${probSpaceComplexity.trim()}`;

      const payload = {
        title: probTitle.trim(),
        description: probDescription.trim(),
        difficulty: probDifficulty,
        topic: probTopic.trim() || 'Arrays',
        problemConstraints: probConstraints.trim(),
        sampleInput: sampleInputPayload,
        sampleOutput: primarySampleOutput,
        hints: validHints.length > 0 ? JSON.stringify(validHints) : '',
        starterCode: starterCodePayload,
        solutionCode: officialSolPayload,
        solutionApproach: fullApproach,
        editorial: probEditorial.trim(),
        companies: probCompanies.trim(),
        followUp: probFollowUp.trim()
      };

      const res = await problemApi.createProblem(payload);
      const createdProblem = res.data;

      // Add all defined judge test cases
      if (createdProblem?.id) {
        const validTestCases = probTestCases.filter(tc => tc.inputData.trim() || tc.expectedOutput.trim());
        for (let i = 0; i < validTestCases.length; i++) {
          const tc = validTestCases[i];
          try {
            await testCaseApi.createTestCase(createdProblem.id, {
              inputData: tc.inputData,
              expectedOutput: tc.expectedOutput,
              isHidden: Boolean(tc.isHidden),
              testCaseOrder: i + 1
            });
          } catch (tcErr) {
            console.warn('Test case creation warning:', tcErr);
          }
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
      setActionSuccess(`Problem "${createdProblem.title}" created with full specifications and added to contest selection!`);
    } catch (err) {
      console.error('Failed to create problem:', err);
      setProbError(err.response?.data?.message || err.message || 'Failed to create problem.');
    } finally {
      setProbSubmitting(false);
    }
  };

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

      // Pre-select first 5 problems by default if none selected yet
      setSelectedProblemIds((prev) => {
        if (prev.length > 0) return prev;
        return problemsList.slice(0, 5).map(p => p.id);
      });
    } catch (err) {
      console.error('Failed to load admin contest data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
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

                            {isLive ? (
                              <Link
                                to={`/admin/contests/${c.id}/monitor`}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs animate-pulse"
                              >
                                <Radio className="w-3.5 h-3.5" />
                                <span>Live Video Monitor</span>
                              </Link>
                            ) : isFinished ? (
                              <Link
                                to={`/admin/contests/${c.id}/monitor`}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>View Results</span>
                              </Link>
                            ) : (
                              <Link
                                to={`/admin/contests/${c.id}/monitor`}
                                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                <span>Contest Details</span>
                              </Link>
                            )}
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
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
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
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                    className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
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
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
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
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
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

        {/* ADD NEW PROBLEM MODAL (Complete LeetCode-style specification) */}
        {showProblemModal && createPortal(
          <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border-2 border-slate-300 max-h-[92vh] flex flex-col space-y-4 animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Add New Problem (Full Specifications)</h2>
                    <p className="text-xs text-slate-500">Configure all problem sections (A to F) & auto-select it for this contest.</p>
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

              {/* Section Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 border-b border-slate-100 scrollbar-none">
                {[
                  { key: 'A', label: 'A. Basic Info', icon: FileText },
                  { key: 'B', label: 'B. Description & Examples', icon: BookOpen },
                  { key: 'C', label: 'C. Function Signature', icon: Code2 },
                  { key: 'D', label: 'D. Test Cases', icon: CheckCircle2 },
                  { key: 'E', label: 'E. Hints & Editorial', icon: Lightbulb },
                  { key: 'F', label: 'F. Official Solution', icon: Sparkles }
                ].map((sec) => {
                  const Icon = sec.icon;
                  const isActive = probActiveSection === sec.key;
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => setProbActiveSection(sec.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isActive
                          ? 'bg-[#0D684D] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>

              {probError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{probError}</span>
                </div>
              )}

              {/* Scrollable Form Content */}
              <form onSubmit={handleCreateProblem} className="flex-1 overflow-y-auto pr-1 space-y-4">
                {/* SECTION A: BASIC INFO */}
                {probActiveSection === 'A' && (
                  <div className="space-y-4">
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
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Difficulty *
                        </label>
                        <div className="grid grid-cols-3 gap-1.5 h-[42px] items-center">
                          {[
                            { id: 'EASY', label: 'EASY', activeClass: 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-sm' },
                            { id: 'MEDIUM', label: 'MEDIUM', activeClass: 'bg-amber-500 text-white border-amber-500 font-extrabold shadow-sm' },
                            { id: 'HARD', label: 'HARD', activeClass: 'bg-rose-600 text-white border-rose-600 font-extrabold shadow-sm' },
                          ].map((d) => (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => setProbDifficulty(d.id)}
                              className={`h-full px-2 rounded-xl border text-xs transition-all flex items-center justify-center ${
                                probDifficulty === d.id
                                  ? d.activeClass
                                  : 'bg-white border-slate-300 text-slate-800 font-bold hover:bg-slate-50 hover:border-slate-400'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        URL Slug / Problem ID (Auto-Generated)
                      </label>
                      <input
                        type="text"
                        value={probSlug}
                        onChange={(e) => {
                          setProbSlug(e.target.value);
                          setProbSlugCustomized(true);
                        }}
                        placeholder="e.g. invert-binary-tree"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Topic */}
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
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
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
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                      />
                    </div>

                    {/* Companies */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Target Companies (Optional)
                      </label>
                      <input
                        type="text"
                        value={probCompanies}
                        onChange={(e) => setProbCompanies(e.target.value)}
                        placeholder="e.g. Google, Amazon, Meta, Microsoft (comma separated)"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* SECTION B: DESCRIPTION & EXAMPLES */}
                {probActiveSection === 'B' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Problem Statement *
                      </label>
                      <ProblemDescriptionEditor
                        value={probDescription}
                        onChange={setProbDescription}
                        placeholder="Write the problem statement using Markdown or rich formatting..."
                      />
                    </div>

                    {/* Dynamic Examples */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Examples ({probExamples.length})
                          </h4>
                          <p className="text-[11px] text-slate-500">Add dynamic input/output examples for contestant clarity</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddExample}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Example</span>
                        </button>
                      </div>

                      {probExamples.map((ex, idx) => (
                        <div key={ex.id || idx} className="p-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/70 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">Example {idx + 1}</span>
                            {probExamples.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveExample(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1 text-xs font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Input</label>
                              <input
                                type="text"
                                value={ex.input}
                                onChange={(e) => handleExampleChange(idx, 'input', e.target.value)}
                                placeholder="nums = [2,7,11,15], target = 9"
                                style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Output</label>
                              <input
                                type="text"
                                value={ex.output}
                                onChange={(e) => handleExampleChange(idx, 'output', e.target.value)}
                                placeholder="[0,1]"
                                style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Explanation (Optional)</label>
                            <input
                              type="text"
                              value={ex.explanation}
                              onChange={(e) => handleExampleChange(idx, 'explanation', e.target.value)}
                              placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                              style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Constraints */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Constraints (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={probConstraints}
                        onChange={(e) => setProbConstraints(e.target.value)}
                        placeholder="2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Follow-up */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Follow-up Question (Optional)
                      </label>
                      <input
                        type="text"
                        value={probFollowUp}
                        onChange={(e) => setProbFollowUp(e.target.value)}
                        placeholder="e.g. Can you come up with an algorithm that is less than O(n^2) time complexity?"
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* SECTION C: FUNCTION SIGNATURE */}
                {probActiveSection === 'C' && (
                  <div className="space-y-4">
                    <FunctionSignatureConfig
                      config={probFunctionConfig}
                      onChange={setProbFunctionConfig}
                      problemTitle={probTitle}
                    />
                  </div>
                )}

                {/* SECTION D: TEST CASES */}
                {probActiveSection === 'D' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Judge Evaluation Test Cases ({probTestCases.length})
                        </h4>
                        <p className="text-[11px] text-slate-500">Provide sample and hidden judge test cases for automatic submission grading.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSyncExamplesToTestCases}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sync from Examples</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAddTestCase}
                          className="px-3 py-1.5 rounded-lg bg-[#0D684D] text-white text-xs font-bold hover:bg-[#0A543E] flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Test Case</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {probTestCases.map((tc, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border-2 border-slate-300 bg-white space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">Test Case #{idx + 1}</span>
                              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden}
                                  onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span>Hidden Test Case</span>
                              </label>
                            </div>
                            {probTestCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTestCase(idx)}
                                className="text-rose-600 hover:text-rose-800 p-1 text-xs font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Input Data</label>
                              <textarea
                                rows={2}
                                value={tc.inputData}
                                onChange={(e) => handleTestCaseChange(idx, 'inputData', e.target.value)}
                                placeholder="[2,7,11,15]&#10;9"
                                style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Expected Output</label>
                              <textarea
                                rows={2}
                                value={tc.expectedOutput}
                                onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                placeholder="[0,1]"
                                style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION E: HINTS & EDITORIAL */}
                {probActiveSection === 'E' && (
                  <div className="space-y-4">
                    {/* Hints */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Hints ({probHints.length})
                        </label>
                        <button
                          type="button"
                          onClick={handleAddHint}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Hint</span>
                        </button>
                      </div>
                      {probHints.map((hint, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-6 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={hint}
                            onChange={(e) => handleHintChange(idx, e.target.value)}
                            placeholder={`Hint #${idx + 1}`}
                            style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                            className="flex-1 px-3 py-1.5 rounded-lg border-2 border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          {probHints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHint(idx)}
                              className="p-2 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Complexity & Approach */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Solution Approach
                        </label>
                        <input
                          type="text"
                          value={probSolutionApproach}
                          onChange={(e) => setProbSolutionApproach(e.target.value)}
                          placeholder="e.g. One-pass Hash Table"
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Time Complexity
                        </label>
                        <input
                          type="text"
                          value={probTimeComplexity}
                          onChange={(e) => setProbTimeComplexity(e.target.value)}
                          placeholder="e.g. O(n)"
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                          Space Complexity
                        </label>
                        <input
                          type="text"
                          value={probSpaceComplexity}
                          onChange={(e) => setProbSpaceComplexity(e.target.value)}
                          placeholder="e.g. O(n)"
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Editorial */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Detailed Editorial & Intuition Walkthrough
                      </label>
                      <textarea
                        rows={4}
                        value={probEditorial}
                        onChange={(e) => setProbEditorial(e.target.value)}
                        placeholder="Explain the intuition, algorithm breakdown, edge case handling, and step-by-step reasoning..."
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* SECTION F: OFFICIAL SOLUTION */}
                {probActiveSection === 'F' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs">
                      <p className="font-semibold">Working reference solution uploaded by Admin for each language (distinct from auto-generated starter code).</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">Function signatures from Section C are automatically loaded below ready for implementation.</p>
                    </div>

                    {/* Language Tabs */}
                    <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                      {['JAVA', 'CPP', 'C', 'PYTHON', 'JAVASCRIPT'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setProbSolutionTab(lang)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            probSolutionTab === lang
                              ? 'bg-[#0D684D] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {lang === 'CPP' ? 'C++' : lang === 'JAVASCRIPT' ? 'JavaScript' : lang.charAt(0) + lang.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>

                    <div>
                      <textarea
                        rows={9}
                        value={probOfficialSolutions[probSolutionTab] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProbOfficialSolutions(prev => ({ ...prev, [probSolutionTab]: val }));
                          setProbManualSolutionEdit(prev => ({ ...prev, [probSolutionTab]: true }));
                        }}
                        placeholder={`// Enter official working ${probSolutionTab} solution code here...`}
                        style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                        className="w-full p-4 rounded-xl border-2 border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Section Navigation Footer & Submit */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 shrink-0">
                  <div className="flex items-center gap-2">
                    {probActiveSection !== 'A' && (
                      <button
                        type="button"
                        onClick={() => {
                          const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
                          const curIdx = keys.indexOf(probActiveSection);
                          if (curIdx > 0) setProbActiveSection(keys[curIdx - 1]);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                      >
                        ← Previous Section
                      </button>
                    )}
                    {probActiveSection !== 'F' && (
                      <button
                        type="button"
                        onClick={() => {
                          const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
                          const curIdx = keys.indexOf(probActiveSection);
                          if (curIdx < keys.length - 1) setProbActiveSection(keys[curIdx + 1]);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                      >
                        Next Section →
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
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
                          <span>Save & Add to Contest</span>
                        </>
                      )}
                    </button>
                  </div>
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
