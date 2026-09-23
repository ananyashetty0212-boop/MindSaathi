/**
 * MindSaathi - Adaptive Cognitive Engine (ACE)
 * 
 * SIH26003: AI-Based Cognitive Gaming and Memory Assistance Platform
 * for Elderly Dementia Patients in the North Eastern Region (NER).
 * 
 * IMPORTANT DISCLAIMER:
 * This algorithm is strictly an assistive engagement tuning and difficulty adaptation tool.
 * It DOES NOT provide medical diagnosis, clinical staging, or pathology assessment for dementia,
 * Alzheimer's, or any other neurodegenerative disease.
 */

class AdaptiveCognitiveEngine {
  /**
   * Evaluate a completed cognitive game session and provide adaptive recommendations.
   * 
   * @param {Object} metrics
   * @param {string} metrics.gameType - 'memory_match' | 'pattern_recognition' | etc.
   * @param {number} metrics.accuracy - 0 to 100 percentage
   * @param {number} metrics.responseTimeMs - Average response time in milliseconds
   * @param {number} metrics.mistakes - Number of incorrect attempts
   * @param {number} metrics.hintsUsed - Number of hints requested
   * @param {number} metrics.completionRate - 0 to 100 percentage of puzzle completed
   * @param {string} metrics.currentDifficulty - 'EASY' | 'MODERATE' | 'CHALLENGING'
   * @param {Array<Object>} [recentSessions=[]] - Historical session records for baseline comparison
   * 
   * @returns {Object} Evaluation report containing performance score, difficulty recommendation,
   *                   and engagement observations.
   */
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

    // 1. Accuracy Component (Weight: 45%)
    // Bound strictly between 0 and 100
    const clampedAccuracy = Math.min(100, Math.max(0, Number(accuracy) || 0));
    const accuracyScore = clampedAccuracy * 0.45;

    // 2. Response Speed Component (Weight: 25%)
    // Normalized response curve for elderly ergonomics:
    // Ideal elderly response range: 1,500ms to 4,000ms.
    // Overly fast (<800ms) might indicate hasty random clicking.
    // Extremely slow (>12,000ms) indicates fatigue or struggle.
    let speedScore = 25;
    if (responseTimeMs < 800) {
      speedScore = 18; // slight penalty for hasty random tapping
    } else if (responseTimeMs <= 3500) {
      speedScore = 25; // optimal pacing
    } else if (responseTimeMs <= 7000) {
      const penalty = ((responseTimeMs - 3500) / 3500) * 10;
      speedScore = Math.max(12, 25 - penalty);
    } else {
      const penalty = 13 + Math.min(10, ((responseTimeMs - 7000) / 5000) * 8);
      speedScore = Math.max(5, 25 - penalty);
    }

    // 3. Mistake & Error Factor (Weight: 15%)
    // Gentle mistake scaling so elderly users are not discouraged by trial and error
    const mistakePenalty = Math.min(15, (mistakes * 1.5));
    const mistakeScore = Math.max(0, 15 - mistakePenalty);

    // 4. Assistance & Autonomy Factor (Weight: 10%)
    // Hints used are positive for engagement, but reflect greater assistance needed
    const hintPenalty = Math.min(10, hintsUsed * 2.5);
    const autonomyScore = Math.max(0, 10 - hintPenalty);

    // 5. Completion Factor (Weight: 5%)
    const clampedCompletion = Math.min(100, Math.max(0, Number(completionRate) || 100));
    const completionScore = (clampedCompletion / 100) * 5;

    // Raw calculated score (0 - 100)
    const rawScore = Math.round(
      accuracyScore + speedScore + mistakeScore + autonomyScore + completionScore
    );
    const performanceScore = Math.min(100, Math.max(10, rawScore));

    // Baseline calculation from recent sessions (if available)
    let baselineAverage = performanceScore;
    let unusualChangeDetected = false;
    let unusualChangeDetails = null;

    if (Array.isArray(recentSessions) && recentSessions.length >= 2) {
      const matchingTypeSessions = recentSessions.filter(s => s.gameType === gameType);
      const targetPool = matchingTypeSessions.length >= 2 ? matchingTypeSessions : recentSessions;
      
      const totalScore = targetPool.reduce((acc, s) => acc + (s.performanceScore || 70), 0);
      baselineAverage = Math.round(totalScore / targetPool.length);

      // Detect meaningful deviation (> 25 points drop or sharp latency increase)
      const scoreDrop = baselineAverage - performanceScore;
      if (scoreDrop >= 25) {
        unusualChangeDetected = true;
        unusualChangeDetails = `Performance score dropped by ${scoreDrop} points compared to patient baseline (${baselineAverage}). Patient might be tired or distracted.`;
      } else if (responseTimeMs > 9000) {
        unusualChangeDetected = true;
        unusualChangeDetails = `Response latency is significantly elevated (${Math.round(responseTimeMs / 1000)}s). Consider a calming rest or hydration reminder.`;
      }
    }

    // Recommended Difficulty determination
    let recommendedDifficulty = currentDifficulty;
    if (performanceScore >= 85 && clampedAccuracy >= 80) {
      if (currentDifficulty === 'EASY') recommendedDifficulty = 'MODERATE';
      else if (currentDifficulty === 'MODERATE') recommendedDifficulty = 'CHALLENGING';
      else recommendedDifficulty = 'CHALLENGING';
    } else if (performanceScore < 50 || mistakes > 8) {
      if (currentDifficulty === 'CHALLENGING') recommendedDifficulty = 'MODERATE';
      else recommendedDifficulty = 'EASY';
    }

    // Contextual Next Activity Recommendation
    let nextActivityRecommendation = 'Memory Match (Gentle North-East Flora & Fauna)';
    let activityRationale = 'Maintain consistent gentle visual-spatial stimulation.';

    if (unusualChangeDetected) {
      nextActivityRecommendation = 'Hydration & Calming Voice Breathing Exercise';
      activityRationale = 'A gentle break is recommended before resuming cognitive games.';
    } else if (gameType === 'memory_match') {
      nextActivityRecommendation = 'Pattern Recognition (Musical Rhythm of Assam)';
      activityRationale = 'Switch from visual paired association to sequential sensory pattern processing.';
    } else if (gameType === 'pattern_recognition') {
      nextActivityRecommendation = 'Daily Routine Recall (Family and Familiar Places)';
      activityRationale = 'Reinforce autobiographical and prospective episodic memory.';
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
      clinicalDisclaimer: 'MindSaathi metrics represent assistive cognitive interaction data only and are not intended for medical diagnosis or clinical classification.'
    };
  }
}

module.exports = AdaptiveCognitiveEngine;
