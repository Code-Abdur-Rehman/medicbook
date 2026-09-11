const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get platform-wide statistics for Super Admin
// @route   GET /api/stats/platform
// @access  Private (super_admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const approvedHospitals = await Hospital.countDocuments({ status: 'approved' });
    const pendingHospitals = await Hospital.countDocuments({ status: 'pending' });

    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ status: 'active' });

    const totalPatients = await User.countDocuments({ role: 'patient' });

    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Revenue calculation
    const revenueAgg = await Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$consultationFee' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Recent 5 appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name')
      .populate('hospital', 'name')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalHospitals,
        approvedHospitals,
        pendingHospitals,
        totalDoctors,
        activeDoctors,
        totalPatients,
        totalAppointments,
        completedAppointments,
        confirmedAppointments,
        cancelledAppointments,
        totalRevenue,
      },
      recentAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital-specific stats for Hospital Admin
// @route   GET /api/stats/hospital
// @access  Private (hospital_admin)
exports.getHospitalStats = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ adminUser: req.user.id });
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const totalDoctors = await Doctor.countDocuments({ hospital: hospital._id });
    const activeDoctors = await Doctor.countDocuments({
      hospital: hospital._id,
      status: 'active',
    });

    const totalAppointments = await Appointment.countDocuments({ hospital: hospital._id });
    const todayAppointments = await Appointment.countDocuments({
      hospital: hospital._id,
      dateString: todayStr,
      status: { $ne: 'cancelled' },
    });
    const completedAppointments = await Appointment.countDocuments({
      hospital: hospital._id,
      status: 'completed',
    });
    const cancelledAppointments = await Appointment.countDocuments({
      hospital: hospital._id,
      status: 'cancelled',
    });

    const revenueAgg = await Appointment.aggregate([
      {
        $match: {
          hospital: hospital._id,
          status: { $in: ['confirmed', 'completed'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$consultationFee' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentAppointments = await Appointment.find({ hospital: hospital._id })
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      hospital: {
        id: hospital._id,
        name: hospital.name,
        slug: hospital.slug,
        status: hospital.status,
      },
      stats: {
        totalDoctors,
        activeDoctors,
        totalAppointments,
        todayAppointments,
        completedAppointments,
        cancelledAppointments,
        totalRevenue,
      },
      recentAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor-specific stats for Doctor Dashboard
// @route   GET /api/stats/doctor
// @access  Private (doctor)
exports.getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = await Appointment.find({
      doctor: doctor._id,
      dateString: todayStr,
      status: { $ne: 'cancelled' },
    })
      .populate('patient', 'name phone email avatar')
      .sort({ 'timeSlot.startTime': 1 });

    const totalCompleted = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'completed',
    });
    const upcomingCount = await Appointment.countDocuments({
      doctor: doctor._id,
      status: 'confirmed',
      dateString: { $gte: todayStr },
    });

    res.json({
      success: true,
      stats: {
        todayTotal: todayAppointments.length,
        totalCompleted,
        upcomingCount,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
      },
      todayAppointments,
    });
  } catch (error) {
    next(error);
  }
};
