import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Star,
  Building2,
  Stethoscope,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Complete & Consultation Notes Modal
  const [activeAppt, setActiveAppt] = useState(null);
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([
    { medicine: '', dosage: '', instructions: '' },
  ]);
  const [updating, setUpdating] = useState(false);

  const fetchDoctorStats = async () => {
    try {
      const res = await api.get('/stats/doctor');
      if (res.data.success) {
        setStats(res.data.stats);
        setTodayAppointments(res.data.todayAppointments || []);
      }
    } catch (err) {
      console.error('Error loading doctor stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorStats();
  }, []);

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '', instructions: '' }]);
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleCompleteConsultation = async (e) => {
    e.preventDefault();
    if (!activeAppt) return;
    setUpdating(true);

    try {
      const filteredPrescriptions = prescriptions.filter((p) => p.medicine.trim() !== '');
      const res = await api.patch(`/appointments/${activeAppt._id}/status`, {
        status: 'completed',
        consultationNotes: notes,
        prescriptions: filteredPrescriptions,
      });

      if (res.data.success) {
        setActiveAppt(null);
        setNotes('');
        setPrescriptions([{ medicine: '', dosage: '', instructions: '' }]);
        fetchDoctorStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update consultation.');
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkNoShow = async (apptId) => {
    if (!confirm('Mark patient as No-Show?')) return;
    try {
      await api.patch(`/appointments/${apptId}/status`, { status: 'no_show' });
      fetchDoctorStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.replace('Dr. ', '').charAt(0) || 'D'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Doctor Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user?.hospitalName || 'Affiliated Hospital'}</span>
              <span>•</span>
              <span className="text-slate-600 font-medium">OPD Consultation Desk</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200 text-center min-w-[90px]">
            <span className="text-slate-500 block">Today's Queue</span>
            <strong className="text-slate-900 text-xl font-extrabold">{stats?.todayTotal || 0}</strong>
          </div>
          <div className="bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 text-center min-w-[90px]">
            <span className="text-emerald-700 block">Completed</span>
            <strong className="text-emerald-900 text-xl font-extrabold">{stats?.totalCompleted || 0}</strong>
          </div>
          <div className="bg-amber-50 px-4 py-3 rounded-2xl border border-amber-200 text-center min-w-[90px]">
            <span className="text-amber-700 block">Rating</span>
            <strong className="text-amber-900 text-xl font-extrabold flex items-center justify-center space-x-1">
              <span>{stats?.rating || 4.9}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </strong>
          </div>
        </div>
      </div>

      {/* Today's Queue Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-bold text-slate-900">Today's Patient Consultations</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Date: <strong className="text-slate-800">{new Date().toISOString().split('T')[0]}</strong>
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading today's agenda...</div>
        ) : todayAppointments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No appointments scheduled for today</h3>
            <p className="text-xs text-slate-500">Your patient queue is currently clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Chief Complaint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAppointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-600">
                      #{appt.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {appt.timeSlot?.startTime} - {appt.timeSlot?.endTime}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{appt.patientDetails?.name || appt.patient?.name}</div>
                      <div className="text-[10px] text-slate-400">{appt.patientDetails?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 capitalize">
                      {appt.patientDetails?.age || 30} yrs / {appt.patientDetails?.gender || 'male'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {appt.patientDetails?.symptoms || 'General Consultation'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          appt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : appt.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {appt.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              setActiveAppt(appt);
                              setNotes(appt.consultationNotes || '');
                            }}
                            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Consult & Prescribe
                          </button>
                          <button
                            onClick={() => handleMarkNoShow(appt._id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium"
                          >
                            No-Show
                          </button>
                        </>
                      )}
                      {appt.status === 'completed' && (
                        <span className="text-emerald-600 font-bold flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Finished</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Consultation & Prescribe Modal */}
      {activeAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Patient Consultation Summary</h3>
                <p className="text-xs text-slate-500">
                  {activeAppt.patientDetails?.name} • Token #{activeAppt.tokenNumber} • {activeAppt.timeSlot?.startTime}
                </p>
              </div>
              <button
                onClick={() => setActiveAppt(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteConsultation} className="space-y-4">
              {/* Consultation Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Clinical Diagnosis & Examination Notes
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Enter clinical observations, diagnosis, lab recommendations, lifestyle advice..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              {/* Prescriptions Builder */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Prescription Medications</label>
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="text-xs text-brand-600 font-bold flex items-center space-x-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {prescriptions.map((p, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      placeholder="Medicine name (e.g. Paracetamol 500mg)"
                      value={p.medicine}
                      onChange={(e) => handlePrescriptionChange(idx, 'medicine', e.target.value)}
                      className="w-5/12 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (1 tab twice daily)"
                      value={p.dosage}
                      onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                      className="w-4/12 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instructions (5 days)"
                      value={p.instructions}
                      onChange={(e) => handlePrescriptionChange(idx, 'instructions', e.target.value)}
                      className="w-3/12 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                    />
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveAppt(null)}
                  className="w-1/2 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  {updating ? 'Saving...' : 'Mark Consultation Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
