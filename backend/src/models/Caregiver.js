const mongoose = require('mongoose');

const CaregiverSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    relationship: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Caregiver || mongoose.model('Caregiver', CaregiverSchema);
