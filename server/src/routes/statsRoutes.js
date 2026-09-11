const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getHospitalStats,
  getDoctorStats,
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/platform', protect, authorize('super_admin'), getPlatformStats);
router.get('/hospital', protect, authorize('hospital_admin', 'super_admin'), getHospitalStats);
router.get('/doctor', protect, authorize('doctor'), getDoctorStats);

module.exports = router;
