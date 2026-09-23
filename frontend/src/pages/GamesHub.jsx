import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';

export const GamesHub = () => {
  const speechText = "Choose an activity. Take a few minutes to exercise your memory and attention. Memory match helps you find pairs. Pattern recognition lets you follow gentle musical lights.";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '2.2rem' }}>🧠</span>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--primary-dark)' }}>
              Choose an Activity
            </h1>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Take a few minutes to exercise your memory and attention at your own peaceful pace.
          </p>
        </div>

        <AudioSpeakButton text={speechText} label="Listen to Instructions" />
      </div>

      {/* Large Calm Activity Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Activity 1: Memory Match */}
        <div className="elder-action-box" style={{
          borderLeft: '8px solid var(--primary)',
          padding: '2.5rem 2rem',
          minHeight: '320px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div className="elder-action-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)', fontSize: '2.8rem' }}>
                🦏
              </div>

              <span style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary-dark)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}>
                Recommended Today
              </span>
            </div>

            <h2 className="elder-action-title" style={{ fontSize: '2.1rem' }}>
              Kaziranga Memory Match
            </h2>

            <p className="elder-action-sub" style={{ fontSize: '1.25rem', margin: '0.85rem 0 1.75rem 0' }}>
              Remember the pictures and find the matching pair of tea leaves and gentle rhinos.
            </p>
          </div>

          <Link
            to="/games/memory"
            className="btn-elderly btn-primary-garden"
            style={{ width: '100%', fontSize: '1.25rem' }}
          >
            <span>START MEMORY MATCH</span>
            <ArrowRight size={22} />
          </Link>
        </div>

        {/* Activity 2: Pattern Recognition */}
        <div className="elder-action-box" style={{
          borderLeft: '8px solid var(--secondary)',
          padding: '2.5rem 2rem',
          minHeight: '320px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div className="elder-action-icon" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)', fontSize: '2.8rem' }}>
                🥁
              </div>

              <span style={{
                background: 'var(--secondary-soft)',
                color: 'var(--secondary)',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '0.95rem'
              }}>
                Rhythm & Focus
              </span>
            </div>

            <h2 className="elder-action-title" style={{ fontSize: '2.1rem' }}>
              Brahmaputra Pattern Sequence
            </h2>

            <p className="elder-action-sub" style={{ fontSize: '1.25rem', margin: '0.85rem 0 1.75rem 0' }}>
              Watch the gentle light sequence and tap the pads in order with calming river sounds.
            </p>
          </div>

          <Link
            to="/games/pattern"
            className="btn-elderly btn-terracotta"
            style={{ width: '100%', fontSize: '1.25rem' }}
          >
            <span>START PATTERN GAME</span>
            <ArrowRight size={22} />
          </Link>
        </div>
      </div>

      {/* Adaptive Cognitive Guidance Note */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
          <Sparkles size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-dark)' }}>
            Calm, Adaptive Pacing
          </h3>
        </div>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Today's activities are adjusted based on your recent comfort. There are no sudden timers or countdowns. Take all the time you need, pause whenever you like, or ask for a friendly hint.
        </p>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};

export default GamesHub;
