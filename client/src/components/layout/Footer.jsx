import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Heart, ShieldCheck, Clock, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Medi<span className="text-brand-400">Book</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized healthcare appointment & scheduling marketplace. Connecting patients with leading hospitals and board-certified doctors in one unified system.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant Healthcare Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">For Patients</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors by Specialty</Link></li>
              <li><Link to="/hospitals" className="hover:text-white transition-colors">Browse Partner Hospitals</Link></li>
              <li><Link to="/doctors?city=Lahore" className="hover:text-white transition-colors">Doctors in Lahore</Link></li>
              <li><Link to="/doctors?city=Karachi" className="hover:text-white transition-colors">Doctors in Karachi</Link></li>
              <li><Link to="/doctors?city=Islamabad" className="hover:text-white transition-colors">Doctors in Islamabad</Link></li>
            </ul>
          </div>

          {/* For Healthcare Providers */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Providers & Admins</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Hospital Portal Sign In</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Doctor Schedule Manager</Link></li>
              <li><Link to="/register?type=hospital" className="hover:text-white transition-colors">Register a New Hospital</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Super Admin Center</Link></li>
            </ul>
          </div>

          {/* FYP Academic Notice */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-white text-xs font-semibold flex items-center space-x-1.5">
              <span>Final Year Project (FYP)</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Designed and built as a centralized MERN-stack multi-hospital scheduling platform demonstrating RBAC, conflict-free dynamic slot generation, and multi-tenant hospital dashboards.
            </p>
            <div className="pt-2 text-[10px] text-slate-300 flex items-center space-x-1">
              <span>Built with React, Node.js & MongoDB</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300">
          <p>© {new Date().getFullYear()} MediBook Healthcare Network. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Unified Multi-Hospital Scheduling Architecture</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
