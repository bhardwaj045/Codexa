import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Sparkles, ArrowRight, Trophy, Zap, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,104,77,0.08),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#0D684D] border border-emerald-100 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Competitive Coding Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Master Coding & Ace <br />
              <span className="text-[#0D684D]">
                Technical Interviews
              </span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Solve algorithmic problems with an automated multi-language online judge, evaluate against comprehensive test cases, and track your progress in a clean workspace.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? "/problems" : "/login?redirect=/problems"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105"
              >
                <Terminal className="w-5 h-5" />
                Start Practicing
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-105"
                >
                  <ArrowRight className="w-5 h-5 text-[#0D684D]" />
                  Create Free Account
                </Link>
              )}
            </div>

            {/* Stats Bar */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-300 shadow-sm">
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100+</div>
                <div className="text-xs text-slate-500 mt-1">Curated Problems</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4</div>
                <div className="text-xs text-slate-500 mt-1">Languages Supported</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0D684D]">Real-Time</div>
                <div className="text-xs text-slate-500 mt-1">Judge Engine</div>
              </div>
              <div className="p-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
                <div className="text-xs text-slate-500 mt-1">Free Platform</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-[#0D684D] uppercase tracking-wider">Features</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Everything you need to level up
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0D684D] flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Instant Code Evaluation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compile and execute your code in Java, Python, C++, and JavaScript against comprehensive public and private test suites.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0D684D] flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Global Leaderboard</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compete with learners around the globe, earn points for every solved challenge, and climb the platform podium.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-300 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0D684D] flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Progress Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Keep track of your solved difficulties, streak metrics, acceptance rate, and view complete submission history.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
