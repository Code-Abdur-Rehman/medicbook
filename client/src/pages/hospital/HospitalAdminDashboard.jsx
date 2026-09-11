import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Stethoscope,
  MapPin,
  CheckCircle2,
  X,
  Star,
  Activity,
} from 'lucide-react';

const HospitalAdminDashboard = () => {
  const { user } = useAuth();
  const [hospitalData, setHospitalData] = useState(null);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Doctor Modal
  const [addDoctorOpen, setAddDoctorOpen] = useState(false);
  const [docFormData, setDocFormData] = useState({
    name: '',
    email: '',
    password: 'Doctor@123',
    phone: '',
    departmentId: '',
    consultationFee: 2000,
    roomNumber: 'OPD-1',
    experienceYears: 5,
    bio: '',
    qualifications: 'MBBS, FCPS',
  });
  const [addingDoctor, setAddingDoctor] = useState(false);

  const fetchHospitalDashboard = async () => {
    try {
      const [hospRes, statRes, deptRes] = await Promise.all([
        api.get('/hospitals/admin/my-hospital'),
        api.get('/stats/hospital'),
        api.get('/taxonomies/departments'),
      ]);

      if (hospRes.data.success) {
        setHospitalData(hospRes.data.hospital);
        // Fetch doctors affiliated with this hospital
        const docRes = await api.get(`/doctors?hospital=${hospRes.data.hospital._id}`);
        if (docRes.data.success) setDoctors(docRes.data.doctors);
      }
      if (statRes.data.success) setStats(statRes.data.stats);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
        if (deptRes.data.departments.length > 0) {
          setDocFormData((prev) => ({ ...prev, departmentId: deptRes.data.departments[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error loading hospital admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalDashboard();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setAddingDoctor(true);

    try {
      const res = await api.post('/doctors', {
        ...docFormData,
        qualifications: docFormData.qualifications.split(',').map((s) => s.trim()),
      });

      if (res.data.success) {
        setAddDoctorOpen(false);
        setDocFormData({
          name: '',
          email: '',
          password: 'Doctor@123',
          phone: '',
          departmentId: departments[0]?._id || '',
          consultationFee: 2000,
          roomNumber: 'OPD-1',
          experienceYears: 5,
          bio: '',
          qualifications: 'MBBS, FCPS',
        });
        fetchHospitalDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not onboard doctor.');
    } finally {
      setAddingDoctor(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hospital Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {hospitalData?.name || 'Hospital Administration'}
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                Hospital Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{hospitalData?.address?.street}, {hospitalData?.address?.city}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">Reg: {hospitalData?.registrationNumber}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddDoctorOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Doctor</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-brand-600" />
            <span>Affiliated Doctors</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalDoctors || doctors.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Today's Appointments</span>
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">{stats?.todayAppointments || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Completed Consultations</span>
          </span>
          <div className="text-2xl font-extrabold text-blue-700">{stats?.completedAppointments || 0}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>Estimated Revenue</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-700">
            Rs. {stats?.totalRevenue?.toLocaleString() || '0'}
          </div>
        </div>
      </div>

      {/* Hospital Doctors Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-brand-600" />
            <span>Hospital Medical Staff ({doctors.length})</span>
          </h2>
          <span className="text-xs text-slate-500">
            Doctors assigned to {hospitalData?.name}
          </span>
        </div>

        {doctors.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No doctors onboarded yet. Click "Onboard New Doctor" above to assign specialists.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Consultation Fee</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{doc.user?.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-600">
                      {doc.department?.name || 'General'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{doc.roomNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      Rs. {doc.consultationFee?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center space-x-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating || 4.9}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Doctor Modal */}
      {addDoctorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Onboard New Specialist</h3>
                <p className="text-xs text-slate-500">Add a doctor to {hospitalData?.name}</p>
              </div>
              <button
                onClick={() => setAddDoctorOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kamran Shah"
                  value={docFormData.name}
                  onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@hospital.com"
                    value={docFormData.email}
                    onChange={(e) => setDocFormData({ ...docFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+92 300 0000000"
                    value={docFormData.phone}
                    onChange={(e) => setDocFormData({ ...docFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={docFormData.departmentId}
                    onChange={(e) => setDocFormData({ ...docFormData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Consultation Fee (PKR)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={docFormData.consultationFee}
                    onChange={(e) => setDocFormData({ ...docFormData, consultationFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Room / OPD Suite</label>
                  <input
                    type="text"
                    value={docFormData.roomNumber}
                    onChange={(e) => setDocFormData({ ...docFormData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    value={docFormData.experienceYears}
                    onChange={(e) => setDocFormData({ ...docFormData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Qualifications (comma separated)</label>
                <input
                  type="text"
                  placeholder="MBBS, FCPS, Fellowship..."
                  value={docFormData.qualifications}
                  onChange={(e) => setDocFormData({ ...docFormData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddDoctorOpen(false)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingDoctor}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  {addingDoctor ? 'Onboarding...' : 'Register Specialist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminDashboard;
