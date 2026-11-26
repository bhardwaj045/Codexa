import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { dashboardApi } from '../api/dashboardApi';
import { AppLayout } from '../components/AppLayout';
import { Users, Search, X } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getRegisteredUsers();
      // Only keep registered student users (exclude admin accounts)
      const studentUsers = (res.data || []).filter((u) => u.userRole !== 'ADMIN');
      setUsers(studentUsers);
    } catch (err) {
      console.error('Failed to load registered users', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase().trim();
    return !term || 
      (u.name && u.name.toLowerCase().includes(term)) || 
      (u.email && u.email.toLowerCase().includes(term));
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Registered recently';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <AppLayout title="Manage Users">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Registered Users
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View registered student accounts, problem progress, and scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0D684D] text-xs font-bold">
              {users.length} Students Registered
            </span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* USERS TABLE CARD */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-[#0D684D] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading users list...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No student users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">STUDENT</th>
                    <th className="py-3 px-6">EMAIL</th>
                    <th className="py-3 px-6">ROLE</th>
                    <th className="py-3 px-6">PROBLEMS SOLVED</th>
                    <th className="py-3 px-6">TOTAL POINTS</th>
                    <th className="py-3 px-6">JOINED</th>
                    <th className="py-3 px-6 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 text-[#0D684D] font-bold flex items-center justify-center text-xs">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {u.userRole || 'STUDENT'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{u.problemsSolved || 0}</td>
                      <td className="py-4 px-6 font-bold text-[#0D684D]">{u.totalPoints || 0} pts</td>
                      <td className="py-4 px-6 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETAILS MODAL (Rendered at document.body for full-screen edge-to-edge blur) */}
        {selectedUser && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">User Profile</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Full Name</p>
                  <p className="font-semibold text-slate-800">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="font-semibold text-slate-800">{selectedUser.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400">Problems Solved</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{selectedUser.problemsSolved || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400">Total Points</p>
                    <p className="text-xl font-bold text-[#0D684D] mt-1">{selectedUser.totalPoints || 0}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AppLayout>
  );
};
