const ElderlyProfile = require('../models/ElderlyProfile');
const mockStore = require('./mockDataStore');
const { getDBStatus } = require('../config/db');

async function getAuthorizedPatientId(req, requestedId) {
  if (req.user.role === 'elderly') return String(req.user.id);
  if (req.user.role !== 'caregiver') return null;

  const patientId = requestedId || req.user.patientId;
  if (!patientId) {
    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      const elder = await ElderlyProfile.findOne({ caregiverId: req.user.id }).lean();
      return elder ? String(elder._id) : null;
    }
    const elder = mockStore.getEldersForCaregiver(req.user.id)[0];
    return elder ? String(elder.id) : null;
  }

  const dbStatus = getDBStatus();
  if (dbStatus.connected) {
    const elder = await ElderlyProfile.findOne({ _id: patientId, caregiverId: req.user.id }).lean();
    return elder ? String(elder._id) : null;
  }
  const elder = mockStore.getEldersForCaregiver(req.user.id).find(e => String(e.id) === String(patientId));
  return elder ? String(elder.id) : null;
}

module.exports = { getAuthorizedPatientId };
