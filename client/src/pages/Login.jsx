import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearAuthError } from '../store/authSlice';
import { Flame, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate('/');
    }
    // Clean up auth errors when opening the page
    dispatch(clearAuthError());
  }, [token, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    dispatch(login({ email, password }));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]"></div>

      <div className="w-full max-w-md space-y-8 animate-fade-in-up z-10">
        {/* Brand header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-xl shadow-indigo-500/25">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to track your calories, hydration, and macros.
          </p>
        </div>

        {/* Form panel */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          {/* Alerts */}
          {(error || validationError) && (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/25 p-4 text-xs font-semibold text-rose-400">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <div>{validationError || error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4.5 w-4.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="mt-8 text-center text-xs">
            <span className="text-slate-500">Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
