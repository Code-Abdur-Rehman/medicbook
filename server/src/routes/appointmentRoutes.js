const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);

router.patch('/:id/status', protect, authorize('doctor', 'hospital_admin', 'super_admin'), updateAppointmentStatus);
router.patch('/:id/cancel', protect, cancelAppointment);
router.patch('/:id/reschedule', protect, rescheduleAppointment);

module.exports = router;
