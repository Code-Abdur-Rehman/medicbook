const Department = require('../models/Department');
const Specialty = require('../models/Specialty');

// @desc    Get all departments
// @route   GET /api/taxonomies/departments
// @access  Public
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: departments.length, departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department (Super Admin)
// @route   POST /api/taxonomies/departments
// @access  Private (super_admin)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const department = await Department.create({ name, description, icon });
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all specialties
// @route   GET /api/taxonomies/specialties
// @access  Public
exports.getSpecialties = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.departmentId) {
      query.department = req.query.departmentId;
    }
    const specialties = await Specialty.find(query)
      .populate('department', 'name icon')
      .sort({ name: 1 });
    res.json({ success: true, count: specialties.length, specialties });
  } catch (error) {
    next(error);
  }
};

// @desc    Create specialty (Super Admin)
// @route   POST /api/taxonomies/specialties
// @access  Private (super_admin)
exports.createSpecialty = async (req, res, next) => {
  try {
    const { name, departmentId, description, icon } = req.body;
    const specialty = await Specialty.create({
      name,
      department: departmentId,
      description,
      icon,
    });
    res.status(201).json({ success: true, specialty });
  } catch (error) {
    next(error);
  }
};
