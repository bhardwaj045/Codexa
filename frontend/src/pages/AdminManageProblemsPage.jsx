import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemApi } from '../api/problemApi';
import { AppLayout } from '../components/AppLayout';

export const AdminManageProblemsPage = () => {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const res = await problemApi.getProblems();
      setProblems(res.data);
    } catch (err) {
      console.error('Failed to load problems', err);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        await problemApi.deleteProblem(id);
        setProblems(problems.filter((p) => p.id !== id));
      } catch (err) {
        alert('Failed to delete problem: ' + err.message);
      }
    }
  };

  return (
    <AppLayout title="Manage Problems">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP TITLE & BADGE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Problems
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage coding challenges on your platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0D684D] text-xs font-bold">
              {problems.length} Problems
            </span>
          </div>
        </div>

        {/* PROBLEMS LIST / TABLE CARD */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-3">
            <div className="col-span-8">PROBLEM</div>
            <div className="col-span-2">TOPIC</div>
            <div className="col-span-2 text-right">DIFFICULTY</div>
          </div>

          <div className="space-y-6">
            {problems.map((p, idx) => (
              <div key={p.id} className="pt-2 border-b border-slate-200 pb-6 last:border-b-0 space-y-3">
                <div className="grid grid-cols-12 items-start">
                  <div className="col-span-8 pr-4">
                    <p className="font-bold text-slate-900 text-sm">
                      {idx + 1}. {p.title}
                    </p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="col-span-2 text-xs font-medium text-slate-600">
                    {p.topic || 'General'}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#0D684D] border border-emerald-100">
                      {p.difficulty || 'EASY'}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="w-full py-2 px-4 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-semibold text-center transition-colors"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/admin/problems/edit/${p.id}`}
                    className="py-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/admin/problems/${p.id}/test-cases`}
                    className="py-2 px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#0D684D] text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    Test Cases
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
