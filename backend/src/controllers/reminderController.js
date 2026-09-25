const Reminder = require('../models/Reminder');
const mockStore = require('../services/mockDataStore');
const { getDBStatus } = require('../config/db');
const { getAuthorizedPatientId } = require('../services/accessService');

const VALID_STATUSES = [
  'pending',
  'taken',
  'snoozed',
  'skipped'
];

const VALID_CATEGORIES = [
  'medicine',
  'hydration',
  'activity',
  'appointment'
];

const VALID_TIMES_OF_DAY = [
  'Morning',
  'Afternoon',
  'Evening',
  'Night'
];

function sanitizeReminderInput(body = {}) {
  return {
    title: String(body.title || '').trim(),
    category: body.category || 'medicine',
    dosageOrInstruction: String(body.dosageOrInstruction || '').trim(),
    scheduledTime: String(body.scheduledTime || '').trim(),
    timeOfDay: body.timeOfDay || 'Morning',
    repeatDaily: body.repeatDaily !== false,
    active: body.active !== false
  };
}

function validateReminderInput(input) {
  if (!input.title) return 'Medicine/reminder name is required.';
  if (!VALID_CATEGORIES.includes(input.category)) return 'Invalid reminder category.';
  if (!input.scheduledTime) return 'Scheduled time is required.';
  if (!VALID_TIMES_OF_DAY.includes(input.timeOfDay)) return 'Invalid time of day.';
  return null;
}

function normalizeExpiredSnooze(reminder) {
  if (
    reminder &&
    reminder.status === 'snoozed' &&
    reminder.snoozeUntil &&
    new Date(reminder.snoozeUntil).getTime() <= Date.now()
  ) {
    reminder.status = 'pending';
    reminder.snoozeUntil = null;
    reminder.lastActionAt = new Date();
    reminder.updatedAt = new Date();
  }
  return reminder;
}

async function getReminderForPatient(id, patientId) {
  const dbStatus = getDBStatus();

  if (dbStatus.connected) {
    try {
      return await Reminder.findOne({
        _id: id,
        patientId,
        active: true
      });
    } catch (_) {
      return mockStore.getReminderById(id, patientId);
    }
  }

  return mockStore.getReminderById(id, patientId);
}

exports.getReminders = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.query.patientId);

    if (!patientId) {
      return res.status(403).json({
        success: false,
        error: 'No linked elderly profile is available for this account.'
      });
    }

    const dbStatus = getDBStatus();
    let reminders = [];

    if (dbStatus.connected) {
      try {
        reminders = await Reminder.find({
          patientId,
          active: true
        }).sort({ scheduledTime: 1 });

        for (const reminder of reminders) {
          const before = reminder.status;
          normalizeExpiredSnooze(reminder);
          if (before !== reminder.status) await reminder.save();
        }
      } catch (_) {
        reminders = mockStore
          .getReminders()
          .filter(
            r => String(r.patientId) === String(patientId) && r.active !== false
          )
          .map(normalizeExpiredSnooze)
          .sort((a, b) => String(a.scheduledTime).localeCompare(String(b.scheduledTime)));
      }
    } else {
      reminders = mockStore
        .getReminders()
        .filter(
          r => String(r.patientId) === String(patientId) && r.active !== false
        )
        .map(normalizeExpiredSnooze)
        .sort((a, b) => String(a.scheduledTime).localeCompare(String(b.scheduledTime)));
    }

    return res.json({
      success: true,
      data: reminders,
      adherenceDisclaimer:
        'Self-reported medication confirmation. Does not replace supervised clinical administration.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reminders: ' + error.message
    });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.body.patientId);

    if (!patientId) {
      return res.status(403).json({
        success: false,
        error: 'No linked elderly profile is available for this account.'
      });
    }

    const input = sanitizeReminderInput(req.body);
    const validationError = validateReminderInput(input);

    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const payload = {
      ...input,
      patientId,
      createdByRole: req.user.role === 'caregiver' ? 'caregiver' : 'elderly',
      createdById: String(req.user.id)
    };

    const dbStatus = getDBStatus();
    let reminder;

    if (dbStatus.connected) {
      try {
        reminder = await Reminder.create(payload);
      } catch (_) {
        reminder = mockStore.createReminder(payload);
      }
    } else {
      reminder = mockStore.createReminder(payload);
    }

    return res.status(201).json({
      success: true,
      message: 'Reminder created successfully.',
      data: reminder
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to create reminder: ' + error.message
    });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.body.patientId);

    if (!patientId) {
      return res.status(403).json({
        success: false,
        error: 'No linked elderly profile is available for this account.'
      });
    }

    const existing = await getReminderForPatient(req.params.id, patientId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found for this elderly profile.'
      });
    }

    const existingData = typeof existing.toObject === 'function'
      ? existing.toObject()
      : existing;

    const input = sanitizeReminderInput({
      ...existingData,
      ...req.body
    });

    const validationError = validateReminderInput(input);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const updates = {
      ...input,
      lastActionAt: new Date()
    };

    const dbStatus = getDBStatus();
    let updatedReminder;

    if (dbStatus.connected) {
      try {
        updatedReminder = await Reminder.findOneAndUpdate(
          { _id: req.params.id, patientId, active: true },
          { $set: updates },
          { new: true, runValidators: true }
        );
      } catch (_) {
        updatedReminder = mockStore.updateReminder(req.params.id, patientId, updates);
      }
    } else {
      updatedReminder = mockStore.updateReminder(req.params.id, patientId, updates);
    }

    if (!updatedReminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder could not be updated.'
      });
    }

    return res.json({
      success: true,
      message: 'Reminder updated successfully.',
      data: updatedReminder
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update reminder: ' + error.message
    });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(
      req,
      req.query.patientId || req.body?.patientId
    );

    if (!patientId) {
      return res.status(403).json({
        success: false,
        error: 'No linked elderly profile is available for this account.'
      });
    }

    const dbStatus = getDBStatus();
    let removed;

    if (dbStatus.connected) {
      try {
        removed = await Reminder.findOneAndUpdate(
          { _id: req.params.id, patientId, active: true },
          { $set: { active: false, lastActionAt: new Date() } },
          { new: true }
        );
      } catch (_) {
        removed = mockStore.updateReminder(req.params.id, patientId, {
          active: false,
          lastActionAt: new Date()
        });
      }
    } else {
      removed = mockStore.updateReminder(req.params.id, patientId, {
        active: false,
        lastActionAt: new Date()
      });
    }

    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found for this elderly profile.'
      });
    }

    return res.json({
      success: true,
      message: 'Reminder deactivated successfully.',
      data: removed
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to deactivate reminder: ' + error.message
    });
  }
};

exports.updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, snoozeUntil } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`
      });
    }

    const patientId = await getAuthorizedPatientId(req, req.body.patientId);

    if (!patientId) {
      return res.status(403).json({
        success: false,
        error: 'No linked elderly profile is available for this account.'
      });
    }

    let snoozeDate = null;

    if (status === 'snoozed') {
      snoozeDate = new Date(snoozeUntil);

      if (!snoozeUntil || Number.isNaN(snoozeDate.getTime()) || snoozeDate.getTime() <= Date.now()) {
        return res.status(400).json({
          success: false,
          error: 'A future snooze time is required.'
        });
      }
    }

    const dbStatus = getDBStatus();
    let updatedReminder = null;

    if (dbStatus.connected) {
      try {
        const update = {
          status,
          confirmationTime:
            status === 'pending' || status === 'snoozed' ? null : new Date(),
          confirmationNote: note || null,
          snoozeUntil: status === 'snoozed' ? snoozeDate : null,
          snoozeCount: status === 'snoozed' ? undefined : 0,
          lastActionAt: new Date()
        };

        if (status === 'snoozed') {
          updatedReminder = await Reminder.findOneAndUpdate(
            { _id: id, patientId, active: true },
            { $set: update, $inc: { snoozeCount: 1 } },
            { new: true }
          );
        } else {
          delete update.snoozeCount;
          updatedReminder = await Reminder.findOneAndUpdate(
            { _id: id, patientId, active: true },
            { $set: { ...update, snoozeCount: 0 } },
            { new: true }
          );
        }
      } catch (_) {
        updatedReminder = mockStore.updateReminderStatus(
          id,
          patientId,
          status,
          note,
          snoozeDate
        );
      }
    } else {
      updatedReminder = mockStore.updateReminderStatus(
        id,
        patientId,
        status,
        note,
        snoozeDate
      );
    }

    if (!updatedReminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found for this elderly profile.'
      });
    }

    return res.json({
      success: true,
      message:
        status === 'snoozed'
          ? 'Reminder postponed successfully.'
          : `Medication status updated to: ${status}`,
      data: updatedReminder,
      responsibleTrackingNotice:
        'Logged as patient self-reported medication confirmation.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update reminder: ' + error.message
    });
  }
};
