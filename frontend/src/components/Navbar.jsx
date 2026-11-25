import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo (Left) */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#0D684D] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform font-mono font-bold text-sm">
              &lt;/&gt;
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#0D684D] transition-colors">
              CoDingHub
            </span>
          </Link>

          {/* Right Header Controls: Sign In & Sign Up */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0D684D] hover:bg-slate-100 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 text-xs sm:text-sm font-semibold bg-[#0D684D] hover:bg-[#0A543E] text-white rounded-xl transition-all shadow-sm hover:scale-[1.02]"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 text-center"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold bg-[#0D684D] text-white text-center shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};
