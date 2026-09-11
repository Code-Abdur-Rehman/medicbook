const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  getSpecialties,
  createSpecialty,
} = require('../controllers/taxonomyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/departments', getDepartments);
router.post('/departments', protect, authorize('super_admin'), createDepartment);

router.get('/specialties', getSpecialties);
router.post('/specialties', protect, authorize('super_admin'), createSpecialty);

module.exports = router;
