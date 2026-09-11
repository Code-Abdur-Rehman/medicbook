import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Building2,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Stethoscope,
  Activity,
  Layers,
  X,
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Department Modal
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [addingDept, setAddingDept] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [statsRes, hospRes, deptRes] = await Promise.all([
        api.get('/stats/platform'),
        api.get('/hospitals'),
        api.get('/taxonomies/departments'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentAppointments(statsRes.data.recentAppointments || []);
      }
      if (hospRes.data.success) setHospitals(hospRes.data.hospitals);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Error loading platform admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateHospitalStatus = async (hospitalId, newStatus) => {
    try {
      const res = await api.patch(`/hospitals/${hospitalId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update status');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setAddingDept(true);
    try {
      const res = await api.post('/taxonomies/departments', {
        name: deptName,
        description: deptDesc,
      });
      if (res.data.success) {
        setAddDeptOpen(false);
        setDeptName('');
        setDeptDesc('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create department');
    } finally {
      setAddingDept(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">Platform Super Admin</h1>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                Global Network Controller
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              System governance, hospital approvals, taxonomy definitions, and cross-facility analytics.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddDeptOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Medical Department</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Total Partner Hospitals</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalHospitals || 3}</div>
          <div className="text-[10px] text-emerald-600 font-medium">All active on marketplace</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Registered Doctors</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalDoctors || 6}</div>
          <div className="text-[10px] text-blue-600 font-medium">{stats?.activeDoctors || 6} active schedules</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>Total Appointments</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-900">{stats?.totalAppointments || 3}</div>
          <div className="text-[10px] text-slate-500 font-medium">{stats?.completedAppointments || 1} completed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>Platform Revenue Volume</span>
          </span>
          <div className="text-2xl font-extrabold text-amber-700">
            Rs. {stats?.totalRevenue?.toLocaleString() || '0'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">From consultation bookings</div>
        </div>
      </div>

      {/* Hospital Governance & Approvals */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>Hospital Partners & Verification</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Multi-tenant management</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Hospital Name</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Registration #</th>
                <th className="py-3 px-4">Admin Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hospitals.map((hosp) => (
                <tr key={hosp._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{hosp.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{hosp.address?.city}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{hosp.registrationNumber}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{hosp.adminUser?.name || 'Assigned Admin'}</div>
                    <div className="text-[10px] text-slate-400">{hosp.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        hosp.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : hosp.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {hosp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {hosp.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateHospitalStatus(hosp._id, 'approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {hosp.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateHospitalStatus(hosp._id, 'suspended')}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments Taxonomy List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <span>Platform Medical Departments ({departments.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{d.description || 'Specialty medical discipline.'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Department Modal */}
      {addDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add Medical Department</h3>
              <button onClick={() => setAddDeptOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ophthalmology, Oncology, Urology..."
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Clinical scope and disorders treated..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddDeptOpen(false)}
                  className="w-1/2 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingDept}
                  className="w-1/2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  {addingDept ? 'Creating...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
