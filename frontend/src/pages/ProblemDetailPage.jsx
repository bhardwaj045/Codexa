import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { problemApi } from '../api/problemApi';
import { submissionApi } from '../api/submissionApi';
import { useAuth } from '../context/AuthContext';
import { getLeetCodeMetadata } from '../utils/leetcodeProblems';
import { Play, Send, RotateCcw, ArrowLeft, History, Copy, Check, X, FileCode, Clock, Terminal, CheckCircle2, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, MessageSquare, Star, Share2, Maximize2, Code2, BookOpen, FileText, Lightbulb, Tag, Lock, Sun, Moon, Users } from 'lucide-react';

// LeetCode-style colorful syntax highlighter (single-pass tokenizer)
const highlightCode = (code, lang, isDark) => {
  if (!code) return '';

  const cKeyword = isDark ? '#569CD6' : '#7C3AED';
  const cType = isDark ? '#4EC9B0' : '#0D9488';
  const cFunction = isDark ? '#DCDCAA' : '#2563EB';
  const cString = isDark ? '#CE9178' : '#059669';
  const cNumber = isDark ? '#B5CEA8' : '#D97706';
  const cComment = isDark ? '#6A9955' : '#94A3B8';

  const keywords = new Set([
    'class', 'public', 'private', 'protected', 'static', 'final', 'const', 'let', 'var',
    'def', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'new', 'this', 'super', 'import', 'package', 'from', 'as', 'try',
    'catch', 'finally', 'throw', 'throws', 'lambda', 'null', 'true', 'false', 'function',
    'yield', 'async', 'await'
  ]);

  const types = new Set([
    'int', 'void', 'boolean', 'char', 'float', 'double', 'long', 'short', 'byte',
    'String', 'Integer', 'Boolean', 'Character', 'Double', 'Long', 'Map', 'HashMap',
    'List', 'ArrayList', 'Set', 'HashSet', 'Queue', 'LinkedList', 'Stack', 'Arrays',
    'Math', 'vector', 'string', 'bool', 'unordered_map', 'unordered_set', 'Solution', 'Main'
  ]);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const tokenRegex = /("[^"]*"|'[^']*'|`[^`]*`|\/\/.*|\/\*[\s\S]*?\*\/|#.*|[a-zA-Z_$][a-zA-Z0-9_$]*|\b\d+\b|[^\s\w]+|\s+)/g;

  return code.replace(tokenRegex, (match) => {
    if (match.startsWith('"') || match.startsWith("'") || match.startsWith('`')) {
      return `<span style="color:${cString};">${esc(match)}</span>`;
    }
    if (match.startsWith('//') || match.startsWith('#') || match.startsWith('/*')) {
      return `<span style="color:${cComment};font-style:italic;">${esc(match)}</span>`;
    }
    if (/^\d+$/.test(match)) {
      return `<span style="color:${cNumber};">${match}</span>`;
    }
    if (keywords.has(match)) {
      return `<span style="color:${cKeyword};font-weight:600;">${match}</span>`;
    }
    if (types.has(match)) {
      return `<span style="color:${cType};font-weight:500;">${match}</span>`;
    }
    if (/^[a-z][a-zA-Z0-9]*$/.test(match) && match.length > 2) {
      return `<span style="color:${cFunction};">${match}</span>`;
    }
    return esc(match);
  });
};

export const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuth();
  const contestId = new URLSearchParams(location.search).get('contestId');

  // Problem data
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Workspace View State: 'description', 'solutions', 'editorial', 'submissions'
  const [leftTab, setLeftTab] = useState('description');
  const [theme, setTheme] = useState('light'); // 'light' (default) or 'dark'
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [starred, setStarred] = useState(false);

  // Accordion toggle states (Topics, Companies, Hints, Discussion)
  const [openAccordions, setOpenAccordions] = useState({
    topics: false,
    companies: false,
    hint1: false,
    hint2: false,
    hint3: false,
    similar: false,
    discussion: false
  });

  // Editor states
  const [language, setLanguage] = useState('JAVA');
  const [sourceCode, setSourceCode] = useState('');
  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Console Drawer states: 'testcase' or 'result'
  const [activeConsoleTab, setActiveConsoleTab] = useState('result'); // 'testcase' or 'result'
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [consoleExpanded, setConsoleExpanded] = useState(false);

  // Execution states
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  // Past submissions states
  const [problemSubmissions, setProblemSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmissionCode, setSelectedSubmissionCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedEditorCode, setCopiedEditorCode] = useState(false);
  const [copiedSolutionCode, setCopiedSolutionCode] = useState(false);

  // Editor refs for synchronized scrolling with syntax highlight overlay
  const highlightRef = useRef(null);
  const textareaRef = useRef(null);

  const meta = problem ? getLeetCodeMetadata(problem.title) : null;

  useEffect(() => {
    fetchProblemData();
    if (isAuthenticated) {
      fetchProblemSubmissions();
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (problem) {
      if (problem.starterCode && problem.starterCode.trim()) {
        setSourceCode(problem.starterCode);
      } else {
        const pMeta = getLeetCodeMetadata(problem.title);
        if (pMeta && pMeta.starterTemplates && pMeta.starterTemplates[language]) {
          setSourceCode(pMeta.starterTemplates[language]);
        } else {
          setSourceCode(`class Solution {\n    // Write your solution here\n}`);
        }
      }
    }
  }, [problem, language]);

  const fetchProblemData = async () => {
    setLoading(true);
    try {
      const pRes = await problemApi.getProblemById(id);
      setProblem(pRes.data);
      if (pRes.data?.sampleInput) {
        setCustomInput(pRes.data.sampleInput);
      }
    } catch (err) {
      console.error('Error fetching problem details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemSubmissions = async () => {
    if (!isAuthenticated) return;
    setLoadingSubmissions(true);
    try {
      const res = await submissionApi.getProblemSubmissions(id);
      setProblemSubmissions(res.data || []);
    } catch (err) {
      console.error('Error fetching past submissions for problem:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const toggleAccordion = (name) => {
    setOpenAccordions(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (meta && meta.starterTemplates && meta.starterTemplates[newLang]) {
      setSourceCode(meta.starterTemplates[newLang]);
    }
  };

  const handleResetCode = () => {
    if (meta && meta.starterTemplates && meta.starterTemplates[language]) {
      setSourceCode(meta.starterTemplates[language]);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabSpaces = '    ';
      const updatedCode = sourceCode.substring(0, start) + tabSpaces + sourceCode.substring(end);
      setSourceCode(updatedCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
        updateCursorPosition(textarea);
      }, 0);
    }
  };

  const updateCursorPosition = (textarea) => {
    const selStart = textarea.selectionStart;
    const textLines = textarea.value.substr(0, selStart).split('\n');
    const currentLn = textLines.length;
    const currentCol = textLines[textLines.length - 1].length + 1;
    setCursorPos({ ln: currentLn, col: currentCol });
  };

  const copyEditorCode = () => {
    if (!sourceCode) return;
    navigator.clipboard.writeText(sourceCode);
    setCopiedEditorCode(true);
    setTimeout(() => setCopiedEditorCode(false), 2000);
  };

  const copyModalCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getExecutableCode = (code, lang, probTitle) => {
    if (!code) return '';
    // If the student already included a main method or driver, execute directly
    if (code.includes('public static void main') || code.includes('class Main') || code.includes('if __name__ ==') || code.includes('int main(')) {
      return code;
    }
    const pMeta = getLeetCodeMetadata(probTitle);
    if (pMeta?.driverCode && pMeta.driverCode[lang]) {
      if (lang === 'JAVA') {
        return `import java.util.*;\n\n${code}\n\n${pMeta.driverCode.JAVA}`;
      } else if (lang === 'PYTHON') {
        return `import sys\n\n${code}\n\n${pMeta.driverCode.PYTHON}`;
      } else if (lang === 'CPP') {
        return `#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <unordered_set>\n#include <algorithm>\n#include <sstream>\nusing namespace std;\n\n${code}\n\n${pMeta.driverCode.CPP}`;
      }
    }
    return code;
  };

  const handleRunCode = async () => {
    setRunning(true);
    setRunResult(null);
    setHasRun(true);
    setActiveConsoleTab('result');
    try {
      const payload = {
        problemId: problem.id,
        programmingLanguage: language,
        sourceCode: getExecutableCode(sourceCode, language, problem.title),
        customInput: customInput || problem.sampleInput || '',
      };
      const res = await submissionApi.runCode(payload);
      setRunResult(res.data);
    } catch (err) {
      console.error('Run failed', err);
      setRunResult({
        status: 'RUNTIME_ERROR',
        stderr: err.response?.data?.message || 'Execution error occurred',
        passed: false,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to submit your solution!');
      navigate(`/login?redirect=/problems/${id}`);
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);
    setHasRun(true);
    setActiveConsoleTab('result');
    try {
      const searchParams = new URLSearchParams(location.search);
      const contestId = searchParams.get('contestId');
      const payload = {
        problemId: problem.id,
        programmingLanguage: language,
        sourceCode: getExecutableCode(sourceCode, language, problem.title),
        contestId: contestId ? parseInt(contestId) : null,
      };
      const res = await submissionApi.submit(payload);
      setSubmitResult(res.data);
      // Immediately refresh past submissions and problem statistics
      fetchProblemSubmissions();
      fetchProblemData();
    } catch (err) {
      console.error('Submit failed', err);
      if (err.response?.status === 401) {
        alert('Your session has expired. Please sign in again.');
        navigate(`/login?redirect=/problems/${id}`);
      } else {
        alert('Submission failed: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-slate-900'}`}>
        <div className="w-8 h-8 border-3 border-[#2CBB5D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const lines = sourceCode.split('\n');
  const isSolved = problem.status === 'SOLVED' || problemSubmissions.some(s => (s.submissionStatus || s.status) === 'ACCEPTED');

  // Number of users who tried to solve it (ensuring the current active user is counted)
  let usersTriedCount = Number(problem?.attemptedUsersCount) || 0;
  const userAlreadyInDb = problemSubmissions.some(s => s.userId === user?.id);
  if (!userAlreadyInDb) {
    usersTriedCount = usersTriedCount + 1;
  }
  usersTriedCount = Math.max(1, usersTriedCount);

  // Dynamic difficulty badge color
  const diffBadgeColor = () => {
    const diff = (meta?.difficulty || problem.difficulty || 'EASY').toUpperCase();
    if (diff === 'HARD') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (diff === 'MEDIUM') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-teal-400 bg-teal-500/10 border-teal-500/20'; // Easy (LeetCode teal)
  };

  // Color classes for Dark / Light theme
  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-[#1A1A1A] text-[#E0E0E0]' : 'bg-[#DFE3E8] text-slate-900';
  const bgPane = isDark ? 'bg-[#262626] border-[#383838]' : 'bg-white border-slate-300 shadow-sm';
  const bgSubPane = isDark ? 'bg-[#202020]' : 'bg-[#F1F3F6]';
  const borderCol = isDark ? 'border-[#383838]' : 'border-slate-300';
  const textMuted = isDark ? 'text-[#8A8A8A]' : 'text-slate-500';
  const textHead = isDark ? 'text-white' : 'text-slate-900';

  if (loading || !problem) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center font-sans ${isDark ? 'bg-[#1A1A1A] text-white' : 'bg-[#F0F2F5] text-slate-900'}`}>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-400">Loading Problem Workspace...</p>
      </div>
    );
  }

  // LeetCode formatted examples
  const examplesList = meta?.examples || [
    {
      id: 1,
      input: problem?.sampleInput || 'Standard test input',
      output: problem?.sampleOutput || 'Standard expected output',
      explanation: 'Computed according to problem specifications.'
    }
  ];

  // LeetCode formatted constraints
  const constraintsList = meta?.constraints || (
    problem?.problemConstraints 
      ? problem.problemConstraints.split('\n').filter(Boolean)
      : ['1 <= n <= 10^5']
  );

  // Dynamic hints (Admin entered or fallback to LeetCode defaults)
  let problemHints = meta?.hints || ['Break down the problem using two pointers or hash maps to optimize time complexity.'];
  if (problem?.hints) {
    try {
      const parsed = JSON.parse(problem.hints);
      if (Array.isArray(parsed) && parsed.length > 0) {
        problemHints = parsed;
      } else {
        const lines = problem.hints.split('\n').filter(Boolean);
        if (lines.length > 0) problemHints = lines;
      }
    } catch {
      const lines = problem.hints.split('\n').filter(Boolean);
      if (lines.length > 0) problemHints = lines;
    }
  }

  // Dynamic companies (Admin entered or fallback to LeetCode defaults)
  let problemCompanies = meta?.companies || ['Amazon', 'Google', 'Apple', 'Microsoft', 'Meta'];
  if (problem?.companies && problem.companies.trim()) {
    const list = problem.companies.split(',').map((c) => c.trim()).filter(Boolean);
    if (list.length > 0) {
      problemCompanies = list;
    }
  }

  // Follow-up question
  const followUpQuestion = problem?.followUp?.trim() || meta?.followUp;

  // Real platform metrics for this problem
  const totalSubs = problem?.totalSubmissions != null ? problem.totalSubmissions : problemSubmissions.length;
  const acceptedSubs = problem?.acceptedSubmissions != null 
    ? problem.acceptedSubmissions 
    : problemSubmissions.filter(s => (s.submissionStatus || s.status) === 'ACCEPTED').length;
  const acceptanceRate = totalSubs > 0 
    ? `${((acceptedSubs / totalSubs) * 100).toFixed(1)}%` 
    : '0.0%';

  return (
    <div className={`h-screen flex flex-col font-sans antialiased overflow-hidden ${bgMain} selection:bg-[#2CBB5D]/30`}>
      {/* TOP LEETCODE BAR */}
      <header className={`h-12 ${bgPane} border-b ${borderCol} px-4 flex items-center justify-between shrink-0 z-20`}>
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className={`p-1.5 rounded-lg border ${borderCol} hover:${bgSubPane} ${textMuted} transition-colors`}
            title="Problem List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#2CBB5D] text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
              &lt;/&gt;
            </div>
            <span className={`font-bold text-sm tracking-tight ${textHead}`}>CodeXa</span>
            {contestId && (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {isAdmin ? 'Contest Problem Preview' : 'Contest Arena'}
              </span>
            )}
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle (Dark LeetCode / Light LeetCode) */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${borderCol} text-xs font-semibold ${textMuted} hover:${textHead} transition-colors`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <Link
            to={contestId ? (isAdmin ? `/admin/contests/${contestId}/monitor` : `/contests/${contestId}`) : isAdmin ? '/admin/problems' : '/problems'}
            className={`px-3 py-1 rounded-lg border ${borderCol} text-xs font-semibold ${textMuted} hover:${textHead} transition-colors`}
          >
            {contestId ? (isAdmin ? 'Back to Monitor' : 'Back to Arena') : 'Exit'}
          </Link>
        </div>
      </header>

      {/* DUAL PANE WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 gap-2">
        {/* LEFT PANE (Tabs: Description, Solutions, Editorial, Submissions) */}
        <div className={`w-full lg:w-1/2 flex flex-col rounded-xl overflow-hidden border ${borderCol} ${bgPane} shadow-sm`}>
          {/* LeetCode Top Tabs Bar */}
          <div className={`h-10 border-b ${borderCol} px-3 flex items-center justify-between shrink-0 ${bgSubPane}`}>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLeftTab('description')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === 'description' 
                    ? isDark ? 'bg-[#333333] text-white shadow-xs' : 'bg-white text-slate-900 font-bold shadow-xs border border-[#E2E8F0]'
                    : `${textMuted} hover:${textHead}`
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Description</span>
              </button>

              <button
                onClick={() => setLeftTab('solutions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === 'solutions' 
                    ? isDark ? 'bg-[#333333] text-white shadow-xs' : 'bg-white text-slate-900 font-bold shadow-xs border border-[#E2E8F0]'
                    : `${textMuted} hover:${textHead}`
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Solutions</span>
              </button>

              <button
                onClick={() => setLeftTab('editorial')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === 'editorial' 
                    ? isDark ? 'bg-[#333333] text-white shadow-xs' : 'bg-white text-slate-900 font-bold shadow-xs border border-[#E2E8F0]'
                    : `${textMuted} hover:${textHead}`
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Editorial</span>
              </button>

              <button
                onClick={() => setLeftTab('submissions')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  leftTab === 'submissions' 
                    ? isDark ? 'bg-[#333333] text-white shadow-xs' : 'bg-white text-slate-900 font-bold shadow-xs border border-[#E2E8F0]'
                    : `${textMuted} hover:${textHead}`
                }`}
              >
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>Submissions {problemSubmissions.length > 0 ? `(${problemSubmissions.length})` : ''}</span>
              </button>
            </div>

            <div className={`flex items-center gap-1 ${textMuted}`}>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                className={`p-1 rounded hover:${textHead}`}
                title="Toggle View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Left Pane Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {leftTab === 'description' ? (
              <>
                {/* Title & Solved Checkmark */}
                <div className="flex items-center justify-between">
                  <h1 className={`text-2xl font-bold tracking-tight ${textHead}`}>
                    {problem.id}. {problem.title}
                  </h1>
                  {isSolved && (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <span>Solved</span>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Pill Badges Row: [Difficulty] */}
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${diffBadgeColor()}`}>
                    {meta?.difficulty || problem.difficulty}
                  </span>
                </div>

                {/* Main Problem Description */}
                <div className={`text-[13.5px] leading-relaxed space-y-3 font-normal ${isDark ? 'text-[#D0D0D0]' : 'text-slate-700'}`}>
                  <p className="whitespace-pre-line">
                    {meta ? meta.description : problem.description}
                  </p>
                </div>

                {/* Dynamic LeetCode Examples */}
                <div className="space-y-4">
                  {examplesList.map((ex) => (
                    <div key={ex.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${textHead}`}>Example {ex.id}:</p>
                        {ex.id === 1 && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isDark ? 'bg-[#333] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            Original
                          </span>
                        )}
                      </div>
                      <div className={`p-4 rounded-xl border ${borderCol} ${bgSubPane} font-mono text-xs space-y-1.5`}>
                        <p>
                          <span className={textMuted}>Input: </span>
                          <span className={textHead}>{ex.input}</span>
                        </p>
                        <p>
                          <span className={textMuted}>Output: </span>
                          <span className={textHead}>{ex.output}</span>
                        </p>
                        {ex.explanation && (
                          <p className="pt-1 text-[11px] font-sans">
                            <span className={textMuted}>Explanation: </span>
                            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{ex.explanation}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div className="space-y-2">
                  <p className={`text-xs font-bold ${textHead}`}>Constraints:</p>
                  <ul className={`list-disc list-inside space-y-1 font-mono text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {constraintsList.map((c, idx) => (
                      <li key={idx}>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${isDark ? 'bg-[#333]' : 'bg-slate-100'}`}>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Follow-up question */}
                {followUpQuestion && (
                  <div className={`p-3.5 rounded-xl border ${borderCol} ${bgSubPane} text-xs`}>
                    <span className={`font-bold ${textHead}`}>Follow-up: </span>
                    <span className={textMuted}>{followUpQuestion}</span>
                  </div>
                )}

                {/* Accepted Metrics Bar (Platform Real Data) */}
                <div className={`pt-4 border-t ${borderCol} flex items-center justify-between text-xs`}>
                  <div className="flex items-center gap-2">
                    <span className={textMuted}>Accepted</span>
                    <span className={`font-bold ${textHead}`}>
                      {acceptedSubs.toLocaleString()} / {totalSubs.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={textMuted}>Acceptance Rate</span>
                    <span className={`font-bold ${textHead}`}>{acceptanceRate}</span>
                  </div>
                </div>

                {/* LeetCode Dropdown Accordions */}
                <div className={`space-y-1.5 pt-2 border-t ${borderCol}`}>
                  {/* Topics Accordion */}
                  <div className={`border ${borderCol} rounded-xl overflow-hidden`}>
                    <button
                      onClick={() => toggleAccordion('topics')}
                      className={`w-full p-3 flex items-center justify-between text-xs font-semibold ${textHead} hover:${bgSubPane} transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                        <span>Topics</span>
                      </div>
                      {openAccordions.topics ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openAccordions.topics && (
                      <div className={`p-3 border-t ${borderCol} ${bgSubPane} flex flex-wrap gap-2 text-xs`}>
                        {(meta?.topics || [problem.topic || 'General']).map((t, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg border ${borderCol} font-medium`}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Companies Accordion */}
                  <div className={`border ${borderCol} rounded-xl overflow-hidden`}>
                    <button
                      onClick={() => toggleAccordion('companies')}
                      className={`w-full p-3 flex items-center justify-between text-xs font-semibold ${textHead} hover:${bgSubPane} transition-colors`}
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Companies</span>
                      </div>
                      {openAccordions.companies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openAccordions.companies && (
                      <div className={`p-3 border-t ${borderCol} ${bgSubPane} flex flex-wrap gap-2 text-xs`}>
                        {problemCompanies.map((c, idx) => (
                          <span key={idx} className={`px-2.5 py-1 rounded-lg border ${borderCol} font-medium`}>{c}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Hints */}
                  {problemHints.map((hint, idx) => {
                    const hintKey = `hint${idx + 1}`;
                    return (
                      <div key={idx} className={`border ${borderCol} rounded-xl overflow-hidden`}>
                        <button
                          onClick={() => toggleAccordion(hintKey)}
                          className={`w-full p-3 flex items-center justify-between text-xs font-semibold ${textHead} hover:${bgSubPane} transition-colors`}
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>Hint {idx + 1}</span>
                          </div>
                          {openAccordions[hintKey] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {openAccordions[hintKey] && (
                          <div className={`p-3 border-t ${borderCol} ${bgSubPane} text-xs leading-relaxed ${textMuted}`}>
                            {hint}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : leftTab === 'solutions' ? (
              /* Solutions Tab */
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${textHead}`}>Optimal Approaches & Reference Solutions</h3>
                
                {/* Admin-defined Solution Code & Approach */}
                {(problem.solutionCode || problem.solutionApproach) && (
                  <div className={`p-4 rounded-xl border ${borderCol} ${bgSubPane} space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                        {problem.solutionApproach || 'Optimal Solution'}
                      </span>
                      {problem.solutionCode && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(problem.solutionCode);
                            setCopiedSolutionCode(true);
                            setTimeout(() => setCopiedSolutionCode(false), 2000);
                          }}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-500 font-mono transition-colors"
                        >
                          {copiedSolutionCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSolutionCode ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      )}
                    </div>
                    {problem.solutionCode && (
                      <pre className={`p-4 rounded-xl border ${borderCol} font-mono text-xs overflow-x-auto leading-relaxed ${isDark ? 'bg-[#181818] text-emerald-300' : 'bg-slate-900 text-emerald-300'}`}>
                        {problem.solutionCode}
                      </pre>
                    )}
                  </div>
                )}

                {/* Additional Catalog Solutions */}
                {(meta?.solutions || (!problem.solutionCode && !problem.solutionApproach ? [
                  {
                    title: 'Optimal Approach',
                    timeComplexity: 'O(n)',
                    spaceComplexity: 'O(1)',
                    description: 'Direct optimal solution evaluating state linearly.'
                  }
                ] : [])).map((sol, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${borderCol} ${bgSubPane} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{sol.title}</span>
                      <span className="text-[11px] font-mono text-emerald-400">Time: {sol.timeComplexity} | Space: {sol.spaceComplexity}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${textMuted}`}>
                      {sol.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : leftTab === 'editorial' ? (
              /* Editorial Tab */
              <div className="space-y-4">
                <h3 className={`text-lg font-bold ${textHead}`}>Editorial & Intuition</h3>
                <div className={`p-4 rounded-xl border ${borderCol} ${bgSubPane} text-xs leading-relaxed space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <p className="whitespace-pre-line">
                    {problem.editorial || meta?.editorial || 'Comprehensive intuition and theoretical walkthrough for this challenge.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Submissions Tab */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-inherit">
                  <h3 className={`text-sm font-bold ${textHead}`}>Previous Submissions for Problem #{problem.id}</h3>
                  <span className={`text-xs ${textMuted}`}>{problemSubmissions.length} recorded</span>
                </div>

                {loadingSubmissions ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-[#2CBB5D] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Loading past submissions...</span>
                  </div>
                ) : problemSubmissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-1">
                    <Clock className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                    <p className={`text-xs font-semibold ${textHead}`}>No submissions recorded yet</p>
                    <p className={`text-[11px] ${textMuted}`}>Submit your code using the "Submit" button to test and record your attempts.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className={`border-b ${borderCol} text-[11px] ${textMuted} font-bold uppercase tracking-wider`}>
                          <th className="pb-2">ID</th>
                          <th className="pb-2">Status</th>
                          <th className="pb-2">Language</th>
                          <th className="pb-2">Runtime</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${borderCol} font-mono text-[11px]`}>
                        {problemSubmissions.map((sub) => {
                          const status = sub.submissionStatus || sub.status || 'EVALUATED';
                          const isAccepted = status === 'ACCEPTED';
                          return (
                            <tr key={sub.id} className={`hover:${bgSubPane} transition-colors`}>
                              <td className="py-2.5 text-slate-400">#{sub.id}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  isAccepted
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className={`py-2.5 ${textHead}`}>{sub.programmingLanguage || sub.language}</td>
                              <td className={`py-2.5 ${textMuted}`}>{sub.executionTimeMs != null ? `${sub.executionTimeMs} ms` : '—'}</td>
                              <td className={`py-2.5 ${textMuted} font-sans`}>
                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="py-2.5 text-right font-sans space-x-1.5">
                                <button
                                  onClick={() => {
                                    setSourceCode(sub.sourceCode);
                                    if (sub.programmingLanguage || sub.language) {
                                      setLanguage(sub.programmingLanguage || sub.language);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-[#2CBB5D]/15 hover:bg-[#2CBB5D]/25 text-[#2CBB5D] border border-[#2CBB5D]/30 text-[11px] font-semibold transition-colors"
                                  title="Load this code into the editor"
                                >
                                  Restore
                                </button>
                                <button
                                  onClick={() => setSelectedSubmissionCode(sub)}
                                  className={`px-2.5 py-1 rounded border ${borderCol} hover:${bgSubPane} ${textHead} text-[11px] font-semibold transition-colors`}
                                >
                                  View Code
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Social / Status Footer */}
          <div className={`h-11 border-t ${borderCol} px-4 flex items-center justify-between text-xs ${textMuted} ${bgSubPane} shrink-0`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setLiked(!liked);
                  setLikeCount(liked ? likeCount - 1 : likeCount + 1);
                }}
                className={`flex items-center gap-1 hover:${textHead} transition-colors ${liked ? 'text-emerald-500 font-bold' : ''}`}
                title="Like problem"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{likeCount}</span>
              </button>

              <button
                onClick={() => setDisliked(!disliked)}
                className={`hover:${textHead} transition-colors ${disliked ? 'text-rose-500' : ''}`}
                title="Dislike problem"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 hover:${textHead} transition-colors" title="Your submission attempts">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>{problemSubmissions.length} attempts</span>
              </div>

              <button
                onClick={() => setStarred(!starred)}
                className={`hover:${textHead} transition-colors ${starred ? 'text-amber-400 fill-amber-400' : ''}`}
                title="Star problem"
              >
                <Star className="w-3.5 h-3.5" />
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Problem link copied to clipboard!');
                }}
                className={`hover:${textHead} transition-colors`}
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div 
              className="flex items-center gap-1.5 font-bold text-xs text-emerald-500 select-none cursor-default"
              title={`${usersTriedCount} users tried to solve this problem`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>{usersTriedCount}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANE (CODE EDITOR & TESTCASE DRAWER IN LEETCODE SLEEK UI) */}
        <div className={`w-full lg:w-1/2 flex flex-col rounded-xl overflow-hidden border ${borderCol} ${bgPane} shadow-sm`}>
          {/* Top Bar: </> Code */}
          <div className={`h-10 border-b ${borderCol} px-4 flex items-center justify-between shrink-0 ${bgSubPane}`}>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#2CBB5D]" />
              <span className={`text-xs font-bold tracking-tight ${textHead}`}>Code</span>
            </div>

            {/* Language Selector & LeetCode Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={`bg-transparent ${textHead} text-xs font-semibold focus:outline-none cursor-pointer pr-1 py-1`}
                >
                  <option value="JAVA" className={isDark ? 'bg-[#262626]' : 'bg-white'}>Java</option>
                  <option value="PYTHON" className={isDark ? 'bg-[#262626]' : 'bg-white'}>Python</option>
                  <option value="CPP" className={isDark ? 'bg-[#262626]' : 'bg-white'}>C++</option>
                  <option value="JAVASCRIPT" className={isDark ? 'bg-[#262626]' : 'bg-white'}>JavaScript</option>
                </select>
                <span className={`text-[10px] ${textMuted}`}>🔒 Auto</span>
              </div>

              <div className={`flex items-center gap-1 pl-2 border-l ${borderCol}`}>
                <button
                  onClick={copyEditorCode}
                  title="Copy Code"
                  className={`p-1 rounded ${textMuted} hover:${textHead} transition-colors`}
                >
                  {copiedEditorCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleResetCode}
                  title="Reset to default template"
                  className={`p-1 rounded ${textMuted} hover:${textHead} transition-colors`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Editor Body with Syntax Highlighting */}
          <div className={`${consoleExpanded ? 'h-[32%]' : 'h-[46%]'} min-h-[190px] flex overflow-hidden shrink-0 transition-all duration-200 ${isDark ? 'bg-[#1E1E1E]' : 'bg-[#FAFBFC]'}`}>
            {/* Line Numbers Column */}
            <div className={`w-11 py-3 ${isDark ? 'bg-[#1E1E1E] text-[#666]' : 'bg-[#F1F3F5] text-slate-400 border-r border-[#E2E8F0]'} font-mono text-xs select-none text-right pr-2.5 shrink-0`}>
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input with Synchronized Syntax Highlighting */}
            <div className="relative flex-1 h-full overflow-hidden">
              <pre
                ref={highlightRef}
                aria-hidden="true"
                className={`absolute inset-0 p-3 font-mono text-[13px] leading-6 overflow-hidden pointer-events-none select-none m-0 whitespace-pre ${
                  isDark ? 'text-[#E0E0E0]' : 'text-slate-800'
                }`}
                dangerouslySetInnerHTML={{ __html: highlightCode(sourceCode, language, isDark) + '\n' }}
              />

              <textarea
                ref={textareaRef}
                value={sourceCode}
                onChange={(e) => {
                  setSourceCode(e.target.value);
                  updateCursorPosition(e.target);
                }}
                onScroll={(e) => {
                  if (highlightRef.current) {
                    highlightRef.current.scrollTop = e.target.scrollTop;
                    highlightRef.current.scrollLeft = e.target.scrollLeft;
                  }
                }}
                onKeyDown={handleEditorKeyDown}
                onClick={(e) => updateCursorPosition(e.target)}
                onKeyUp={(e) => updateCursorPosition(e.target)}
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className={`absolute inset-0 p-3 font-mono text-[13px] leading-6 resize-none focus:outline-none bg-transparent whitespace-pre overflow-auto ${
                  isDark ? 'text-transparent caret-white selection:bg-blue-600/30' : 'text-transparent caret-slate-900 selection:bg-blue-200/50'
                }`}
              />
            </div>
          </div>

          {/* Editor Status Bar (Saved, Ln 1, Col 1) */}
          <div className={`h-7 px-4 border-t ${borderCol} flex items-center justify-between text-[11px] ${textMuted} ${bgSubPane} shrink-0`}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Saved</span>
            </div>
            <span>Ln {cursorPos.ln}, Col {cursorPos.col}</span>
          </div>

          {/* LeetCode Bottom Drawer: [Testcase] [>_ Test Result] */}
          <div className={`flex-1 border-t ${borderCol} flex flex-col overflow-hidden min-h-0 ${bgPane}`}>
            {/* Drawer Header Tabs & Action Buttons */}
            <div className={`h-10 border-b ${borderCol} px-3 flex items-center justify-between ${bgSubPane} shrink-0`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeConsoleTab === 'testcase'
                      ? isDark ? 'bg-[#333333] text-white' : 'bg-slate-100 text-slate-900 font-bold'
                      : `${textMuted} hover:${textHead}`
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Testcase</span>
                </button>

                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeConsoleTab === 'result'
                      ? isDark ? 'bg-[#333333] text-white' : 'bg-slate-100 text-slate-900 font-bold'
                      : `${textMuted} hover:${textHead}`
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Test Result</span>
                  {(submitResult || runResult) && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (submitResult?.status === 'ACCEPTED' || runResult?.status === 'ACCEPTED' || runResult?.passed)
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`} />
                  )}
                </button>
              </div>

              {/* Action Buttons: Run & Submit */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsoleExpanded(!consoleExpanded)}
                  className={`p-1.5 rounded-lg border ${borderCol} ${textMuted} hover:${textHead} transition-colors`}
                  title={consoleExpanded ? "Standard Editor Height" : "Reduce Editor Height / Expand Console"}
                >
                  {consoleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleRunCode}
                  disabled={running || submitting}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border ${borderCol} ${isDark ? 'bg-[#333] hover:bg-[#3E3E3E] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'} text-xs font-semibold transition-colors`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run</span>
                </button>

                {contestId && isAdmin ? (
                  <Link
                    to={`/admin/contests/${contestId}/monitor`}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Back to Monitor</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={running || submitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#2CBB5D] hover:bg-[#25A050] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 p-4 overflow-y-auto text-xs">
              {activeConsoleTab === 'testcase' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTestCaseIdx(0);
                        if (examplesList[0]) setCustomInput(examplesList[0].input);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedTestCaseIdx === 0
                          ? isDark ? 'bg-[#333] text-white' : 'bg-slate-200 text-slate-900'
                          : `${textMuted} hover:${textHead}`
                      }`}
                    >
                      Case 1
                    </button>
                    {examplesList.length > 1 && (
                      <button
                        onClick={() => {
                          setSelectedTestCaseIdx(1);
                          if (examplesList[1]) setCustomInput(examplesList[1].input);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedTestCaseIdx === 1
                            ? isDark ? 'bg-[#333] text-white' : 'bg-slate-200 text-slate-900'
                            : `${textMuted} hover:${textHead}`
                        }`}
                      >
                        Case 2
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-semibold ${textMuted}`}>
                      Input data:
                    </label>
                    <textarea
                      rows={3}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter inputs here..."
                      className={`w-full p-2.5 rounded-xl border ${borderCol} ${isDark ? 'bg-[#1E1E1E] text-white' : 'bg-white text-slate-900'} font-mono text-xs focus:outline-none focus:border-[#2CBB5D]`}
                    />
                  </div>
                </div>
              ) : (
                /* Test Result Tab */
                <div className="h-full flex flex-col justify-center">
                  {!hasRun ? (
                    /* Initial State: Exact Text from User Screenshots ("You must run your code first") */
                    <div className="text-center py-8">
                      <p className={`text-sm ${textMuted} font-normal tracking-wide`}>
                        You must run your code first
                      </p>
                    </div>
                  ) : running || submitting ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-slate-400">
                      <div className="w-4 h-4 border-2 border-[#2CBB5D] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Evaluating your solution against test cases...</span>
                    </div>
                  ) : submitResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          submitResult.status === 'ACCEPTED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {submitResult.status}
                        </span>
                        <div className={`text-xs ${textMuted} flex items-center gap-3`}>
                          <span>Runtime: <b className={`${textHead} font-mono`}>{submitResult.executionTimeMs || 0} ms</b></span>
                          <span>Memory: <b className={`${textHead} font-mono`}>{submitResult.memoryUsedMb ? submitResult.memoryUsedMb.toFixed(1) : 0} MB</b></span>
                        </div>
                      </div>
                      {submitResult.errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-400">
                          {submitResult.errorMessage}
                        </div>
                      )}
                    </div>
                  ) : runResult ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          runResult.status === 'ACCEPTED' || runResult.passed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {runResult.status || (runResult.passed ? 'ACCEPTED' : 'WRONG ANSWER')}
                        </span>
                        <span className={`text-xs ${textMuted}`}>
                          Runtime: <b className={`${textHead} font-mono`}>{runResult.executionTimeMs || 0} ms</b>
                        </span>
                      </div>
                      {runResult.actualOutput && (
                        <div className="space-y-1">
                          <p className={`text-[11px] font-semibold ${textMuted}`}>Your Output:</p>
                          <pre className={`p-2.5 rounded-lg border ${borderCol} ${isDark ? 'bg-[#1E1E1E] text-emerald-400' : 'bg-slate-50 text-slate-800'} font-mono text-xs overflow-x-auto`}>
                            {runResult.actualOutput}
                          </pre>
                        </div>
                      )}
                      {runResult.stderr && (
                        <pre className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs overflow-x-auto">
                          {runResult.stderr}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-sm ${textMuted}`}>You must run your code first</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Modal for Submissions */}
      {selectedSubmissionCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className={`${bgPane} border ${borderCol} rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4`}>
            <div className={`flex items-center justify-between border-b ${borderCol} pb-3`}>
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-[#2CBB5D]" />
                <h3 className={`text-base font-bold ${textHead}`}>
                  Submission #{selectedSubmissionCode.id} ({selectedSubmissionCode.programmingLanguage || selectedSubmissionCode.language || 'JAVA'})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyModalCode(selectedSubmissionCode.sourceCode || '')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${borderCol} text-xs font-semibold ${textHead} hover:${bgSubPane} transition-colors`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => setSelectedSubmissionCode(null)}
                  className={`p-1 rounded-lg ${textMuted} hover:${textHead}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <pre className={`p-4 ${isDark ? 'bg-[#181818]' : 'bg-slate-900 text-slate-100'} rounded-xl font-mono text-xs overflow-x-auto max-h-80 leading-relaxed border ${borderCol}`}>
              {selectedSubmissionCode.sourceCode}
            </pre>

            <div className={`flex items-center justify-between text-xs ${textMuted} pt-2 border-t ${borderCol}`}>
              <span>
                Status:{' '}
                <b className={
                  (selectedSubmissionCode.submissionStatus || selectedSubmissionCode.status) === 'ACCEPTED' 
                    ? 'text-emerald-400 font-mono' 
                    : 'text-rose-400 font-mono'
                }>
                  {selectedSubmissionCode.submissionStatus || selectedSubmissionCode.status}
                </b>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSourceCode(selectedSubmissionCode.sourceCode);
                    if (selectedSubmissionCode.programmingLanguage || selectedSubmissionCode.language) {
                      setLanguage(selectedSubmissionCode.programmingLanguage || selectedSubmissionCode.language);
                    }
                    setSelectedSubmissionCode(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-[#2CBB5D] hover:bg-[#25A050] text-white font-semibold transition-colors"
                >
                  Restore to Editor
                </button>
                <button
                  onClick={() => setSelectedSubmissionCode(null)}
                  className={`px-4 py-1.5 rounded-xl border ${borderCol} ${textHead} hover:${bgSubPane} font-semibold transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
