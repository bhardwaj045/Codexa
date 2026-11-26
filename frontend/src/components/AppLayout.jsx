import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Code2,
  FileText,
  TrendingUp,
  Trophy,
  PlusCircle,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  Bell,
  Flame
} from 'lucide-react';

export const AppLayout = ({ children, title }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: Code2 },
    { name: 'Contests', path: '/contests', icon: Flame },
    { name: 'My Submissions', path: '/submissions', icon: FileText },
    { name: 'My Progress', path: '/progress', icon: TrendingUp },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Contests', path: '/admin/contests', icon: Flame },
    { name: 'Add Problem', path: '/admin/problems/new', icon: PlusCircle },
    { name: 'Manage Problems', path: '/admin/problems', icon: FolderKanban },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;
  const sectionLabel = isAdmin ? 'ADMIN PANEL' : 'WORKSPACE';
  const roleInitial = user?.name ? user.name.charAt(0).toUpperCase() : (isAdmin ? 'S' : 'T');
  const displayName = user?.name || (isAdmin ? 'Shaik Vahedunnisa' : 'Test Student');
  const subtitle = isAdmin ? 'Manage your coding platform' : 'Your coding workspace';

  return (
    <div className="min-h-screen flex font-sans antialiased bg-[#F0F2F5] text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-300 flex flex-col shrink-0 min-h-screen select-none shadow-sm">
        {/* Brand Header */}
        <Link to="/" className="h-16 flex items-center px-6 gap-3 border-b border-slate-200 hover:bg-slate-50/80 transition-colors group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-[#0D684D] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            &lt;/&gt;
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            CodeXa
          </span>
        </Link>

        {/* Section Label */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            {sectionLabel}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            let active = false;
            if (item.path === '/admin/problems/new') {
              active = location.pathname === '/admin/problems/new';
            } else if (item.path === '/admin/problems') {
              active = location.pathname.startsWith('/admin/problems') && location.pathname !== '/admin/problems/new';
            } else if (item.path === '/admin/users') {
              active = location.pathname.startsWith('/admin/users');
            } else if (item.path === '/admin') {
              active = location.pathname === '/admin';
            } else if (item.path === '/dashboard') {
              active = location.pathname === '/dashboard';
            } else {
              active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#EBF7F2] text-[#0D684D] font-semibold border border-emerald-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#0D684D]' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-200 space-y-1">
          <button
            onClick={() => alert('Settings configured to default.')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-slate-600 hover:text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F0F2F5]">
        {/* TOP HEADER */}
        <header className="h-16 px-8 flex items-center justify-between shrink-0 bg-white border-b border-slate-300 shadow-xs">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {title || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-500 font-medium -mt-0.5">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-300">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#EBF7F2] text-[#0D684D] border border-emerald-300">
                {roleInitial}
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#F0F2F5]">
          {children}
        </main>
      </div>
    </div>
  );
};
