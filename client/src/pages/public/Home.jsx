import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  MapPin,
  Building2,
  Stethoscope,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  HeartPulse,
  Sparkles,
  Users,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [deptRes, hospRes, docRes] = await Promise.all([
          api.get('/taxonomies/departments'),
          api.get('/hospitals'),
          api.get('/doctors?sortBy=rating'),
        ]);

        if (deptRes.data.success) setDepartments(deptRes.data.departments);
        if (hospRes.data.success) setHospitals(hospRes.data.hospitals.slice(0, 3));
        if (docRes.data.success) setTopDoctors(docRes.data.doctors.slice(0, 3));
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCity) params.append('city', selectedCity);
    if (selectedDept) params.append('department', selectedDept);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Unified Healthcare Appointment Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One Platform, Multiple Hospitals,{' '}
              <span className="text-brand-600">The Best Doctors.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Skip juggling multiple hospital websites. Search certified specialists across partner hospitals, compare consultation fees, and book verified appointments in seconds.
            </p>
          </div>

          {/* Unified Multi-Criteria Search Widget */}
          <div className="mt-10 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-brand-900/5 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3"
            >
              {/* Doctor / Specialty / Condition Keyword */}
              <div className="sm:col-span-5 relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Doctor, specialty, e.g. Cardiologist"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* City Selection */}
              <div className="sm:col-span-3 relative flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  <option value="">All Cities</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                </select>
              </div>

              {/* Department Selection */}
              <div className="sm:col-span-2 relative flex items-center">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all cursor-pointer"
                >
                  <option value="">All Depts</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit CTA */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/25 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Filter Tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Popular searches:</span>
              <button
                type="button"
                onClick={() => navigate('/doctors?search=Cardiology')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                Cardiologist
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors?search=Dermatology')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                Dermatologist
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors?search=Neurology')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                Neurologist
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctors?city=Lahore')}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 transition-colors"
              >
                Lahore Hospitals
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">3+</div>
                <div className="text-xs font-medium text-slate-500">Partner Hospitals</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">6+</div>
                <div className="text-xs font-medium text-slate-500">Board Specialists</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">20 min</div>
                <div className="text-xs font-medium text-slate-500">Realtime Slots</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">4.9 ★</div>
                <div className="text-xs font-medium text-slate-500">Verified Patient Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Medical Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Browse by Medical Specialty</h2>
            <p className="text-sm text-slate-500 mt-1">Consult with verified healthcare specialists across our network</p>
          </div>
          <Link
            to="/doctors"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>View all specialties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {departments.map((dept) => (
            <Link
              key={dept._id}
              to={`/doctors?department=${dept._id}`}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center space-y-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors flex items-center justify-center">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">Top Specialists</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Single Hospital vs MediBook Platform Architecture Feature Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-400">
              Why A Multi-Hospital Platform?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              The Power of a Unified Healthcare Marketplace
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Traditional hospital websites trap patients into single-facility silos. MediBook centralizes doctor schedules, credentials, and appointments under one modern platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-base font-bold">Cross-Hospital Comparison</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compare consultation fees (Rs. 1,500 vs Rs. 2,500), hospital locations, and real-time appointment availability across multiple hospitals simultaneously.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-base font-bold">Conflict-Free Dynamic Slots</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Atomic reservation architecture ensures doctors never get double-booked across hospital shifts, while break intervals and queue tokens are generated dynamically.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-base font-bold">Granular 4-Tier RBAC</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated portals for Patients, Doctors, Hospital Admins, and Platform Super Admins with role-restricted endpoints and live management dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hospitals Carousel/Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Partner Hospitals</h2>
            <p className="text-sm text-slate-500 mt-1">
              Accredited medical institutes with integrated online booking
            </p>
          </div>
          <Link
            to="/hospitals"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>Browse all hospitals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold text-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{hosp.rating || '4.8'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{hosp.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {hosp.address?.street}, {hosp.address?.city}
                    </span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {hosp.description}
                </p>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {hosp.facilities?.slice(0, 3).map((f, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {hosp.departments?.length || 4} Departments Active
                </span>
                <Link
                  to={`/hospitals/${hosp._id}`}
                  className="px-3 py-1.5 bg-white hover:bg-brand-50 text-brand-600 border border-slate-200 hover:border-brand-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <span>View Doctors</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Rated Doctors Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Highly Rated Specialists</h2>
            <p className="text-sm text-slate-500 mt-1">
              Directly book consultations with senior consultants
            </p>
          </div>
          <Link
            to="/doctors"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1 mt-2 md:mt-0"
          >
            <span>Explore all doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {doc.user?.name?.replace('Dr. ', '').charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.user?.name}</h3>
                    <p className="text-xs font-semibold text-brand-600">
                      {doc.specialties?.[0]?.name || doc.department?.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{doc.hospital?.name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs py-2 px-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600">
                    <strong className="text-slate-900">{doc.experienceYears || 5}+</strong> yrs exp
                  </span>
                  <span className="flex items-center space-x-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.rating || 4.9}</span>
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Rs. {doc.consultationFee?.toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.bio || 'Senior medical consultant available for OPD consultation.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Slots Available</span>
                </span>
                <Link
                  to={`/doctors/${doc._id}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-brand-600/20 transition-all"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
