const express = require('express');
const router = express.Router();
const {
  getDoctorSchedules,
  saveDoctorSchedule,
  getAvailableSlots,
} = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/doctor/:doctorId', getDoctorSchedules);
router.get('/doctor/:doctorId/slots', getAvailableSlots);

router.post(
  '/',
  protect,
  authorize('doctor', 'hospital_admin', 'super_admin'),
  saveDoctorSchedule
);

module.exports = router;
