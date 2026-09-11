const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Helper: Convert "HH:MM" to minutes from midnight
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// Helper: Convert minutes from midnight to "HH:MM"
const minutesToTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const m = (totalMinutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// @desc    Get weekly schedule templates for a doctor
// @route   GET /api/schedules/doctor/:doctorId
// @access  Public
exports.getDoctorSchedules = async (req, res, next) => {
  try {
    const schedules = await Schedule.find({
      doctor: req.params.doctorId,
      isActive: true,
    }).sort({ dayOfWeek: 1 });

    res.json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update schedule entries for a doctor
// @route   POST /api/schedules
// @access  Private (doctor themselves, hospital_admin, super_admin)
exports.saveDoctorSchedule = async (req, res, next) => {
  try {
    const {
      doctorId,
      hospitalId,
      dayOfWeek,
      startTime,
      endTime,
      slotDurationMinutes,
      breakTimes,
    } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Upsert schedule
    const schedule = await Schedule.findOneAndUpdate(
      {
        doctor: doctorId,
        hospital: hospitalId || doctor.hospital,
        dayOfWeek: Number(dayOfWeek),
      },
      {
        doctor: doctorId,
        hospital: hospitalId || doctor.hospital,
        dayOfWeek: Number(dayOfWeek),
        startTime: startTime || '09:00',
        endTime: endTime || '17:00',
        slotDurationMinutes: slotDurationMinutes || 20,
        breakTimes: breakTimes || [],
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Schedule updated successfully', schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calculated time slots for a doctor on a specific date
// @route   GET /api/schedules/doctor/:doctorId/slots?date=YYYY-MM-DD
// @access  Public
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // e.g. "2026-09-15"

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date parameter in YYYY-MM-DD format.',
      });
    }

    // Parse date and determine day of week (0 = Sunday, 1 = Monday, etc.)
    const targetDate = new Date(`${date}T00:00:00`);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    const dayOfWeek = targetDate.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Find schedule for this day
    const schedule = await Schedule.findOne({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    if (!schedule) {
      return res.json({
        success: true,
        date,
        dayName: dayNames[dayOfWeek],
        available: false,
        message: `Doctor does not have scheduled hours on ${dayNames[dayOfWeek]}s.`,
        slots: [],
      });
    }

    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);
    const duration = schedule.slotDurationMinutes || 20;

    // Fetch existing booked non-cancelled appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      dateString: date,
      status: { $ne: 'cancelled' },
    }).select('timeSlot tokenNumber');

    const bookedSlotStarts = new Set(bookedAppointments.map((a) => a.timeSlot.startTime));

    // Convert breaks to minute intervals
    const breaks = (schedule.breakTimes || []).map((b) => ({
      start: timeToMinutes(b.start),
      end: timeToMinutes(b.end),
      title: b.title,
    }));

    const slots = [];
    let current = startMinutes;
    let slotIndex = 1;

    while (current + duration <= endMinutes) {
      const slotStart = current;
      const slotEnd = current + duration;
      const slotStartStr = minutesToTime(slotStart);
      const slotEndStr = minutesToTime(slotEnd);

      // Check if overlaps with break
      const isBreak = breaks.some(
        (b) => Math.max(slotStart, b.start) < Math.min(slotEnd, b.end)
      );

      if (!isBreak) {
        const isBooked = bookedSlotStarts.has(slotStartStr);
        slots.push({
          slotNumber: slotIndex++,
          startTime: slotStartStr,
          endTime: slotEndStr,
          isAvailable: !isBooked,
          isBooked,
        });
      }

      current += duration;
    }

    res.json({
      success: true,
      date,
      dayName: dayNames[dayOfWeek],
      available: true,
      shift: {
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDurationMinutes: duration,
      },
      totalSlots: slots.length,
      availableCount: slots.filter((s) => s.isAvailable).length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};
