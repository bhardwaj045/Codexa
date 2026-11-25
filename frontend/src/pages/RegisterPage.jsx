import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { ArrowLeft } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [capacityInfo, setCapacityInfo] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const res = await dashboardApi.getRegistrationLimit();
        setCapacityInfo(res.data);
      } catch (err) {
        console.error('Failed to load registration limit info', err);
      }
    };
    fetchLimit();
  }, []);

  const isRegistrationClosed = capacityInfo && (!capacityInfo.registrationEnabled || capacityInfo.remainingSpots <= 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegistrationClosed) {
      setError('Registration is currently closed by the administrator.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, 'STUDENT');
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        navigate(redirectParam);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Cannot connect to backend server. Please make sure the backend is running on http://localhost:8080.');
      } else {
        setError('Registration failed');
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
            CoDingHub
          </span>
        </Link>

        {/* Hero Copy */}
        <div className="max-w-md z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D684D] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#0D684D]"></span>
            <span>START YOUR CODING JOURNEY</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            Learn Today.<br />
            <span className="text-[#0D684D]">Code Better.</span><br />
            Grow Tomorrow.
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Create your account and take the next step towards becoming a confident programmer. Practice, learn and improve every day.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D684D] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span>Access coding practice problems</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D684D] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span>Submit and evaluate your solutions</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D684D] flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <span>Monitor your coding progress</span>
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
          <p className="text-[#0D684D] font-bold">const journey = &#123;</p>
          <p className="pl-4 text-slate-600">learn: true,</p>
          <p className="pl-4 text-slate-600">practice: true,</p>
          <p className="pl-4 text-slate-600">improve: true</p>
          <p className="text-[#0D684D] font-bold">&#125;;</p>
        </div>
      </div>

      {/* RIGHT REGISTER FORM */}
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
              <span className="text-[#0D684D]">&lt;/&gt;</span> CoDingHub
            </Link>
          </div>

          <div>
            <p className="text-xs font-bold text-[#0D684D] uppercase tracking-wider mb-1">
              CREATE YOUR ACCOUNT
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Join CoDingHub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your details to create your student account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                placeholder="Create a password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0D684D] focus:bg-white transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">Use 8-72 characters for your password.</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
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
              <span>{loading ? 'Creating account...' : 'Create Account →'}</span>
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0D684D] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
