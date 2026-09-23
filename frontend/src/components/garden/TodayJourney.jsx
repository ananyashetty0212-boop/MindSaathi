import React from 'react';
import { Sun, Brain, Utensils, Moon, CheckCircle2, Clock } from 'lucide-react';

export const TodayJourney = ({ compact = false }) => {
  const steps = [
    {
      id: 'morning',
      timeLabel: 'Morning 🌅',
      icon: <Sun size={22} color="#D98836" />,
      tag: 'Completed',
      statusClass: 'completed',
      tasks: ['💊 Morning Blood Pressure Tab', '💧 Warm Water & Herbal Tea']
    },
    {
      id: 'midday',
      timeLabel: 'Midday 🧠',
      icon: <Brain size={22} color="#6E8B74" />,
      tag: 'Current Focus',
      statusClass: 'active',
      tasks: ['🧩 Kaziranga Memory Match', '💧 Hydration Check']
    },
    {
      id: 'afternoon',
      timeLabel: 'Afternoon 🍽️',
      icon: <Utensils size={22} color="#C97A5A" />,
      tag: 'Upcoming',
      statusClass: 'pending',
      tasks: ['🍎 Nutritious Lunch', '🌿 Veranda Garden Walk']
    },
    {
      id: 'evening',
      timeLabel: 'Evening 🌙',
      icon: <Moon size={22} color="#A99BCB" />,
      tag: 'Upcoming',
      statusClass: 'pending',
      tasks: ['👨‍👩‍👧 Talk with Family', '💤 Night Rest Tonic']
    }
  ];

  return (
    <section className="journey-container" aria-label="Today's Gentle Journey">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.45rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
            Today's Journey 🌿
          </h3>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>
            One calm step at a time. No rushing, just a peaceful routine.
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          padding: '0.45rem 1rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.92rem',
          fontWeight: 700,
          border: '1.5px solid var(--border)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--primary-dark)'
        }}>
          <Clock size={16} color="var(--primary)" />
          <span>Currently Midday</span>
        </div>
      </div>

      <div className="journey-timeline">
        {steps.map((step) => (
          <div key={step.id} className={`journey-step ${step.statusClass}`}>
            <div className="journey-step-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{step.icon}</span>
                <span className="journey-step-time">{step.timeLabel}</span>
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: step.statusClass === 'completed' ? 'var(--primary-soft)' : step.statusClass === 'active' ? 'var(--accent-gold-soft)' : 'var(--bg-subtle)',
                color: step.statusClass === 'completed' ? 'var(--primary-dark)' : step.statusClass === 'active' ? '#8C5611' : 'var(--text-muted)'
              }}>
                {step.tag}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
              {step.tasks.map((task, idx) => (
                <div key={idx} className="journey-task-pill">
                  {step.statusClass === 'completed' ? (
                    <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                  )}
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TodayJourney;
