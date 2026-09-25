import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock,
  Clock3,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { speech } from '../services/speechService';
import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  title: '',
  dosageOrInstruction: '',
  scheduledTime: '09:00 AM',
  timeOfDay: 'Morning',
  repeatDaily: true
};

const SNOOZE_OPTIONS = [
  { minutes: 10, label: '10 minutes' },
  { minutes: 15, label: '15 minutes' },
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 hour' }
];

function getSnoozeUntil(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function formatSnoozeTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function toTimeInputValue(displayTime) {
  if (!displayTime) return '';
  const match = displayTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '';

  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = match[3]?.toUpperCase();

  if (suffix === 'PM' && hour < 12) hour += 12;
  if (suffix === 'AM' && hour === 12) hour = 0;

  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function toDisplayTime(value) {
  if (!value) return '';
  const [hourString, minute] = value.split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function timeToMinutes(value) {
  if (!value) return 9999;
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 9999;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3].toUpperCase();

  if (suffix === 'PM' && hour < 12) hour += 12;
  if (suffix === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minute;
}

export default function RoutinePage() {
  const { role } = useAuth();

  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [snoozeRoutine, setSnoozeRoutine] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const canManage = role === 'caregiver' || role === 'elderly';

  const fetchRoutines = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const result = await api.getReminders();
      const items = Array.isArray(result?.data) ? result.data : [];
      setRoutines(items.filter(item => item.category === 'activity'));
    } catch (error) {
      console.error('Failed to load daily routines:', error);
      setRoutines([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines();

    // Keep elder and caregiver views synchronized during the demo.
    const interval = setInterval(() => fetchRoutines(false), 5000);

    return () => clearInterval(interval);
  }, []);

  const sortedRoutines = useMemo(
    () => [...routines].sort(
      (a, b) => timeToMinutes(a.scheduledTime) - timeToMinutes(b.scheduledTime)
    ),
    [routines]
  );

  const completedCount = routines.filter(item => item.status === 'taken').length;
  const pendingCount = routines.filter(
    item => item.status === 'pending' || item.status === 'snoozed'
  ).length;
  const skippedCount = routines.filter(item => item.status === 'skipped').length;

  const nextRoutine = sortedRoutines.find(
    item => item.status !== 'taken' && item.status !== 'skipped'
  );

  const openAddForm = () => {
    setEditingRoutine(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = item => {
    setEditingRoutine(item);
    setForm({
      title: item.title || '',
      dosageOrInstruction: item.dosageOrInstruction || '',
      scheduledTime: item.scheduledTime || '09:00 AM',
      timeOfDay: item.timeOfDay || 'Morning',
      repeatDaily: item.repeatDaily !== false
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingRoutine(null);
    setForm(EMPTY_FORM);
  };

  const handleSaveRoutine = async event => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert('Please enter a routine name.');
      return;
    }

    if (!form.scheduledTime) {
      window.alert('Please choose a routine time.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        category: 'activity'
      };

      if (editingRoutine) {
        await api.updateReminder(editingRoutine._id, payload);
        speech.speak(`${form.title} has been updated.`);
      } else {
        await api.createReminder(payload);
        speech.speak(`${form.title} has been added to your daily routine.`);
      }

      closeForm();
      await fetchRoutines(false);
    } catch (error) {
      console.error('Failed to save routine:', error);
      window.alert(error?.message || 'Unable to save this routine.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoutine = async item => {
    const confirmed = window.confirm(
      `Remove "${item.title}" from the active daily routine?`
    );

    if (!confirmed) return;

    try {
      await api.deleteReminder(item._id);
      await fetchRoutines(false);
      speech.speak(`${item.title} has been removed from the active routine.`);
    } catch (error) {
      console.error('Failed to remove routine:', error);
      window.alert(error?.message || 'Unable to remove this routine.');
    }
  };

  const handleStatus = async (
    id,
    status,
    title,
    snoozeUntil = null
  ) => {
    setRoutines(previous =>
      previous.map(item =>
        item._id === id
          ? { ...item, status, snoozeUntil }
          : item
      )
    );

    try {
      await api.updateReminderStatus(id, status, '', snoozeUntil);

      if (status === 'taken') {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.8 }
        });
        speech.speak(`${title} is marked complete.`);
      } else if (status === 'skipped') {
        speech.speak(`${title} is marked skipped.`);
      } else if (status === 'snoozed') {
        speech.speak(`Reminder postponed until ${formatSnoozeTime(snoozeUntil)}.`);
      }

      setSnoozeRoutine(null);
      await fetchRoutines(false);
    } catch (error) {
      console.error('Routine status update failed:', error);
      await fetchRoutines(false);
      window.alert(error?.message || 'Unable to update this routine.');
    }
  };

  const handleSnooze = (item, minutes) => {
    handleStatus(
      item._id,
      'snoozed',
      item.title,
      getSnoozeUntil(minutes)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section
        className="elder-action-box"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card), var(--accent-gold-soft))'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.65rem',
              marginBottom: '.45rem'
            }}>
              <CalendarDays size={30} color="var(--primary)" />
              <h1 style={{ color: 'var(--primary-dark)', margin: 0 }}>
                My Daily Routine
              </h1>
            </div>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.15rem',
              margin: 0,
              maxWidth: '720px',
              lineHeight: 1.55
            }}>
              A shared routine for the elder and caregiver. Changes made here are reflected
              on both sides of the linked account.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '.7rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="control-btn"
              onClick={() => fetchRoutines()}
              disabled={loading}
            >
              <RefreshCw size={18} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {canManage && (
              <button
                type="button"
                className="btn-elderly btn-primary-garden"
                onClick={openAddForm}
              >
                <Plus size={21} />
                <span>Add Routine</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <SummaryCard emoji="🌿" value={routines.length} label="Routine items" />
        <SummaryCard emoji="✅" value={completedCount} label="Completed" />
        <SummaryCard emoji="⏰" value={pendingCount} label="Pending / postponed" />
        <SummaryCard emoji="↪️" value={skippedCount} label="Skipped" />
      </section>

      {nextRoutine && (
        <section
          className="elder-action-box"
          style={{
            padding: '1.25rem 1.5rem',
            borderLeft: '6px solid var(--primary)'
          }}
        >
          <strong style={{ color: 'var(--primary-dark)', fontSize: '1.1rem' }}>
            Next routine
          </strong>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.7rem',
            marginTop: '.45rem',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '1.25rem' }}>🌱</span>
            <strong>{nextRoutine.title}</strong>
            <span style={{ color: 'var(--text-muted)' }}>
              at {nextRoutine.scheduledTime}
            </span>
          </div>
        </section>
      )}

      {showForm && (
        <form
          onSubmit={handleSaveRoutine}
          className="elder-action-box"
          style={{
            padding: '1.5rem',
            border: '2px solid var(--primary-light)'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.2rem'
          }}>
            <div>
              <h2 style={{ color: 'var(--primary-dark)', marginBottom: '.3rem' }}>
                {editingRoutine ? 'Edit Daily Routine' : 'Add Daily Routine'}
              </h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Both the elder and caregiver can manage the shared routine.
              </p>
            </div>

            <button
              type="button"
              className="control-btn"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close routine form"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '.4rem' }}>
                Routine name
              </span>
              <input
                value={form.title}
                onChange={event => setForm(previous => ({
                  ...previous,
                  title: event.target.value
                }))}
                placeholder="Example: Morning walk"
                style={inputStyle}
              />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '.4rem' }}>
                Time
              </span>
              <input
                type="time"
                value={toTimeInputValue(form.scheduledTime)}
                onChange={event => setForm(previous => ({
                  ...previous,
                  scheduledTime: toDisplayTime(event.target.value)
                }))}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '.4rem' }}>
                Time of day
              </span>
              <select
                value={form.timeOfDay}
                onChange={event => setForm(previous => ({
                  ...previous,
                  timeOfDay: event.target.value
                }))}
                style={inputStyle}
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '.4rem' }}>
                Instruction
              </span>
              <input
                value={form.dosageOrInstruction}
                onChange={event => setForm(previous => ({
                  ...previous,
                  dosageOrInstruction: event.target.value
                }))}
                placeholder="Example: Walk for 15 minutes"
                style={inputStyle}
              />
            </label>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.65rem',
            marginTop: '1rem',
            fontSize: '1.05rem'
          }}>
            <input
              type="checkbox"
              checked={form.repeatDaily}
              onChange={event => setForm(previous => ({
                ...previous,
                repeatDaily: event.target.checked
              }))}
              style={{ width: '20px', height: '20px' }}
            />
            <span>Repeat this routine daily</span>
          </label>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '.75rem',
            marginTop: '1.25rem',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              className="btn-elderly btn-cream-action"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-elderly btn-primary-garden"
              disabled={saving}
            >
              <Save size={20} />
              <span>
                {saving
                  ? 'Saving...'
                  : editingRoutine
                    ? 'Save Changes'
                    : 'Add Routine'}
              </span>
            </button>
          </div>
        </form>
      )}

      <section>
        {loading ? (
          <div className="elder-action-box" style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            Loading your daily routine...
          </div>
        ) : sortedRoutines.length === 0 ? (
          <div className="elder-action-box" style={{
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '.5rem' }}>
              Your routine is empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Add your first daily activity to start building the shared routine.
            </p>
          </div>
        ) : (
          sortedRoutines.map(item => {
            const isComplete = item.status === 'taken';
            const isSkipped = item.status === 'skipped';
            const isSnoozed = item.status === 'snoozed';

            return (
              <article
                key={item._id}
                className="reminder-card"
                style={{ marginBottom: '1rem' }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    minWidth: 0
                  }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      background: 'var(--primary-soft)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '2rem',
                      flexShrink: 0
                    }}>
                      🌿
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.65rem',
                        flexWrap: 'wrap'
                      }}>
                        <h2 className="reminder-title" style={{ margin: 0 }}>
                          {item.title}
                        </h2>
                        <AudioSpeakButton
                          text={`${item.title}. Scheduled for ${item.scheduledTime}. ${item.dosageOrInstruction || ''}`}
                          size="small"
                          label="Read"
                        />
                      </div>

                      <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1.08rem',
                        margin: '.4rem 0 .65rem'
                      }}>
                        {item.dosageOrInstruction || 'No additional instruction.'}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.6rem',
                        flexWrap: 'wrap',
                        color: 'var(--text-main)',
                        fontWeight: 700
                      }}>
                        <Clock size={18} color="var(--primary)" />
                        <span>{item.scheduledTime}</span>
                        <span>• {item.timeOfDay || 'Daily'}</span>
                        {item.repeatDaily !== false && <span>• Every day</span>}
                        {isSnoozed && item.snoozeUntil && (
                          <span style={{ color: '#8C5611' }}>
                            • Again at {formatSnoozeTime(item.snoozeUntil)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '.6rem'
                  }}>
                    <StatusBadge
                      complete={isComplete}
                      skipped={isSkipped}
                      snoozed={isSnoozed}
                    />

                    {canManage && (
                      <div style={{ display: 'flex', gap: '.45rem' }}>
                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => openEditForm(item)}
                        >
                          <Edit3 size={17} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="control-btn"
                          onClick={() => handleDeleteRoutine(item)}
                        >
                          <Trash2 size={17} />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '.8rem',
                  marginTop: '1rem'
                }}>
                  <button
                    type="button"
                    className="btn-elderly btn-taken"
                    onClick={() => handleStatus(item._id, 'taken', item.title)}
                    aria-pressed={isComplete}
                  >
                    <Check size={23} strokeWidth={2.5} />
                    <span>Mark Complete</span>
                  </button>

                  <button
                    type="button"
                    className="btn-elderly btn-snooze"
                    onClick={() => setSnoozeRoutine(item)}
                    aria-pressed={isSnoozed}
                  >
                    <Clock3 size={22} />
                    <span>Remind Me Later</span>
                  </button>

                  <button
                    type="button"
                    className="btn-elderly btn-skip"
                    onClick={() => handleStatus(item._id, 'skipped', item.title)}
                    aria-pressed={isSkipped}
                  >
                    <X size={22} />
                    <span>Skip</span>
                  </button>
                </div>

                {snoozeRoutine?._id === item._id && (
                  <div style={{
                    marginTop: '1rem',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '16px',
                    padding: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.5rem',
                      marginBottom: '.8rem',
                      fontWeight: 800,
                      color: 'var(--primary-dark)'
                    }}>
                      <Clock3 size={19} />
                      Choose when to remind again
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '.65rem'
                    }}>
                      {SNOOZE_OPTIONS.map(option => (
                        <button
                          key={option.minutes}
                          type="button"
                          className="btn-elderly btn-cream-action"
                          onClick={() => handleSnooze(item, option.minutes)}
                        >
                          {option.label}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="btn-elderly btn-cream-action"
                        onClick={() => setSnoozeRoutine(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      <section style={{
        background: 'var(--bg-card)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid var(--border)',
        color: 'var(--text-muted)',
        lineHeight: 1.6
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.5rem',
          fontWeight: 800,
          color: 'var(--primary-dark)',
          marginBottom: '.35rem'
        }}>
          <AlertCircle size={20} color="var(--secondary)" />
          <span>Shared routine</span>
        </div>
        <p style={{ margin: 0 }}>
          Routine completion is recorded as an activity status. It is shared with the
          linked caregiver and does not represent medical verification.
        </p>
      </section>

      <MedicalDisclaimer />
    </div>
  );
}

function SummaryCard({ emoji, value, label }) {
  return (
    <div className="elder-action-box" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '1.7rem' }}>{emoji}</div>
      <strong style={{
        display: 'block',
        fontSize: '2rem',
        color: 'var(--primary-dark)',
        marginTop: '.2rem'
      }}>
        {value}
      </strong>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function StatusBadge({ complete, skipped, snoozed }) {
  if (complete) {
    return (
      <span style={badgeStyle('var(--primary-soft)', 'var(--primary-dark)')}>
        <Check size={17} strokeWidth={3} /> Completed
      </span>
    );
  }

  if (skipped) {
    return (
      <span style={badgeStyle('var(--secondary-soft)', '#983C2F')}>
        <X size={17} strokeWidth={3} /> Skipped
      </span>
    );
  }

  if (snoozed) {
    return (
      <span style={badgeStyle('var(--accent-gold-soft)', '#8C5611')}>
        <Clock3 size={17} strokeWidth={3} /> Postponed
      </span>
    );
  }

  return (
    <span style={badgeStyle('var(--bg-surface)', 'var(--text-muted)')}>
      <Clock size={17} /> Not completed
    </span>
  );
}

function badgeStyle(background, color) {
  return {
    background,
    color,
    padding: '.45rem .9rem',
    borderRadius: '999px',
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.4rem',
    border: '1px solid var(--border)'
  };
}

const inputStyle = {
  width: '100%',
  minHeight: '52px',
  padding: '.75rem .9rem',
  borderRadius: '12px',
  border: '1.5px solid var(--border)',
  background: 'var(--bg-surface)',
  fontSize: '1.05rem'
};
