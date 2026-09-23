import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Droplet, 
  Clock, 
  Check, 
  Clock3, 
  X, 
  AlertCircle, 
  RefreshCw,
  CalendarCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { speech } from '../services/speechService';
import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';

export const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.getReminders();
      if (res && res.data) {
        setReminders(res.data);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleUpdateStatus = async (id, newStatus, itemTitle) => {
    // Optimistic UI update
    setReminders(prev =>
      prev.map(r => (r._id === id ? { ...r, status: newStatus } : r))
    );

    if (newStatus === 'taken') {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
      speech.speak(`Thank you. Confirmation recorded for: ${itemTitle}`);
    } else if (newStatus === 'snoozed') {
      speech.speak(`We will remind you in 15 minutes for: ${itemTitle}`);
    } else if (newStatus === 'skipped') {
      speech.speak(`Marked as skipped for: ${itemTitle}. Your caregiver is notified.`);
    }

    try {
      await api.updateReminderStatus(id, newStatus);
    } catch (err) {
      console.warn('Status update API error:', err);
    }
  };

  const filteredReminders = activeFilter === 'all'
    ? reminders
    : reminders.filter(r => r.category === activeFilter);

  const pendingCount = reminders.filter(r => r.status === 'pending').length;
  const confirmedCount = reminders.filter(r => r.status === 'taken').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '2.4rem' }}>💊</span>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--primary-dark)' }}>
              Medicines & Daily Routine
            </h1>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Clear medication confirmation with large, peaceful buttons.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <AudioSpeakButton
            text={`You have ${pendingCount} pending items and ${confirmedCount} confirmed.`}
            label="Speak Reminders Summary"
          />
          <button
            type="button"
            className="control-btn"
            onClick={fetchReminders}
            title="Refresh reminder schedule"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { id: 'all', label: `All Items (${reminders.length})` },
          { id: 'medicine', label: 'Medicines 💊' },
          { id: 'hydration', label: 'Water & Tea 💧' },
          { id: 'activity', label: 'Daily Routine 🌿' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`btn-elderly ${activeFilter === tab.id ? 'btn-primary-garden' : 'btn-cream-action'}`}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              minHeight: '52px',
              padding: '0.6rem 1.4rem',
              fontSize: '1.08rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Loading your gentle schedule...
          </div>
        ) : filteredReminders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3.5rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '2px solid var(--border)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>All Clear!</h3>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)' }}>No reminders in this category.</p>
          </div>
        ) : (
          filteredReminders.map(item => {
            const isTaken = item.status === 'taken';
            const isSkipped = item.status === 'skipped';
            const isSnoozed = item.status === 'snoozed';

            return (
              <div
                key={item._id}
                className={`reminder-card ${
                  isTaken ? 'status-taken' : isSkipped ? 'status-skipped' : isSnoozed ? 'status-snoozed' : ''
                }`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                  {/* Left Pill Visual & Info */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-md)',
                      background: item.category === 'medicine' ? 'var(--secondary-soft)' : item.category === 'hydration' ? 'var(--accent-blue-soft)' : 'var(--primary-soft)',
                      color: item.category === 'medicine' ? 'var(--secondary)' : item.category === 'hydration' ? 'var(--accent-blue)' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.2rem',
                      flexShrink: 0
                    }}>
                      {item.category === 'medicine' ? '💊' : item.category === 'hydration' ? '💧' : '🌿'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <h2 className="reminder-title">{item.title}</h2>
                        <AudioSpeakButton
                          text={`${item.title}. Scheduled for ${item.scheduledTime}. ${item.dosageOrInstruction}`}
                          size="small"
                          label="Read"
                        />
                      </div>

                      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                        {item.dosageOrInstruction}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        <Clock size={18} color="var(--primary)" />
                        <span>Scheduled: {item.scheduledTime}</span>
                        {item.timeOfDay && <span>• {item.timeOfDay}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isTaken ? (
                      <span style={{
                        background: 'var(--primary-soft)',
                        color: 'var(--primary-dark)',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        border: '1px solid var(--primary-light)'
                      }}>
                        <Check size={18} strokeWidth={3} /> Status: Confirmed by user
                      </span>
                    ) : isSkipped ? (
                      <span style={{
                        background: 'var(--secondary-soft)',
                        color: '#983C2F',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        border: '1px solid rgba(189, 83, 67, 0.4)'
                      }}>
                        <X size={18} strokeWidth={3} /> Status: Marked skipped
                      </span>
                    ) : isSnoozed ? (
                      <span style={{
                        background: 'var(--accent-gold-soft)',
                        color: '#8C5611',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        border: '1px solid rgba(229, 184, 92, 0.5)'
                      }}>
                        <Clock3 size={18} strokeWidth={3} /> Status: Postponed (15m)
                      </span>
                    ) : (
                      <span style={{
                        background: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        border: '1.5px solid var(--border)'
                      }}>
                        Status: Not confirmed
                      </span>
                    )}
                  </div>
                </div>

                {/* Large Action Buttons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-elderly btn-taken"
                    onClick={() => handleUpdateStatus(item._id, 'taken', item.title)}
                    aria-pressed={isTaken}
                  >
                    <Check size={24} strokeWidth={2.5} />
                    <span>I Took It</span>
                  </button>

                  <button
                    type="button"
                    className="btn-elderly btn-snooze"
                    onClick={() => handleUpdateStatus(item._id, 'snoozed', item.title)}
                    aria-pressed={isSnoozed}
                  >
                    <Clock3 size={22} />
                    <span>Remind Me Later</span>
                  </button>

                  <button
                    type="button"
                    className="btn-elderly btn-skip"
                    onClick={() => handleUpdateStatus(item._id, 'skipped', item.title)}
                    aria-pressed={isSkipped}
                  >
                    <X size={22} />
                    <span>I Skipped It</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Responsible Medication Confirmation vs Ingestion Notice */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '1.5rem 2rem',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--border)',
        fontSize: '1.05rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
          <AlertCircle size={20} color="var(--secondary)" />
          <span>Medication Confirmation Disclosure:</span>
        </div>
        <p>
          Selecting <strong>"I Took It"</strong> logs a self-reported confirmation by the elder or family member. It does <em>not</em> verify physical physiological ingestion. Family caregivers can review these confirmation logs to support routine consistency.
        </p>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};

export default RemindersPage;
