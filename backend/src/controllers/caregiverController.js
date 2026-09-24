const GameSession = require('../models/GameSession');
const Reminder = require('../models/Reminder');
const ElderlyProfile = require('../models/ElderlyProfile');
const Caregiver = require('../models/Caregiver');
const mockStore = require('../services/mockDataStore');
const { getDBStatus } = require('../config/db');
const { getAuthorizedPatientId } = require('../services/accessService');

function toDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function isToday(value) {
  const date = toDate(value);
  if (!date) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function sortNewest(items) {
  return [...items].sort((a, b) => {
    const aTime = toDate(a.createdAt || a.updatedAt || a.confirmationTime)?.getTime() || 0;
    const bTime = toDate(b.createdAt || b.updatedAt || b.confirmationTime)?.getTime() || 0;
    return bTime - aTime;
  });
}

exports.getOverview = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.query.patientId);

    if (!patientId) {
      return res.status(404).json({
        success: false,
        error: 'No elderly profile is linked to this caregiver.'
      });
    }

    const dbStatus = getDBStatus();
    let reminders = [];
    let sessions = [];
    let patient = null;
    let caregiver = null;

    if (dbStatus.connected) {
      try {
        reminders = await Reminder.find({ patientId }).lean();
        sessions = await GameSession.find({ patientId })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        patient = await ElderlyProfile.findById(patientId).lean();
        caregiver = await Caregiver.findById(req.user.id).lean();
      } catch (err) {
        console.warn('Caregiver overview DB query failed, using fallback:', err.message);
        reminders = mockStore.getReminders().filter((r) => String(r.patientId) === String(patientId));
        sessions = mockStore.getSessions().filter((s) => String(s.patientId) === String(patientId));
        patient = mockStore.findElderById(patientId);
        caregiver = mockStore.findCaregiverById(req.user.id);
      }
    } else {
      reminders = mockStore.getReminders().filter((r) => String(r.patientId) === String(patientId));
      sessions = mockStore.getSessions().filter((s) => String(s.patientId) === String(patientId));
      patient = mockStore.findElderById(patientId);
      caregiver = mockStore.findCaregiverById(req.user.id);
    }

    sessions = sortNewest(sessions);
    reminders = sortNewest(reminders);

    const medicineReminders = reminders.filter((r) => r.category === 'medicine');
    const confirmedTaken = medicineReminders.filter((r) => r.status === 'taken').length;
    const skippedMedicines = medicineReminders.filter((r) => r.status === 'skipped').length;
    const pendingMedicines = medicineReminders.filter((r) => ['pending', 'snoozed'].includes(r.status)).length;
    const totalMedicines = medicineReminders.length;
    const adherenceRate = totalMedicines
      ? Math.round((confirmedTaken / totalMedicines) * 100)
      : 0;

    const todaySessions = sessions.filter((s) => isToday(s.createdAt || s.updatedAt));
    const todayConfirmedMedicines = medicineReminders.filter(
      (r) => r.status === 'taken' && isToday(r.confirmationTime || r.updatedAt)
    );
    const todaySkippedMedicines = medicineReminders.filter(
      (r) => r.status === 'skipped' && isToday(r.confirmationTime || r.updatedAt)
    );

    const averageScore = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + Number(s.performanceScore || 0), 0) / sessions.length)
      : 0;

    const averageAccuracy = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + Number(s.accuracy || 0), 0) / sessions.length)
      : 0;

    const averageLatencyMs = sessions.length
      ? Math.round(sessions.reduce((sum, s) => sum + Number(s.responseTimeMs || 0), 0) / sessions.length)
      : 0;

    const todayAverageScore = todaySessions.length
      ? Math.round(todaySessions.reduce((sum, s) => sum + Number(s.performanceScore || 0), 0) / todaySessions.length)
      : 0;

    const todayAverageAccuracy = todaySessions.length
      ? Math.round(todaySessions.reduce((sum, s) => sum + Number(s.accuracy || 0), 0) / todaySessions.length)
      : 0;

    const latestSession = sessions[0] || null;

    const alerts = [];

    if (pendingMedicines > 0) {
      alerts.push({
        id: 'alert_med_pending',
        severity: 'warning',
        title: 'Medication confirmation pending',
        message: `${pendingMedicines} medicine reminder${pendingMedicines === 1 ? '' : 's'} still needs confirmation.`,
        timestamp: new Date().toISOString()
      });
    }

    if (skippedMedicines > 0) {
      alerts.push({
        id: 'alert_med_skip',
        severity: 'warning',
        title: 'Medication marked skipped',
        message: `${skippedMedicines} medicine reminder${skippedMedicines === 1 ? '' : 's'} was marked skipped.`,
        timestamp: new Date().toISOString()
      });
    }

    if (latestSession?.unusualChangeDetected) {
      alerts.push({
        id: 'alert_cog_change',
        severity: 'info',
        title: 'Unusual change in recent activity',
        message:
          latestSession.unusualChangeDetails ||
          'A notable change in recent task performance was observed.',
        timestamp: latestSession.createdAt || new Date().toISOString()
      });
    }

    if (!todaySessions.length) {
      alerts.push({
        id: 'alert_no_activity',
        severity: 'info',
        title: 'No cognitive activity recorded today',
        message: 'No completed cognitive activity has been recorded today.',
        timestamp: new Date().toISOString()
      });
    }

    const chartTrend = sessions
      .slice(0, 10)
      .reverse()
      .map((session) => ({
        date: new Date(session.createdAt || Date.now()).toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short'
        }),
        score: Number(session.performanceScore || 0),
        accuracy: Number(session.accuracy || 0),
        responseTimeSec: Number(((session.responseTimeMs || 0) / 1000).toFixed(1))
      }));

    const timeline = [];

    sessions.slice(0, 15).forEach((session) => {
      timeline.push({
        id: `game_${session._id}`,
        type: 'game',
        icon: 'brain',
        title:
          session.gameType === 'memory_match'
            ? 'Memory Match'
            : session.gameType === 'pattern_recognition'
              ? 'Pattern Recognition'
              : session.gameType === 'attention_game'
                ? 'Attention Activity'
                : 'Routine Recall',
        status: 'completed',
        details: `${session.accuracy || 0}% accuracy · ${session.performanceScore || 0}/100 score`,
        timestamp: session.createdAt || session.updatedAt
      });
    });

    reminders.forEach((reminder) => {
      if (!reminder.confirmationTime && !reminder.updatedAt) return;
      if (!isToday(reminder.confirmationTime || reminder.updatedAt)) return;

      timeline.push({
        id: `reminder_${reminder._id}`,
        type: reminder.category === 'medicine' ? 'medicine' : 'routine',
        icon: reminder.category === 'medicine' ? 'pill' : 'calendar',
        title: reminder.title,
        status: reminder.status,
        details:
          reminder.status === 'taken'
            ? 'Confirmed by user'
            : reminder.status === 'skipped'
              ? 'Marked skipped'
              : reminder.status === 'snoozed'
                ? 'Reminder postponed'
                : 'Status updated',
        timestamp: reminder.confirmationTime || reminder.updatedAt
      });
    });

    timeline.sort((a, b) => {
      const aTime = toDate(a.timestamp)?.getTime() || 0;
      const bTime = toDate(b.timestamp)?.getTime() || 0;
      return bTime - aTime;
    });

    return res.json({
      success: true,
      patient: patient
        ? {
            id: String(patient._id || patient.id),
            name: patient.name,
            age: patient.age,
            location: patient.region || '',
            primaryCaregiver: caregiver?.fullName || 'Caregiver',
            preferredLanguage: patient.preferredLanguage,
            currentDifficultyLevel: latestSession?.recommendedDifficulty || 'EASY'
          }
        : null,
      today: {
        cognitiveActivitiesCompleted: todaySessions.length,
        averageScore: todayAverageScore,
        averageAccuracy: todayAverageAccuracy,
        medicinesConfirmed: todayConfirmedMedicines.length,
        medicinesSkipped: todaySkippedMedicines.length,
        medicinesPending: Math.max(0, totalMedicines - todayConfirmedMedicines.length - todaySkippedMedicines.length),
        attentionNeeded: alerts.length
      },
      cognitiveEngagement: {
        averageScore,
        averageAccuracy,
        averageLatencySec: sessions.length ? (averageLatencyMs / 1000).toFixed(1) : '0.0',
        totalGamesPlayed: sessions.length,
        recommendedNextActivity:
          latestSession?.nextActivityRecommendation || 'Start with Memory Match',
        recommendedDifficulty:
          latestSession?.recommendedDifficulty || 'EASY',
        recommendationReason:
          latestSession?.unusualChangeDetails ||
          latestSession?.activityRationale ||
          'Begin with a comfortable cognitive activity.',
        chartTrend
      },
      medicationConfirmation: {
        totalMedicines,
        confirmedTaken,
        skippedMedicines,
        pendingMedicines,
        adherenceRate,
        disclaimer:
          'Reflects self-reported confirmation by the elderly user or assisting family member.'
      },
      alerts,
      timeline: timeline.slice(0, 20),
      recentSessions: sessions.slice(0, 10),
      dbStatus
    });
  } catch (error) {
    console.error('Caregiver overview error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch caregiver overview: ' + error.message
    });
  }
};
