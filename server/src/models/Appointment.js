const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    dateString: {
      type: String,
      required: true, // "YYYY-MM-DD"
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: { type: String, required: true }, // "09:20"
      endTime: { type: String, required: true },   // "09:40"
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pay_at_hospital', 'paid', 'refunded'],
      default: 'pay_at_hospital',
    },
    paymentMethod: {
      type: String,
      default: 'Cash at Desk',
    },
    patientDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
      symptoms: { type: String, default: '' },
    },
    consultationNotes: {
      type: String,
      default: '',
    },
    prescriptions: [
      {
        medicine: String,
        dosage: String,
        instructions: String,
      },
    ],
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'hospital_admin', 'super_admin', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent double bookings (unless the appointment was cancelled)
appointmentSchema.index(
  { doctor: 1, dateString: 1, 'timeSlot.startTime': 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } },
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
