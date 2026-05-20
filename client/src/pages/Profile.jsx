import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearAuthError } from '../store/authSlice';
import { User, Scale, Ruler, Compass, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Lock, ChevronDown } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Profile Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Maintain');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [password, setPassword] = useState('');

  // UI Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age || 25);
      setWeight(user.weight || 70);
      setHeight(user.height || 170);
      setFitnessGoal(user.fitnessGoal || 'Maintain');
      setCalorieGoal(user.calorieGoal || 2000);
    }
    dispatch(clearAuthError());
  }, [user, dispatch]);

  // Mifflin-St Jeor Auto Calorie Recommendation
  const getRecommendedCalorie = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    if (!w || !h || !a) return 2000;

    // Mifflin-St Jeor Equation (Male baseline default)
    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    
    if (fitnessGoal === 'Lose Weight') {
      return Math.round(bmr * 1.2 - 500);
    } else if (fitnessGoal === 'Gain Muscle') {
      return Math.round(bmr * 1.4 + 300);
    } else {
      return Math.round(bmr * 1.2);
    }
  };

  const recommendedCal = getRecommendedCalorie();

  const handleApplyRecommendation = () => {
    setCalorieGoal(recommendedCal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setValidationError('');

    if (!name) {
      setValidationError('Name is a required field');
      return;
    }

    const updatePayload = {
      name,
      age: parseInt(age) || 25,
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      fitnessGoal,
      calorieGoal: parseInt(calorieGoal) || 2000,
    };

    if (password.trim()) {
      if (password.length < 6) {
        setValidationError('Password must be at least 6 characters long');
        return;
      }
      updatePayload.password = password;
    }

    try {
      await dispatch(updateProfile(updatePayload)).unwrap();
      setSuccessMessage('Profile settings saved successfully!');
      setPassword(''); // clear password field
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // BMI Estimation helper
  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert to meters
    if (!w || !h) return 0;
    return (w / (h * h)).toFixed(1);
  };

  const bmi = calculateBMI();

  const getBMICategory = (val) => {
    if (val === 0) return 'N/A';
    if (val < 18.5) return 'Underweight';
    if (val < 25) return 'Normal Weight';
    if (val < 30) return 'Overweight';
    return 'Obese';
  };

  const getBMICategoryColor = (cat) => {
    switch (cat) {
      case 'Normal Weight':
        return 'text-emerald-400';
      case 'Underweight':
        return 'text-sky-400';
      case 'Overweight':
        return 'text-amber-400';
      case 'Obese':
      default:
        return 'text-rose-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Profile Settings</h2>
        <p className="text-xs text-slate-400">Configure your parameters, daily calorie intake targets, and security details.</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-sm font-bold text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {(error || validationError) && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-4 text-xs font-semibold text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- DOCK PANEL 1: BMI CARD --- */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
            <div className="absolute -right-5 -top-5 h-20 w-20 bg-indigo-500/5 rounded-full blur-xl"></div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Body Mass Index (BMI)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated based on active height and weight configurations.</p>
              
              <div className="mt-8 text-center">
                <span className="text-6xl font-black tracking-tight text-white">{bmi}</span>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-2">BMI Score</p>
                
                <span className={`inline-block mt-4 rounded-full bg-slate-900 border border-slate-800 px-4 py-1 text-xs font-semibold ${getBMICategoryColor(getBMICategory(bmi))}`}>
                  {getBMICategory(bmi)}
                </span>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-500 mt-6 leading-relaxed border-t border-slate-900 pt-4">
              BMI is a general reference. Health metrics depend on muscle mass, body composition, and exercise levels.
            </div>
          </div>
        </div>

        {/* --- MAIN PROFILE EDIT FORM --- */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input w-full pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Age (years)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Scale className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="glass-input w-full pl-10"
                    />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Scale className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="glass-input w-full pl-10"
                    />
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Ruler className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="glass-input w-full pl-10"
                    />
                  </div>
                </div>

                {/* Goal Selection */}
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
                      className="glass-input w-full pl-10 pr-10 appearance-none bg-slate-900"
                    >
                      <option value="Lose Weight">Lose Weight</option>
                      <option value="Maintain">Maintain</option>
                      <option value="Gain Muscle">Gain Muscle</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 pointer-events-none">
                      <ChevronDown className="h-4.5 w-4.5" />
                    </span>
                  </div>
                </div>

                {/* Target Calories */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Daily Calorie Target (kcal)
                  </label>
                  <input
                    type="number"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(e.target.value)}
                    className="glass-input w-full"
                  />
                </div>
              </div>

              {/* RECOMMENDER METABOLIC SHIFT SECTION */}
              <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  Metabolic Suggestion Engine (Mifflin-St Jeor)
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Based on your details, your recommended intake is: <strong className="text-white">{recommendedCal} kcal/day</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleApplyRecommendation}
                    className="rounded-xl bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/25 transition-all duration-150 flex-shrink-0"
                  >
                    Apply Target
                  </button>
                </div>
              </div>

              {/* Security section (Password Update) */}
              <div className="border-t border-slate-900 pt-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Security Details
                </h4>
                
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Update Password (leave blank to keep current)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Save trigger */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 active:scale-98 transition-all duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Saving Profiles...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
