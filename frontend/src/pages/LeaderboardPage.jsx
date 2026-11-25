import React, { useState, useEffect } from 'react';
import { leaderboardApi } from '../api/leaderboardApi';
import { useAuth } from '../context/AuthContext';
import { Crown } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await leaderboardApi.getLeaderboard();
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <AppLayout title="Leaderboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Global Leaderboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Top programmers ranked by problems solved and algorithmic points.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0D684D] text-xs font-bold">
              {leaderboard.length} Ranked Coders
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-3 border-[#0D684D] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">Calculating rankings...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Cards */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
                {/* Rank 2 (Silver) */}
                {top3[1] && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-300 text-center relative shadow-sm order-2 md:order-1">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                      2
                    </div>
                    <h3 className="text-base font-bold text-slate-900 truncate">{top3[1].name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{top3[1].problemsSolved} problems solved</p>
                    <div className="mt-3 inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                      {top3[1].totalPoints} pts
                    </div>
                  </div>
                )}

                {/* Rank 1 (Gold) */}
                {top3[0] && (
                  <div className="p-7 rounded-2xl bg-gradient-to-b from-amber-50 to-white border border-amber-300 text-center relative shadow-md scale-105 z-10 order-1 md:order-2">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-md">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      1
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 truncate">{top3[0].name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{top3[0].problemsSolved} problems solved</p>
                    <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono text-sm font-bold">
                      {top3[0].totalPoints} pts
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3[2] && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-300 text-center relative shadow-sm order-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                      3
                    </div>
                    <h3 className="text-base font-bold text-slate-900 truncate">{top3[2].name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{top3[2].problemsSolved} problems solved</p>
                    <div className="mt-3 inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                      {top3[2].totalPoints} pts
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ranking Table Card */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6 w-20 text-center">Rank</th>
                      <th className="py-4 px-6">Programmer</th>
                      <th className="py-4 px-6 text-center">Problems Solved</th>
                      <th className="py-4 px-6 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leaderboard.map((entry) => {
                      const isCurrentUser = user && user.id === entry.userId;
                      return (
                        <tr
                          key={entry.rank}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isCurrentUser ? 'bg-emerald-50/70 border-l-4 border-l-[#0D684D]' : ''
                          }`}
                        >
                          <td className="py-4 px-6 text-center font-bold">
                            {entry.rank === 1 ? (
                              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold inline-flex items-center justify-center text-xs">
                                1
                              </span>
                            ) : entry.rank === 2 ? (
                              <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold inline-flex items-center justify-center text-xs">
                                2
                              </span>
                            ) : entry.rank === 3 ? (
                              <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 font-bold inline-flex items-center justify-center text-xs">
                                3
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">#{entry.rank}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <span>{entry.name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0D684D]">
                                  YOU
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center text-slate-700">
                            {entry.problemsSolved}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-[#0D684D]">
                            {entry.totalPoints} pts
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};
