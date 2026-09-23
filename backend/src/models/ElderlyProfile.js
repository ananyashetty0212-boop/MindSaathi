const mongoose = require('mongoose');

const ElderlyProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120
    },

    preferredLanguage: {
      type: String,
      default: 'English',
      trim: true
    },

    // Optional profile information.
    // The application itself remains region-neutral.
    region: {
      type: String,
      default: '',
      trim: true
    },

    emergencyContactName: {
      type: String,
      default: '',
      trim: true
    },

    emergencyContactPhone: {
      type: String,
      default: '',
      trim: true
    },

    wakeTime: {
      type: String,
      default: '07:00 AM'
    },

    sleepTime: {
      type: String,
      default: '09:30 PM'
    },

    waterGoal: {
      type: Number,
      default: 8,
      min: 1,
      max: 30
    },

    accessPin: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4,
      index: true
    },

    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Caregiver',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.ElderlyProfile ||
  mongoose.model(
    'ElderlyProfile',
    ElderlyProfileSchema
  );