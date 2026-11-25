import React from 'react';
import { Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0D684D] flex items-center justify-center text-white">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                CoDingHub
              </span>
            </div>
            <p className="text-sm text-slate-500">
              The premier interactive platform to practice coding interview problems, enhance algorithmic skills, and compete globally.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Practice</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/problems" className="hover:text-[#0D684D] transition-colors">Problem Catalog</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#0D684D] transition-colors">Global Leaderboard</Link></li>
              <li><Link to="/problems?difficulty=EASY" className="hover:text-[#0D684D] transition-colors">Easy Problems</Link></li>
              <li><Link to="/problems?difficulty=MEDIUM" className="hover:text-[#0D684D] transition-colors">Medium Problems</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Supported Languages</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> JavaScript (Node.js)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Java (JDK 25)</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Python 3</li>
              <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> C++ (GCC)</li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/problems" className="hover:text-[#0D684D] transition-colors">About CoDingHub</Link></li>
              <li><Link to="/leaderboard" className="hover:text-[#0D684D] transition-colors">Leaderboard</Link></li>
              <li><Link to="/login" className="hover:text-[#0D684D] transition-colors">Student Sign In</Link></li>
              <li><Link to="/login" className="hover:text-[#0D684D] transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CoDingHub. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Crafted for engineers preparing for technical interviews
          </p>
        </div>
      </div>
    </footer>
  );
};
