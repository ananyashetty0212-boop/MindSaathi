import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  PhoneCall, 
  Sparkles, 
  Sun,
  Leaf,
  Heart,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAccessibility } from '../context/AccessibilityContext';
import { speech } from '../services/speechService';
import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';
import MemoryGarden from '../components/garden/MemoryGarden';
import TodayJourney from '../components/garden/TodayJourney';
import ElderActionCard from '../components/garden/ElderActionCard';
import WaterProgress from '../components/garden/WaterProgress';

export const ElderlyDashboard = () => {
  const { patientProfile } = useAccessibility();
  const [greeting, setGreeting] = useState('Good morning');
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [medsTaken, setMedsTaken] = useState(2);
  const [selectedMood, setSelectedMood] = useState(null);
  const [callingCaregiver, setCallingCaregiver] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const fullVoiceBriefing = `${greeting} ${patientProfile.name}. Let us take care of today together. Your garden has received 4 glasses of water and your morning medicine is confirmed. Would you like to play Memory Match now?`;

  const handleAddWater = () => {
    setWaterGlasses(prev => prev + 1);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    speech.speak('Shabash! Added one fresh glass of water to your garden.');
  };

  const handleMoodSelect = (moodName, label) => {
    setSelectedMood(moodName);
    speech.speak(`Thank you for letting us know. You feel ${label} today.`);
  };

  const handleCallCaregiver = () => {
    setCallingCaregiver(true);
    speech.speak(`Ringing your daughter ${patientProfile.caregiverName}. Please relax, she is being informed.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Warm Welcoming Hero Bar */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(255, 253, 248, 0.95) 0%, rgba(228, 240, 230, 0.45) 100%)',
        borderRadius: 'var(--radius-xl)',
        border: '2px solid var(--border)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.75rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '2.4rem' }}>🌿</span>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--primary-dark)' }}>
              {greeting}, {patientProfile.name}!
            </h1>
          </div>

          <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            <em>"Namaskar Koka!"</em> Let's take care of today together. Everything is calm and peaceful.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 1.1rem',
              fontSize: '1.05rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-main)'
            }}>
              <Sun size={20} color="var(--accent-gold)" />
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>

            <button
              type="button"
              className="btn-elderly btn-terracotta"
              onClick={() => speech.speak(fullVoiceBriefing)}
              style={{ padding: '0.65rem 1.4rem', fontSize: '1.1rem' }}
              aria-label="Listen to today's update"
            >
              <Volume2 size={22} />
              <span>Listen to Today's Update</span>
            </button>
          </div>
        </div>

        {/* Daily Feeling Check-in */}
        <div style={{
          background: 'var(--bg-card)',
          padding: '1.4rem 1.6rem',
          borderRadius: 'var(--radius-lg)',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          textAlign: 'center',
          maxWidth: '340px'
        }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            How do you feel right now?
          </h3>
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            {[
              { id: 'Happy', emoji: '😊', label: 'Good' },
              { id: 'Peaceful', emoji: '😌', label: 'Peaceful' },
              { id: 'Sleepy', emoji: '😴', label: 'Sleepy' },
              { id: 'Sore', emoji: '🤕', label: 'Need Help' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleMoodSelect(item.id, item.label)}
                style={{
                  background: selectedMood === item.id ? 'var(--primary-soft)' : 'var(--bg-surface)',
                  border: selectedMood === item.id ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.6rem 0.75rem',
                  fontSize: '1.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'transform 0.15s ease'
                }}
                title={item.label}
              >
                <span>{item.emoji}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Living Memory Garden */}
      <MemoryGarden
        gamesPlayed={gamesPlayed}
        medsTaken={medsTaken}
        waterGlasses={waterGlasses}
        routinesDone={2}
      />

      {/* Today's Journey Visual Timeline */}
      <TodayJourney />

      {/* The 4 Major Elderly Action Cards */}
      <section>
        <h2 style={{ fontSize: '1.9rem', color: 'var(--primary-dark)', marginBottom: '1.25rem' }}>
          What would you like to do? 🌸
        </h2>

        <div className="elder-quad-grid">
          {/* Action 1: Play */}
          <ElderActionCard
            to="/games"
            icon="🧠"
            iconBg="var(--primary-soft)"
            iconColor="var(--primary-dark)"
            borderColor="var(--primary)"
            badgeText="Recommended"
            title="Play"
            subtitle="Kaziranga Memory Match & gentle rhythm sequence games."
            actionText="Start Activity"
          />

          {/* Action 2: Medicines */}
          <ElderActionCard
            to="/reminders"
            icon="💊"
            iconBg="var(--secondary-soft)"
            iconColor="var(--secondary)"
            borderColor="var(--secondary)"
            badgeText="2 Due"
            title="Medicines"
            subtitle="Blood pressure tablet & gentle daytime tonics."
            actionText="Check Medicines"
          />

          {/* Action 3: My Day */}
          <ElderActionCard
            to="/reminders"
            icon="📅"
            iconBg="var(--accent-gold-soft)"
            iconColor="#A06414"
            borderColor="var(--accent-gold)"
            title="My Day"
            subtitle="Herbal tea, garden veranda walk, prayer, and rest."
            actionText="View Routine"
          />

          {/* Action 4: Family */}
          <ElderActionCard
            onClick={handleCallCaregiver}
            icon="👨‍👩‍👧"
            iconBg="var(--accent-lavender-soft)"
            iconColor="#6B599C"
            borderColor="var(--accent-lavender)"
            title="Family"
            subtitle={`Direct call to ${patientProfile.caregiverName} (${patientProfile.caregiverPhone}).`}
            actionText={callingCaregiver ? 'Connecting...' : 'Tap to Ring'}
          />
        </div>
      </section>

      {/* Hydration Widget */}
      <WaterProgress
        glasses={waterGlasses}
        target={8}
        onAddGlass={handleAddWater}
      />

      {/* Calling Family Reassuring Modal */}
      {callingCaregiver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(41, 68, 56, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2.5rem',
            maxWidth: '480px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-hover)',
            border: '2px solid var(--border)'
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'var(--accent-lavender-soft)',
              color: '#6B599C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <PhoneCall size={44} />
            </div>

            <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.65rem' }}>
              Calling {patientProfile.caregiverName}...
            </h2>

            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Please relax. A gentle audio alert has been sent to your daughter's phone.
            </p>

            <button
              type="button"
              className="btn-elderly btn-skip"
              onClick={() => {
                setCallingCaregiver(false);
                speech.cancel();
              }}
              style={{ width: '100%', fontSize: '1.25rem' }}
            >
              <X size={22} />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}

      <MedicalDisclaimer />
    </div>
  );
};

export default ElderlyDashboard;
