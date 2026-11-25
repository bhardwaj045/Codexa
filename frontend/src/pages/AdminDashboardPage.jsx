import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { problemApi } from '../api/problemApi';
import { AppLayout } from '../components/AppLayout';
import { Plus, ArrowRight, FolderKanban, Layers, FileText } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [dashRes, usersRes] = await Promise.all([
        dashboardApi.getAdminDashboard(),
        dashboardApi.getRegisteredUsers()
      ]);
      setMetrics(dashRes.data);
      // Only keep registered student users in the display list
      const studentsOnly = (usersRes.data || []).filter((u) => u.userRole !== 'ADMIN');
      setRegisteredUsers(studentsOnly);
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const m = metrics || {
    totalUsers: 1,
    totalStudents: 1,
    totalProblems: 11,
    totalSubmissions: 11,
    easyCount: 11,
    mediumCount: 0,
    hardCount: 0,
    platformAcceptanceRate: 36,
    recentSubmissions: []
  };

  const totalProblems = m.totalProblems || 11;
  const easyCount = m.easyCount ?? 11;
  const mediumCount = m.mediumCount ?? 0;
  const hardCount = m.hardCount ?? 0;
  const easyPercent = totalProblems > 0 ? Math.round((easyCount / totalProblems) * 100) : 100;
  const mediumPercent = totalProblems > 0 ? Math.round((mediumCount / totalProblems) * 100) : 0;
  const hardPercent = totalProblems > 0 ? Math.round((hardCount / totalProblems) * 100) : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* PLATFORM OVERVIEW HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#0D684D] tracking-wider uppercase">
              ADMINISTRATION
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Platform overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor your coding library and manage platform content.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/problems/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add new problem</span>
            </Link>
          </div>
        </div>

        {/* 4 PURE WHITE METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Total Problems */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">Total problems</p>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">{totalProblems}</p>
            <p className="text-xs text-slate-500 mt-2">Available coding challenges</p>
          </div>

          {/* 2. Easy Problems */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">Easy problems</p>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">{easyCount}</p>
            <p className="text-xs text-slate-500 mt-2">Beginner level</p>
          </div>

          {/* 3. Medium Problems */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">Medium problems</p>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                ◆
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">{mediumCount}</p>
            <p className="text-xs text-slate-500 mt-2">Intermediate level</p>
          </div>

          {/* 4. Hard Problems */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">Hard problems</p>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                ◆
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-3">{hardCount}</p>
            <p className="text-xs text-slate-500 mt-2">Advanced level</p>
          </div>
        </div>

        {/* 2-COLUMN SECTION: Problem Distribution & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Problem distribution
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Breakdown of your coding challenge library
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0D684D] flex items-center justify-center text-xs">
                  <Layers className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-5">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span>Easy</span>
                    <span className="font-semibold text-slate-900">{easyCount}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-[#0D684D] rounded-full transition-all"
                      style={{ width: `${easyPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{easyPercent}% of all problems</p>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span>Medium</span>
                    <span className="font-semibold text-slate-900">{mediumCount}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-[#0D684D] rounded-full" style={{ width: `${mediumPercent}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{mediumPercent}% of all problems</p>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span>Hard</span>
                    <span className="font-semibold text-slate-900">{hardCount}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div className="h-full bg-[#0D684D] rounded-full" style={{ width: `${hardPercent}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{hardPercent}% of all problems</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-[#0D684D] uppercase tracking-wider mb-1">
                QUICK ACTIONS
              </p>
              <h3 className="text-base font-bold text-slate-900">
                Manage your platform
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-6">
                Use these shortcuts to maintain your coding problem library.
              </p>

              <div className="space-y-3">
                <Link
                  to="/admin/problems/new"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-300 hover:border-emerald-300 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D684D] flex items-center justify-center font-bold text-lg">
                      +
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#0D684D] transition-colors">
                        Add a problem
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Create a new coding challenge
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D684D] group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/admin/problems"
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-300 hover:border-emerald-300 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0D684D] flex items-center justify-center">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-[#0D684D] transition-colors">
                        Manage problems
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Review or remove existing challenges
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0D684D] group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* REGISTERED USERS SUMMARY CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Registered platform users
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students practicing on CoDingHub
              </p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-[#0D684D] hover:underline"
            >
              Manage users &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Problems Solved</th>
                  <th className="py-2.5 px-3">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {registeredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No student records found
                    </td>
                  </tr>
                ) : (
                  registeredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold text-slate-800">{u.name}</td>
                      <td className="py-3 px-3 text-slate-500">{u.email}</td>
                      <td className="py-3 px-3 text-slate-700">{u.problemsSolved || 0}</td>
                      <td className="py-3 px-3 font-semibold text-[#0D684D]">{u.totalPoints || 0} pts</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
