import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  ShieldCheck,
  Calendar,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';

const HospitalDetail = () => {
  const { idOrSlug } = useParams();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const res = await api.get(`/hospitals/${idOrSlug}`);
        if (res.data.success) {
          setHospital(res.data.hospital);
          setDoctors(res.data.doctors || []);
        }
      } catch (err) {
        console.error('Error fetching hospital:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalData();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2">Loading hospital details...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">Hospital Not Found</h2>
        <Link to="/hospitals" className="text-xs text-brand-600 font-semibold underline">
          Return to hospitals directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hospital Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{hospital.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Healthcare Facility</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{hospital.address?.street}, {hospital.address?.city}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hospital.phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hospital.email}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200 self-start">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <div>
              <div className="text-sm font-bold text-slate-900">{hospital.rating || '4.8'} / 5.0</div>
              <div className="text-[10px] text-slate-500 font-medium">{hospital.totalReviews || 24} patient reviews</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {hospital.description}
        </p>

        {/* Facilities */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Available Hospital Facilities</h3>
          <div className="flex flex-wrap gap-2">
            {hospital.facilities?.map((f, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Affiliated Doctors Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-brand-600" />
            <span>Doctors Available at this Hospital ({doctors.length})</span>
          </h2>
        </div>

        {doctors.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No doctors currently listed under this hospital.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-base">
                    {doc.user?.name?.replace('Dr. ', '').charAt(0) || 'D'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.user?.name}</h3>
                    <p className="text-xs font-semibold text-brand-600">{doc.department?.name}</p>
                    <p className="text-[11px] text-slate-500">{doc.qualifications?.join(', ')}</p>
                  </div>
                </div>

                <div className="text-right space-y-1.5 flex-shrink-0">
                  <div className="text-sm font-extrabold text-emerald-700">
                    Rs. {doc.consultationFee?.toLocaleString()}
                  </div>
                  <Link
                    to={`/doctors/${doc._id}`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Book</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDetail;
