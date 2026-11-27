import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboardApi';
import { submissionApi } from '../api/submissionApi';
import { AppLayout } from '../components/AppLayout';
import { Flame, Copy, Check, X, Calendar, Clock, Sparkles } from 'lucide-react';

export const UserDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [mySubmissionsCache, setMySubmissionsCache] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardApi.getStudentDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const d = data || {
    name: '',
    problemsSolved: 0,
    totalAvailableProblems: 0,
    acceptedSubmissions: 0,
    acceptanceRate: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalSubmissions: 0,
    easySolved: 0,
    easyTotal: 0,
    mediumSolved: 0,
    mediumTotal: 0,
    hardSolved: 0,
    hardTotal: 0,
    submissionCalendar: {},
    recentSubmissions: [],
    nextChallenge: null
  };

  const solvedEasy = d.easySolved ?? 0;
  const totalEasy = d.easyTotal || 0;
  const easyPercent = totalEasy > 0 ? Math.round((solvedEasy / totalEasy) * 100) : 0;

  const solvedMedium = d.mediumSolved ?? 0;
  const totalMedium = d.mediumTotal ?? 0;
  const mediumPercent = totalMedium > 0 ? Math.round((solvedMedium / totalMedium) * 100) : 0;

  const solvedHard = d.hardSolved ?? 0;
  const totalHard = d.hardTotal ?? 0;
  const hardPercent = totalHard > 0 ? Math.round((solvedHard / totalHard) * 100) : 0;

  // Real recent submissions list
  const recentList = (d.recentSubmissions || []).map(s => ({
    id: s.id,
    problemId: s.problemId,
    problemTitle: s.problemTitle || `Problem #${s.problemId}`,
    language: s.programmingLanguage || s.language || 'JAVA',
    submittedAt: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-GB') : '',
    submittedTime: s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    status: s.submissionStatus || s.status || 'EVALUATED',
    sourceCode: s.sourceCode,
    executionTimeMs: s.executionTimeMs,
    memoryUsedMb: s.memoryUsedKb ? (s.memoryUsedKb / 1024).toFixed(1) : (s.memoryUsedMb || null)
  }));

  // Activity calendar generation grouped cleanly by month (past 12 months)
  const { calendarMonths, totalYearSubmissions, activeDaysCount } = useMemo(() => {
    const calendarMap = d.submissionCalendar || {};
    let yearSubCount = 0;
    let activeDays = 0;

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const monthsData = [];
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 to 11

    // Rolling 12 months ending with current month
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const monthName = monthDate.toLocaleString('en-US', { month: 'short' });

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

      const weeks = [];
      let currentWeek = [];

      // Leading empty placeholders for days before the 1st of this month
      for (let pad = 0; pad < firstDayOfWeek; pad++) {
        currentWeek.push({ isEmpty: true });
      }

      for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
        const cellDate = new Date(year, month, dayNum);
        const yyyy = cellDate.getFullYear();
        const mm = String(cellDate.getMonth() + 1).padStart(2, '0');
        const dd = String(cellDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const isFuture = cellDate > todayMidnight;
        const count = isFuture ? 0 : (calendarMap[dateStr] || 0);

        if (count > 0 && !isFuture) {
          yearSubCount += count;
          activeDays += 1;
        }

        currentWeek.push({
          isEmpty: false,
          dateStr,
          displayDate: cellDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          count,
          isFuture
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }

      // Trailing empty placeholders to complete the last week column
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({ isEmpty: true });
        }
        weeks.push(currentWeek);
      }

      monthsData.push({
        name: monthName,
        year,
        weeks
      });
    }

    return {
      calendarMonths: monthsData,
      totalYearSubmissions: yearSubCount,
      activeDaysCount: activeDays
    };
  }, [d.submissionCalendar]);

  // Dynamic Weekly Activity (past 7 days calculated from real submissions)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weeklyData = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(today.getDate() - i);
    const dayStr = dt.toISOString().split('T')[0];
    const dayLabel = daysOfWeek[dt.getDay()];
    const count = (d.submissionCalendar && d.submissionCalendar[dayStr]) || (
      (d.recentSubmissions || []).filter(s => {
        if (!s.submittedAt) return false;
        return new Date(s.submittedAt).toISOString().split('T')[0] === dayStr;
      }).length
    );
    weeklyData.push({ day: dayLabel, count });
  }
  const maxWeekly = Math.max(1, ...weeklyData.map(w => w.count));

  // Handle "View Code"
  const handleViewCode = async (sub) => {
    if (sub.sourceCode) {
      setSelectedSubmission(sub);
      return;
    }

    // If sourceCode wasn't included, fetch it dynamically from submissions API
    try {
      let subs = mySubmissionsCache;
      if (!subs) {
        const res = await submissionApi.getMySubmissions();
        subs = res.data || [];
        setMySubmissionsCache(subs);
      }
      const match = subs.find(item => item.id === sub.id);
      if (match && match.sourceCode) {
        setSelectedSubmission({
          ...sub,
          sourceCode: match.sourceCode
        });
      } else {
        setSelectedSubmission({
          ...sub,
          sourceCode: '// Source code could not be retrieved for this submission.'
        });
      }
    } catch (err) {
      console.error('Failed to load submission source code', err);
      setSelectedSubmission({
        ...sub,
        sourceCode: '// Error loading source code from server.'
      });
    }
  };

  const copyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getHeatmapColor = (count, isFuture) => {
    if (isFuture) return 'bg-transparent';
    if (!count || count === 0) return 'bg-[#EBEDF0] hover:bg-[#E2E6EA] border border-slate-300/80';
    if (count === 1) return 'bg-[#9BE9A8] hover:bg-[#85E394] border border-[#85E394]';
    if (count <= 3) return 'bg-[#40C463] hover:bg-[#34B355] border border-[#34B355]';
    return 'bg-[#216E39] hover:bg-[#1C5F31] border border-[#1C5F31]';
  };

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* STUDENT OVERVIEW HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#0D684D] tracking-wider uppercase">
              STUDENT DASHBOARD
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Welcome back, {d.name || 'Student'}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your authentic coding metrics, streak, and recent problem evaluations.
            </p>
          </div>

          <Link
            to="/problems"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-sm font-semibold shadow-sm transition-all self-start sm:self-auto hover:scale-[1.02] active:scale-95"
          >
            Explore problems &rarr;
          </Link>
        </div>

        {/* 4 TOP METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Problems Solved */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Problems solved</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {d.problemsSolved}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Out of {d.totalAvailableProblems} available problems
            </p>
          </div>

          {/* 2. Accepted Submissions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Accepted submissions</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {d.acceptedSubmissions}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Successful solutions passed
            </p>
          </div>

          {/* 3. Acceptance Rate */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Acceptance rate</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {d.acceptanceRate}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              All judge submissions
            </p>
          </div>

          {/* 4. Current Streak */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">Current streak</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-2 flex items-center gap-1.5">
              <span>{d.currentStreak}</span>
              <span className="text-2xl">🔥</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Max streak: <b>{d.maxStreak || d.currentStreak} days</b>
            </p>
          </div>
        </div>

        {/* CODING ACTIVITY CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {totalYearSubmissions} submissions in the past year
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hoveredDay ? (
                  <span className="text-emerald-700 font-semibold">
                    {hoveredDay.count} {hoveredDay.count === 1 ? 'submission' : 'submissions'} on {hoveredDay.displayDate}
                  </span>
                ) : (
                  <span>Hover over any square to view daily submission counts</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{activeDaysCount} active days</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Flame className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>{d.currentStreak} day streak</span>
              </div>
            </div>
          </div>

          {/* Contribution Calendar Grid - Grouped and Separated by Month */}
          <div className="overflow-x-auto py-2">
            <div className="min-w-fit select-none">
              <div className="flex gap-2 items-start">
                {/* Day labels column (Mon, Wed, Fri aligned with rows 1, 3, 5) */}
                <div className="flex flex-col text-[10px] font-semibold text-slate-500 w-6 shrink-0 select-none">
                  {/* Spacer matching month label height and margin */}
                  <div className="h-4 mb-1.5" />
                  <div className="flex flex-col gap-1">
                    <div className="w-2.5 h-2.5 flex items-center justify-end invisible"><span className="text-[9px]">Sun</span></div>
                    <div className="w-2.5 h-2.5 flex items-center justify-end"><span className="text-[9px] leading-none">Mon</span></div>
                    <div className="w-2.5 h-2.5 flex items-center justify-end invisible"><span className="text-[9px]">Tue</span></div>
                    <div className="w-2.5 h-2.5 flex items-center justify-end"><span className="text-[9px] leading-none">Wed</span></div>
                    <div className="w-2.5 h-2.5 flex items-center justify-end invisible"><span className="text-[9px]">Thu</span></div>
                    <div className="w-2.5 h-2.5 flex items-center justify-end"><span className="text-[9px] leading-none">Fri</span></div>
                    <div className="w-2.5 h-2.5 flex items-center justify-end invisible"><span className="text-[9px]">Sat</span></div>
                  </div>
                </div>

                {/* Months separated by gap-3 */}
                <div className="flex items-start gap-3">
                  {calendarMonths.map((m, mIdx) => (
                    <div key={mIdx} className="flex flex-col">
                      {/* Month label header */}
                      <span className="text-[10px] font-semibold text-slate-500 mb-1.5 h-4 select-none">
                        {m.name}
                      </span>

                      {/* Month Weeks */}
                      <div className="flex gap-1">
                        {m.weeks.map((week, wIdx) => (
                          <div key={wIdx} className="flex flex-col gap-1">
                            {week.map((day, dIdx) => {
                              if (day.isEmpty) {
                                return <div key={dIdx} className="w-2.5 h-2.5 invisible pointer-events-none" />;
                              }
                              return (
                                <div
                                  key={dIdx}
                                  onMouseEnter={() => !day.isFuture && setHoveredDay(day)}
                                  onMouseLeave={() => setHoveredDay(null)}
                                  className={`w-2.5 h-2.5 rounded-[2px] transition-all cursor-pointer ${getHeatmapColor(day.count, day.isFuture)}`}
                                  title={day.isFuture ? '' : `${day.count} submissions on ${day.displayDate}`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-end text-xs text-slate-500 mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#EBEDF0] border border-slate-300"></div>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#9BE9A8] border border-[#85E394]"></div>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#40C463] border border-[#34B355]"></div>
                <div className="w-2.5 h-2.5 rounded-[2px] bg-[#216E39] border border-[#1C5F31]"></div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* WEEKLY ACTIVITY & NEXT CHALLENGE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Coding Activity (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Weekly coding activity</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-6">
              Your real submissions over the last 7 days
            </p>

            <div className="flex items-end justify-between h-44 px-4 pt-4 border-b border-slate-200 pb-2">
              {weeklyData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-slate-700">{item.count}</span>
                  <div className="w-6 h-28 bg-slate-100 rounded-t-md flex items-end justify-center">
                    <div
                      className="w-full bg-[#0D684D] rounded-t-md transition-all"
                      style={{ height: item.count > 0 ? `${(item.count / maxWeekly) * 100}%` : '4px' }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real Next Challenge (1 col) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col justify-between">
            {d.nextChallenge ? (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>RECOMMENDED CHALLENGE</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {d.nextChallenge.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {d.nextChallenge.description || 'Solve this algorithmic challenge to boost your problem-solving streak.'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {d.nextChallenge.difficulty || 'EASY'}
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {d.nextChallenge.topic || 'General'}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">
                  ALL CAUGHT UP
                </p>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  All Problems Solved!
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You have solved every available problem currently in the catalog. Great job!
                </p>
              </div>
            )}

            <Link
              to={d.nextChallenge ? `/problems/${d.nextChallenge.id}` : "/problems"}
              className="mt-6 w-full py-3 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <span>{d.nextChallenge ? 'Solve Challenge' : 'Explore Problems'}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* LEARNING PROGRESS CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Learning progress</h3>
              <p className="text-xs text-slate-500 mt-0.5">Problems solved by difficulty level</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Easy</span>
                <span className="font-semibold text-slate-800">{solvedEasy} / {totalEasy} solved</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-[#0D684D] rounded-full transition-all"
                  style={{ width: `${easyPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{easyPercent}% completed</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Medium</span>
                <span className="font-semibold text-slate-800">{solvedMedium} / {totalMedium} solved</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-[#0D684D] rounded-full" style={{ width: `${mediumPercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{mediumPercent}% completed</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                <span>Hard</span>
                <span className="font-semibold text-slate-800">{solvedHard} / {totalHard} solved</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-[#0D684D] rounded-full" style={{ width: `${hardPercent}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{hardPercent}% completed</p>
            </div>
          </div>
        </div>

        {/* RECENT SUBMISSIONS TABLE CARD */}
        <div className="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Submissions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your latest problem submissions and judge evaluations</p>
            </div>
            <Link
              to="/submissions"
              className="text-xs font-semibold text-[#0D684D] hover:underline transition-colors flex items-center gap-1"
            >
              <span>View all</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Question</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Runtime</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Time Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-semibold text-slate-700">No submissions yet</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Solve problems to see your real attempts, evaluation results, and code here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentList.map((sub, idx) => {
                    const isAccepted = sub.status === 'ACCEPTED';
                    return (
                      <tr key={sub.id || idx} className="hover:bg-slate-50 transition-colors">
                        {/* Question */}
                        <td className="py-3 px-4">
                          {sub.problemId ? (
                            <Link
                              to={`/problems/${sub.problemId}`}
                              className="font-semibold text-slate-900 hover:text-[#0D684D] hover:underline"
                            >
                              {sub.problemTitle}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900">{sub.problemTitle}</span>
                          )}
                        </td>

                        {/* Status (bold color + dot) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${isAccepted ? 'bg-[#2CBB5D]' : 'bg-[#EF4743]'}`} />
                            <span className={`font-bold ${isAccepted ? 'text-[#2CBB5D]' : 'text-[#EF4743]'}`}>
                              {isAccepted ? 'Accepted' : (sub.status.replace(/_/g, ' ') || 'Wrong Answer')}
                            </span>
                          </div>
                        </td>

                        {/* Runtime */}
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {sub.executionTimeMs != null ? `${sub.executionTimeMs} ms` : 'N/A'}
                        </td>

                        {/* Language */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold border border-slate-200 uppercase">
                            {sub.language}
                          </span>
                        </td>

                        {/* Time Submitted */}
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {sub.submittedAt} {sub.submittedTime && <span className="text-slate-400 text-[10px]">({sub.submittedTime})</span>}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewCode(sub)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              View Code
                            </button>
                            {sub.problemId && (
                              <Link
                                to={`/problems/${sub.problemId}`}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0D684D] hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
                              >
                                Solve Again
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

        {/* View Code Modal for Dashboard (Rendered at document.body for full-screen edge-to-edge blur) */}
        {selectedSubmission && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Submission #{selectedSubmission.id} • {selectedSubmission.problemTitle}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedSubmission.status === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(selectedSubmission.sourceCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto font-mono text-xs max-h-96 leading-relaxed">
                  {selectedSubmission.sourceCode || '// No source code recorded'}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Language: <b className="text-slate-800">{selectedSubmission.language}</b></span>
                <span>Execution Time: <b className="text-slate-800">{selectedSubmission.executionTimeMs || 0} ms</b></span>
                <div className="flex items-center gap-2">
                  {selectedSubmission.problemId && (
                    <Link
                      to={`/problems/${selectedSubmission.problemId}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Solve in Workspace
                    </Link>
                  )}
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-1.5 rounded-xl bg-[#0D684D] text-white font-semibold hover:bg-[#0A543E] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  );
};
