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

  updateReminderStatus(
    id,
    status,
    note = null
  ) {

    const reminder =
      this.reminders.find(
        item =>
          String(item._id) === String(id)
      );

    if (!reminder) {
      return null;
    }

    reminder.status = status;

    reminder.confirmationTime =
      status === 'pending'
        ? null
        : new Date();

    reminder.confirmationNote =
      note || null;

    reminder.updatedAt =
      new Date();

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