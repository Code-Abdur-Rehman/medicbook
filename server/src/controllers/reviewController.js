const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

// @desc    Submit review for a completed appointment
// @route   POST /api/reviews
// @access  Private (patient)
exports.createReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review appointments booked under your account.',
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review appointments that have been marked completed.',
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this appointment.',
      });
    }

    const review = await Review.create({
      patient: req.user.id,
      doctor: appointment.doctor,
      hospital: appointment.hospital,
      appointment: appointmentId,
      rating: Number(rating),
      comment,
    });

    // Recalculate doctor rating
    const docReviews = await Review.find({ doctor: appointment.doctor });
    const avgDocRating =
      docReviews.reduce((acc, item) => acc + item.rating, 0) / docReviews.length;

    await Doctor.findByIdAndUpdate(appointment.doctor, {
      rating: Number(avgDocRating.toFixed(1)),
      totalReviews: docReviews.length,
    });

    // Recalculate hospital rating
    const hospReviews = await Review.find({ hospital: appointment.hospital });
    const avgHospRating =
      hospReviews.reduce((acc, item) => acc + item.rating, 0) / hospReviews.length;

    await Hospital.findByIdAndUpdate(appointment.hospital, {
      rating: Number(avgHospRating.toFixed(1)),
      totalReviews: hospReviews.length,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getDoctorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};
