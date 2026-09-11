const mongoose = require('mongoose');

const breakTimeSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  title: { type: String, default: 'Break' },
});

const scheduleSchema = new mongoose.Schema(
  {
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
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    },
    startTime: {
      type: String,
      required: true, // "09:00"
    },
    endTime: {
      type: String,
      required: true, // "17:00"
    },
    slotDurationMinutes: {
      type: Number,
      default: 20,
      min: 10,
      max: 60,
    },
    breakTimes: [breakTimeSchema],
    maxPatientsPerSlot: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a doctor has at most 1 schedule entry per dayOfWeek per hospital
scheduleSchema.index({ doctor: 1, hospital: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
