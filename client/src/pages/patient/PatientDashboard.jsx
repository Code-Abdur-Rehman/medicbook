import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  FileText,
  RotateCcw,
  X,
  Phone,
  User,
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | completed | cancelled

  // Action Modals
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const [reviewModalAppt, setReviewModalAppt] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalAppt) return;
    setCancelLoading(true);

    try {
      const res = await api.patch(`/appointments/${cancelModalAppt._id}/cancel`, {
        cancellationReason: cancelReason,
      });
      if (res.data.success) {
        setCancelModalAppt(null);
        setCancelReason('');
        fetchAppointments();
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewModalAppt) return;
    setReviewLoading(true);
    setReviewSuccess('');

    try {
      const res = await api.post('/reviews', {
        appointmentId: reviewModalAppt._id,
        rating,
        comment: reviewComment,
      });
      if (res.data.success) {
        setReviewSuccess('Review submitted successfully! Thank you.');
        setTimeout(() => {
          setReviewModalAppt(null);
          setReviewComment('');
          setReviewSuccess('');
          fetchAppointments();
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'upcoming') return a.status === 'confirmed' || a.status === 'pending';
    if (activeTab === 'completed') return a.status === 'completed';
    if (activeTab === 'cancelled') return a.status === 'cancelled' || a.status === 'no_show';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Patient Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-xs font-semibold rounded-full">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.email} • {user?.phone || 'No phone set'} • {user?.city}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-500 block">Total Bookings</span>
            <strong className="text-slate-900 text-base">{appointments.length}</strong>
          </div>
          <div className="bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 text-center">
            <span className="text-emerald-700 block">Completed</span>
            <strong className="text-emerald-900 text-base">
              {appointments.filter((a) => a.status === 'completed').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'upcoming'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming Appointments ({appointments.filter((a) => a.status === 'confirmed').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'completed'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed History ({appointments.filter((a) => a.status === 'completed').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'cancelled'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Cancelled / No Show</span>
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading your booking queue...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No appointments in this category</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'upcoming'
              ? 'You have no pending consultations scheduled. Browse top doctors to book a slot.'
              : 'No past consultations recorded here.'}
          </p>
          {activeTab === 'upcoming' && (
            <a
              href="/doctors"
              className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20"
            >
              Browse Doctors & Hospitals
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Doctor & Hospital Details */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {appt.doctor?.user?.name?.replace('Dr. ', '').charAt(0) || 'D'}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">{appt.doctor?.user?.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-md">
                      {appt.doctor?.specialties?.[0]?.name || appt.doctor?.department?.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center space-x-1 font-semibold text-slate-800">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appt.hospital?.name}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{appt.hospital?.address?.city}</span>
                    <span>•</span>
                    <span>Ref: <strong className="text-slate-800">{appt.appointmentNumber}</strong></span>
                  </div>

                  {/* Date & Time Slot Badge */}
                  <div className="flex items-center space-x-3 pt-1 text-xs">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{appt.dateString}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-semibold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{appt.timeSlot?.startTime} - {appt.timeSlot?.endTime}</span>
                    </span>
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold">
                      Token #{appt.tokenNumber}
                    </span>
                  </div>

                  {/* Consultation Notes if present */}
                  {appt.consultationNotes && (
                    <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                      <strong>Doctor Notes:</strong> {appt.consultationNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3 flex-shrink-0">
                <div className="text-left md:text-right">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                      appt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : appt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {appt.status}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    Fee: <strong>Rs. {appt.consultationFee?.toLocaleString()}</strong> ({appt.paymentStatus})
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {appt.status === 'confirmed' && (
                    <button
                      onClick={() => setCancelModalAppt(appt)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  {appt.status === 'completed' && (
                    <button
                      onClick={() => setReviewModalAppt(appt)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>Review Doctor</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Cancel Appointment</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your appointment with{' '}
              <strong>{cancelModalAppt.doctor?.user?.name}</strong> on {cancelModalAppt.dateString}?
            </p>

            <form onSubmit={handleCancel} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for cancellation</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Schedule conflict, feeling better, personal emergency..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalAppt(null)}
                  className="w-1/2 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Rate & Review Consultation</h3>
            <p className="text-xs text-slate-600">
              Share your feedback for <strong>{reviewModalAppt.doctor?.user?.name}</strong> at {reviewModalAppt.hospital?.name}.
            </p>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center">
                {reviewSuccess}
              </div>
            ) : (
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Your Review / Comments</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Describe your consultation experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalAppt(null)}
                    className="w-1/2 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="w-1/2 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                  >
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
