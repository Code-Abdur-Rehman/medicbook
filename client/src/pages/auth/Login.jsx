import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, Sparkles, ArrowRight, UserCheck, Shield, Stethoscope, Building2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from);
      return;
    }
    if (role === 'patient') navigate('/patient/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'hospital_admin') navigate('/hospital/dashboard');
    else if (role === 'super_admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      redirectAfterLogin(res.user.role);
    } else {
      setError(res.message);
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    setError('');
    const res = await demoLogin(role);
    setLoading(false);
    if (res.success) {
      redirectAfterLogin(res.user.role);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to MediBook</h1>
        <p className="text-xs text-slate-500">Access your healthcare appointments and management portal</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Evaluation Box */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Instant Demo Logins (FYP Evaluation)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoClick('patient')}
              className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-left transition-colors"
            >
              <div className="font-bold text-sky-900 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Patient</span>
              </div>
              <div className="text-[10px] text-sky-600 truncate">Hamza Ali</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('doctor')}
              className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors"
            >
              <div className="font-bold text-blue-900 flex items-center space-x-1">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Doctor</span>
              </div>
              <div className="text-[10px] text-blue-600 truncate">Dr. Ahmed (Cardio)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('hospital_admin')}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-colors"
            >
              <div className="font-bold text-emerald-900 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hosp Admin</span>
              </div>
              <div className="text-[10px] text-emerald-600 truncate">City General Hosp</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('super_admin')}
              className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition-colors"
            >
              <div className="font-bold text-purple-900 flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Super Admin</span>
              </div>
              <div className="text-[10px] text-purple-600 truncate">Platform Admin</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-1">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Register as Patient
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
