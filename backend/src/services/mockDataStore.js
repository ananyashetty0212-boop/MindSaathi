/**
 * MindSaathi - Local Demo Store
 *
 * Starts EMPTY.
 * Real data is created only through the application.
 *
 * This is used automatically when MongoDB is unavailable.
 */

class MockDataStore {

  constructor() {
    this.caregivers = [];
    this.elders = [];
    this.reminders = [];
    this.sessions = [];
  }

  // =========================================================
  // CAREGIVER + ELDER CREATION
  // =========================================================

  createCaregiverWithElder(caregiverData, elderData) {

    if (this.findCaregiverByEmail(caregiverData.email)) {
      return {
        error: 'EMAIL_EXISTS'
      };
    }

    const caregiver = {
      id:
        `care_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      ...caregiverData,

      createdAt: new Date()
    };

    const elder = {

      id:
        `elder_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      caregiverId: caregiver.id,

      ...elderData,

      createdAt: new Date()
    };

    this.caregivers.push(caregiver);

    this.elders.push(elder);

    this.seedRemindersForElder(elder.id);

    return {
      caregiver,
      elder
    };
  }

  // =========================================================
  // DEFAULT DAILY ROUTINE
  // =========================================================

  seedRemindersForElder(patientId) {

    const prefix = `rem_${patientId}`;

    this.reminders.push(

      {
        _id: `${prefix}_medicine`,

        patientId,

        title: 'Morning Medicine',

        category: 'medicine',

        dosageOrInstruction:
          'Confirm after taking your scheduled medicine.',

        scheduledTime: '08:30 AM',

        timeOfDay: 'Morning',

        status: 'pending',

        confirmationTime: null,

        confirmationNote: null,

        repeatDaily: true,

        createdAt: new Date()
      },

      {
        _id: `${prefix}_water`,

        patientId,

        title: 'Drink Water',

        category: 'hydration',

        dosageOrInstruction:
          'Drink one full glass of water.',

        scheduledTime: '11:00 AM',

        timeOfDay: 'Morning',

        status: 'pending',

        confirmationTime: null,

        confirmationNote: null,

        repeatDaily: true,

        createdAt: new Date()
      },

      {
        _id: `${prefix}_activity`,

        patientId,

        title: 'Gentle Daily Activity',

        category: 'activity',

        dosageOrInstruction:
          'Take a gentle walk or complete a calm daily activity.',

        scheduledTime: '05:30 PM',

        timeOfDay: 'Evening',

        status: 'pending',

        confirmationTime: null,

        confirmationNote: null,

        repeatDaily: true,

        createdAt: new Date()
      }
    );
  }

  // =========================================================
  // CAREGIVERS
  // =========================================================

  findCaregiverByEmail(email) {

    return this.caregivers.find(
      caregiver =>
        caregiver.email === email
    );
  }

  findCaregiverById(id) {

    return this.caregivers.find(
      caregiver =>
        String(caregiver.id) === String(id)
    );
  }

  // =========================================================
  // ELDERS
  // =========================================================

  findElderByPin(pin) {

    return this.elders.find(
      elder =>
        elder.accessPin === pin
    );
  }

  findElderById(id) {

    return this.elders.find(
      elder =>
        String(elder.id) === String(id)
    );
  }

  getEldersForCaregiver(caregiverId) {

    return this.elders.filter(
      elder =>
        String(elder.caregiverId) === String(caregiverId)
    );
  }

  // =========================================================
  // REMINDERS
  // =========================================================

  getReminders() {

    return this.reminders;
  }

  getReminderById(id, patientId = null) {
    return this.reminders.find(
      item =>
        String(item._id) === String(id) &&
        (!patientId || String(item.patientId) === String(patientId))
    ) || null;
  }

  createReminder(data) {
    const reminder = {
      _id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      patientId: String(data.patientId),
      title: data.title,
      category: data.category || 'medicine',
      dosageOrInstruction: data.dosageOrInstruction || '',
      scheduledTime: data.scheduledTime,
      timeOfDay: data.timeOfDay || 'Morning',
      status: 'pending',
      confirmationTime: null,
      confirmationNote: null,
      repeatDaily: data.repeatDaily !== false,
      active: data.active !== false,
      snoozeUntil: null,
      snoozeCount: 0,
      lastActionAt: null,
      createdByRole: data.createdByRole || 'system',
      createdById: data.createdById || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.reminders.push(reminder);
    return reminder;
  }

  updateReminder(id, patientId, updates) {
    const reminder = this.getReminderById(id, patientId);
    if (!reminder) return null;

    Object.assign(reminder, updates);
    reminder.updatedAt = new Date();
    return reminder;
  }

  updateReminderStatus(
    id,
    patientId,
    status,
    note = null,
    snoozeUntil = null
  ) {
    const reminder = this.getReminderById(id, patientId);

    if (!reminder) {
      return null;
    }

    reminder.status = status;
    reminder.confirmationTime =
      status === 'pending' || status === 'snoozed'
        ? null
        : new Date();
    reminder.confirmationNote = note || null;
    reminder.snoozeUntil =
      status === 'snoozed' ? snoozeUntil : null;
    reminder.snoozeCount =
      status === 'snoozed'
        ? Number(reminder.snoozeCount || 0) + 1
        : 0;
    reminder.lastActionAt = new Date();
    reminder.updatedAt = new Date();

    return reminder;
  }

  // =========================================================
  // GAME SESSIONS
  // =========================================================

  getSessions() {

    return this.sessions;
  }

  addSession(session) {

    const record = {

      _id:
        `sess_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      createdAt: new Date(),

      ...session
    };

    this.sessions.push(record);

    return record;
  }
}

module.exports = new MockDataStore();