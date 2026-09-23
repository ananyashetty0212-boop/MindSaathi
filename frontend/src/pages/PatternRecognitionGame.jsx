import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Volume2, Sparkles, Check, Play, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { speech } from '../services/speechService';
import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';

// 4 distinct tactile pads with color + shape + symbol
const PADS = [
  { id: 0, name: 'Tea Leaf', color: '#6E8B74', activeColor: '#8BA891', emoji: '🍃', shape: 'Leaf' },
  { id: 1, name: 'Sunset Amber', color: '#C97A5A', activeColor: '#DE9376', emoji: '🌅', shape: 'Sun' },
  { id: 2, name: 'River Water', color: '#709CB5', activeColor: '#8DB2C7', emoji: '💧', shape: 'Drop' },
  { id: 3, name: 'Kopou Orchid', color: '#8F7EA8', activeColor: '#A99BCB', emoji: '🌺', shape: 'Flower' }
];

export const PatternRecognitionGame = () => {
  const [sequence, setSequence] = useState([]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Web Audio tone generator (gentle harmonic sine frequencies)
  const playGentleTone = (padId) => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freqs = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      osc.type = 'sine';
      osc.frequency.value = freqs[padId] || 320;

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      // Audio context might be restricted before gesture
    }
  };

  const startNewGame = () => {
    setScore(0);
    setMistakes(0);
    setRound(1);
    setGameOver(false);
    setGameStarted(true);

    const firstPad = Math.floor(Math.random() * 4);
    const initialSeq = [firstPad];
    setSequence(initialSeq);
    setUserStep(0);

    speech.speak('Watch the gentle lights and tap the pads in the same order.');
    playSequence(initialSeq);
  };

  const playSequence = (seqToPlay) => {
    setIsPlayingSequence(true);
    let step = 0;

    const interval = setInterval(() => {
      if (step >= seqToPlay.length) {
        clearInterval(interval);
        setActivePad(null);
        setIsPlayingSequence(false);
        setUserStep(0);
        return;
      }

      const currentPadId = seqToPlay[step];
      setActivePad(currentPadId);
      playGentleTone(currentPadId);

      setTimeout(() => {
        setActivePad(null);
      }, 550);

      step++;
    }, 850);
  };

  const repeatSequence = () => {
    if (isPlayingSequence || !gameStarted || gameOver) return;
    speech.speak('Repeating the pattern.');
    playSequence(sequence);
  };

  const handlePadClick = (padId) => {
    if (isPlayingSequence || gameOver || !gameStarted) return;

    setActivePad(padId);
    playGentleTone(padId);

    setTimeout(() => {
      setActivePad(null);
    }, 250);

    if (padId === sequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Finished current round sequence
      if (nextStep === sequence.length) {
        setScore(prev => prev + 1);
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });

        if (round >= 5) {
          handleGameCompletion(round, mistakes, true);
        } else {
          const nextRound = round + 1;
          setRound(nextRound);
          const nextPad = Math.floor(Math.random() * 4);
          const nextSeq = [...sequence, nextPad];
          setSequence(nextSeq);

          setTimeout(() => {
            playSequence(nextSeq);
          }, 1000);
        }
      }
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      speech.speak('That is okay! Let us listen once more.');

      if (newMistakes >= 3) {
        handleGameCompletion(round, newMistakes, false);
      } else {
        setTimeout(() => {
          playSequence(sequence);
        }, 1200);
      }
    }
  };

  const handleGameCompletion = async (roundsDone, totalMistakes, won) => {
    setGameOver(true);
    if (won) {
      confetti({ particleCount: 65, spread: 60 });
      speech.speak('Wonderful concentration! Your pattern activity is completed.');
    }

    const calculatedAccuracy = Math.max(50, Math.min(100, Math.round((roundsDone / (roundsDone + totalMistakes)) * 100)));

    try {
      await api.evaluateCognitiveSession({
        gameType: 'pattern_recognition',
        accuracy: calculatedAccuracy,
        responseTimeMs: 2500,
        mistakes: totalMistakes,
        hintsUsed: 0,
        completionRate: Math.round((roundsDone / 5) * 100),
        currentDifficulty: 'EASY'
      });
    } catch (e) {
      console.warn('Telemetry submission error:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/games"
          className="btn-elderly btn-cream-action"
          style={{ padding: '0.65rem 1.4rem', fontSize: '1.05rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={20} />
          <span>Back to Activities</span>
        </Link>

        {gameStarted && !gameOver && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="control-btn"
              onClick={repeatSequence}
              disabled={isPlayingSequence}
              style={{ fontSize: '1.05rem', padding: '0.65rem 1.25rem' }}
            >
              <RefreshCw size={18} />
              <span>REPEAT PATTERN</span>
            </button>
          </div>
        )}
      </div>

      {/* Game Card */}
      <div className="game-container" style={{ textAlign: 'center' }}>
        <div className="game-header">
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '2rem' }}>🥁</span>
              <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)' }}>
                Brahmaputra Pattern Sequence
              </h1>
            </div>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
              Follow the gentle light and sound rhythm.
            </p>
          </div>

          <div className="game-stats-pill">
            <div className="stat-item">
              <span>Round:</span>
              <strong style={{ color: 'var(--secondary)' }}>{round} / 5</strong>
            </div>

            <div className="stat-item">
              <span>Points:</span>
              <strong>{score}</strong>
            </div>
          </div>
        </div>

        {!gameStarted ? (
          <div style={{ padding: '3.5rem 1.5rem' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'var(--accent-gold-soft)',
              color: '#A06414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.8rem',
              margin: '0 auto 1.5rem auto'
            }}>
              🥁
            </div>

            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-dark)', marginBottom: '0.75rem' }}>
              Ready to Begin?
            </h2>

            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 2.5rem auto' }}>
              The pads will light up with gentle musical bells. When they pause, tap the same pads in order.
            </p>

            <button
              type="button"
              className="btn-elderly btn-primary-garden"
              onClick={startNewGame}
              style={{ padding: '1.1rem 3rem', fontSize: '1.35rem' }}
            >
              <Play size={24} />
              <span>START ACTIVITY</span>
            </button>
          </div>
        ) : (
          <div>
            <p style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: isPlayingSequence ? 'var(--secondary)' : 'var(--primary-dark)',
              margin: '1.75rem 0'
            }}>
              {isPlayingSequence ? '👀 Watch & Listen carefully...' : '👉 Your Turn! Tap the pads in order.'}
            </p>

            {/* 4 Distinct Tactile Pads */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1.75rem',
              maxWidth: '420px',
              margin: '2rem auto'
            }}>
              {PADS.map(pad => {
                const isActive = activePad === pad.id;
                return (
                  <button
                    key={pad.id}
                    type="button"
                    onClick={() => handlePadClick(pad.id)}
                    disabled={isPlayingSequence || gameOver}
                    className="pattern-pad"
                    style={{
                      background: isActive ? pad.activeColor : pad.color,
                      border: isActive ? '4px solid #FFFFFF' : '4px solid transparent',
                      cursor: isPlayingSequence || gameOver ? 'not-allowed' : 'pointer',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)'
                    }}
                    aria-label={`${pad.name} pad`}
                  >
                    <span style={{ fontSize: '3rem' }}>{pad.emoji}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{pad.name}</span>
                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{pad.shape}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Peaceful Friendly Completion Notice */}
        {gameOver && (
          <div style={{
            background: 'linear-gradient(135deg, #FFFDF8 0%, #E4F0E6 100%)',
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
              🌸
            </div>

            <h2 style={{ fontSize: '2.3rem', color: 'var(--primary-dark)', marginBottom: '0.65rem' }}>
              Well done! 🌿
            </h2>

            <p style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              You completed {round} rounds of peaceful pattern recognition.
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
                <span>Play Again</span>
              </button>

              <Link
                to="/games/memory"
                className="btn-elderly btn-terracotta"
                style={{ fontSize: '1.2rem', textDecoration: 'none' }}
              >
                <Sparkles size={22} />
                <span>Try Memory Match</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      <MedicalDisclaimer />
    </div>
  );
};

export default PatternRecognitionGame;
