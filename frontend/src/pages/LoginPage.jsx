import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export const LoginPage = () => {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' or 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (redirectParam) {
        navigate(redirectParam);
      } else if (user.userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:8080.');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased text-slate-900">
      {/* LEFT MINT HERO PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-slate-50 border-r border-slate-200/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 z-10 group cursor-pointer w-fit">
          <div className="w-9 h-9 rounded-xl bg-[#0D684D] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            &lt;/&gt;
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            CodeXa
          </span>
        </Link>

        {/* Hero Copy */}
        <div className="max-w-md z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D684D] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#0D684D]"></span>
            <span>YOUR CODING JOURNEY STARTS HERE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Think Code.<br />
            <span className="text-[#0D684D]">Build Skills.</span><br />
            Crack Interviews.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Practice coding problems, strengthen your problem-solving skills and prepare yourself for technical interviews.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D684D] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span>Practice real coding challenges</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D684D] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span>Track your learning progress</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D684D] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span>Improve your programming skills</span>
            </div>
          </div>
        </div>

        {/* Code Mockup Card at Bottom */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200/80 max-w-sm z-10 font-mono text-xs text-slate-800">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
          </div>
          <p className="text-[#0D684D] font-bold">function solveProblem() &#123;</p>
          <p className="pl-4 text-slate-600">const skills = "practice";</p>
          <p className="pl-4 text-slate-600">return skills + " + consistency";</p>
          <p className="text-[#0D684D] font-bold">&#125;</p>
        </div>
      </div>

      {/* RIGHT SIGN IN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <Link to="/" className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span className="text-[#0D684D]">&lt;/&gt;</span> CodeXa
            </Link>
          </div>

          <div>
            <p className="text-xs font-bold text-[#0D684D] uppercase tracking-wider mb-1">
              WELCOME BACK
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to continue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access your account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Account Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select your account type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleToggle('STUDENT')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'STUDENT'
                    ? 'bg-white text-[#0D684D] border border-emerald-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle('ADMIN')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  role === 'ADMIN'
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Buttons (Avoids Chrome Breach Warning) */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Quick Fill:</span>
            <button
              type="button"
              onClick={() => {
                setRole('ADMIN');
                setEmail('admin@codexa.com');
                setPassword('CodeXa@Admin2026!');
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-[#0D684D] font-bold text-xs transition-colors"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('STUDENT');
                setEmail('student@codexa.com');
                setPassword('CodeXa@Student2026!');
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xs transition-colors"
            >
              Student Demo
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="skvahedunnisa@gmail.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-[#0D684D] hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-white text-sm font-semibold bg-[#0D684D] hover:bg-[#0A543E] shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>{loading ? 'Signing in...' : `Sign in as ${role === 'ADMIN' ? 'Admin' : 'Student'} →`}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-1">
            New to CodeXa?{' '}
            <Link
              to={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
              className="font-semibold text-[#0D684D] hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
