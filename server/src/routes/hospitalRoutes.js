const express = require('express');
const router = express.Router();
const {
  getAllHospitals,
  getHospital,
  getMyHospital,
  createHospital,
  updateHospital,
  updateHospitalStatus,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAllHospitals);
router.get('/admin/my-hospital', protect, authorize('hospital_admin'), getMyHospital);
router.get('/:idOrSlug', getHospital);

router.post('/', protect, authorize('hospital_admin', 'super_admin'), createHospital);
router.put('/:id', protect, authorize('hospital_admin', 'super_admin'), updateHospital);
router.patch('/:id/status', protect, authorize('super_admin'), updateHospitalStatus);

module.exports = router;
