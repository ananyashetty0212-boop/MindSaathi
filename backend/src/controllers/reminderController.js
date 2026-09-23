const Reminder = require('../models/Reminder');
const mockStore = require('../services/mockDataStore');
const { getDBStatus } = require('../config/db');
const { getAuthorizedPatientId } = require('../services/accessService');

exports.getReminders = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.query.patientId);
    if (!patientId) return res.status(403).json({ success: false, error: 'No linked elderly profile is available for this account.' });
    const dbStatus = getDBStatus();
    let reminders = [];
    if (dbStatus.connected) {
      try {
        reminders = await Reminder.find({ patientId }).sort({ scheduledTime: 1 });
      } catch (_) { reminders = mockStore.getReminders().filter(r => String(r.patientId) === String(patientId)); }
    } else reminders = mockStore.getReminders().filter(r => String(r.patientId) === String(patientId));
    return res.json({ success: true, data: reminders, adherenceDisclaimer: 'Self-reported medication confirmation. Does not replace supervised clinical administration.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch reminders: ' + error.message });
  }
};

exports.updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const validStatuses = ['pending', 'taken', 'snoozed', 'skipped'];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, error: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });

    const patientId = await getAuthorizedPatientId(req, req.body.patientId);
    if (!patientId) return res.status(403).json({ success: false, error: 'No linked elderly profile is available for this account.' });
    const dbStatus = getDBStatus();
    let updatedReminder = null;

    if (dbStatus.connected) {
      try {
        updatedReminder = await Reminder.findOneAndUpdate(
          { _id: id, patientId },
          { status, confirmationTime: status === 'pending' ? null : new Date(), confirmationNote: note || null },
          { new: true }
        );
      } catch (_) {
        updatedReminder = mockStore.updateReminderStatus(id, status, note);
      }
    } else updatedReminder = mockStore.updateReminderStatus(id, status, note);

    if (!updatedReminder || String(updatedReminder.patientId) !== String(patientId)) return res.status(404).json({ success: false, error: 'Reminder not found for this elderly profile.' });
    return res.json({ success: true, message: `Medication status updated to: ${status}`, data: updatedReminder, responsibleTrackingNotice: 'Logged as patient self-reported medication confirmation.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update reminder: ' + error.message });
  }
};
