import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contestApi } from '../api/contestApi';
import { AppLayout } from '../components/AppLayout';
import { 
  Trophy, 
  Clock, 
  Users, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Code2, 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  X, 
  FileCode, 
  Layers, 
  Flame, 
  Radio, 
  Copy, 
  Check 
} from 'lucide-react';

export const AdminContestMonitorPage = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('LEADERBOARD'); // LEADERBOARD, SUBMISSIONS, PROBLEMS
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isFinished: false });

  useEffect(() => {
    fetchData(true);
  }, [id]);

  // Real-time auto-refresh polling every 4 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const pollInterval = setInterval(() => {
      fetchData(false);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [id, autoRefresh]);

  // Live ticking countdown timer
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

  const fetchData = async (isFirst = false) => {
    try {
      if (isFirst) setLoading(true);
      else setRefreshing(true);

      const [cRes, lbRes, subRes] = await Promise.all([
        contestApi.getContestDetail(id),
        contestApi.getContestLeaderboard(id),
        contestApi.getContestSubmissions(id)
      ]);

      setContest(cRes.data);
      setLeaderboard(lbRes.data || []);
      setSubmissions(subRes.data || []);
    } catch (err) {
      console.error('Failed to load contest monitor data', err);
    } finally {
      if (isFirst) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AppLayout title="Contest Monitoring">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Connecting to Contest Live Feed...</p>
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
          <Link to="/admin/contests" className="text-emerald-600 font-semibold hover:underline">
            &larr; Back to Manage Contests
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isLive = contest.status === 'LIVE' && !timeLeft.isFinished;
  const acceptedCount = submissions.filter(s => s.submissionStatus === 'ACCEPTED').length;

  return (
    <AppLayout title="Contest Monitoring">
      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* TOP NAVIGATION BREADCRUMB & CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/contests"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Manage Contests</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Live Polling Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{autoRefresh ? 'Auto-Refresh: ON (4s)' : 'Auto-Refresh: OFF'}</span>
            </button>

            <button
              onClick={() => fetchData(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* MONITOR HERO BANNER */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Eye className="w-3.5 h-3.5" />
                  ADMIN MONITORING CENTER
                </span>
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
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  ⏱ {contest.durationMinutes} Minutes Duration
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {contest.title}
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                {contest.description}
              </p>
            </div>

            {/* LIVE COUNTDOWN CLOCK */}
            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700 flex flex-col items-center justify-center shrink-0 min-w-[200px]">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isLive ? 'Time Remaining' : 'Contest Ended'}</span>
              </div>

              {isLive ? (
                <div className="font-mono text-3xl font-black text-emerald-400 tracking-tight">
                  {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              ) : (
                <div className="font-mono text-2xl font-bold text-slate-400">
                  00:00:00
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contestants</p>
            <p className="text-2xl font-extrabold text-slate-900">{leaderboard.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Active on leaderboard</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Submissions</p>
            <p className="text-2xl font-extrabold text-blue-600">{submissions.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Evaluated in real-time</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Accepted</p>
            <p className="text-2xl font-extrabold text-emerald-600">{acceptedCount}</p>
            <p className="text-[11px] text-slate-500 font-medium">Solved challenges</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Challenges</p>
            <p className="text-2xl font-extrabold text-purple-600">{contest.problems?.length || 0}</p>
            <p className="text-[11px] text-slate-500 font-medium">Problems in contest</p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            { id: 'LEADERBOARD', label: 'Live Leaderboard', icon: Trophy, count: leaderboard.length },
            { id: 'SUBMISSIONS', label: 'Real-Time Submissions Feed', icon: Send, count: submissions.length },
            { id: 'PROBLEMS', label: 'Assigned Problems', icon: Code2, count: contest.problems?.length || 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all -mb-px ${
                  active
                    ? 'border-[#0D684D] text-[#0D684D]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LIVE LEADERBOARD */}
        {activeTab === 'LEADERBOARD' && (
          <div className="space-y-6">
            {/* TOP 3 PODIUM */}
            {leaderboard.length >= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {leaderboard[1] && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-between order-2 sm:order-1">
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

                {leaderboard[0] && (
                  <div className="bg-gradient-to-b from-amber-50 via-white to-white rounded-2xl p-6 border-2 border-amber-300 shadow-md text-center flex flex-col items-center justify-between order-1 sm:order-2 sm:-translate-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-400 text-white font-bold flex items-center justify-center text-xl mb-2 shadow-xs">
                      👑 1
                    </div>
                    <p className="font-extrabold text-slate-900 text-lg">{leaderboard[0].userName}</p>
                    <p className="text-xs text-amber-700 font-medium mt-1">{leaderboard[0].problemsSolved} Solved • {leaderboard[0].penaltyMinutes}m Penalty</p>
                    <div className="mt-3 px-4 py-1.5 rounded-full bg-amber-400 text-slate-900 font-mono text-base font-extrabold shadow-xs">
                      {leaderboard[0].score} pts
                    </div>
                  </div>
                )}

                {leaderboard[2] && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-between order-3">
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

            {/* FULL RANKING TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Contest Scoreboard & Ranking</h3>
                <span className="text-xs text-slate-500">Auto-updating live every 4 seconds</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
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
                          No contestant submissions recorded yet. Submissions will populate here live.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry) => (
                        <tr key={entry.userId} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 text-center font-bold text-slate-700">
                            #{entry.rank}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900">
                            {entry.userName}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                            {entry.score}
                          </td>
                          <td className="py-4 px-4 text-center text-slate-700">
                            {entry.problemsSolved} / {contest.problems?.length || 0}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-xs text-slate-500">
                            {entry.penaltyMinutes}m
                          </td>

                          {(contest.problems || []).map((cp) => {
                            const pResult = entry.problemResults?.[cp.problemId] || entry.problemResults?.[String(cp.problemId)];
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SUBMISSIONS STREAM */}
        {activeTab === 'SUBMISSIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Live Contest Submissions Stream</h3>
              <span className="text-xs text-slate-500">Click "Inspect Code" to view contestant code</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/60 text-slate-600 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Contestant</th>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4 text-center">Verdict</th>
                    <th className="py-3 px-4 text-right">Runtime</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No submissions received in this contest yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const isAccepted = sub.submissionStatus === 'ACCEPTED';
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
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
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedSub(sub)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <FileCode className="w-3.5 h-3.5" />
                              <span>Inspect Code</span>
                            </button>
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

        {/* TAB 3: CHALLENGES LIST */}
        {activeTab === 'PROBLEMS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">Contest Problems Set</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {(contest.problems || []).map((cp) => (
                <div
                  key={cp.id}
                  className="p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                      {cp.orderLabel}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{cp.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-emerald-700">{cp.difficulty}</span>
                        <span>•</span>
                        <span>{cp.topic}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">★ {cp.points} Points</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/problems/${cp.problemId}?contestId=${contest.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Problem</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CODE INSPECTOR MODAL */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedSub.problemTitle} — Submitted Code
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contestant: <span className="font-bold text-slate-800">{selectedSub.userName}</span> • {selectedSub.programmingLanguage} • {selectedSub.submissionStatus}
                  </p>
                </div>
                <button onClick={() => setSelectedSub(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 bg-slate-900 rounded-2xl p-4 overflow-y-auto font-mono text-xs text-slate-200 border border-slate-800">
                <button
                  onClick={() => handleCopyCode(selectedSub.sourceCode)}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-sans font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="whitespace-pre-wrap">{selectedSub.sourceCode || '// No source code recorded'}</pre>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
