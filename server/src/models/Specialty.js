const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Specialty name is required'],
      unique: true,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Associated department is required'],
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Stethoscope',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Specialty', specialtySchema);
