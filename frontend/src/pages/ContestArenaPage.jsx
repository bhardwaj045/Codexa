import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contestApi } from '../api/contestApi';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Code2, 
  ArrowLeft, 
  ExternalLink,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  Send
} from 'lucide-react';

export const ContestArenaPage = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('PROBLEMS'); // PROBLEMS, LEADERBOARD, SUBMISSIONS
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isFinished: false });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadContestData();
  }, [id]);

  // Live countdown timer ticking every second
  useEffect(() => {
    if (!contest?.endTime) return;

    const updateTimer = () => {
      const total = Date.parse(contest.endTime) - Date.now();
      if (total <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isFinished: true });
        return;
      }

      const seconds = Math.floor((total / 1000) % 60);
      const minutes = Math.floor((total / 1000 / 60) % 60);
      const hours = Math.floor((total / (1000 * 60 * 60)));
      setTimeLeft({ hours, minutes, seconds, isFinished: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const loadContestData = async () => {
    try {
      setLoading(true);
      const [contestRes, lbRes, subRes] = await Promise.all([
        contestApi.getContestDetail(id),
        contestApi.getContestLeaderboard(id),
        contestApi.getContestSubmissions(id)
      ]);
      setContest(contestRes.data);
      setLeaderboard(lbRes.data || []);
      setSubmissions(subRes.data || []);

      // If student is logged in and not registered, auto-join for smooth experience
      if (user && !isAdmin && !contestRes.data.isRegistered && contestRes.data.status === 'LIVE') {
        try {
          await contestApi.joinContest(id);
          const updated = await contestApi.getContestDetail(id);
          setContest(updated.data);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Failed to load contest', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const [lbRes, subRes] = await Promise.all([
        contestApi.getContestLeaderboard(id),
        contestApi.getContestSubmissions(id)
      ]);
      setLeaderboard(lbRes.data || []);
      setSubmissions(subRes.data || []);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Contest Arena">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Entering Contest Arena...</p>
        </div>
      </AppLayout>
    );
  }

  if (!contest) {
    return (
      <AppLayout title="Contest Not Found">
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Contest Not Found</h2>
          <Link to="/contests" className="text-emerald-600 font-semibold hover:underline">
            &larr; Back to Contests Catalog
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isLive = contest.status === 'LIVE' && !timeLeft.isFinished;

  return (
    <AppLayout title={contest.title}>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/contests"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Contests</span>
          </Link>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh Standings</span>
          </button>
        </div>

        {/* CONTEST HEADER ARENA BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    CONTEST IS LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    CONTEST FINISHED
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                  ⏱ 2 Hours Duration
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  🧩 5 Challenges
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Eye className="w-3.5 h-3.5" />
                    ADMIN (MONITOR ONLY)
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {contest.title}
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed">
                {contest.description}
              </p>
            </div>

            {/* LIVE COUNTDOWN CLOCK */}
            <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 flex flex-col items-center justify-center shrink-0 min-w-[220px]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{isLive ? 'Time Remaining' : 'Contest Ended'}</span>
              </div>

              {isLive ? (
                <div className="flex items-center gap-2 font-mono text-3xl sm:text-4xl font-black text-emerald-400">
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">Hours</span>
                  </div>
                  <span className="pb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">Mins</span>
                  </div>
                  <span className="pb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] font-sans font-medium text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              ) : (
                <div className="font-mono text-xl font-bold text-slate-400 py-2">
                  00:00:00
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ARENA NAVIGATION TABS */}
        <div className="flex items-center gap-3 border-b border-slate-200">
          {[
            { id: 'PROBLEMS', label: 'Challenges (5 Problems)', icon: Code2, count: contest.problems?.length || 5 },
            { id: 'LEADERBOARD', label: 'Live Leaderboard', icon: Trophy, count: leaderboard.length },
            { id: 'SUBMISSIONS', label: 'Submissions Feed', icon: Send, count: submissions.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all -mb-px ${
                  active
                    ? 'border-[#0D684D] text-[#0D684D]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT: 1. PROBLEMS LIST */}
        {activeTab === 'PROBLEMS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Contest Problem Set</h3>
              <span className="text-xs text-slate-500">
                {isAdmin ? 'Contest problem set. Admins monitor submissions and rankings.' : 'Each challenge awards points upon getting Accepted'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {(contest.problems || []).map((cp) => {
                const isAccepted = cp.isSolved;
                return (
                  <div
                    key={cp.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Problem Order Badge (A, B, C, D, E) */}
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 group-hover:bg-[#0D684D] transition-colors">
                        {cp.orderLabel}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <Link
                            to={`/problems/${cp.problemId}?contestId=${contest.id}`}
                            className="font-bold text-base text-slate-900 hover:text-[#0D684D] transition-colors"
                          >
                            {cp.title}
                          </Link>
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Accepted
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className={`font-semibold px-2 py-0.5 rounded ${
                            cp.difficulty === 'EASY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : cp.difficulty === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {cp.difficulty}
                          </span>
                          <span>•</span>
                          <span>{cp.topic}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-700">★ {cp.points} Points</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:self-center">
                      {isAdmin ? (
                        <Link
                          to={`/problems/${cp.problemId}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Problem</span>
                        </Link>
                      ) : (
                        <Link
                          to={`/problems/${cp.problemId}?contestId=${contest.id}`}
                          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm ${
                            isAccepted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-[#0D684D] hover:bg-[#0A543E] text-white hover:scale-105'
                          }`}
                        >
                          <span>{isAccepted ? 'Review Solution' : 'Solve Challenge'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. LIVE LEADERBOARD */}
        {activeTab === 'LEADERBOARD' && (
          <div className="space-y-6">
            {/* TOP 3 PODIUM */}
            {leaderboard.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* 2nd Place */}
                {leaderboard[1] && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-between order-2 sm:order-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm mb-2 border border-slate-300">
                      🥈 2
                    </div>
                    <p className="font-bold text-slate-900 text-base">{leaderboard[1].userName}</p>
                    <p className="text-xs text-slate-500 mt-1">{leaderboard[1].problemsSolved} Solved • {leaderboard[1].penaltyMinutes}m Penalty</p>
                    <div className="mt-3 px-3 py-1 rounded-full bg-slate-50 font-mono text-sm font-bold text-slate-800 border border-slate-200">
                      {leaderboard[1].score} pts
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {leaderboard[0] && (
                  <div className="bg-gradient-to-b from-amber-50 via-white to-white rounded-2xl p-6 border-2 border-amber-300 shadow-md text-center flex flex-col items-center justify-between order-1 sm:order-2 sm:-translate-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center text-xl mb-2 shadow-sm">
                      👑 1
                    </div>
                    <p className="font-extrabold text-slate-900 text-lg">{leaderboard[0].userName}</p>
                    <p className="text-xs text-amber-700 font-medium mt-1">{leaderboard[0].problemsSolved} Solved • {leaderboard[0].penaltyMinutes}m Penalty</p>
                    <div className="mt-3 px-4 py-1.5 rounded-full bg-amber-400 text-slate-900 font-mono text-base font-extrabold shadow-sm">
                      {leaderboard[0].score} pts
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {leaderboard[2] && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center justify-between order-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-800 font-bold flex items-center justify-center text-sm mb-2 border border-amber-200">
                      🥉 3
                    </div>
                    <p className="font-bold text-slate-900 text-base">{leaderboard[2].userName}</p>
                    <p className="text-xs text-slate-500 mt-1">{leaderboard[2].problemsSolved} Solved • {leaderboard[2].penaltyMinutes}m Penalty</p>
                    <div className="mt-3 px-3 py-1 rounded-full bg-slate-50 font-mono text-sm font-bold text-slate-800 border border-slate-200">
                      {leaderboard[2].score} pts
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FULL RANKINGS TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                      <th className="py-3.5 px-4 text-center w-16">Rank</th>
                      <th className="py-3.5 px-4">Contestant</th>
                      <th className="py-3.5 px-4 text-center">Score</th>
                      <th className="py-3.5 px-4 text-center">Solved</th>
                      <th className="py-3.5 px-4 text-center">Penalty</th>
                      {(contest.problems || []).map((p) => (
                        <th key={p.id} className="py-3.5 px-3 text-center">
                          {p.orderLabel} ({p.points})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5 + (contest.problems?.length || 0)} className="py-12 text-center text-slate-500">
                          No submissions recorded yet. Be the first to solve a challenge!
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry) => {
                        const isCurrentUser = user && entry.userId === user.id;
                        return (
                          <tr
                            key={entry.userId}
                            className={`transition-colors hover:bg-slate-50 ${
                              isCurrentUser ? 'bg-emerald-50/70 font-semibold' : ''
                            }`}
                          >
                            <td className="py-4 px-4 text-center font-bold text-slate-700">
                              #{entry.rank}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-900 font-bold">{entry.userName}</span>
                                {isCurrentUser && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                              {entry.score}
                            </td>
                            <td className="py-4 px-4 text-center text-slate-700">
                              {entry.problemsSolved} / {contest.problems?.length || 5}
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-xs text-slate-500">
                              {entry.penaltyMinutes}m
                            </td>

                            {/* Per-Problem Status Badges */}
                            {(contest.problems || []).map((cp) => {
                              const pResult = entry.problemResults?.[cp.problemId];
                              if (pResult?.solved) {
                                return (
                                  <td key={cp.id} className="py-4 px-3 text-center">
                                    <span className="inline-flex flex-col items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                                      <span>+{pResult.points}</span>
                                      <span className="text-[9px] text-emerald-700 font-normal">{pResult.solvedMinutes}m</span>
                                    </span>
                                  </td>
                                );
                              } else if (pResult?.attempts > 0) {
                                return (
                                  <td key={cp.id} className="py-4 px-3 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-mono">
                                      -{pResult.attempts}
                                    </span>
                                  </td>
                                );
                              }
                              return (
                                <td key={cp.id} className="py-4 px-3 text-center text-slate-300">
                                  -
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 3. SUBMISSIONS FEED */}
        {activeTab === 'SUBMISSIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Real-Time Contest Submissions</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Contestant</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4 text-center">Verdict</th>
                    <th className="py-3 px-4 text-right">Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No submissions received yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const isAccepted = sub.submissionStatus === 'ACCEPTED';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                            {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {sub.userName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            {sub.problemTitle}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                            {sub.programmingLanguage}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isAccepted
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isAccepted ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {sub.submissionStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                            {sub.executionTimeMs != null ? `${sub.executionTimeMs} ms` : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
