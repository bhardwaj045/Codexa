import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { contestApi } from '../api/contestApi';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  Users, 
  Code2, 
  CheckCircle, 
  Play, 
  ArrowRight, 
  Flame, 
  Plus, 
  Sparkles,
  AlertCircle,
  Ban
} from 'lucide-react';
import { proctoringService } from '../utils/proctoringService';

export const ContestsListPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, LIVE, UPCOMING, COMPLETED
  const [registeringId, setRegisteringId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const banCheck = !isAdmin && user ? proctoringService.checkUserBan(user.id) : { isBanned: false };

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await contestApi.getAllContests();
      setContests(res.data || []);
    } catch (err) {
      console.error('Failed to load contests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (contestId, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login?redirect=/contests');
      return;
    }

    try {
      setRegisteringId(contestId);
      await contestApi.joinContest(contestId);
      setActionMessage('Successfully registered! Entering contest arena...');
      setTimeout(() => {
        navigate(`/contests/${contestId}`);
      }, 700);
    } catch (err) {
      console.error('Failed to register for contest', err);
      setActionMessage('Failed to register. Please try again.');
    } finally {
      setRegisteringId(null);
    }
  };

  const getContestTimingState = (contest) => {
    const now = Date.now();
    const startMs = contest?.startTime ? Date.parse(contest.startTime) : 0;
    const endMs = contest?.endTime ? Date.parse(contest.endTime) : 0;
    
    // Strict timing: if scheduled start time is in future, it is strictly UPCOMING (Waiting Room)
    const isUpcoming = contest?.status === 'PUBLISHED' || (startMs > 0 && now < startMs);
    const isFinished = contest?.status === 'COMPLETED' || (endMs > 0 && now >= endMs);
    const isLive = !isUpcoming && !isFinished && contest?.status === 'LIVE';

    return { isUpcoming, isLive, isFinished };
  };

  const filteredContests = contests.filter((c) => {
    const { isUpcoming, isLive, isFinished } = getContestTimingState(c);
    if (filterTab === 'LIVE') return isLive;
    if (filterTab === 'UPCOMING') return isUpcoming;
    if (filterTab === 'COMPLETED') return isFinished;
    return true;
  });

  const getStatusBadge = (contest) => {
    const { isUpcoming, isLive, isFinished } = getContestTimingState(contest);
    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          LIVE NOW
        </span>
      );
    }
    if (isUpcoming) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
          <Clock className="w-3.5 h-3.5" />
          UPCOMING
        </span>
      );
    }
    if (isFinished) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
          FINISHED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        DRAFT
      </span>
    );
  };

  const formatCountdown = (targetDate) => {
    const total = Date.parse(targetDate) - Date.now();
    if (total <= 0) return '00:00:00';
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)));
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  return (
    <AppLayout title="Coding Contests">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-emerald-900/30">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Flame className="w-4 h-4 text-emerald-400" />
                <span>CodeXa Official Contest Arenas</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Competitive Coding Contests
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Test your algorithmic speed and accuracy under timed pressure. Solve algorithmic problems under timed conditions, earn ranking points, and measure yourself against global programmers.
              </p>
            </div>

            {isAdmin && (
              <div className="shrink-0">
                <Link
                  to="/admin/contests"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Admin Contest Panel
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* CONTEST BAN SUSPENSION BANNER */}
        {banCheck.isBanned && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Ban className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                <strong>Contest Participation Suspended (1-Month Ban):</strong> Your account received 5 anti-cheat warnings and cannot participate in contests until <strong>{banCheck.formattedExpiry}</strong>.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] shrink-0">
              BLOCKED
            </span>
          </div>
        )}

        {/* FEEDBACK ALERT */}
        {actionMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* FILTER TABS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'All Contests' },
              { id: 'LIVE', label: '🔥 Live Now' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'COMPLETED', label: 'Past Contests' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  filterTab === tab.id
                    ? 'bg-[#0D684D] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredContests.length}</span> contests
          </div>
        </div>

        {/* CONTESTS LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500">Loading contests...</p>
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No Contests Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              There are no contests in this tab right now. Stay tuned for new 2-hour coding sprints!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredContests.map((contest) => {
              const { isUpcoming, isLive, isFinished } = getContestTimingState(contest);

              return (
                <div
                  key={contest.id}
                  onClick={() => navigate(isAdmin ? `/admin/contests/${contest.id}/monitor` : `/contests/${contest.id}`)}
                  className={`bg-white rounded-2xl p-6 sm:p-8 border transition-all cursor-pointer group hover:shadow-lg ${
                    isLive
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10 hover:border-emerald-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* LEFT METRICS */}
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        {getStatusBadge(contest)}
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          ⏱ {contest.durationMinutes} Minutes
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          🧩 {contest.totalProblems || contest.problems?.length || 0} Challenges
                        </span>
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#0D684D] transition-colors">
                          {contest.title}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {contest.description}
                        </p>
                      </div>

                      {/* CONTEST DETAILS STRIP */}
                      <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            {new Date(contest.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                            at {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{contest.totalParticipants} Participants</span>
                        </div>
                        {contest.isRegistered && (
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Registered</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT ACTIONS & TIMER */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 lg:border-l lg:border-slate-100 lg:pl-8">
                      {isLive ? (
                        <div className="space-y-1 text-left lg:text-right">
                          <p className="text-[11px] font-bold tracking-wider uppercase text-rose-600">Contest Ends In</p>
                          <div className="font-mono text-xl sm:text-2xl font-black text-rose-600">
                            {formatCountdown(contest.endTime)}
                          </div>
                        </div>
                      ) : isUpcoming ? (
                        <div className="space-y-1 text-left lg:text-right">
                          <p className="text-[11px] font-bold tracking-wider uppercase text-blue-600">Starts In</p>
                          <div className="font-mono text-lg sm:text-xl font-bold text-blue-700">
                            {formatCountdown(contest.startTime)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-left lg:text-right text-xs text-slate-400 font-medium">
                          Contest has concluded
                        </div>
                      )}

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {banCheck.isBanned ? (
                          <button
                            disabled
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs cursor-not-allowed border border-rose-200"
                          >
                            Blocked (1-Month Ban)
                          </button>
                        ) : (
                          <>
                            {!isAdmin && !contest.isRegistered && !isFinished ? (
                              <button
                                onClick={(e) => handleJoin(contest.id, e)}
                                disabled={registeringId === contest.id}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all hover:scale-105"
                              >
                                {registeringId === contest.id ? 'Registering...' : 'Register Now'}
                              </button>
                            ) : null}

                            <Link
                              to={isAdmin ? `/admin/contests/${contest.id}/monitor` : `/contests/${contest.id}`}
                              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                                isLive || isAdmin
                                  ? 'bg-[#0D684D] hover:bg-[#0A543E] text-white shadow-md hover:scale-[1.02]'
                                  : isUpcoming
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                              }`}
                            >
                              <span>{isAdmin ? 'Open Live Monitor' : isLive ? 'Enter Arena (Live)' : isUpcoming ? 'Waiting Room' : 'View Results'}</span>
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
