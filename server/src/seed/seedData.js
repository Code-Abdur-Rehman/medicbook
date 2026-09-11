const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../../.env' });

const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medibook';
    console.log(`[Seeder] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Purging existing MediBook database collections...');
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      Department.deleteMany({}),
      Specialty.deleteMany({}),
      Doctor.deleteMany({}),
      Schedule.deleteMany({}),
      Appointment.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seeder] Creating Super Admin...');
    const superAdmin = await User.create({
      name: 'System Super Admin',
      email: 'admin@medibook.com',
      password: 'Admin@123',
      role: 'super_admin',
      phone: '+92 300 0000001',
      city: 'Islamabad',
    });

    console.log('[Seeder] Creating Departments & Specialties...');
    const depts = await Department.create([
      { name: 'Cardiology', description: 'Heart, cardiovascular system and circulation disorders', icon: 'Heart' },
      { name: 'Neurology', description: 'Brain, spinal cord, and nervous system care', icon: 'Brain' },
      { name: 'Orthopedics', description: 'Musculoskeletal system, joints, bones, and spine', icon: 'Bone' },
      { name: 'Pediatrics', description: 'Infant, child, and adolescent specialized healthcare', icon: 'Baby' },
      { name: 'Dermatology', description: 'Skin, hair, nails, and cosmetic dermatological health', icon: 'Sparkles' },
      { name: 'General Medicine', description: 'Primary healthcare, internal medicine, and preventative care', icon: 'Stethoscope' },
    ]);

    const deptMap = {};
    depts.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    const specs = await Specialty.create([
      { name: 'Interventional Cardiology', department: deptMap['Cardiology'], description: 'Angioplasty, stenting, and catheter-based heart interventions' },
      { name: 'Clinical Cardiology', department: deptMap['Cardiology'], description: 'Hypertension, heart failure, and arrhythmia management' },
      { name: 'Adult Neurology', department: deptMap['Neurology'], description: 'Stroke, epilepsy, dementia, and neuromuscular diagnosis' },
      { name: 'Joint Replacement & Arthroscopy', department: deptMap['Orthopedics'], description: 'Hip, knee replacements and reconstructive sports surgery' },
      { name: 'General Pediatrics', department: deptMap['Pediatrics'], description: 'Child immunizations, growth monitoring, and pediatric diseases' },
      { name: 'Clinical & Cosmetic Dermatology', department: deptMap['Dermatology'], description: 'Acne, eczema, psoriasis, laser therapy, and skin restoration' },
      { name: 'Internal Medicine', department: deptMap['General Medicine'], description: 'Chronic disease management, diabetes, and comprehensive physicals' },
    ]);

    const specMap = {};
    specs.forEach((s) => {
      specMap[s.name] = s._id;
    });

    console.log('[Seeder] Creating Hospital Admins and Hospitals...');
    const hospAdmin1 = await User.create({
      name: 'Dr. Tariq Jamil (Hospital Director)',
      email: 'admin.citygen@medibook.com',
      password: 'Hospital@123',
      role: 'hospital_admin',
      phone: '+92 321 1112233',
      city: 'Lahore',
    });

    const hospAdmin2 = await User.create({
      name: 'Ms. Rubina Khalid (Operations Lead)',
      email: 'admin.carepoint@medibook.com',
      password: 'Hospital@123',
      role: 'hospital_admin',
      phone: '+92 333 4445566',
      city: 'Karachi',
    });

    const hospAdmin3 = await User.create({
      name: 'Col. (R) Dr. Nadeem Akhtar (CEO)',
      email: 'admin.apexheart@medibook.com',
      password: 'Hospital@123',
      role: 'hospital_admin',
      phone: '+92 300 7778899',
      city: 'Islamabad',
    });

    const hospitals = await Hospital.create([
      {
        name: 'City General Hospital',
        registrationNumber: 'HOSP-LHR-101',
        adminUser: hospAdmin1._id,
        email: 'info@citygeneral.medibook.com',
        phone: '+92 42 35789000',
        address: { street: 'Main Boulevard, Gulberg III', city: 'Lahore', state: 'Punjab', postalCode: '54000' },
        description: 'A 500-bed state-of-the-art tertiary care hospital offering round-the-clock emergency, advanced surgical suites, and multi-disciplinary specialty OPDs.',
        departments: [deptMap['Cardiology'], deptMap['Orthopedics'], deptMap['Dermatology'], deptMap['General Medicine']],
        facilities: ['24/7 Emergency & Trauma', 'Modular Operation Theaters', 'Dialysis Unit', 'Full Diagnostic Imaging & MRI', 'In-house Pharmacy'],
        status: 'approved',
        rating: 4.8,
        totalReviews: 24,
      },
      {
        name: 'CarePoint Medical Center',
        registrationNumber: 'HOSP-KHI-204',
        adminUser: hospAdmin2._id,
        email: 'support@carepoint.medibook.com',
        phone: '+92 21 35841200',
        address: { street: 'Shahrah-e-Faisal, Block 6 PECHS', city: 'Karachi', state: 'Sindh', postalCode: '75400' },
        description: 'Premier outpatient diagnostic and consultation center equipped with modern international diagnostic facilities, day surgeries, and specialized clinics.',
        departments: [deptMap['Cardiology'], deptMap['Pediatrics'], deptMap['Orthopedics']],
        facilities: ['Advanced Cardiac Catheterization Lab', 'Pediatric Intensive Care Unit', 'Executive Health Screening Clinic'],
        status: 'approved',
        rating: 4.7,
        totalReviews: 18,
      },
      {
        name: 'Apex Heart & Neuro Institute',
        registrationNumber: 'HOSP-ISB-309',
        adminUser: hospAdmin3._id,
        email: 'contact@apexhealth.medibook.com',
        phone: '+92 51 2894560',
        address: { street: 'Sector G-8/3, Kashmir Highway', city: 'Islamabad', state: 'Federal', postalCode: '44000' },
        description: 'Nationally recognized center of excellence in Cardiovascular and Neurological Sciences providing compassionate patient-centered healthcare.',
        departments: [deptMap['Cardiology'], deptMap['Neurology'], deptMap['Pediatrics']],
        facilities: ['Comprehensive Stroke Center', 'Neuro-navigation Surgery Suite', 'Cardiac ICU', 'Ambulance Helipad Access'],
        status: 'approved',
        rating: 4.9,
        totalReviews: 31,
      },
    ]);

    const hosp1 = hospitals[0];
    const hosp2 = hospitals[1];
    const hosp3 = hospitals[2];

    console.log('[Seeder] Creating Doctors...');
    // Doctor 1: Dr. Ahmed Khan (Cardiology @ City General)
    const uDoc1 = await User.create({
      name: 'Dr. Ahmed Khan',
      email: 'dr.ahmed@medibook.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+92 301 2345678',
      city: 'Lahore',
    });
    const doc1 = await Doctor.create({
      user: uDoc1._id,
      hospital: hosp1._id,
      department: deptMap['Cardiology'],
      specialties: [specMap['Interventional Cardiology']],
      qualifications: ['MBBS (KEMU)', 'FCPS (Cardiology)', 'Fellowship Interventional Cardiology (UK)'],
      experienceYears: 14,
      consultationFee: 2500,
      bio: 'Senior Consultant Interventional Cardiologist with over 14 years of clinical experience in coronary angiographies, complex angioplasties, and pacemaker implantations.',
      roomNumber: 'OPD Suite 204',
      rating: 4.9,
      totalReviews: 42,
      status: 'active',
      isApprovedByAdmin: true,
    });

    // Doctor 2: Dr. Sara Farooq (Cardiology @ CarePoint)
    const uDoc2 = await User.create({
      name: 'Dr. Sara Farooq',
      email: 'dr.sara@medibook.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+92 322 8765432',
      city: 'Karachi',
    });
    const doc2 = await Doctor.create({
      user: uDoc2._id,
      hospital: hosp2._id,
      department: deptMap['Cardiology'],
      specialties: [specMap['Clinical Cardiology']],
      qualifications: ['MBBS (Dow)', 'MRCP (UK)', 'Diplomate in Adult Cardiology'],
      experienceYears: 9,
      consultationFee: 1800,
      bio: 'Cardiologist specializing in preventative heart care, post-infarction rehabilitation, hypertension control, and non-invasive echocardiography diagnostics.',
      roomNumber: 'Consultation Room 12',
      rating: 4.8,
      totalReviews: 29,
      status: 'active',
      isApprovedByAdmin: true,
    });

    // Doctor 3: Dr. Ali Raza (Neurology @ Apex Heart & Neuro)
    const uDoc3 = await User.create({
      name: 'Dr. Ali Raza',
      email: 'dr.ali@medibook.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+92 334 1122334',
      city: 'Islamabad',
    });
    const doc3 = await Doctor.create({
      user: uDoc3._id,
      hospital: hosp3._id,
      department: deptMap['Neurology'],
      specialties: [specMap['Adult Neurology']],
      qualifications: ['MBBS (AMC)', 'FCPS (Neurology)', 'Member American Academy of Neurology'],
      experienceYears: 16,
      consultationFee: 3000,
      bio: 'Distinguished Neurologist and stroke specialist with extensive clinical expertise in managing migraine headaches, movement disorders, epilepsy, and peripheral neuropathies.',
      roomNumber: 'Neuro Wing - Room 3A',
      rating: 5.0,
      totalReviews: 38,
      status: 'active',
      isApprovedByAdmin: true,
    });

    // Doctor 4: Dr. Ayesha Malik (Dermatology @ City General)
    const uDoc4 = await User.create({
      name: 'Dr. Ayesha Malik',
      email: 'dr.ayesha@medibook.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+92 313 5566778',
      city: 'Lahore',
    });
    const doc4 = await Doctor.create({
      user: uDoc4._id,
      hospital: hosp1._id,
      department: deptMap['Dermatology'],
      specialties: [specMap['Clinical & Cosmetic Dermatology']],
      qualifications: ['MBBS', 'MCPS (Dermatology)', 'Fellowship in Aesthetic Medicine (USA)'],
      experienceYears: 8,
      consultationFee: 2000,
      bio: 'Leading Dermatologist focused on precision skin therapeutics, acne scarring treatment, laser treatments, eczema management, and anti-aging dermatology.',
      roomNumber: 'Skin & Aesthetics Suite 101',
      rating: 4.9,
      totalReviews: 51,
      status: 'active',
      isApprovedByAdmin: true,
    });

    // Doctor 5: Dr. Bilal Tariq (Orthopedics @ CarePoint)
    const uDoc5 = await User.create({
      name: 'Dr. Bilal Tariq',
      email: 'dr.bilal@medibook.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+92 345 9988776',
      city: 'Karachi',
    });
    const doc5 = await Doctor.create({
      user: uDoc5._id,
      hospital: hosp2._id,
      department: deptMap['Orthopedics'],
      specialties: [specMap['Joint Replacement & Arthroscopy']],
      qualifications: ['MBBS', 'FRCS (Trauma & Orthopedics UK)'],
      experienceYears: 12,
      consultationFee: 2200,
      bio: 'Consultant Orthopedic and Arthroscopic Surgeon with specialized focus on sports knee injuries, ACL reconstruction, joint replacements, and arthritis.',
      roomNumber: 'Orthopedic OPD-2',
      rating: 4.7,
      totalReviews: 22,
      status: 'active',
      isApprovedByAdmin: true,
    });

    // Doctor 6: Dr. Fatima Zahra (Pediatrics @ Apex)
    const uDoc6 = await User.create({
      name: 'Dr. Fatima Zahra',
      email: 'dr.fatima@medibook.com',
      password: 'Doctor@123',
      role: 'doctor',
      phone: '+92 300 4455667',
      city: 'Islamabad',
    });
    const doc6 = await Doctor.create({
      user: uDoc6._id,
      hospital: hosp3._id,
      department: deptMap['Pediatrics'],
      specialties: [specMap['General Pediatrics']],
      qualifications: ['MBBS', 'FCPS (Pediatrics)', 'MRCPCH (UK)'],
      experienceYears: 11,
      consultationFee: 1700,
      bio: 'Compassionate Pediatrician dedicated to pediatric health, newborn intensive care recovery, child nutrition counseling, and infectious disease therapies.',
      roomNumber: 'Pediatric Care Unit 08',
      rating: 4.9,
      totalReviews: 35,
      status: 'active',
      isApprovedByAdmin: true,
    });

    const allDoctors = [doc1, doc2, doc3, doc4, doc5, doc6];

    console.log('[Seeder] Creating Schedules for Doctors...');
    // Create Monday-Saturday schedules for each doctor
    for (const doc of allDoctors) {
      // Monday (1) through Saturday (6)
      for (let day = 1; day <= 6; day++) {
        await Schedule.create({
          doctor: doc._id,
          hospital: doc.hospital,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '15:00',
          slotDurationMinutes: 20,
          breakTimes: [
            { start: '13:00', end: '13:40', title: 'Lunch & Prayers' },
          ],
          isActive: true,
        });
      }
    }

    console.log('[Seeder] Creating Patient Accounts...');
    const patient1 = await User.create({
      name: 'Hamza Ali',
      email: 'patient.hamza@medibook.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+92 301 9876543',
      city: 'Lahore',
    });

    const patient2 = await User.create({
      name: 'Zainab Bibi',
      email: 'patient.zainab@medibook.com',
      password: 'Patient@123',
      role: 'patient',
      phone: '+92 333 8765432',
      city: 'Islamabad',
    });

    console.log('[Seeder] Creating Sample Appointments...');
    // Today's date string & tomorrow's date string
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Past completed appointment 1
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    const pastStr = pastDate.toISOString().split('T')[0];

    const appt1 = await Appointment.create({
      appointmentNumber: 'MB-2026-09101',
      patient: patient1._id,
      doctor: doc1._id,
      hospital: hosp1._id,
      dateString: pastStr,
      appointmentDate: pastDate,
      timeSlot: { startTime: '10:00', endTime: '10:20' },
      tokenNumber: 1,
      status: 'completed',
      consultationFee: doc1.consultationFee,
      paymentStatus: 'paid',
      paymentMethod: 'Cash at Desk',
      patientDetails: {
        name: 'Hamza Ali',
        phone: '+92 301 9876543',
        age: 32,
        gender: 'male',
        symptoms: 'Mild chest discomfort after strenuous workout and occasional palpitations.',
      },
      consultationNotes: 'Normal resting ECG. Advised Echocardiogram and 24hr Holter monitoring. Reduce sodium intake and monitor resting blood pressure.',
      prescriptions: [
        { medicine: 'Tab Nebivolol 2.5mg', dosage: '1 tablet once daily morning', instructions: 'For 14 days' },
        { medicine: 'Tab Aspirin 75mg', dosage: '1 tablet with breakfast', instructions: 'Take after meal' },
      ],
    });

    // Create review for past appointment
    await Review.create({
      patient: patient1._id,
      doctor: doc1._id,
      hospital: hosp1._id,
      appointment: appt1._id,
      rating: 5,
      comment: 'Exceptional consultation with Dr. Ahmed Khan. He explained my ECG thoroughly and made me feel completely at ease. City General Hospital was very well organized!',
    });

    // Upcoming appointment for today
    await Appointment.create({
      appointmentNumber: 'MB-2026-09102',
      patient: patient1._id,
      doctor: doc4._id, // Dr Ayesha
      hospital: hosp1._id,
      dateString: todayStr,
      appointmentDate: today,
      timeSlot: { startTime: '11:00', endTime: '11:20' },
      tokenNumber: 1,
      status: 'confirmed',
      consultationFee: doc4.consultationFee,
      paymentStatus: 'pay_at_hospital',
      paymentMethod: 'Cash at Desk',
      patientDetails: {
        name: 'Hamza Ali',
        phone: '+92 301 9876543',
        age: 32,
        gender: 'male',
        symptoms: 'Dry skin rash on right forearm and slight itching.',
      },
    });

    // Upcoming appointment for tomorrow
    await Appointment.create({
      appointmentNumber: 'MB-2026-09103',
      patient: patient2._id,
      doctor: doc3._id, // Dr Ali Raza
      hospital: hosp3._id,
      dateString: tomorrowStr,
      appointmentDate: tomorrow,
      timeSlot: { startTime: '09:40', endTime: '10:00' },
      tokenNumber: 1,
      status: 'confirmed',
      consultationFee: doc3.consultationFee,
      paymentStatus: 'paid',
      paymentMethod: 'Online Mock Payment',
      patientDetails: {
        name: 'Zainab Bibi',
        phone: '+92 333 8765432',
        age: 27,
        gender: 'female',
        symptoms: 'Recurring tension headache and neck stiffness during screen work.',
      },
    });

    console.log('[Seeder] Creating Notifications...');
    await Notification.create([
      {
        recipient: patient1._id,
        title: 'Appointment Reminder',
        message: `Your appointment with Dr. Ayesha Malik is scheduled for today at 11:00 AM (Token #1).`,
        type: 'reminder',
        link: '/patient/appointments',
      },
      {
        recipient: uDoc1._id,
        title: 'Patient Review Received',
        message: 'Patient Hamza Ali left a 5-star review for your consultation.',
        type: 'system',
        link: '/doctor/reviews',
      },
    ]);

    console.log('====================================================');
    console.log('🎉 MediBook Database Seeded Successfully!');
    console.log('====================================================');
    console.log('Available Demo Login Accounts:');
    console.log('1. SUPER ADMIN:');
    console.log('   Email: admin@medibook.com | Password: Admin@123');
    console.log('2. HOSPITAL ADMIN (City General Hospital):');
    console.log('   Email: admin.citygen@medibook.com | Password: Hospital@123');
    console.log('3. DOCTOR (Dr. Ahmed Khan - Cardiologist):');
    console.log('   Email: dr.ahmed@medibook.com | Password: Doctor@123');
    console.log('4. PATIENT (Hamza Ali):');
    console.log('   Email: patient.hamza@medibook.com | Password: Patient@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
