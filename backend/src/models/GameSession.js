const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true
    },

    gameType: {
      type: String,
      required: true,
      enum: [
        'memory_match',
        'pattern_recognition',
        'attention_game',
        'daily_routine_recall'
      ]
    },

    difficulty: {
      type: String,
      enum: [
        'EASY',
        'MODERATE',
        'CHALLENGING'
      ],
      default: 'EASY'
    },

    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    responseTimeMs: {
      type: Number,
      required: true,
      min: 0
    },

    mistakes: {
      type: Number,
      default: 0,
      min: 0
    },

    hintsUsed: {
      type: Number,
      default: 0,
      min: 0
    },

    completionRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    performanceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    recommendedDifficulty: {
      type: String,
      enum: [
        'EASY',
        'MODERATE',
        'CHALLENGING'
      ],
      default: 'EASY'
    },

    nextActivityRecommendation: {
      type: String,
      default: 'Memory Match'
    },

    unusualChangeDetected: {
      type: Boolean,
      default: false
    },

    unusualChangeDetails: {
      type: String,
      default: null
    },

    metadata: {
      platform: {
        type: String,
        default: 'MindSaathi Web'
      },

      engineVersion: {
        type: String,
        default: '1.0.0'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.GameSession ||
  mongoose.model(
    'GameSession',
    GameSessionSchema
  );