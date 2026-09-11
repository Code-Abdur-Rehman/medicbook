const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Review = require('../models/Review');

// @desc    Get all doctors with multi-criteria filtering
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
  try {
    const {
      search,
      hospital,
      department,
      specialty,
      city,
      minFee,
      maxFee,
      sortBy,
    } = req.query;

    const query = { status: 'active', isApprovedByAdmin: true };

    if (hospital) {
      query.hospital = hospital;
    }
    if (department) {
      query.department = department;
    }
    if (specialty) {
      query.specialties = specialty;
    }
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    let sortOption = { rating: -1 };
    if (sortBy === 'fee_low') sortOption = { consultationFee: 1 };
    if (sortBy === 'fee_high') sortOption = { consultationFee: -1 };
    if (sortBy === 'experience') sortOption = { experienceYears: -1 };
    if (sortBy === 'rating') sortOption = { rating: -1 };

    let doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar city')
      .populate('hospital', 'name slug address logo rating')
      .populate('department', 'name icon')
      .populate('specialties', 'name')
      .sort(sortOption);

    // Apply city or search text filter in-memory if matching on populated fields
    if (city) {
      doctors = doctors.filter(
        (doc) =>
          doc.hospital?.address?.city?.toLowerCase() === city.toLowerCase() ||
          doc.user?.city?.toLowerCase() === city.toLowerCase()
      );
    }

    if (search) {
      const s = search.toLowerCase();
      doctors = doctors.filter((doc) => {
        const nameMatch = doc.user?.name?.toLowerCase().includes(s);
        const hospMatch = doc.hospital?.name?.toLowerCase().includes(s);
        const deptMatch = doc.department?.name?.toLowerCase().includes(s);
        const specMatch = doc.specialties?.some((sp) => sp.name?.toLowerCase().includes(s));
        return nameMatch || hospMatch || deptMatch || specMatch;
      });
    }

    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor details by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar city')
      .populate('hospital', 'name slug address phone email logo facilities')
      .populate('department', 'name description icon')
      .populate('specialties', 'name description');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Fetch doctor's recent reviews
    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, doctor, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in doctor profile
// @route   GET /api/doctors/profile/me
// @access  Private (doctor)
exports.getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('hospital', 'name slug address logo')
      .populate('department', 'name icon')
      .populate('specialties', 'name');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account.',
      });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Onboard/Create new Doctor (Hospital Admin or Super Admin)
// @route   POST /api/doctors
// @access  Private (hospital_admin, super_admin)
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      hospitalId,
      departmentId,
      specialtyIds,
      qualifications,
      experienceYears,
      consultationFee,
      bio,
      roomNumber,
    } = req.body;

    // Verify hospital permissions
    let finalHospitalId = hospitalId;
    if (req.user.role === 'hospital_admin') {
      const myHospital = await Hospital.findOne({ adminUser: req.user.id });
      if (!myHospital) {
        return res.status(400).json({
          success: false,
          message: 'You must have a registered hospital to add doctors.',
        });
      }
      finalHospitalId = myHospital._id;
    }

    // Find or create User
    let doctorUser = await User.findOne({ email });
    if (!doctorUser) {
      doctorUser = await User.create({
        name,
        email,
        password: password || 'Doctor@123',
        role: 'doctor',
        phone: phone || '',
      });
    } else {
      doctorUser.role = 'doctor';
      await doctorUser.save();
    }

    // Check if Doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: doctorUser._id });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'A doctor profile is already attached to this user account.',
      });
    }

    const doctor = await Doctor.create({
      user: doctorUser._id,
      hospital: finalHospitalId,
      department: departmentId,
      specialties: specialtyIds || [],
      qualifications: qualifications || ['MBBS'],
      experienceYears: experienceYears || 3,
      consultationFee: consultationFee || 1500,
      bio: bio || '',
      roomNumber: roomNumber || 'OPD-1',
      status: 'active',
      isApprovedByAdmin: true,
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('hospital', 'name')
      .populate('department', 'name')
      .populate('specialties', 'name');

    res.status(201).json({ success: true, doctor: populatedDoctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile details
// @route   PUT /api/doctors/:id
// @access  Private (doctor themselves, hospital_admin of this hospital, super_admin)
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Authorization check
    const isSelf = req.user.role === 'doctor' && doctor.user.toString() === req.user.id;
    const isSuperAdmin = req.user.role === 'super_admin';
    let isHospitalAdmin = false;
    if (req.user.role === 'hospital_admin') {
      const myHospital = await Hospital.findOne({ adminUser: req.user.id });
      if (myHospital && myHospital._id.toString() === doctor.hospital.toString()) {
        isHospitalAdmin = true;
      }
    }

    if (!isSelf && !isSuperAdmin && !isHospitalAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this doctor profile.',
      });
    }

    const {
      consultationFee,
      experienceYears,
      qualifications,
      bio,
      roomNumber,
      status,
      specialtyIds,
    } = req.body;

    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (qualifications) doctor.qualifications = qualifications;
    if (bio !== undefined) doctor.bio = bio;
    if (roomNumber !== undefined) doctor.roomNumber = roomNumber;
    if (status !== undefined) doctor.status = status;
    if (specialtyIds) doctor.specialties = specialtyIds;

    await doctor.save();

    const updated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('hospital', 'name')
      .populate('department', 'name')
      .populate('specialties', 'name');

    res.json({ success: true, doctor: updated });
  } catch (error) {
    next(error);
  }
};
