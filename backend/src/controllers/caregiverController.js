const GameSession = require('../models/GameSession');
const Reminder = require('../models/Reminder');
const ElderlyProfile = require('../models/ElderlyProfile');
const Caregiver = require('../models/Caregiver');
const mockStore = require('../services/mockDataStore');
const { getDBStatus } = require('../config/db');
const { getAuthorizedPatientId } = require('../services/accessService');

exports.getOverview = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.query.patientId);
    if (!patientId) return res.status(404).json({ success: false, error: 'No elderly profile is linked to this caregiver.' });
    const dbStatus = getDBStatus();
    let reminders = [], sessions = [], patient = null, caregiver = null;

    if (dbStatus.connected) {
      try {
        reminders = await Reminder.find({ patientId }).lean();
        sessions = await GameSession.find({ patientId }).sort({ createdAt: -1 }).limit(20).lean();
        patient = await ElderlyProfile.findById(patientId).lean();
        caregiver = await Caregiver.findById(req.user.id).lean();
      } catch (err) {
        reminders = mockStore.getReminders().filter(r => String(r.patientId) === String(patientId));
        sessions = mockStore.getSessions().filter(s => String(s.patientId) === String(patientId));
        patient = mockStore.findElderById(patientId);
        caregiver = mockStore.findCaregiverById(req.user.id);
      }
    } else {
      reminders = mockStore.getReminders().filter(r => String(r.patientId) === String(patientId));
      sessions = mockStore.getSessions().filter(s => String(s.patientId) === String(patientId));
      patient = mockStore.findElderById(patientId);
      caregiver = mockStore.findCaregiverById(req.user.id);
    }

    const medicineReminders = reminders.filter(r => r.category === 'medicine');
    const totalMedicines = medicineReminders.length;
    const confirmedTaken = medicineReminders.filter(r => r.status === 'taken').length;
    const skippedMedicines = medicineReminders.filter(r => r.status === 'skipped').length;
    const pendingMedicines = medicineReminders.filter(r => ['pending', 'snoozed'].includes(r.status)).length;
    const adherenceRate = totalMedicines ? Math.round((confirmedTaken / totalMedicines) * 100) : 0;

    const totalGamesPlayed = sessions.length;
    const averageScore = totalGamesPlayed ? Math.round(sessions.reduce((a, s) => a + (s.performanceScore || 0), 0) / totalGamesPlayed) : 0;
    const averageAccuracy = totalGamesPlayed ? Math.round(sessions.reduce((a, s) => a + (s.accuracy || 0), 0) / totalGamesPlayed) : 0;
    const averageLatencyMs = totalGamesPlayed ? Math.round(sessions.reduce((a, s) => a + (s.responseTimeMs || 0), 0) / totalGamesPlayed) : 0;

    const alerts = [];
    if (skippedMedicines > 0) alerts.push({ id: 'alert_med_skip', severity: 'warning', title: 'Medication marked skipped', message: `${skippedMedicines} medicine reminder was marked as skipped. Consider checking in with the elderly user.`, timestamp: new Date().toISOString() });
    const latestSession = sessions[0];
    if (latestSession?.unusualChangeDetected) alerts.push({ id: 'alert_cog_change', severity: 'info', title: 'Cognitive Engine observation', message: latestSession.unusualChangeDetails || 'A recent task-performance change was observed.', timestamp: latestSession.createdAt || new Date().toISOString() });

    const chartTrend = sessions.slice(0, 7).reverse().map((s, i) => ({ day: new Date(s.createdAt || Date.now()).toLocaleDateString(undefined, { weekday: 'short' }), score: s.performanceScore || 0, accuracy: s.accuracy || 0, latency: Math.round((s.responseTimeMs || 0) / 100) / 10 })).filter((v, i, a) => a.findIndex(x => x.day === v.day) === i);
    if (!chartTrend.length) chartTrend.push({ day: 'Today', score: 0, accuracy: 0, latency: 0 });

    return res.json({
      success: true,
      patient: patient ? {
        id: String(patient._id || patient.id), name: patient.name, age: patient.age,
        location: patient.region, primaryCaregiver: caregiver?.fullName || 'Caregiver',
        preferredLanguage: patient.preferredLanguage, currentDifficultyLevel: latestSession?.recommendedDifficulty || 'EASY'
      } : null,
      cognitiveEngagement: {
        averageScore, averageAccuracy, averageLatencySec: totalGamesPlayed ? (averageLatencyMs / 1000).toFixed(1) : '0.0',
        totalGamesPlayed, recommendedNextActivity: latestSession?.nextActivityRecommendation || 'Start with Memory Match', chartTrend
      },
      medicationConfirmation: { totalMedicines, confirmedTaken, skippedMedicines, pendingMedicines, adherenceRate, disclaimer: 'Reflects self-reported confirmation by the elderly user or assisting family member.' },
      alerts,
      recentSessions: sessions.slice(0, 5),
      dbStatus
    });
  } catch (error) {
    console.error('Caregiver overview error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch caregiver overview: ' + error.message });
  }
};
