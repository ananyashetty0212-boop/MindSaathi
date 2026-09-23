const AdaptiveCognitiveEngine = require('../services/adaptiveEngine');
const GameSession = require('../models/GameSession');
const mockStore = require('../services/mockDataStore');
const { getDBStatus } = require('../config/db');
const { getAuthorizedPatientId } = require('../services/accessService');

exports.evaluateSession = async (req, res) => {
  try {
    const { gameType, accuracy, responseTimeMs, mistakes, hintsUsed, completionRate, currentDifficulty } = req.body;
    if (!gameType || accuracy === undefined || responseTimeMs === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required game performance metrics (gameType, accuracy, responseTimeMs)' });
    }

    const patientId = await getAuthorizedPatientId(req, req.body.patientId);
    if (!patientId) return res.status(403).json({ success: false, error: 'No linked elderly profile is available for this account.' });

    let recentSessions = [];
    const dbStatus = getDBStatus();
    if (dbStatus.connected) {
      try {
        recentSessions = await GameSession.find({ patientId }).sort({ createdAt: -1 }).limit(10).lean();
      } catch (err) {
        console.warn('DB query error, using fallback:', err.message);
        recentSessions = mockStore.getSessions().filter(s => String(s.patientId) === String(patientId));
      }
    } else {
      recentSessions = mockStore.getSessions().filter(s => String(s.patientId) === String(patientId));
    }

    const evaluation = AdaptiveCognitiveEngine.evaluatePerformance(
      { gameType, accuracy, responseTimeMs, mistakes, hintsUsed, completionRate, currentDifficulty },
      recentSessions
    );

    const sessionData = {
      patientId, gameType, difficulty: currentDifficulty || 'EASY', accuracy, responseTimeMs,
      mistakes: mistakes || 0, hintsUsed: hintsUsed || 0, completionRate: completionRate || 100,
      performanceScore: evaluation.performanceScore, recommendedDifficulty: evaluation.recommendedDifficulty,
      nextActivityRecommendation: evaluation.nextActivityRecommendation,
      unusualChangeDetected: evaluation.unusualChangeDetected, unusualChangeDetails: evaluation.unusualChangeDetails
    };

    let savedRecord = null;
    if (dbStatus.connected) {
      try { savedRecord = await GameSession.create(sessionData); }
      catch (err) { savedRecord = mockStore.addSession(sessionData); }
    } else savedRecord = mockStore.addSession(sessionData);

    return res.status(201).json({ success: true, evaluation, sessionRecord: savedRecord });
  } catch (error) {
    console.error('Error in evaluateSession:', error);
    return res.status(500).json({ success: false, error: 'Failed to process cognitive evaluation: ' + error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const patientId = await getAuthorizedPatientId(req, req.query.patientId);
    if (!patientId) return res.status(403).json({ success: false, error: 'No linked elderly profile is available for this account.' });
    const dbStatus = getDBStatus();
    let history = [];
    if (dbStatus.connected) {
      try { history = await GameSession.find({ patientId }).sort({ createdAt: -1 }).limit(20); }
      catch (_) { history = mockStore.getSessions().filter(s => String(s.patientId) === String(patientId)); }
    } else history = mockStore.getSessions().filter(s => String(s.patientId) === String(patientId));
    return res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve cognitive session history: ' + error.message });
  }
};
