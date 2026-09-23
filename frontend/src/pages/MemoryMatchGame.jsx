import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Lightbulb, CheckCircle2, Leaf, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { speech } from '../services/speechService';
import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';

// Culturally familiar North-Eastern heritage symbols
const CARD_ITEMS = [
  { id: 'rhino', emoji: '🦏', name: 'One-Horned Rhino' },
  { id: 'tea', emoji: '🍃', name: 'Assam Tea Leaf' },
  { id: 'drum', emoji: '🥁', name: 'Bihu Dhol' },
  { id: 'lotus', emoji: '🪷', name: 'Lotus Flower' },
  { id: 'hornbill', emoji: '🦜', name: 'Great Hornbill' },
  { id: 'mountain', emoji: '🏔️', name: 'Himalayan Peak' }
];

export const MemoryMatchGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const timerRef = useRef(null);

  // Initialize Cards
  const startNewGame = () => {
    const deck = [...CARD_ITEMS, ...CARD_ITEMS].map((item, index) => ({
      uniqueId: `${item.id}_${index}`,
      id: item.id,
      emoji: item.emoji,
      name: item.name
    }));

    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
    setMoves(0);
    setMistakes(0);
    setHintsUsed(0);
    setGameCompleted(false);
    setStartTime(Date.now());
    setElapsedSeconds(0);

    speech.speak('Find the matching pictures. Take your time, there is no hurry.');
  };

  useEffect(() => {
    startNewGame();
    return () => clearInterval(timerRef.current);
  }, []);

  // Timer Tick
  useEffect(() => {
    if (startTime && !gameCompleted) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, gameCompleted]);

  // Card Tap Handler
  const handleCardClick = (index) => {
    if (flippedIndices.length >= 2 || flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.id === secondCard.id) {
        // Matched!
        const newMatched = [...matchedIds, firstCard.id];
        setMatchedIds(newMatched);
        setFlippedIndices([]);
        speech.speak(`Matched! ${firstCard.name}`);

        if (newMatched.length === CARD_ITEMS.length) {
          handleGameCompletion(moves + 1, mistakes);
        }
      } else {
        // Not a match
        setMistakes(prev => prev + 1);
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1100);
      }
    }
  };

  // Friendly Hint
  const handleHint = () => {
    if (matchedIds.length === CARD_ITEMS.length || hintsUsed >= 3) return;

    setHintsUsed(prev => prev + 1);
    const unmatched = cards.find(c => !matchedIds.includes(c.id));
    if (!unmatched) return;

    const matchingIndices = cards
      .map((c, idx) => (c.id === unmatched.id ? idx : null))
      .filter(idx => idx !== null);

    setFlippedIndices(matchingIndices);
    speech.speak(`Here is a gentle hint: ${unmatched.name}`);

    setTimeout(() => {
      setFlippedIndices([]);
    }, 1800);
  };

  // Victory Handler & Backend Telemetry Submission
  const handleGameCompletion = async (totalMoves, totalMistakes) => {
    setGameCompleted(true);
    confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    speech.speak('Well done! You have completed all pairs.');

    const totalPairs = CARD_ITEMS.length;
    const calculatedAccuracy = Math.max(50, Math.min(100, Math.round((totalPairs / Math.max(totalPairs, totalMoves)) * 100)));
    const totalDurationSec = Math.max(5, Math.floor((Date.now() - startTime) / 1000));
    const averageResponseTimeMs = Math.round((totalDurationSec / Math.max(1, totalMoves)) * 1000);

    try {
      await api.evaluateCognitiveSession({
        gameType: 'memory_match',
        accuracy: calculatedAccuracy,
        responseTimeMs: averageResponseTimeMs,
        mistakes: totalMistakes,
        hintsUsed,
        completionRate: 100,
        currentDifficulty: 'EASY'
      });
    } catch (err) {
      console.warn('Telemetry submission error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/games"
          className="btn-elderly btn-cream-action"
          style={{ padding: '0.65rem 1.4rem', fontSize: '1.05rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={20} />
          <span>Back to Activities</span>
        </Link>

        <div style={{ display: 'flex', gap: '0.85rem' }}>
          <button
            type="button"
            className="control-btn"
            onClick={handleHint}
            disabled={hintsUsed >= 3 || gameCompleted}
            style={{ fontSize: '1.05rem', padding: '0.65rem 1.25rem' }}
          >
            <Lightbulb size={20} color="var(--secondary)" />
            <span>Hint ({3 - hintsUsed} left)</span>
          </button>

          <button
            type="button"
            className="control-btn"
            onClick={startNewGame}
            style={{ fontSize: '1.05rem', padding: '0.65rem 1.25rem' }}
          >
            <RotateCcw size={20} />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="game-container">
        <div className="game-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '2rem' }}>🦏</span>
              <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>Kaziranga Memory Match</h1>
            </div>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              Find the matching pictures. Tap any two cards to reveal them.
            </p>
          </div>

          <div className="game-stats-pill">
            <div className="stat-item">
              <span>Pairs:</span>
              <strong style={{ color: 'var(--primary)' }}>{matchedIds.length} / {CARD_ITEMS.length}</strong>
            </div>

            <div className="stat-item">
              <span>Time:</span>
              <strong>{elapsedSeconds}s</strong>
            </div>

            <div className="stat-item">
              <span>Turns:</span>
              <strong>{moves}</strong>
            </div>
          </div>
        </div>

        {/* 12 Tactile Memory Cards */}
        <div className="cards-grid" role="grid" aria-label="Memory Match Cards Grid">
          {cards.map((card, index) => {
            const isFlipped = flippedIndices.includes(index) || matchedIds.includes(card.id);
            const isMatched = matchedIds.includes(card.id);

            return (
              <div
                key={card.uniqueId}
                className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                onClick={() => handleCardClick(index)}
                role="gridcell"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleCardClick(index)}
                aria-label={isFlipped ? card.name : `Card number ${index + 1}`}
              >
                {isFlipped ? (
                  <span>{card.emoji}</span>
                ) : (
                  <span className="memory-card-back-icon">🌿</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Peaceful Friendly Completion Notice */}
        {gameCompleted && (
          <div style={{
            background: 'linear-gradient(135deg, #E4F0E6 0%, #FFFDF8 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            marginTop: '2rem',
            border: '2px solid var(--primary)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.25rem auto'
            }}>
              🌿
            </div>

            <h2 style={{ fontSize: '2.3rem', color: 'var(--primary-dark)', marginBottom: '0.65rem' }}>
              Well done! 🌿
            </h2>

            <p style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              You matched all {CARD_ITEMS.length} pairs in <strong>{elapsedSeconds} seconds</strong>.
            </p>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Your activity has been recorded in your Memory Garden.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-elderly btn-primary-garden"
                onClick={startNewGame}
                style={{ fontSize: '1.2rem' }}
              >
                <RotateCcw size={22} />
                <span>Play Another Round</span>
              </button>

              <Link
                to="/games/pattern"
                className="btn-elderly btn-terracotta"
                style={{ fontSize: '1.2rem', textDecoration: 'none' }}
              >
                <Sparkles size={22} />
                <span>Try Pattern Sequence</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <MedicalDisclaimer />
    </div>
  );
};

export default MemoryMatchGame;
