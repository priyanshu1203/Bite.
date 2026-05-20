import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearAuthError } from '../store/authSlice';
import { Flame, Lock, Mail, User, AlertCircle, RefreshCw, Scale, Ruler, Compass, ChevronDown } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Optional physical characteristics
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Maintain');

  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  // If already logged in, route away
  useEffect(() => {
    if (token) {
      navigate('/');
    }
    dispatch(clearAuthError());
  }, [token, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name || !email || !password) {
      setValidationError('Please fill in all required credentials fields');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    const registrationPayload = {
      name,
      email,
      password,
      age: age ? parseInt(age) : 25,
      weight: weight ? parseFloat(weight) : 70,
      height: height ? parseFloat(height) : 170,
      fitnessGoal,
    };

    dispatch(register(registrationPayload));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 selection:bg-indigo-500 selection:text-white">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]"></div>

      <div className="w-full max-w-lg space-y-8 animate-fade-in-up z-10">
        {/* Brand header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 shadow-xl shadow-indigo-500/25">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Build your profile to unlock custom nutrition plans.
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
              
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input w-full pl-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Email Address *
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
                  Password (min 6 characters) *
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

              {/* Physical Profile Setup Section */}
              <div className="border-t border-slate-900 pt-4 mt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
                  Physical Profile (Optional Setup)
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Age */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Age (yrs)
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="glass-input w-full text-center px-1"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Weight (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="70"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="glass-input w-full text-center px-1"
                      />
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="170"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="glass-input w-full text-center px-1"
                    />
                  </div>
                </div>
              </div>

              {/* Goal Setting */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Fitness Target Goal
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Compass className="h-4.5 w-4.5" />
                  </span>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value)}
                    className="glass-input w-full pl-10 pr-10 appearance-none bg-slate-900/90 text-sm focus:bg-slate-900"
                  >
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Maintain">Maintain Weight</option>
                    <option value="Gain Muscle">Gain Muscle</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 pointer-events-none">
                    <ChevronDown className="h-4.5 w-4.5" />
                  </span>
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none transition-all duration-200"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4.5 w-4.5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Profile'
              )}
            </button>
          </form>

          {/* Switch link */}
          <div className="mt-8 text-center text-xs">
            <span className="text-slate-500">Already registered? </span>
            <Link
              to="/login"
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
