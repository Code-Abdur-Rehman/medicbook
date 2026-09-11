import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  MapPin,
  Building2,
  Stethoscope,
  Star,
  CheckCircle2,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Award,
  ArrowRight,
  X,
} from 'lucide-react';

const DoctorSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States initialized from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [hospital, setHospital] = useState(searchParams.get('hospital') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');

  // Load Taxonomies & Hospitals for filter selectors
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, hospRes] = await Promise.all([
          api.get('/taxonomies/departments'),
          api.get('/hospitals'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.departments);
        if (hospRes.data.success) setHospitals(hospRes.data.hospitals);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Doctors whenever filters change
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (city) params.append('city', city);
        if (department) params.append('department', department);
        if (hospital) params.append('hospital', hospital);
        if (sortBy) params.append('sortBy', sortBy);
        if (maxFee) params.append('maxFee', maxFee);

        // Sync with browser URL
        setSearchParams(params, { replace: true });

        const res = await api.get(`/doctors?${params.toString()}`);
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Error loading doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchDoctors();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, city, department, hospital, sortBy, maxFee]);

  const handleClearFilters = () => {
    setSearch('');
    setCity('');
    setDepartment('');
    setHospital('');
    setSortBy('rating');
    setMaxFee('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Find Doctors & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse qualified doctors across multiple hospitals and book dynamic consultation slots.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
          >
            <option value="rating">Top Rated</option>
            <option value="fee_low">Consultation Fee: Low to High</option>
            <option value="fee_high">Consultation Fee: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <span>Filters</span>
              </h2>
              {(search || city || department || hospital || maxFee) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Search Doctor / Specialty</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Ahmed, Cardiologist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">City / Location</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
              >
                <option value="">All Cities</option>
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
              </select>
            </div>

            {/* Hospital Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Hospital</label>
              <select
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
              >
                <option value="">All Hospitals</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.address?.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Max Fee: {maxFee ? `Rs. ${Number(maxFee).toLocaleString()}` : 'Any'}</label>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {['', '1800', '2200', '3000'].map((fVal) => (
                  <button
                    key={fVal}
                    type="button"
                    onClick={() => setMaxFee(fVal)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-colors ${
                      maxFee === fVal
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fVal === '' ? 'Any' : `≤ Rs. ${Number(fVal).toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Results Column */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-800">{doctors.length}</strong> available specialists
            </span>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200 p-12">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">Searching doctor schedules across hospitals...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No doctors match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your filters, selecting 'All Cities', or clearing the search query.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Doctor Bio & Affiliation */}
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-xl shadow-sm flex-shrink-0">
                      {doc.user?.name?.replace('Dr. ', '').charAt(0) || 'D'}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h2 className="text-lg font-bold text-slate-900">{doc.user?.name}</h2>
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[11px] font-semibold rounded-md border border-brand-100">
                          {doc.specialties?.[0]?.name || doc.department?.name}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        {doc.qualifications?.join(', ') || 'MBBS'}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-600 flex-wrap pt-1 gap-y-1">
                        <span className="flex items-center space-x-1 font-semibold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{doc.hospital?.name}</span>
                        </span>

                        <span className="flex items-center space-x-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.hospital?.address?.city || doc.user?.city}</span>
                        </span>

                        <span className="flex items-center space-x-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{doc.rating || 4.9}</span>
                          <span className="text-[10px] text-slate-400">({doc.totalReviews || 12})</span>
                        </span>

                        <span className="text-slate-500">
                          • {doc.experienceYears || 5} Years Experience
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Fee & Booking CTA */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3 flex-shrink-0">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-400 font-medium">Consultation Fee</div>
                      <div className="text-xl font-extrabold text-emerald-700">
                        Rs. {doc.consultationFee?.toLocaleString()}
                      </div>
                    </div>

                    <Link
                      to={`/doctors/${doc._id}`}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-600/20 transition-all flex items-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Appointment</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;
