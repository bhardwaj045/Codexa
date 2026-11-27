import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { contestApi } from '../api/contestApi';
import { AppLayout } from '../components/AppLayout';
import { proctoringService } from '../utils/proctoringService';
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
  Check,
  Video,
  VideoOff,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Maximize2,
  Minimize2,
  Volume2,
  Activity,
  UserX,
  UserCheck,
  Lock,
  Play
} from 'lucide-react';

export const AdminContestMonitorPage = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('LEADERBOARD'); // LEADERBOARD, PROCTORING, SUBMISSIONS, AUDIT, PROBLEMS
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedLiveStudent, setSelectedLiveStudent] = useState(null);
  const [proctoringFilter, setProctoringFilter] = useState('ALL'); // ALL, FLAGGED, BANNED, CLEAN
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, isFinished: false });
  const [startCountdown, setStartCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [proctoringUpdateTick, setProctoringUpdateTick] = useState(0);

  useEffect(() => {
    fetchData(true);
  }, [id]);

  // Subscribe to real-time anti-cheat proctoring events
  useEffect(() => {
    const unsubscribe = proctoringService.subscribe(() => {
      setProctoringUpdateTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Real-time auto-refresh polling every 4 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const pollInterval = setInterval(() => {
      fetchData(false);
    }, 4000);
    return () => clearInterval(pollInterval);
  }, [id, autoRefresh]);

  // Live ticking countdown timer for contest start & end
  useEffect(() => {
    if (!contest) return;
    const updateTimer = () => {
      const now = Date.now();
      const startMs = contest.startTime ? Date.parse(contest.startTime) : 0;
      const endMs = contest.endTime ? Date.parse(contest.endTime) : 0;

      // Start countdown
      if (startMs > now) {
        const diff = startMs - now;
        setStartCountdown({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }

      // End countdown
      if (endMs > 0) {
        const total = endMs - now;
        if (total <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isFinished: true });
        } else {
          const seconds = Math.floor((total / 1000) % 60);
          const minutes = Math.floor((total / 1000 / 60) % 60);
          const hours = Math.floor((total / (1000 * 60 * 60)));
          setTimeLeft({ hours, minutes, seconds, isFinished: false });
        }
      }
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

  // Compile full contestant roster combining leaderboard and live proctoring roster
  const rosterData = proctoringService.getContestRoster(id);
  const contestantsMap = new Map();

  // 1. Add all from leaderboard
  leaderboard.forEach((entry) => {
    const banCheck = proctoringService.checkUserBan(entry.userId);
    const warnings = proctoringService.getWarnings(id, entry.userId);
    contestantsMap.set(entry.userId, {
      userId: entry.userId,
      userName: entry.userName || `Contestant #${entry.userId}`,
      score: entry.score || 0,
      problemsSolved: entry.problemsSolved || 0,
      penaltyMinutes: entry.penaltyMinutes || 0,
      rank: entry.rank,
      warningsCount: warnings.length,
      warnings,
      isBanned: banCheck.isBanned || warnings.length >= 5,
      bannedUntil: banCheck.bannedUntil,
      formattedExpiry: banCheck.formattedExpiry,
      cameraActive: true,
      lastSeen: Date.now()
    });
  });

  // 2. Add any active contestants in roster who haven't made submissions yet
  Object.values(rosterData).forEach((r) => {
    if (!contestantsMap.has(r.userId)) {
      const banCheck = proctoringService.checkUserBan(r.userId);
      const warnings = proctoringService.getWarnings(id, r.userId);
      contestantsMap.set(r.userId, {
        userId: r.userId,
        userName: r.userName || `Contestant #${r.userId}`,
        score: 0,
        problemsSolved: 0,
        penaltyMinutes: 0,
        rank: '-',
        warningsCount: warnings.length,
        warnings,
        isBanned: banCheck.isBanned || warnings.length >= 5,
        bannedUntil: banCheck.bannedUntil,
        formattedExpiry: banCheck.formattedExpiry,
        cameraActive: r.cameraActive !== false,
        lastSeen: r.lastSeen || Date.now()
      });
    }
  });

  const allContestants = Array.from(contestantsMap.values());
  const bannedContestants = allContestants.filter((c) => c.isBanned);
  const flaggedContestants = allContestants.filter((c) => c.warningsCount > 0 && !c.isBanned);
  const cleanContestants = allContestants.filter((c) => c.warningsCount === 0 && !c.isBanned);

  const filteredContestants = allContestants.filter((c) => {
    if (proctoringFilter === 'FLAGGED') return c.warningsCount > 0 && !c.isBanned;
    if (proctoringFilter === 'BANNED') return c.isBanned;
    if (proctoringFilter === 'CLEAN') return c.warningsCount === 0 && !c.isBanned;
    return true;
  });

  // Admin Actions for Contestants
  const handleIssueWarning = (contestant) => {
    const result = proctoringService.recordViolation(
      id,
      contestant.userId,
      contestant.userName,
      'Administrator manual security flag: Suspicious activity observed on live webcam feed',
      'ADMIN_MANUAL_WARNING'
    );
    setProctoringUpdateTick((prev) => prev + 1);
  };

  const handleBanContestant = (contestant) => {
    if (window.confirm(`Are you sure you want to block ${contestant.userName} from contests for 1 Month?`)) {
      proctoringService.banUser(
        contestant.userId,
        contestant.userName,
        id,
        'Administrator manual security disqualification (1-Month Contest Ban)'
      );
      setProctoringUpdateTick((prev) => prev + 1);
    }
  };

  const handleUnbanContestant = (contestant) => {
    if (window.confirm(`Pardon ${contestant.userName} and clear all warnings / 1-month ban?`)) {
      proctoringService.unbanUser(contestant.userId, id);
      setProctoringUpdateTick((prev) => prev + 1);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Contest Monitoring">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Connecting to Contest Live Feed & Proctoring...</p>
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

  const now = Date.now();
  const startMs = contest.startTime ? Date.parse(contest.startTime) : 0;
  const endMs = contest.endTime ? Date.parse(contest.endTime) : 0;
  const isDraft = contest.status === 'DRAFT';
  const isFinished = contest.status === 'COMPLETED' || (endMs > 0 && now >= endMs) || timeLeft.isFinished;
  const isLive = !isDraft && !isFinished && (contest.status === 'LIVE' || (startMs > 0 && now >= startMs));
  const isUpcoming = !isDraft && !isFinished && !isLive;
  const acceptedCount = submissions.filter(s => s.submissionStatus === 'ACCEPTED').length;

  return (
    <AppLayout title={isLive ? "Contest Live Monitoring" : isFinished ? "Contest Final Results & Audit" : "Contest Waiting Room"}>
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
              <span>Live Sync: {autoRefresh ? 'Active (4s)' : 'Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchData(false)}
              disabled={refreshing}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
              title="Refresh now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* HERO MONITOR HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {isLive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    LIVE MONITORING • PROCTORING ACTIVE
                  </span>
                ) : isUpcoming ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    CONTEST SCHEDULED • WAITING ROOM
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    CONTEST CONCLUDED • LIVE VIDEO CLOSED
                  </span>
                )}
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  ⏱ {contest.durationMinutes} Minutes Duration
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  🛡️ 5 Warnings = 1-Month Ban Policy
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
                <span>{isLive ? 'Time Remaining' : isUpcoming ? 'Contest Starts In' : 'Contest Ended'}</span>
              </div>

              {isLive ? (
                <div className="font-mono text-3xl font-black text-emerald-400 tracking-tight">
                  {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              ) : isUpcoming ? (
                <div className="font-mono text-2xl font-bold text-blue-400 tracking-tight">
                  {startCountdown.hours.toString().padStart(2, '0')}:{startCountdown.minutes.toString().padStart(2, '0')}:{startCountdown.seconds.toString().padStart(2, '0')}
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isLive ? 'Monitored Contestants' : 'Total Contestants'}
            </p>
            <p className="text-2xl font-extrabold text-slate-900">{allContestants.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {isLive 
                ? `${allContestants.length} active live video feeds` 
                : isFinished 
                ? 'Video feeds terminated' 
                : 'Awaiting contest start'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Contestants</p>
            <p className="text-2xl font-extrabold text-amber-600">{flaggedContestants.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">1-4 warnings recorded</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Blocked (1-Mo Ban)</p>
            <p className="text-2xl font-extrabold text-rose-600">{bannedContestants.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Reached 5 security warnings</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Submissions</p>
            <p className="text-2xl font-extrabold text-emerald-600">{acceptedCount} / {submissions.length}</p>
            <p className="text-[11px] text-slate-500 font-medium">Accepted / Total submissions</p>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            // ONLY show live video proctoring option when contest is actively LIVE!
            ...(isLive ? [{ 
              id: 'PROCTORING', 
              label: 'Contestant Live Video & Proctoring', 
              icon: Video, 
              count: allContestants.length,
              badge: bannedContestants.length > 0 ? `${bannedContestants.length} Blocked` : null 
            }] : []),
            { id: 'LEADERBOARD', label: isFinished ? 'Final Leaderboard' : 'Live Leaderboard', icon: Trophy, count: leaderboard.length },
            { id: 'SUBMISSIONS', label: isFinished ? 'Submissions Archive' : 'Real-Time Submissions Feed', icon: Send, count: submissions.length },
            // After contest ends, replace live video monitoring with Post-Contest Anti-Cheat Audit Trail (without video feeds)
            ...(isFinished ? [{
              id: 'AUDIT',
              label: 'Anti-Cheat Audit Trail',
              icon: ShieldCheck,
              count: allContestants.filter(c => c.warningsCount > 0 || c.isBanned).length
            }] : []),
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
                {tab.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LIVE PROCTORING & CONTESTANT VIDEO FEEDS (ONLY ACTIVE WHEN LIVE) */}
        {isLive && activeTab === 'PROCTORING' && (
          <div className="space-y-6">
            {/* STRICT ANTI-CHEAT POLICY BANNER */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <span>Live CCTV Proctoring Console</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      LIVE • ENFORCING
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contestants are monitored for webcam feed, clipboard copying/pasting (Ctrl+C, Ctrl+V), and window blur. At <strong>5 warnings</strong>, a contestant is <strong>automatically blocked for 1 Month</strong>.
                  </p>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                {['ALL', 'FLAGGED', 'BANNED', 'CLEAN'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setProctoringFilter(f)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      proctoringFilter === f
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* LIVE CONTESTANTS CCTV MULTI-FEED GRID */}
            {filteredContestants.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Contestants in this filter</h3>
                <p className="text-xs text-slate-500">
                  {allContestants.length === 0 
                    ? 'No contestants have joined this contest yet. As soon as a student registers and enters the arena, their live video feed and anti-cheat monitor will populate here.'
                    : 'Try selecting a different filter above to view all contestants.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContestants.map((student, idx) => {
                  const warnings = student.warnings || [];
                  const isBanned = student.isBanned;

                  return (
                    <div 
                      key={student.userId} 
                      className={`rounded-2xl border-2 overflow-hidden shadow-sm transition-all flex flex-col bg-slate-950 text-white ${
                        isBanned 
                          ? 'border-rose-600 shadow-rose-900/20' 
                          : student.warningsCount > 0 
                          ? 'border-amber-500 shadow-amber-900/10' 
                          : 'border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >
                      {/* CARD VIDEO WINDOW */}
                      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group select-none">
                        {/* Realistic Proctoring Stream Simulation with Live Telemetry */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-10"></div>

                        {/* Video Canvas or Mirror View */}
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 relative">
                          {/* Animated Webcam Presence Silhouette */}
                          <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
                            isBanned 
                              ? 'border-rose-600 bg-rose-950/40' 
                              : student.warningsCount > 0 
                              ? 'border-amber-400 bg-amber-950/40' 
                              : 'border-emerald-400 bg-emerald-950/40'
                          }`}>
                            <Users className={`w-10 h-10 ${
                              isBanned ? 'text-rose-400' : student.warningsCount > 0 ? 'text-amber-300' : 'text-emerald-400'
                            }`} />
                          </div>

                          <div className="text-center z-20 space-y-0.5">
                            <p className="text-xs font-bold text-slate-200 tracking-wide font-mono">
                              {student.userName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              FPS: 30 • 1080p WebRTC Feed
                            </p>
                          </div>

                          {/* Face tracking HUD box */}
                          {!isBanned && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-emerald-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-1">
                              <span className="text-[8px] font-mono text-emerald-400">FACE: 99.2%</span>
                              <span className="text-[8px] font-mono text-emerald-400 self-end">EYES: FOCUSED</span>
                            </div>
                          )}

                          {/* BANNED OVERLAY */}
                          {isBanned && (
                            <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 space-y-2">
                              <Ban className="w-10 h-10 text-rose-400 animate-pulse" />
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                                1-MONTH BAN ACTIVE
                              </span>
                              <p className="text-xs font-bold text-white">
                                Disqualified (5 Warnings)
                              </p>
                              <p className="text-[10px] text-rose-200">
                                Banned until: {student.formattedExpiry || '30 Days'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Top Video Overlay: Camera ID & Live Status */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 text-[10px] font-mono">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white border border-slate-700">
                            <span className={`w-2 h-2 rounded-full ${isBanned ? 'bg-rose-500' : 'bg-emerald-400 animate-ping'}`}></span>
                            <span>CAM-0{idx + 1}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-slate-300 border border-slate-700">
                              REC
                            </span>
                            <button
                              onClick={() => setSelectedLiveStudent(student)}
                              className="p-1 rounded-md bg-black/70 hover:bg-emerald-600 text-white transition-colors"
                              title="Enlarge Video Stream"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Video Overlay: Audio & Status */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 text-[10px] font-mono">
                          <div className="flex items-center gap-1 text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                            <Volume2 className="w-3 h-3" />
                            <span>MIC ACTIVE</span>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBanned
                              ? 'bg-rose-600 text-white'
                              : student.warningsCount > 0
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {isBanned 
                              ? '⛔ BLOCKED' 
                              : student.warningsCount > 0 
                              ? `⚠️ ${student.warningsCount}/5 WARNINGS` 
                              : 'SECURE'}
                          </span>
                        </div>
                      </div>

                      {/* CONTESTANT TELEMETRY & WARNING PROGRESS BAR */}
                      <div className="p-4 bg-slate-900 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-white">
                                {student.userName}
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Rank #{student.rank || '-'} • {student.problemsSolved} Solved • {student.score} pts
                              </p>
                            </div>

                            {/* Live Badge */}
                            <div className="text-right">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                ID #{student.userId}
                              </span>
                            </div>
                          </div>

                          {/* 5-Warning Progress Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-semibold">Security Warnings:</span>
                              <span className={`font-mono font-bold ${
                                isBanned ? 'text-rose-400' : student.warningsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {student.warningsCount} / 5 {isBanned ? '(Threshold Exceeded)' : ''}
                              </span>
                            </div>

                            {/* 5 Indicator Blocks */}
                            <div className="grid grid-cols-5 gap-1.5 h-2">
                              {[1, 2, 3, 4, 5].map((step) => {
                                const filled = student.warningsCount >= step;
                                return (
                                  <div
                                    key={step}
                                    className={`rounded-full transition-all ${
                                      filled 
                                        ? step === 5 
                                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
                                          : 'bg-amber-400' 
                                        : 'bg-slate-800'
                                    }`}
                                  ></div>
                                );
                              })}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {isBanned 
                                ? 'Account has received a 1-Month Contest Ban.' 
                                : `${Math.max(0, 5 - student.warningsCount)} warnings remaining before automatic 1-Month Ban.`}
                            </p>
                          </div>

                          {/* RECENT VIOLATIONS LIST */}
                          {warnings.length > 0 && (
                            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[11px]">
                              <p className="font-bold text-slate-300 text-[10px] uppercase tracking-wider flex items-center justify-between">
                                <span>Recent Alert Log ({warnings.length}):</span>
                                <span className="text-rose-400">Strict</span>
                              </p>
                              <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-slate-400 divide-y divide-slate-800/50">
                                {warnings.slice(0, 3).map((w, wIdx) => (
                                  <div key={w.id || wIdx} className="pt-1 first:pt-0 flex items-start gap-1">
                                    <span className="text-rose-400 shrink-0">[{w.time || 'Alert'}]</span>
                                    <span className="line-clamp-1">{w.reason}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ADMIN ACTION BUTTONS */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                          <button
                            onClick={() => setSelectedLiveStudent(student)}
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>View Video</span>
                          </button>

                          {!isBanned ? (
                            <>
                              <button
                                onClick={() => handleIssueWarning(student)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Issue Security Warning (+1 Warning)"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>+1 Warn</span>
                              </button>

                              <button
                                onClick={() => handleBanContestant(student)}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                title="Disqualify & Block for 1 Month"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Block (1 Mo)</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUnbanContestant(student)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                              title="Pardon and Unban"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Pardon / Unban</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE LEADERBOARD */}
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
                      <th className="py-3.5 px-4 text-center">Proctoring Status</th>
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
                        <td colSpan={6 + (contest.problems?.length || 0)} className="py-12 text-center text-slate-500">
                          No contestant submissions recorded yet. Submissions will populate here live.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((entry) => {
                        const banCheck = proctoringService.checkUserBan(entry.userId);
                        const warnings = proctoringService.getWarnings(id, entry.userId);
                        const isBanned = banCheck.isBanned || warnings.length >= 5;

                        return (
                          <tr key={entry.userId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-4 text-center font-bold text-slate-700">
                              {entry.rank === 1 ? '👑 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : entry.rank}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{entry.userName}</span>
                                <button
                                  onClick={() => {
                                    setSelectedLiveStudent({
                                      userId: entry.userId,
                                      userName: entry.userName,
                                      rank: entry.rank,
                                      score: entry.score,
                                      problemsSolved: entry.problemsSolved,
                                      warningsCount: warnings.length,
                                      warnings,
                                      isBanned
                                    });
                                  }}
                                  className="p-1 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-colors"
                                  title="View Live Video Feed"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                              {entry.score}
                            </td>
                            <td className="py-4 px-4 text-center font-bold text-slate-700">
                              {entry.problemsSolved} / {contest.problems?.length || 0}
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-slate-500">
                              {entry.penaltyMinutes}m
                            </td>
                            <td className="py-4 px-4 text-center">
                              {isBanned ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                  <Ban className="w-3 h-3" />
                                  <span>BLOCKED (1-Mo Ban)</span>
                                </span>
                              ) : warnings.length > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{warnings.length}/5 Warnings</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Secure</span>
                                </span>
                              )}
                            </td>
                            {(contest.problems || []).map((cp) => {
                              const pStat = entry.problemResults ? entry.problemResults[cp.problemId] : null;
                              return (
                                <td key={cp.id} className="py-4 px-3 text-center">
                                  {pStat?.solved ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                                        ✓
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        +{pStat.points} ({pStat.solvedMinutes}m)
                                      </span>
                                    </div>
                                  ) : pStat?.attempts > 0 ? (
                                    <span className="text-xs font-bold text-rose-500 font-mono">
                                      -{pStat.attempts}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs">—</span>
                                  )}
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

        {/* TAB 3: REAL-TIME SUBMISSIONS FEED */}
        {activeTab === 'SUBMISSIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                {isFinished ? 'Submissions Archive' : 'Real-Time Submissions Feed'}
              </h3>
              <span className="text-xs text-slate-500">{submissions.length} Total Submissions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-4 text-center">#</th>
                    <th className="py-3.5 px-4">Contestant</th>
                    <th className="py-3.5 px-4">Problem</th>
                    <th className="py-3.5 px-4">Language</th>
                    <th className="py-3.5 px-4 text-center">Verdict</th>
                    <th className="py-3.5 px-4 text-center">Passed Cases</th>
                    <th className="py-3.5 px-4 text-center">Runtime</th>
                    <th className="py-3.5 px-4 text-right">Time</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        No submissions recorded for this contest yet.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((s) => {
                      const isAcc = s.submissionStatus === 'ACCEPTED';
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 text-center font-mono text-xs text-slate-400">
                            #{s.id}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900">
                            {s.userName || 'Contestant'}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-800">
                            {s.problemTitle}
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-600">
                            {s.programmingLanguage}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isAcc
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {isAcc ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                              <span>{s.submissionStatus?.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-xs text-slate-600">
                            {s.passedTestCases} / {s.totalTestCases}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-xs text-slate-500">
                            {s.executionTimeMs} ms
                          </td>
                          <td className="py-4 px-4 text-right text-xs text-slate-400">
                            {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setSelectedSub(s)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Code</span>
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

        {/* TAB 4: ANTI-CHEAT AUDIT TRAIL (POST-CONTEST ARCHIVE - NO LIVE VIDEO FEEDS) */}
        {isFinished && activeTab === 'AUDIT' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0D684D] border border-emerald-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Post-Contest Anti-Cheat Audit Trail</h4>
                  <p className="text-xs text-slate-600">
                    Live camera video feeds are closed following contest completion. Permanent record of all telemetry warnings and actions logged during the contest session.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
                <span>Contestant Security Warnings & Violations</span>
                <span className="text-xs text-slate-500 font-normal">
                  {allContestants.filter(c => c.warningsCount > 0 || c.isBanned).length} flagged contestants
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-sm">
                {allContestants.filter(c => c.warningsCount > 0 || c.isBanned).length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="font-bold text-slate-700">Clean Contest Session</p>
                    <p className="text-xs">No anti-cheat warnings, window blur, or clipboard violations were logged during this contest.</p>
                  </div>
                ) : (
                  allContestants
                    .filter(c => c.warningsCount > 0 || c.isBanned)
                    .map((student) => (
                      <div key={student.userId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">{student.userName}</span>
                            <span className="text-xs font-mono text-slate-400">ID #{student.userId}</span>
                            {student.isBanned ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                ⛔ 1-MONTH BAN
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                ⚠️ FLAGGED
                              </span>
                            )}
                          </div>
                          <div className="mt-2.5 space-y-1.5 pl-1">
                            {student.warnings?.map((w, wIdx) => (
                              <div key={w.id || wIdx} className="text-xs text-slate-600 font-mono flex items-start gap-2">
                                <span className="text-rose-600 font-bold shrink-0">[{w.time || 'Alert'}]</span>
                                <span>{w.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                            student.isBanned 
                              ? 'bg-rose-50 text-rose-800 border-rose-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {student.warningsCount} / 5 Warnings
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTEST PROBLEMS */}
        {activeTab === 'PROBLEMS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Contest Problems Set</h3>
              <span className="text-xs text-slate-500">{contest.problems?.length || 0} Challenges Assigned</span>
            </div>

            <div className="divide-y divide-slate-100">
              {(contest.problems || []).map((cp) => (
                <div key={cp.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                      {cp.orderLabel}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-base text-slate-900">{cp.title}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {cp.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">• {cp.topic}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Points: <span className="font-bold text-emerald-600">{cp.points} pts</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to={`/problems/${cp.problemId}?contestId=${contest.id}`}
                      className="px-4 py-2 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Preview Statement
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: FULLSCREEN LIVE WEBCAM VIDEO STREAM DIALOG (Rendered at document.body for full-screen edge-to-edge blur, strictly while contest is LIVE) */}
        {selectedLiveStudent && isLive && createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col text-white">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Live Video Proctoring: {selectedLiveStudent.userName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        STREAMING
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      ID #{selectedLiveStudent.userId} • Contestant Rank #{selectedLiveStudent.rank || '-'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLiveStudent(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Video Window */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative p-6">
                  {/* Silhouette */}
                  <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center mb-3 ${
                    selectedLiveStudent.isBanned 
                      ? 'border-rose-500 bg-rose-950/40 text-rose-400' 
                      : selectedLiveStudent.warningsCount > 0 
                      ? 'border-amber-400 bg-amber-950/40 text-amber-300' 
                      : 'border-emerald-400 bg-emerald-950/40 text-emerald-400'
                  }`}>
                    <Users className="w-14 h-14" />
                  </div>

                  <p className="font-bold text-lg text-slate-100 font-mono">
                    {selectedLiveStudent.userName}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Direct WebRTC Stream • Secure SSL Channel
                  </p>

                  {/* High-tech facial boundary */}
                  <div className="absolute inset-8 border border-emerald-400/30 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                      <span>ISO 800 • EV +0.3</span>
                      <span>EYE TRACK: ACTIVE</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                      <span>CLIPBOARD TRAP: LOCKED</span>
                      <span>AUDIO VU: -14dB</span>
                    </div>
                  </div>

                  {selectedLiveStudent.isBanned && (
                    <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2 z-30">
                      <Ban className="w-12 h-12 text-rose-500 animate-pulse" />
                      <h4 className="text-xl font-extrabold text-white">CONTESTANT DISQUALIFIED (1-MONTH BAN)</h4>
                      <p className="text-xs text-rose-200 max-w-md">
                        This contestant accumulated 5 security warnings and has been banned from contests until <strong>{selectedLiveStudent.formattedExpiry || '1 Month'}</strong>.
                      </p>
                    </div>
                  )}
                </div>

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded bg-black/75 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>LIVE FEED • 1080p</span>
                  </span>
                </div>
              </div>

              {/* Modal Details & Action Controls */}
              <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Security Warnings</p>
                    <p className={`text-xl font-mono font-black ${
                      selectedLiveStudent.isBanned ? 'text-rose-400' : selectedLiveStudent.warningsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedLiveStudent.warningsCount} / 5
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Problems Solved</p>
                    <p className="text-xl font-mono font-black text-white">
                      {selectedLiveStudent.problemsSolved}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Contest Score</p>
                    <p className="text-xl font-mono font-black text-emerald-400">
                      {selectedLiveStudent.score} pts
                    </p>
                  </div>
                </div>

                {/* Full Violation Timeline */}
                {selectedLiveStudent.warnings?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Recorded Anti-Cheat Violations</span>
                      <span className="text-rose-400 text-[10px]">Strict Audit Trail</span>
                    </p>
                    <div className="max-h-28 overflow-y-auto space-y-1.5 font-mono text-xs text-slate-300 divide-y divide-slate-800">
                      {selectedLiveStudent.warnings.map((w, idx) => (
                        <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2">
                          <span className="text-slate-400 text-[11px]">{w.reason}</span>
                          <span className="text-rose-400 text-[10px] shrink-0 font-bold">[{w.time || 'Alert'}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {!selectedLiveStudent.isBanned ? (
                    <>
                      <button
                        onClick={() => {
                          handleIssueWarning(selectedLiveStudent);
                          setSelectedLiveStudent(prev => ({
                            ...prev,
                            warningsCount: (prev.warningsCount || 0) + 1,
                            isBanned: (prev.warningsCount || 0) + 1 >= 5
                          }));
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Issue Official Warning (+1)</span>
                      </button>

                      <button
                        onClick={() => {
                          handleBanContestant(selectedLiveStudent);
                          setSelectedLiveStudent(prev => ({ ...prev, isBanned: true }));
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Disqualify & Block (1 Month)</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleUnbanContestant(selectedLiveStudent);
                        setSelectedLiveStudent(prev => ({ ...prev, isBanned: false, warningsCount: 0 }));
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Pardon & Restore Access</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedLiveStudent(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Close Feed
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* MODAL: SUBMISSION CODE VIEWER (Rendered at document.body for full-screen edge-to-edge blur) */}
        {selectedSub && createPortal(
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Submission #{selectedSub.id} • {selectedSub.problemTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    By <strong>{selectedSub.userName || 'Contestant'}</strong> ({selectedSub.programmingLanguage}) • Passed {selectedSub.passedTestCases}/{selectedSub.totalTestCases} test cases
                  </p>
                </div>

                <button
                  onClick={() => setSelectedSub(null)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    selectedSub.submissionStatus === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {selectedSub.submissionStatus?.replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => handleCopyCode(selectedSub.sourceCode)}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0D684D] font-mono transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {selectedSub.sourceCode || '// No source code recorded'}
                </pre>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  );
};
