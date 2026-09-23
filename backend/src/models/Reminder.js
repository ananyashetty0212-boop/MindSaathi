const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
        'medicine',
        'hydration',
        'activity',
        'appointment'
      ],
      default: 'medicine'
    },

    dosageOrInstruction: {
      type: String,
      default: ''
    },

    scheduledTime: {
      type: String,
      required: true
    },

    timeOfDay: {
      type: String,
      enum: [
        'Morning',
        'Afternoon',
        'Evening',
        'Night'
      ],
      default: 'Morning'
    },

    status: {
      type: String,
      enum: [
        'pending',
        'taken',
        'snoozed',
        'skipped'
      ],
      default: 'pending'
    },

    confirmationTime: {
      type: Date,
      default: null
    },

    confirmationNote: {
      type: String,
      default: null
    },

    repeatDaily: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Reminder ||
  mongoose.model(
    'Reminder',
    ReminderSchema
  );