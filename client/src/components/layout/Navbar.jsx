import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  User,
  LogOut,
  Calendar,
  Building2,
  Stethoscope,
  Shield,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleQuickDemo = async (role) => {
    setDemoDropdownOpen(false);
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'patient') navigate('/patient/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'hospital_admin') navigate('/hospital/dashboard');
      else if (role === 'super_admin') navigate('/admin/dashboard');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'patient') return '/patient/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'hospital_admin') return '/hospital/dashboard';
    if (user.role === 'super_admin') return '/admin/dashboard';
    return '/';
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
      hospital_admin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      doctor: 'bg-blue-100 text-blue-800 border-blue-200',
      patient: 'bg-sky-100 text-sky-800 border-sky-200',
    };
    const labels = {
      super_admin: 'Super Admin',
      hospital_admin: 'Hospital Admin',
      doctor: 'Doctor',
      patient: 'Patient',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${badges[role] || 'bg-gray-100'}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Medi<span className="text-brand-600">Book</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium tracking-wide uppercase text-slate-600">
                Healthcare Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/doctors" className="hover:text-brand-600 transition-colors flex items-center space-x-1.5">
              <Stethoscope className="w-4 h-4 text-brand-500" />
              <span>Find Doctors</span>
            </Link>
            <Link to="/hospitals" className="hover:text-brand-600 transition-colors flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Hospitals</span>
            </Link>

            {user && (
              <Link
                to={getDashboardLink()}
                className="hover:text-brand-600 transition-colors flex items-center space-x-1.5 text-brand-600 font-semibold"
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {user.role === 'patient' && 'My Bookings'}
                  {user.role === 'doctor' && 'Doctor Portal'}
                  {user.role === 'hospital_admin' && 'Hospital Admin'}
                  {user.role === 'super_admin' && 'Platform Admin'}
                </span>
              </Link>
            )}
          </nav>

          {/* User Profile & Demo Switcher */}
          <div className="hidden md:flex items-center space-x-3">
            {/* 1-Click Demo Login Menu for Quick Evaluation */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                title="Switch between FYP demo roles instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-600" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
                    Switch Active Role
                  </div>
                  <button
                    onClick={() => handleQuickDemo('patient')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Patient (Hamza Ali)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded font-medium">Patient</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('doctor')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Dr. Ahmed Khan (Cardiology)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">Doctor</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('hospital_admin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Hospital Admin (City Gen)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">Hosp Admin</span>
                  </button>
                  <button
                    onClick={() => handleQuickDemo('super_admin')}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Platform Super Admin</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">Super Admin</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-2 text-slate-700 hover:text-brand-600"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-semibold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name.split(' ')[0]}
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-600/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            Find Doctors
          </Link>
          <Link
            to="/hospitals"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-700 font-medium"
          >
            Hospitals
          </Link>
          {user && (
            <Link
              to={getDashboardLink()}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-brand-600 font-semibold"
            >
              Dashboard ({user.role})
            </Link>
          )}
          <div className="pt-2 border-t border-slate-200">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-rose-600 font-semibold"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 text-sm font-medium bg-brand-600 text-white rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
