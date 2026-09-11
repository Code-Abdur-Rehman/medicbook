const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all hospitals with filtering & search
// @route   GET /api/hospitals
// @access  Public
exports.getAllHospitals = async (req, res, next) => {
  try {
    const { search, city, department, status } = req.query;
    const query = {};

    // Filter by approval status
    if (req.user && req.user.role === 'super_admin') {
      if (status) query.status = status;
    } else {
      query.status = 'approved';
    }

    // City filter
    if (city) {
      query['address.city'] = new RegExp(`^${city}$`, 'i');
    }

    // Department filter
    if (department) {
      query.departments = department;
    }

    // Search query (name or street)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const hospitals = await Hospital.find(query)
      .populate('departments', 'name icon')
      .populate('adminUser', 'name email phone')
      .sort({ rating: -1, createdAt: -1 });

    res.json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital by ID or slug with affiliated doctors
// @route   GET /api/hospitals/:idOrSlug
// @access  Public
exports.getHospital = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let query = {};
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }

    const hospital = await Hospital.findOne(query)
      .populate('departments', 'name description icon')
      .populate('adminUser', 'name email phone');

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Fetch active doctors in this hospital
    const doctors = await Doctor.find({ hospital: hospital._id, status: 'active' })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name icon')
      .populate('specialties', 'name');

    res.json({ success: true, hospital, doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital associated with the logged-in hospital admin
// @route   GET /api/hospitals/admin/my-hospital
// @access  Private (hospital_admin)
exports.getMyHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findOne({ adminUser: req.user.id })
      .populate('departments', 'name icon')
      .populate('adminUser', 'name email phone');

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'No hospital registered under this admin account yet.',
      });
    }

    const doctorsCount = await Doctor.countDocuments({ hospital: hospital._id });

    res.json({ success: true, hospital, doctorsCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new hospital
// @route   POST /api/hospitals
// @access  Private (hospital_admin, super_admin)
exports.createHospital = async (req, res, next) => {
  try {
    const {
      name,
      registrationNumber,
      email,
      phone,
      address,
      description,
      departments,
      facilities,
      logo,
      bannerImage,
    } = req.body;

    // Check if hospital with registration number exists
    const existing = await Hospital.findOne({ registrationNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A hospital with this registration number is already registered.',
      });
    }

    // Default status: approved if created by super_admin, pending if registered by hospital_admin
    const status = req.user.role === 'super_admin' ? 'approved' : 'pending';

    const hospital = await Hospital.create({
      name,
      registrationNumber,
      adminUser: req.user.id,
      email: email || req.user.email,
      phone,
      address,
      description,
      departments: departments || [],
      facilities: facilities || ['24/7 Emergency', 'Pharmacy', 'Clinical Lab'],
      logo,
      bannerImage,
      status,
    });

    res.status(201).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital profile
// @route   PUT /api/hospitals/:id
// @access  Private (hospital_admin of this hospital, super_admin)
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Check ownership
    if (
      req.user.role !== 'super_admin' &&
      hospital.adminUser.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this hospital profile.',
      });
    }

    const {
      name,
      email,
      phone,
      address,
      description,
      departments,
      facilities,
      logo,
      bannerImage,
    } = req.body;

    hospital.name = name || hospital.name;
    hospital.email = email || hospital.email;
    hospital.phone = phone || hospital.phone;
    if (address) hospital.address = { ...hospital.address, ...address };
    hospital.description = description !== undefined ? description : hospital.description;
    if (departments) hospital.departments = departments;
    if (facilities) hospital.facilities = facilities;
    if (logo !== undefined) hospital.logo = logo;
    if (bannerImage !== undefined) hospital.bannerImage = bannerImage;

    await hospital.save();

    res.json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital status (Approve / Suspend)
// @route   PATCH /api/hospitals/:id/status
// @access  Private (super_admin)
exports.updateHospitalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};
