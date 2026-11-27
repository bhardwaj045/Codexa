import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { problemApi } from '../api/problemApi';
import { testCaseApi } from '../api/testCaseApi';
import { AppLayout } from '../components/AppLayout';
import { ProblemDescriptionEditor } from '../components/LeetCodeDescriptionEditor';
import { FunctionSignatureConfig } from '../components/LeetCodeFunctionSignatureConfig';
import { generateSlug, SUPPORTED_LANGUAGES } from '../utils/codeSignatureGenerator';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Copy, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  Code2, 
  Check, 
  Lightbulb, 
  FileText, 
  Building, 
  BookOpen,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle
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

export const AdminProblemFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const [activeSection, setActiveSection] = useState('A'); // 'A', 'B', 'C', 'D', 'E', 'F'
  
  // Section A: Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugCustomized, setSlugCustomized] = useState(false);
  const [difficulty, setDifficulty] = useState('EASY');
  const [topic, setTopic] = useState('Arrays');
  const [companies, setCompanies] = useState('');

  // Section B: Description & Examples
  const [description, setDescription] = useState('');
  const [examples, setExamples] = useState([
    {
      id: 1,
      input: '',
      output: '',
      explanation: ''
    }
  ]);
  const [constraints, setConstraints] = useState('');
  const [followUp, setFollowUp] = useState('');

  // Section C: Function Signature & Starter Code
  const [functionConfig, setFunctionConfig] = useState({
    functionName: '',
    returnType: 'int',
    parameters: [],
    templates: {},
    primaryStarterCode: ''
  });

  // Section D: Test Cases
  const [testCases, setTestCases] = useState([
    { inputData: '', expectedOutput: '', isHidden: false }
  ]);

  // Section E: Hints & Editorial
  const [hints, setHints] = useState(['']);
  const [solutionApproach, setSolutionApproach] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [editorial, setEditorial] = useState('');

  // Section F: Official Reference Solutions (Per language)
  const [officialSolutions, setOfficialSolutions] = useState({
    JAVA: '',
    CPP: '',
    PYTHON: '',
    JAVASCRIPT: '',
    C: ''
  });
  const [solutionTab, setSolutionTab] = useState('JAVA');
  const [manualSolutionEdit, setManualSolutionEdit] = useState({});

  // AUTOMATED FETCH: Automatically sync generated function signatures from Section C to Section F without requiring a button
  useEffect(() => {
    if (functionConfig?.templates && Object.keys(functionConfig.templates).length > 0) {
      setOfficialSolutions(prev => {
        let changed = false;
        const next = { ...prev };
        Object.entries(functionConfig.templates).forEach(([lang, templateCode]) => {
          // If the admin hasn't manually customized this specific solution yet, or if it's empty, auto-populate from Section C
          if (!manualSolutionEdit[lang] || !next[lang] || next[lang].trim() === '') {
            if (next[lang] !== templateCode) {
              next[lang] = templateCode;
              changed = true;
            }
          }
        });
        return changed ? next : prev;
      });
    }
  }, [functionConfig.templates, manualSolutionEdit]);

  // Preview State
  const [previewLang, setPreviewLang] = useState('JAVA');
  const [previewCode, setPreviewCode] = useState('');

  // Form State
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      loadProblemData();
    }
  }, [id]);

  // Automatically update slug when title changes (unless admin custom edited slug)
  useEffect(() => {
    if (!slugCustomized && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugCustomized]);

  const loadProblemData = async () => {
    setLoading(true);
    try {
      const probRes = await problemApi.getProblemById(id);
      const prob = probRes.data;

      setTitle(prob.title || '');
      setSlug(generateSlug(prob.title || ''));
      setDifficulty(prob.difficulty || 'EASY');
      setTopic(prob.topic || 'Arrays');
      setCompanies(prob.companies || '');
      setDescription(prob.description || '');
      setConstraints(prob.problemConstraints || '');
      setFollowUp(prob.followUp || '');
      setEditorial(prob.editorial || '');
      setSolutionApproach(prob.solutionApproach || '');

      // Parse sampleInput as multiple examples if stored in JSON format
      if (prob.sampleInput) {
        try {
          const parsedEx = JSON.parse(prob.sampleInput);
          if (Array.isArray(parsedEx) && parsedEx.length > 0) {
            setExamples(parsedEx);
          } else {
            setExamples([{ id: 1, input: prob.sampleInput, output: prob.sampleOutput || '', explanation: '' }]);
          }
        } catch {
          setExamples([{ id: 1, input: prob.sampleInput, output: prob.sampleOutput || '', explanation: '' }]);
        }
      }

      // Parse hints
      if (prob.hints) {
        try {
          const parsed = JSON.parse(prob.hints);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHints(parsed);
          } else {
            const lines = prob.hints.split('\n').filter(Boolean);
            setHints(lines.length > 0 ? lines : ['']);
          }
        } catch {
          const lines = prob.hints.split('\n').filter(Boolean);
          setHints(lines.length > 0 ? lines : ['']);
        }
      }

      // Parse multi-language starter code templates
      if (prob.starterCode) {
        try {
          const parsedTemplates = JSON.parse(prob.starterCode);
          if (parsedTemplates && typeof parsedTemplates === 'object') {
            setFunctionConfig(prev => ({
              ...prev,
              templates: parsedTemplates,
              primaryStarterCode: parsedTemplates.JAVA || parsedTemplates.PYTHON || Object.values(parsedTemplates)[0]
            }));
          }
        } catch {
          setFunctionConfig(prev => ({ ...prev, primaryStarterCode: prob.starterCode }));
        }
      }

      // Parse official solution code
      if (prob.solutionCode) {
        try {
          const parsedSol = JSON.parse(prob.solutionCode);
          if (parsedSol && typeof parsedSol === 'object') {
            setOfficialSolutions(prev => ({ ...prev, ...parsedSol }));
            const edits = {};
            Object.keys(parsedSol).forEach(k => {
              if (parsedSol[k]?.trim()) edits[k] = true;
            });
            setManualSolutionEdit(edits);
          } else {
            setOfficialSolutions(prev => ({ ...prev, JAVA: prob.solutionCode }));
            if (prob.solutionCode?.trim()) setManualSolutionEdit({ JAVA: true });
          }
        } catch {
          setOfficialSolutions(prev => ({ ...prev, JAVA: prob.solutionCode }));
          if (prob.solutionCode?.trim()) setManualSolutionEdit({ JAVA: true });
        }
      }

      // Load test cases
      const tcRes = await testCaseApi.getTestCases(id, true);
      if (tcRes.data && tcRes.data.length > 0) {
        setTestCases(
          tcRes.data.map((tc) => ({
            id: tc.id,
            inputData: tc.inputData || '',
            expectedOutput: tc.expectedOutput || '',
            isHidden: Boolean(tc.isHidden)
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load problem data', err);
      setFormError('Failed to load problem data from server.');
    } finally {
      setLoading(false);
    }
  };

  // Multiple Examples Handlers
  const handleAddExample = () => {
    setExamples(prev => [
      ...prev,
      {
        id: prev.length + 1,
        input: '',
        output: '',
        explanation: ''
      }
    ]);
  };

  const handleRemoveExample = (idx) => {
    if (examples.length === 1) return;
    setExamples(prev => prev.filter((_, i) => i !== idx).map((ex, newIdx) => ({ ...ex, id: newIdx + 1 })));
  };

  const handleExampleChange = (idx, field, val) => {
    setExamples(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Sync Examples to Test Cases
  const handleSyncExamplesToTestCases = () => {
    const newCases = examples
      .filter(ex => ex.input.trim() || ex.output.trim())
      .map((ex, idx) => ({
        inputData: ex.input.trim(),
        expectedOutput: ex.output.trim(),
        isHidden: idx > 0 // First is sample, others can be marked hidden or sample
      }));

    if (newCases.length > 0) {
      setTestCases(newCases);
    }
  };

  // Hint operations
  const handleAddHint = () => setHints(prev => [...prev, '']);
  const handleRemoveHint = (idx) => {
    if (hints.length === 1) {
      setHints(['']);
      return;
    }
    setHints(prev => prev.filter((_, i) => i !== idx));
  };
  const handleHintChange = (idx, val) => {
    setHints(prev => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  // Test Case operations
  const handleAddTestCase = () => {
    setTestCases(prev => [
      ...prev,
      { inputData: '', expectedOutput: '', isHidden: false }
    ]);
  };
  const handleRemoveTestCase = (idx) => {
    if (testCases.length === 1) return;
    setTestCases(prev => prev.filter((_, i) => i !== idx));
  };
  const handleTestCaseChange = (idx, field, val) => {
    setTestCases(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !description.trim()) {
      setFormError('Problem Title and Description are required.');
      return;
    }

    setLoading(true);
    setStatusMessage('Saving problem definition & starter code...');

    try {
      // Clean hints
      const validHints = hints.map(h => h.trim()).filter(Boolean);

      // Multi-language starter code templates stored as JSON
      const starterCodePayload = functionConfig.templates && Object.keys(functionConfig.templates).length > 0
        ? JSON.stringify(functionConfig.templates)
        : functionConfig.primaryStarterCode || '';

      // Official solutions stored as JSON
      const officialSolPayload = JSON.stringify(officialSolutions);

      // Examples stored as JSON array in sampleInput for multi-example rendering
      const sampleInputPayload = JSON.stringify(examples);
      const primarySampleOutput = examples[0]?.output || '';

      // Format approach with complexity
      const fullApproach = `${solutionApproach.trim()} | Time: ${timeComplexity.trim()} | Space: ${spaceComplexity.trim()}`;

      const payload = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        topic: topic.trim() || 'Arrays',
        problemConstraints: constraints.trim(),
        sampleInput: sampleInputPayload,
        sampleOutput: primarySampleOutput,
        hints: validHints.length > 0 ? JSON.stringify(validHints) : '',
        starterCode: starterCodePayload,
        solutionCode: officialSolPayload,
        solutionApproach: fullApproach,
        editorial: editorial.trim(),
        companies: companies.trim(),
        followUp: followUp.trim()
      };

      let savedProblemId = id;
      if (isEditMode) {
        await problemApi.updateProblem(id, payload);
      } else {
        const createRes = await problemApi.createProblem(payload);
        savedProblemId = createRes.data.id;
      }

      // Sync test cases
      setStatusMessage('Syncing judge test cases...');
      const validTestCases = testCases.filter(tc => tc.inputData.trim() || tc.expectedOutput.trim());
      for (let i = 0; i < validTestCases.length; i++) {
        const tc = validTestCases[i];
        if (tc.id) {
          await testCaseApi.updateTestCase(tc.id, {
            inputData: tc.inputData,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            testCaseOrder: i + 1
          });
        } else {
          await testCaseApi.createTestCase(savedProblemId, {
            inputData: tc.inputData,
            expectedOutput: tc.expectedOutput,
            isHidden: tc.isHidden,
            testCaseOrder: i + 1
          });
        }
      }

      navigate('/admin/problems');
    } catch (err) {
      console.error('Failed to save problem:', err);
      setFormError(err.response?.data?.message || err.message || 'Error saving problem.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const sectionsList = [
    { id: 'A', label: 'Basic Info', icon: FileText },
    { id: 'B', label: 'Description & Examples', icon: BookOpen },
    { id: 'C', label: 'Function Signature', icon: Code2 },
    { id: 'D', label: 'Test Cases', icon: Layers },
    { id: 'E', label: 'Hints & Editorial', icon: Lightbulb },
    { id: 'F', label: 'Solutions', icon: Sparkles }
  ];

  return (
    <AppLayout title={isEditMode ? 'Edit Problem' : 'Create Problem'}>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Problem' : 'Create Problem'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Automated multi-language function signature generation, rich description formatting, dynamic test cases, and editorial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/problems"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Problems</span>
            </Link>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Form Editor</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewCode(functionConfig.templates[previewLang] || functionConfig.primaryStarterCode);
                  setActiveTab('preview');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Contestant View</span>
              </button>
            </div>
          </div>
        </div>

        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* SECTION NAVIGATION PILL BAR */}
        {activeTab === 'editor' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 scrollbar-none">
            {sectionsList.map(sec => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(sec.id);
                    document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    active
                      ? 'bg-[#0D684D] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.id}. {sec.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 1: FORM EDITOR */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ============================================================== */}
            {/* SECTION A: BASIC INFORMATION                                   */}
            {/* ============================================================== */}
            <div id="section-A" className="bg-white rounded-3xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Section A: Basic Information</h3>
                    <p className="text-xs text-slate-500">Core problem title, URL slug, difficulty, and algorithmic tags.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Problem Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Two Sum"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Problem Slug (Auto-generated) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Problem Slug (URL)
                    </label>
                    <button
                      type="button"
                      onClick={() => setSlugCustomized(!slugCustomized)}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold"
                    >
                      {slugCustomized ? 'Auto-generate' : 'Customize'}
                    </button>
                  </div>
                  <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden px-3 py-2">
                    <span className="text-xs text-slate-400 font-mono select-none">/problems/</span>
                    <input
                      type="text"
                      disabled={!slugCustomized}
                      value={slug}
                      onChange={(e) => {
                        setSlugCustomized(true);
                        setSlug(e.target.value);
                      }}
                      style={{ color: '#0f172a', opacity: 1 }}
                      className="bg-transparent text-slate-900 font-mono text-xs flex-1 focus:outline-none disabled:opacity-75 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty & Quick Badge Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Difficulty Level *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'EASY', label: 'EASY', activeClass: 'bg-emerald-100 text-emerald-950 border-emerald-500 ring-2 ring-emerald-500/20' },
                    { id: 'MEDIUM', label: 'MEDIUM', activeClass: 'bg-amber-100 text-amber-950 border-amber-500 ring-2 ring-amber-500/20' },
                    { id: 'HARD', label: 'HARD', activeClass: 'bg-rose-100 text-rose-950 border-rose-500 ring-2 ring-rose-500/20' },
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                        difficulty === d.id
                          ? d.activeClass
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                      }`}
                    >
                      <span>{d.label}</span>
                      {difficulty === d.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic & Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Topic / Algorithmic Category
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {POPULAR_TOPICS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all ${
                        topic === t
                          ? 'bg-[#0D684D] text-white border-[#0D684D] shadow-2xs font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Or enter custom category (e.g. Backtracking, Trie, Segment Tree)"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Companies */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Companies (Optional)
                </label>
                <input
                  type="text"
                  value={companies}
                  onChange={(e) => setCompanies(e.target.value)}
                  placeholder="e.g. Google, Amazon, Meta, Microsoft, Apple, Uber"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION B: PROBLEM DESCRIPTION & EXAMPLES                      */}
            {/* ============================================================== */}
            <div id="section-B" className="bg-white rounded-3xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Section B: Problem Description & Examples</h3>
                    <p className="text-xs text-slate-500">Rich text problem statement, multiple dynamic examples, and constraints.</p>
                  </div>
                </div>
              </div>

              {/* Rich Markdown Description Editor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Problem Statement (Rich Text Editor) *
                </label>
                <ProblemDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  placeholder={`Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.`}
                  rows={8}
                />
              </div>

              {/* Dynamic Multiple Examples Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Problem Examples ({examples.length})
                    </h4>
                    <p className="text-[11px] text-slate-400">Multiple input/output examples shown to students.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[#0D684D] hover:bg-emerald-100 text-xs font-bold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Example</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {examples.map((ex, exIdx) => (
                    <div 
                      key={ex.id || exIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                            {exIdx + 1}
                          </span>
                          <span>Example {exIdx + 1}</span>
                        </span>

                        {examples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveExample(exIdx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete example"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Input
                          </label>
                          <textarea
                            rows={2}
                            value={ex.input}
                            onChange={(e) => handleExampleChange(exIdx, 'input', e.target.value)}
                            placeholder="nums = [2,7,11,15], target = 9"
                            style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Output
                          </label>
                          <textarea
                            rows={2}
                            value={ex.output}
                            onChange={(e) => handleExampleChange(exIdx, 'output', e.target.value)}
                            placeholder="[0,1]"
                            style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Explanation (Optional)
                        </label>
                        <input
                          type="text"
                          value={ex.explanation}
                          onChange={(e) => handleExampleChange(exIdx, 'explanation', e.target.value)}
                          placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Constraints (One per line)
                </label>
                <textarea
                  rows={3}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder={`2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.`}
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Follow-up Question (Optional)
                </label>
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="e.g. Can you come up with an algorithm that is less than O(n^2) time complexity?"
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION C: AUTOMATIC FUNCTION SIGNATURE & STARTER CODE         */}
            {/* ============================================================== */}
            <div id="section-C" className="bg-white rounded-3xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center font-bold">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Section C: Function Signature & Starter Code</h3>
                    <p className="text-xs text-slate-500">
                      Configure function name, return type & parameters once. Templates for Java, C++, C, Python, and JavaScript generate automatically!
                    </p>
                  </div>
                </div>
              </div>

              <FunctionSignatureConfig
                config={functionConfig}
                initialFunctionName={functionConfig.functionName}
                initialReturnType={functionConfig.returnType}
                initialParameters={functionConfig.parameters}
                initialTemplates={functionConfig.templates}
                onChange={setFunctionConfig}
              />
            </div>

            {/* ============================================================== */}
            {/* SECTION D: TEST CASES                                          */}
            {/* ============================================================== */}
            <div id="section-D" className="bg-white rounded-3xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Section D: Judge Test Cases ({testCases.length})</h3>
                    <p className="text-xs text-slate-500">Test cases evaluated by the automated judge to grade student submissions.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncExamplesToTestCases}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D684D] hover:bg-emerald-100 text-xs font-bold transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sync From Examples</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Test Case</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {testCases.map((tc, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                      tc.isHidden 
                        ? 'bg-slate-50/80 border-slate-300' 
                        : 'bg-emerald-50/40 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Test Case #{idx + 1}
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 select-none ml-2">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className={tc.isHidden ? 'text-amber-800 font-bold' : 'text-slate-600'}>
                            {tc.isHidden ? '🔒 Hidden Case' : '👁️ Sample Case'}
                          </span>
                        </label>
                      </div>

                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete test case"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Input Data (passed to stdIn)
                        </label>
                        <textarea
                          rows={2}
                          value={tc.inputData}
                          onChange={(e) => handleTestCaseChange(idx, 'inputData', e.target.value)}
                          placeholder="e.g. [2,7,11,15]\n9"
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Expected Output (asserted against stdOut)
                        </label>
                        <textarea
                          rows={2}
                          value={tc.expectedOutput}
                          onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                          placeholder="e.g. [0,1]"
                          style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION E: HINTS AND EDITORIAL                                 */}
            {/* ============================================================== */}
            <div id="section-E" className="bg-white rounded-3xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Section E: Hints & Editorial</h3>
                    <p className="text-xs text-slate-500">Progressive hints and optimal complexity analysis.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddHint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Hint</span>
                </button>
              </div>

              {/* Progressive Hints */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Progressive Hints ({hints.length})
                </label>
                {hints.map((hText, hIdx) => (
                  <div key={hIdx} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200 flex items-center gap-3">
                    <span className="text-xs font-bold text-amber-800 shrink-0">
                      Hint {hIdx + 1}:
                    </span>
                    <input
                      type="text"
                      value={hText}
                      onChange={(e) => handleHintChange(hIdx, e.target.value)}
                      placeholder={`Enter clue for Hint ${hIdx + 1}...`}
                      style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {hints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHint(hIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Approach & Complexity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Approach Name
                  </label>
                  <input
                    type="text"
                    value={solutionApproach}
                    onChange={(e) => setSolutionApproach(e.target.value)}
                    placeholder="e.g. One-pass Hash Map"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    value={timeComplexity}
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    placeholder="e.g. O(n)"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    value={spaceComplexity}
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    placeholder="e.g. O(n)"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Editorial Walkthrough */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Solution Explanation / Editorial Walkthrough
                </label>
                <textarea
                  rows={5}
                  value={editorial}
                  onChange={(e) => setEditorial(e.target.value)}
                  placeholder="Explain why naive brute-force is insufficient, and walk through how the optimal algorithm solves it step-by-step..."
                  style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1 }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* ============================================================== */}
            {/* SECTION F: OFFICIAL SOLUTION CODE                              */}
            {/* ============================================================== */}
            <div id="section-F" className="bg-white rounded-3xl border border-slate-300 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0D684D] border border-emerald-200 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Section F: Official Reference Solutions</h3>
                    <p className="text-xs text-slate-500">
                      Working reference solution uploaded by Admin for each language (distinct from auto-generated starter code).
                    </p>
                  </div>
                </div>
              </div>

              {/* Multi-language Solution Tabs & High-Contrast White Editor */}
              <div className="rounded-2xl border-2 border-slate-400 overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setSolutionTab(lang.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          solutionTab === lang.id
                            ? 'bg-[#0D684D] text-white shadow-xs font-bold'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 font-semibold">Official Solution Code</span>
                </div>

                <div className="relative bg-white">
                  <textarea
                    rows={12}
                    value={officialSolutions[solutionTab] || ''}
                    onChange={(e) => {
                      setManualSolutionEdit(prev => ({ ...prev, [solutionTab]: true }));
                      setOfficialSolutions(prev => ({ ...prev, [solutionTab]: e.target.value }));
                    }}
                    placeholder={`// Write official ${solutionTab} solution here...`}
                    spellCheck="false"
                    style={{ color: '#0f172a', backgroundColor: '#ffffff', opacity: 1, caretColor: '#0f172a' }}
                    className="w-full p-4 font-mono text-xs sm:text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed resize-y font-semibold selection:bg-[#0D684D] selection:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON BAR */}
            <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-40 backdrop-blur-md">
              <div className="text-xs text-slate-500">
                {statusMessage || 'All required fields validated. Multi-language starter templates generated.'}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/admin/problems"
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all hover:scale-105"
                >
                  {loading ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{isEditMode ? 'Update Problem' : 'Create & Publish Problem'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: CONTESTANT WORKSPACE LIVE PREVIEW */}
        {activeTab === 'preview' && (
          <div className="rounded-3xl border border-slate-300 bg-white overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 min-h-[600px]">
            {/* Left Column: Problem Statement & Examples */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[750px]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    difficulty === 'EASY'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : difficulty === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {difficulty}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">• {topic}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {title || 'Untitled Problem'}
                </h2>
              </div>

              {/* Problem Description */}
              <div className="text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {description || 'No problem statement provided yet.'}
              </div>

              {/* Multiple Examples Display */}
              <div className="space-y-4">
                {examples.map((ex, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">Example {idx + 1}:</p>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs space-y-1">
                      <p><strong className="text-slate-500">Input: </strong><span className="text-slate-900 font-bold">{ex.input}</span></p>
                      <p><strong className="text-slate-500">Output: </strong><span className="text-slate-900 font-bold">{ex.output}</span></p>
                      {ex.explanation && (
                        <p className="pt-1 text-[11px] font-sans text-slate-600">
                          <strong className="text-slate-500 font-sans">Explanation: </strong>{ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800">Constraints:</p>
                <ul className="list-disc list-inside space-y-1 font-mono text-xs text-slate-700">
                  {constraints.split('\n').filter(Boolean).map((c, cIdx) => (
                    <li key={cIdx}>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up */}
              {followUp && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
                  <strong className="text-slate-900">Follow-up: </strong>{followUp}
                </div>
              )}
            </div>

            {/* Right Column: Code Editor & Auto-Generated Signature */}
            <div className="bg-slate-950 flex flex-col justify-between">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setPreviewLang(lang.id);
                        setPreviewCode(functionConfig.templates[lang.id] || '');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        previewLang === lang.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Auto-Signature
                </span>
              </div>

              <div className="p-4 flex-1">
                <pre className="font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed overflow-x-auto">
                  <code>{previewCode || functionConfig.templates[previewLang] || '// Select a language to view generated starter code'}</code>
                </pre>
              </div>

              <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Contestant code workspace preview</span>
                <span>Language: {previewLang}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
