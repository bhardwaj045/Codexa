import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { problemApi } from '../api/problemApi';
import { testCaseApi } from '../api/testCaseApi';
import { AppLayout } from '../components/AppLayout';
import { Plus, Trash2, Eye, Edit3, Copy, ArrowLeft, Layers, CheckCircle2, Code2, Check, Lightbulb, FileText, Building, BookOpen } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    topic: 'Arrays',
    problemConstraints: '',
    sampleInput: '',
    sampleOutput: '',
    solutionCode: '',
    solutionApproach: '',
    editorial: '',
    starterCode: '',
    companies: '',
    followUp: ''
  });

  const [hints, setHints] = useState(['']);
  const [testCases, setTestCases] = useState([
    { inputData: '', expectedOutput: '', isHidden: false }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedPreviewCode, setCopiedPreviewCode] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadProblemAndTestCases();
    }
  }, [id]);

  const loadProblemAndTestCases = async () => {
    setLoading(true);
    try {
      const probRes = await problemApi.getProblemById(id);
      const prob = probRes.data;
      setFormData({
        title: prob.title || '',
        description: prob.description || '',
        difficulty: prob.difficulty || 'EASY',
        topic: prob.topic || 'Arrays',
        problemConstraints: prob.problemConstraints || '',
        sampleInput: prob.sampleInput || '',
        sampleOutput: prob.sampleOutput || '',
        solutionCode: prob.solutionCode || '',
        solutionApproach: prob.solutionApproach || '',
        editorial: prob.editorial || '',
        starterCode: prob.starterCode || '',
        companies: prob.companies || '',
        followUp: prob.followUp || ''
      });

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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (topic) => {
    setFormData((prev) => ({ ...prev, topic }));
  };

  // Hint operations
  const handleAddHint = () => {
    setHints((prev) => [...prev, '']);
  };

  const handleRemoveHint = (index) => {
    if (hints.length === 1) {
      setHints(['']);
      return;
    }
    setHints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHintChange = (index, value) => {
    setHints((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // TestCase operations
  const handleAddTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { inputData: '', expectedOutput: '', isHidden: false }
    ]);
  };

  const handleRemoveTestCase = (index) => {
    if (testCases.length === 1) return;
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    setTestCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSyncSampleToTestCase = () => {
    if (!formData.sampleInput && !formData.sampleOutput) return;
    setTestCases((prev) => [
      {
        inputData: formData.sampleInput || '',
        expectedOutput: formData.sampleOutput || '',
        isHidden: false
      },
      ...prev.filter((tc) => tc.inputData.trim() || tc.expectedOutput.trim())
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('Saving problem details...');

    try {
      const validHints = hints.map((h) => h.trim()).filter(Boolean);
      const payload = {
        ...formData,
        hints: validHints.length > 0 ? JSON.stringify(validHints) : ''
      };

      let savedProblemId = id;
      if (isEditMode) {
        await problemApi.updateProblem(id, payload);
      } else {
        const createRes = await problemApi.createProblem(payload);
        savedProblemId = createRes.data.id;
      }

      // Save test cases
      setStatusMessage('Syncing test cases...');
      const validCases = testCases.filter((tc) => tc.inputData.trim() || tc.expectedOutput.trim());
      for (let i = 0; i < validCases.length; i++) {
        const tc = validCases[i];
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
      console.error('Failed to save problem', err);
      alert('Error saving problem: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <AppLayout title={isEditMode ? 'Edit Problem' : 'Add Problem'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* TOP TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Problem' : 'Create a Problem'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure problem statements, test cases, progressive hints, reference solutions, and editorial.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/problems"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Problems</span>
            </Link>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: FORM EDITOR */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CARD 1: GENERAL INFO */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#0D684D]" />
                <h3 className="text-sm font-bold text-slate-900">General Information</h3>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Problem Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Two Sum"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Problem Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the problem, input format, return format, and background..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              {/* Difficulty and Topic row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Difficulty <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Topic / Category
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Arrays, Hash Table"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Quick Select Topics */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Popular Topics:
                </span>
                {POPULAR_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleSelectTopic(topic)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      formData.topic === topic
                        ? 'bg-emerald-50 border-emerald-200 text-[#0D684D] font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* CARD 2: CONSTRAINTS, SAMPLE I/O & FOLLOW-UP */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers className="w-4 h-4 text-[#0D684D]" />
                <h3 className="text-sm font-bold text-slate-900">Constraints, Sample I/O & Follow-up</h3>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Constraints (one per line)
                </label>
                <textarea
                  rows={3}
                  value={formData.problemConstraints}
                  onChange={(e) => setFormData({ ...formData, problemConstraints: e.target.value })}
                  placeholder={`2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all leading-relaxed"
                />
              </div>

              {/* Sample Input and Output */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Sample Input
                  </label>
                  <textarea
                    rows={4}
                    value={formData.sampleInput}
                    onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                    placeholder={`nums = [2,7,11,15], target = 9`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Sample Output
                  </label>
                  <textarea
                    rows={4}
                    value={formData.sampleOutput}
                    onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                    placeholder={`[0,1]`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Follow-up question */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Follow-up Challenge (Optional)
                </label>
                <input
                  type="text"
                  value={formData.followUp}
                  onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                  placeholder="e.g. Can you come up with an algorithm that is less than O(n^2) time complexity?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* CARD 3: LEETCODE PROGRESSIVE HINTS */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Progressive Hints ({hints.filter((h) => h.trim()).length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hints revealed progressively to students as Hint 1, Hint 2, etc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddHint}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Hint
                </button>
              </div>

              <div className="space-y-4">
                {hints.map((hintText, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        Hint {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHint(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete hint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={hintText}
                      onChange={(e) => handleHintChange(idx, e.target.value)}
                      placeholder={`Enter hint text for Hint ${idx + 1}...`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-500 transition-all leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 4: SOLUTION CODE & OPTIMAL APPROACH */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Code2 className="w-4 h-4 text-[#0D684D]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reference Solution Code & Approach</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official solution displayed in the "Solutions" tab of the coding workspace.
                  </p>
                </div>
              </div>

              {/* Solution Approach & Complexity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Approach Summary & Time/Space Complexity
                </label>
                <input
                  type="text"
                  value={formData.solutionApproach}
                  onChange={(e) => setFormData({ ...formData, solutionApproach: e.target.value })}
                  placeholder="e.g. One-pass Hash Map Approach | Time: O(n), Space: O(n)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                />
              </div>

              {/* Reference Solution Code */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Optimal Reference Solution Code
                  </label>
                  <span className="text-[11px] text-slate-400">Java / Python / C++</span>
                </div>
                <textarea
                  rows={9}
                  value={formData.solutionCode}
                  onChange={(e) => setFormData({ ...formData, solutionCode: e.target.value })}
                  placeholder={`class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 placeholder:text-slate-600 text-xs font-mono focus:outline-none focus:border-[#0D684D] transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* CARD 5: EDITORIAL & INTUITION */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-4 h-4 text-[#0D684D]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Editorial & Algorithm Walkthrough</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    In-depth theoretical breakdown displayed in the "Editorial" tab.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Intuition, Algorithm Steps, and Mathematical Proof
                </label>
                <textarea
                  rows={6}
                  value={formData.editorial}
                  onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
                  placeholder="Explain the intuition behind the problem, why naive brute-force is insufficient, and how the optimal algorithm solves it efficiently..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all leading-relaxed"
                />
              </div>
            </div>

            {/* CARD 6: STARTER CODE TEMPLATE & COMPANIES */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building className="w-4 h-4 text-[#0D684D]" />
                <h3 className="text-sm font-bold text-slate-900">Starter Code & Company Tags</h3>
              </div>

              {/* Starter code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Custom Starter Code Template (Optional)
                </label>
                <textarea
                  rows={5}
                  value={formData.starterCode}
                  onChange={(e) => setFormData({ ...formData, starterCode: e.target.value })}
                  placeholder={`class Solution {\n    public int[] solve(int[] nums) {\n        // Your code here\n    }\n}`}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-900 text-slate-200 placeholder:text-slate-600 text-xs font-mono focus:outline-none focus:border-[#0D684D] transition-all leading-relaxed"
                />
              </div>

              {/* Companies */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Company Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.companies}
                  onChange={(e) => setFormData({ ...formData, companies: e.target.value })}
                  placeholder="e.g. Amazon, Google, Meta, Microsoft, Apple, Uber"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* CARD 7: TEST CASES BUILDER */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D684D]" />
                    <span>Automated Judge Test Cases ({testCases.length})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test cases executed by the compiler to grade student submissions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncSampleToTestCase}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D684D] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-100 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Sync Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Case
                  </button>
                </div>
              </div>

              {/* Test Cases List */}
              <div className="space-y-4">
                {testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#0D684D] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Test Case #{idx + 1}
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer ml-3 text-xs text-slate-600 select-none">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) =>
                              handleTestCaseChange(idx, 'isHidden', e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span
                            className={
                              tc.isHidden ? 'text-amber-700 font-semibold' : 'text-slate-500'
                            }
                          >
                            {tc.isHidden ? 'Hidden (Judge Only)' : 'Public (Student visible)'}
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete test case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Input Data:
                        </span>
                        <textarea
                          rows={3}
                          value={tc.inputData}
                          onChange={(e) =>
                            handleTestCaseChange(idx, 'inputData', e.target.value)
                          }
                          placeholder="Standard input"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-[#0D684D]"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Expected Output:
                        </span>
                        <textarea
                          rows={3}
                          value={tc.expectedOutput}
                          onChange={(e) =>
                            handleTestCaseChange(idx, 'expectedOutput', e.target.value)
                          }
                          placeholder="Exact output expected"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-mono focus:outline-none focus:border-[#0D684D]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Feedback Banner */}
            {statusMessage && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D684D] text-xs font-semibold">
                <div className="w-4 h-4 border-2 border-[#0D684D] border-t-transparent rounded-full animate-spin"></div>
                <span>{statusMessage}</span>
              </div>
            )}

            {/* SUBMIT ACTIONS */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-4 flex items-center justify-between">
              <Link
                to="/admin/problems"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isEditMode ? 'Update Problem' : 'Create Problem'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: LIVE STUDENT PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 space-y-6">
              {/* Header */}
              <div className="border-b border-slate-100 pb-5">
                <p className="text-xs font-bold text-[#0D684D] uppercase tracking-wider mb-1">
                  LEETCODE LIVE PREVIEW
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {formData.title || 'Untitled Problem'}
                </h1>
                <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-[#0D684D] border border-emerald-100">
                    {formData.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200">
                    {formData.topic || 'General Topic'}
                  </span>
                  {formData.companies &&
                    formData.companies.split(',').map((c, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200">
                        {c.trim()}
                      </span>
                    ))}
                </div>
              </div>

              {/* 01 Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                  01 Description
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {formData.description || 'No description entered yet.'}
                </div>
              </div>

              {/* 02 Constraints */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                  02 Constraints
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                  {formData.problemConstraints || 'No constraints provided.'}
                </div>
              </div>

              {/* 03 Sample Example */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                  03 Example
                </h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Input:</span>
                    <pre className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                      {formData.sampleInput || '(No sample input)'}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Output:</span>
                    <pre className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 overflow-x-auto">
                      {formData.sampleOutput || '(No sample output)'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* 04 Follow-up Challenge */}
              {formData.followUp && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                    04 Follow-up Challenge
                  </h3>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
                    <span className="font-bold text-slate-900">Follow-up: </span>
                    {formData.followUp}
                  </div>
                </div>
              )}

              {/* 05 Hints Preview */}
              {hints.filter((h) => h.trim()).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                    05 Hints
                  </h3>
                  <div className="space-y-2">
                    {hints.filter((h) => h.trim()).map((hint, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-amber-800 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          Hint {idx + 1}
                        </span>
                        <p className="text-slate-600 pl-5 leading-relaxed">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 06 Solution Code & Approach Preview */}
              {(formData.solutionCode || formData.solutionApproach) && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                    06 Solution & Optimal Approach
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                    {formData.solutionApproach && (
                      <div className="border-b border-slate-800 pb-2 text-xs font-mono text-emerald-400">
                        {formData.solutionApproach}
                      </div>
                    )}
                    {formData.solutionCode && (
                      <pre className="text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                        {formData.solutionCode}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* 07 Editorial Preview */}
              {formData.editorial && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                    07 Editorial & Intuition
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {formData.editorial}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold transition-colors"
                >
                  Return to Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
