/**
 * MindSaathi - Adaptive Cognitive Engine (ACE)
 *
 * This engine adapts activity difficulty using interaction data.
 * It is an assistive engagement feature and is NOT a medical diagnostic tool.
 */

class AdaptiveCognitiveEngine {
  static evaluatePerformance(metrics, recentSessions = []) {
    const {
      gameType = 'memory_match',
      accuracy = 100,
      responseTimeMs = 2500,
      mistakes = 0,
      hintsUsed = 0,
      completionRate = 100,
      currentDifficulty = 'EASY'
    } = metrics;

    const clampedAccuracy = Math.min(100, Math.max(0, Number(accuracy) || 0));
    const safeResponseTime = Math.max(0, Number(responseTimeMs) || 0);
    const safeMistakes = Math.max(0, Number(mistakes) || 0);
    const safeHints = Math.max(0, Number(hintsUsed) || 0);
    const clampedCompletion = Math.min(100, Math.max(0, Number(completionRate) || 0));

    // Accuracy: 45%
    const accuracyScore = clampedAccuracy * 0.45;

    // Response time: 25%
    let speedScore = 25;
    if (safeResponseTime < 800) {
      speedScore = 18;
    } else if (safeResponseTime <= 3500) {
      speedScore = 25;
    } else if (safeResponseTime <= 7000) {
      const penalty = ((safeResponseTime - 3500) / 3500) * 10;
      speedScore = Math.max(12, 25 - penalty);
    } else {
      const penalty = 13 + Math.min(10, ((safeResponseTime - 7000) / 5000) * 8);
      speedScore = Math.max(5, 25 - penalty);
    }

    // Mistakes: 15%
    const mistakePenalty = Math.min(15, safeMistakes * 1.5);
    const mistakeScore = Math.max(0, 15 - mistakePenalty);

    // Hints/assistance: 10%
    const hintPenalty = Math.min(10, safeHints * 2.5);
    const autonomyScore = Math.max(0, 10 - hintPenalty);

    // Completion: 5%
    const completionScore = (clampedCompletion / 100) * 5;

    const performanceScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(
          accuracyScore + speedScore + mistakeScore + autonomyScore + completionScore
        )
      )
    );

    // Compare against the user's recent interaction baseline.
    const validSessions = Array.isArray(recentSessions)
      ? recentSessions.filter((session) => Number.isFinite(Number(session.performanceScore)))
      : [];

    const matchingTypeSessions = validSessions.filter(
      (session) => session.gameType === gameType
    );

    const baselinePool = matchingTypeSessions.length >= 2
      ? matchingTypeSessions.slice(0, 10)
      : validSessions.slice(0, 10);

    let baselineAverage = performanceScore;
    let unusualChangeDetected = false;
    let unusualChangeDetails = null;

    if (baselinePool.length >= 2) {
      baselineAverage = Math.round(
        baselinePool.reduce(
          (total, session) => total + Number(session.performanceScore || 0),
          0
        ) / baselinePool.length
      );

      const scoreDrop = baselineAverage - performanceScore;

      if (scoreDrop >= 25) {
        unusualChangeDetected = true;
        unusualChangeDetails = `Recent activity score is ${scoreDrop} points below the user's recent baseline (${baselineAverage}).`;
      } else if (safeResponseTime > 9000) {
        unusualChangeDetected = true;
        unusualChangeDetails = `Recent response time is unusually high (${Math.round(safeResponseTime / 1000)} seconds).`;
      } else if (clampedCompletion < 60) {
        unusualChangeDetected = true;
        unusualChangeDetails = 'The activity was completed only partially compared with recent sessions.';
      }
    }

    let recommendedDifficulty = currentDifficulty || 'EASY';

    if (performanceScore >= 85 && clampedAccuracy >= 80) {
      if (recommendedDifficulty === 'EASY') {
        recommendedDifficulty = 'MODERATE';
      } else {
        recommendedDifficulty = 'CHALLENGING';
      }
    } else if (performanceScore < 50 || safeMistakes > 8) {
      if (recommendedDifficulty === 'CHALLENGING') {
        recommendedDifficulty = 'MODERATE';
      } else {
        recommendedDifficulty = 'EASY';
      }
    }

    let nextActivityRecommendation = 'Memory Match';
    let activityRationale = 'Continue with a familiar memory activity at a comfortable pace.';

    if (unusualChangeDetected) {
      nextActivityRecommendation = 'Take a short break, then choose a gentle activity';
      activityRationale = 'A lighter pace may be more comfortable before another cognitive activity.';
    } else if (gameType === 'memory_match') {
      nextActivityRecommendation = 'Pattern Recognition';
      activityRationale = 'Switch to a sequential attention activity after a memory task.';
    } else if (gameType === 'pattern_recognition') {
      nextActivityRecommendation = 'Memory Match';
      activityRationale = 'Return to visual recall after a pattern-based activity.';
    } else if (gameType === 'attention_game') {
      nextActivityRecommendation = 'Memory Match';
      activityRationale = 'Alternate attention work with a familiar recall activity.';
    } else if (gameType === 'daily_routine_recall') {
      nextActivityRecommendation = 'Pattern Recognition';
      activityRationale = 'Continue with a short attention-focused activity.';
    }

    return {
      performanceScore,
      breakdown: {
        accuracyScore: Math.round(accuracyScore * 10) / 10,
        speedScore: Math.round(speedScore * 10) / 10,
        mistakeScore: Math.round(mistakeScore * 10) / 10,
        autonomyScore: Math.round(autonomyScore * 10) / 10,
        completionScore: Math.round(completionScore * 10) / 10
      },
      currentDifficulty,
      recommendedDifficulty,
      nextActivityRecommendation,
      activityRationale,
      unusualChangeDetected,
      unusualChangeDetails,
      baselineAverage,
      timestamp: new Date().toISOString(),
      clinicalDisclaimer:
        'MindSaathi metrics represent assistive cognitive interaction data only and are not intended for medical diagnosis or clinical classification.'
    };
  }
}

module.exports = AdaptiveCognitiveEngine;
