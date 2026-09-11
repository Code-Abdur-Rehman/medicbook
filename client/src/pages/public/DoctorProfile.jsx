import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Star,
  CheckCircle2,
  ShieldCheck,
  Award,
  AlertCircle,
  X,
  CreditCard,
  User,
  Phone,
  FileText,
} from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const [patientDetails, setPatientDetails] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: 30,
    gender: 'male',
    symptoms: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash at Desk');

  // Next 7 days helper
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, monthDay };
  });

  // Load Doctor Details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        if (res.data.success) {
          setDoctor(res.data.doctor);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.error('Error loading doctor:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Load Slots whenever date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      setSlotsLoading(true);
      setSlotsMessage('');
      setSelectedSlot(null);

      try {
        const res = await api.get(`/schedules/doctor/${id}/slots?date=${selectedDate}`);
        if (res.data.success) {
          if (res.data.available) {
            setAvailableSlots(res.data.slots);
          } else {
            setAvailableSlots([]);
            setSlotsMessage(res.data.message || 'No scheduled hours on this day.');
          }
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
        setSlotsMessage('Unable to load appointment slots.');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  // If user state updates, initialize patient details form
  useEffect(() => {
    if (user) {
      setPatientDetails((prev) => ({
        ...prev,
        name: prev.name || user.name,
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setBookingError('');
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await api.post('/appointments', {
        doctorId: doctor._id,
        dateString: selectedDate,
        timeSlot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
        patientDetails,
        paymentMethod,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.appointment);
        // Refresh slots in background
        const slotRefresh = await api.get(`/schedules/doctor/${id}/slots?date=${selectedDate}`);
        if (slotRefresh.data.success) {
          setAvailableSlots(slotRefresh.data.slots);
        }
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking could not be confirmed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Loading specialist profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Doctor Not Found</h2>
        <p className="text-xs text-slate-500">The specialist you are looking for is unavailable.</p>
        <Link to="/doctors" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Back to Doctor Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-3xl shadow-md">
              {doctor.user?.name?.replace('Dr. ', '').charAt(0) || 'D'}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{doctor.user?.name}</h1>
                <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-200">
                  {doctor.department?.name}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                {doctor.qualifications?.join(' • ')}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                <Link
                  to={`/hospitals/${doctor.hospital?._id}`}
                  className="flex items-center space-x-1 font-semibold text-brand-600 hover:underline"
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{doctor.hospital?.name}</span>
                </Link>

                <span className="flex items-center space-x-1 text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{doctor.hospital?.address?.city}</span>
                </span>

                <span className="flex items-center space-x-1 text-amber-600 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">({doctor.totalReviews} reviews)</span>
                </span>

                <span className="text-slate-500 font-medium">
                  Room: <strong>{doctor.roomNumber}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Fee & Consultation Summary */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex md:flex-col items-center md:items-end justify-between md:min-w-[200px]">
            <div className="text-left md:text-right">
              <span className="text-xs font-medium text-slate-500 block">Consultation Fee</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                Rs. {doctor.consultationFee?.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>

        {/* Doctor Bio & Specialties */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Professional Biography
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {doctor.bio || 'Experienced medical practitioner specializing in evidence-based clinical diagnostics and care.'}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Areas of Specialization
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {doctor.specialties?.map((s) => (
                <span
                  key={s._id}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Slot Booking Engine Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2 text-brand-600 mb-1">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900">Select Date & Time Slot</h2>
          </div>
          <p className="text-xs text-slate-500">
            Slots are calculated in real-time based on the doctor's shift schedule and conflict-free booking queue.
          </p>
        </div>

        {/* Day / Date Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {nextDays.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedDate === d.dateStr
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className={`text-[11px] font-semibold ${selectedDate === d.dateStr ? 'text-brand-100' : 'text-slate-500'}`}>
                {d.dayName}
              </div>
              <div className="text-sm font-bold mt-0.5">{d.monthDay}</div>
            </button>
          ))}
        </div>

        {/* Slots Grid */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Available Slots for <strong>{selectedDate}</strong>
            </span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Available</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>
                <span>Booked</span>
              </span>
            </div>
          </div>

          {slotsLoading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs">Computing available schedule slots...</p>
            </div>
          ) : slotsMessage ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
              <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">{slotsMessage}</p>
              <p className="text-[11px] text-slate-500">Please select another date from the tabs above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {availableSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  type="button"
                  disabled={!slot.isAvailable}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    !slot.isAvailable
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                      : selectedSlot?.startTime === slot.startTime
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md ring-2 ring-brand-400'
                      : 'bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Slot Action Bar */}
        {selectedSlot && (
          <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800">
                  Selected Slot: {selectedDate} at {selectedSlot.startTime} – {selectedSlot.endTime}
                </div>
                <div className="text-[11px] text-slate-500">
                  Consultation Fee: Rs. {doctor.consultationFee?.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenBooking}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Proceed to Book Appointment</span>
            </button>
          </div>
        )}
      </div>

      {/* Patient Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>Patient Feedback ({reviews.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Overall Rating: <strong className="text-slate-800">{doctor.rating} / 5.0</strong>
          </span>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No reviews recorded yet for this specialist.</p>
        ) : (
          <div className="space-y-3 pt-2">
            {reviews.map((r) => (
              <div key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
                      {r.patient?.name?.charAt(0) || 'P'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{r.patient?.name}</span>
                  </div>
                  <div className="flex items-center text-amber-500 text-xs font-bold space-x-0.5">
                    {Array.from({ length: r.rating }, (_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal Dialog */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setBookingModalOpen(false);
                setBookingSuccess(null);
              }}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your appointment slot has been atomically reserved in the hospital queue.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Appointment Ref:</span>
                    <strong className="text-brand-600">{bookingSuccess.appointmentNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Queue Token #:</span>
                    <strong className="text-slate-900 text-sm">{bookingSuccess.tokenNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="text-slate-800">{bookingSuccess.dateString} at {bookingSuccess.timeSlot?.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hospital:</span>
                    <span className="text-slate-800">{doctor.hospital?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment:</span>
                    <span className="text-emerald-700 font-semibold uppercase">{bookingSuccess.paymentStatus}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Link
                    to="/patient/dashboard"
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md text-center"
                  >
                    View in My Bookings
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Confirm Appointment</h3>
                  <p className="text-xs text-slate-500">
                    {doctor.user?.name} at {doctor.hospital?.name}
                  </p>
                </div>

                {bookingError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                    {bookingError}
                  </div>
                )}

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <strong className="text-slate-800">{selectedDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <strong className="text-slate-800">{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <strong className="text-emerald-700">Rs. {doctor.consultationFee?.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Patient Form Fields */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      value={patientDetails.name}
                      onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone</label>
                      <input
                        type="text"
                        required
                        value={patientDetails.phone}
                        onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={patientDetails.age}
                        onChange={(e) => setPatientDetails({ ...patientDetails, age: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Symptoms or Reason for Consultation</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Chest pain, recurring headaches, routine checkup..."
                      value={patientDetails.symptoms}
                      onChange={(e) => setPatientDetails({ ...patientDetails, symptoms: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Option</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label
                        className={`p-3 border rounded-xl flex items-center space-x-2 cursor-pointer transition-colors ${
                          paymentMethod === 'Cash at Desk'
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payOption"
                          value="Cash at Desk"
                          checked={paymentMethod === 'Cash at Desk'}
                          onChange={() => setPaymentMethod('Cash at Desk')}
                          className="hidden"
                        />
                        <span>Pay at Hospital Desk</span>
                      </label>

                      <label
                        className={`p-3 border rounded-xl flex items-center space-x-2 cursor-pointer transition-colors ${
                          paymentMethod === 'Online Mock Payment'
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payOption"
                          value="Online Mock Payment"
                          checked={paymentMethod === 'Online Mock Payment'}
                          onChange={() => setPaymentMethod('Online Mock Payment')}
                          className="hidden"
                        />
                        <div className="flex items-center space-x-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                          <span>Online Simulation</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center space-x-2"
                  >
                    {bookingLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirm & Reserve Slot</span>
                      </>
                    )}
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

export default DoctorProfile;
