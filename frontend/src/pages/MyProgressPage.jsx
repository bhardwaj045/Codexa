import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import { AppLayout } from '../components/AppLayout';

export const MyProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await dashboardApi.getStudentDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  const d = data || {
    problemsSolved: 0,
    totalAvailableProblems: 11,
    acceptanceRate: 0,
    easySolved: 0,
    easyTotal: 11,
    mediumSolved: 0,
    mediumTotal: 0,
    hardSolved: 0,
    hardTotal: 0,
    recentSubmissions: []
  };

  const solvedEasy = d.easySolved ?? 0;
  const totalEasy = d.easyTotal || 11;
  const easyPercent = totalEasy > 0 ? Math.round((solvedEasy / totalEasy) * 100) : 0;
  const solvedMedium = d.mediumSolved ?? 0;
  const totalMedium = d.mediumTotal ?? 0;
  const mediumPercent = totalMedium > 0 ? Math.round((solvedMedium / totalMedium) * 100) : 0;
  const solvedHard = d.hardSolved ?? 0;
  const totalHard = d.hardTotal ?? 0;
  const hardPercent = totalHard > 0 ? Math.round((solvedHard / totalHard) * 100) : 0;
  const totalAttempts = d.recentSubmissions?.length || 0;

  return (
    <AppLayout title="My Progress">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 4 PROGRESS METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Problems Solved */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Problems solved</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{d.problemsSolved}</p>
            <p className="text-xs text-slate-500 mt-2">Unique accepted problems</p>
          </div>

          {/* 2. Total Problems */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Total problems</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{d.totalAvailableProblems}</p>
            <p className="text-xs text-slate-500 mt-2">Available challenges</p>
          </div>

          {/* 3. Completion Rate */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Completion rate</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{easyPercent}%</p>
            <p className="text-xs text-slate-500 mt-2">Problems completed</p>
          </div>

          {/* 4. Total Attempts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Total attempts</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalAttempts}</p>
            <p className="text-xs text-slate-500 mt-2">All recorded submissions</p>
          </div>
        </div>

        {/* DIFFICULTY-WISE PROGRESS CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">Difficulty-wise progress</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-6">
            Your accepted solutions in each difficulty level
          </p>

          <div className="space-y-6">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Easy</span>
                <span className="font-semibold text-slate-800">{solvedEasy} / {totalEasy} solved</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0D684D] rounded-full transition-all"
                  style={{ width: `${easyPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{easyPercent}% completed</p>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Medium</span>
                <span className="font-semibold text-slate-800">{solvedMedium} / {totalMedium} solved</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0D684D] rounded-full" style={{ width: `${mediumPercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{mediumPercent}% completed</p>
            </div>

            {/* Hard */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Hard</span>
                <span className="font-semibold text-slate-800">{solvedHard} / {totalHard} solved</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0D684D] rounded-full" style={{ width: `${hardPercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{hardPercent}% completed</p>
            </div>
          </div>
        </div>

        {/* KEEP IMPROVING CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">Keep improving!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Continue solving problems and your progress will update automatically after accepted submissions.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};
