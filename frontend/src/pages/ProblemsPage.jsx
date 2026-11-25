import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemApi } from '../api/problemApi';
import { DifficultyBadge } from '../components/Badge';
import { Search, CheckCircle2, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';

export const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SOLVED, ATTEMPTED, UNSOLVED
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [search, selectedDifficulty, selectedTopic]);

  const fetchTopics = async () => {
    try {
      const res = await problemApi.getTopics();
      setTopics(res.data);
    } catch (err) {
      console.error('Failed to load topics', err);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.query = search.trim();
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (selectedTopic) params.topic = selectedTopic;

      const res = await problemApi.getProblems(params);
      setProblems(res.data);
    } catch (err) {
      console.error('Failed to load problems', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'SOLVED') return p.status === 'SOLVED';
    if (statusFilter === 'ATTEMPTED') return p.status === 'ATTEMPTED';
    if (statusFilter === 'UNSOLVED') return p.status === 'UNSOLVED' || !p.status;
    return true;
  });

  return (
    <AppLayout title="Problems">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Problem Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse algorithm problems, test against judge suites, and sharpen your skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0D684D] text-xs font-bold">
              Total Problems: {problems.length}
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by problem title or keyword..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
              />
            </div>

            {/* Topic Select */}
            <div className="w-full md:w-56">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty & Status Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Difficulty:</span>
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDifficulty === ''
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedDifficulty('EASY')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDifficulty === 'EASY'
                    ? 'bg-emerald-100 text-[#0D684D] font-bold border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-[#0D684D]'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setSelectedDifficulty('MEDIUM')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDifficulty === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setSelectedDifficulty('HARD')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDifficulty === 'HARD'
                    ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-800'
                }`}
              >
                Hard
              </button>
            </div>

            {/* Status Filter (if logged in) */}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                {['ALL', 'SOLVED', 'ATTEMPTED', 'UNSOLVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      statusFilter === st
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st.toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Problems Table Card */}
        <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-[#0D684D] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading problem catalog...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-700">No problems found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6 w-16 text-center">Status</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Difficulty</th>
                    <th className="py-4 px-6">Topic</th>
                    <th className="py-4 px-6 text-center">Test Cases</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProblems.map((prob) => (
                    <tr
                      key={prob.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {prob.status === 'SOLVED' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" title="Solved" />
                        ) : prob.status === 'ATTEMPTED' ? (
                          <Clock className="w-5 h-5 text-amber-600 mx-auto" title="Attempted" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-200 mx-auto" title="Unsolved"></div>
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-4 px-6">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-semibold text-slate-900 group-hover:text-[#0D684D] transition-colors flex items-center gap-2"
                        >
                          <span>{prob.id}.</span>
                          <span>{prob.title}</span>
                        </Link>
                      </td>

                      {/* Difficulty */}
                      <td className="py-4 px-6">
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>

                      {/* Topic */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {prob.topic || 'General'}
                        </span>
                      </td>

                      {/* Test Cases Count */}
                      <td className="py-4 px-6 text-center text-xs text-slate-500">
                        {prob.testCasesCount} cases
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-[#0D684D] text-[#0D684D] hover:text-white border border-emerald-100 text-xs font-semibold transition-all group-hover:scale-105"
                        >
                          Solve
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
