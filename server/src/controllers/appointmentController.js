const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');

// Generate unique human-readable appointment number
const generateAppointmentNumber = (dateString) => {
  const cleanDate = dateString.replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MB-${cleanDate}-${randomSuffix}`;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (patient)
exports.bookAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      dateString,
      timeSlot,
      patientDetails,
      paymentMethod,
    } = req.body;

    if (!doctorId || !dateString || !timeSlot?.startTime || !timeSlot?.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, and time slot are required.',
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('hospital user');
    if (!doctor || doctor.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'The requested doctor is not currently available for bookings.',
      });
    }

    // Verify slot is not already taken
    const existingBooking = await Appointment.findOne({
      doctor: doctorId,
      dateString,
      'timeSlot.startTime': timeSlot.startTime,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available. Please select another slot.',
      });
    }

    // Calculate token number for the day
    const dayAppointmentsCount = await Appointment.countDocuments({
      doctor: doctorId,
      dateString,
      status: { $ne: 'cancelled' },
    });
    const tokenNumber = dayAppointmentsCount + 1;

    const appointmentDate = new Date(`${dateString}T00:00:00`);
    const appointmentNumber = generateAppointmentNumber(dateString);

    const appointment = await Appointment.create({
      appointmentNumber,
      patient: req.user.id,
      doctor: doctorId,
      hospital: doctor.hospital._id,
      dateString,
      appointmentDate,
      timeSlot,
      tokenNumber,
      consultationFee: doctor.consultationFee,
      paymentStatus: paymentMethod === 'Online Mock Payment' ? 'paid' : 'pay_at_hospital',
      paymentMethod: paymentMethod || 'Cash at Desk',
      patientDetails: {
        name: patientDetails?.name || req.user.name,
        phone: patientDetails?.phone || req.user.phone,
        age: patientDetails?.age || 28,
        gender: patientDetails?.gender || 'male',
        symptoms: patientDetails?.symptoms || '',
      },
      status: 'confirmed',
    });

    // Notify doctor
    if (doctor.user?._id) {
      await Notification.create({
        recipient: doctor.user._id,
        title: 'New Appointment Booked',
        message: `Patient ${patientDetails?.name || req.user.name} booked a slot on ${dateString} at ${timeSlot.startTime}.`,
        type: 'booking',
        link: `/doctor/appointments`,
      });
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('doctor', 'consultationFee roomNumber')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .populate('hospital', 'name slug address logo')
      .populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment reserved successfully!',
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's appointments (Role-aware)
// @route   GET /api/appointments/my
// @access  Private
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { status, dateString } = req.query;
    let filter = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: req.user.id });
      if (!doc) {
        return res.json({ success: true, count: 0, appointments: [] });
      }
      filter.doctor = doc._id;
    } else if (req.user.role === 'hospital_admin') {
      const hosp = await Hospital.findOne({ adminUser: req.user.id });
      if (!hosp) {
        return res.json({ success: true, count: 0, appointments: [] });
      }
      filter.hospital = hosp._id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (dateString) {
      filter.dateString = dateString;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone avatar')
      .populate('hospital', 'name slug address logo')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name' },
          { path: 'specialties', select: 'name' },
        ],
      })
      .sort({ appointmentDate: -1, 'timeSlot.startTime': 1 });

    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate('hospital', 'name slug address phone logo')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name' },
          { path: 'specialties', select: 'name' },
        ],
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status or clinical notes (Doctor / Hospital Admin)
// @route   PATCH /api/appointments/:id/status
// @access  Private (doctor, hospital_admin, super_admin)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, consultationNotes, prescriptions, paymentStatus } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (consultationNotes !== undefined) appointment.consultationNotes = consultationNotes;
    if (prescriptions) appointment.prescriptions = prescriptions;
    if (paymentStatus) appointment.paymentStatus = paymentStatus;

    await appointment.save();

    // Notify patient
    await Notification.create({
      recipient: appointment.patient,
      title: 'Appointment Status Updated',
      message: `Your appointment (#${appointment.appointmentNumber}) is now marked as ${status || 'updated'}.`,
      type: 'status_change',
      link: '/patient/appointments',
    });

    res.json({ success: true, message: 'Appointment updated successfully', appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by user request';
    appointment.cancelledBy = req.user.role;

    await appointment.save();

    res.json({ success: true, message: 'Appointment successfully cancelled', appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private (patient, doctor)
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDateString, newTimeSlot } = req.body;

    if (!newDateString || !newTimeSlot?.startTime || !newTimeSlot?.endTime) {
      return res.status(400).json({
        success: false,
        message: 'New appointment date and time slot are required.',
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify the new slot is not taken
    const slotTaken = await Appointment.findOne({
      doctor: appointment.doctor,
      dateString: newDateString,
      'timeSlot.startTime': newTimeSlot.startTime,
      status: { $ne: 'cancelled' },
      _id: { $ne: appointment._id },
    });

    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: 'The requested new time slot is already booked. Please choose another.',
      });
    }

    appointment.dateString = newDateString;
    appointment.appointmentDate = new Date(`${newDateString}T00:00:00`);
    appointment.timeSlot = newTimeSlot;
    appointment.status = 'confirmed';

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
