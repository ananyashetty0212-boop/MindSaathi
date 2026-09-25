import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Clock3,
  Edit3,
  Plus,
  Pill,
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
  category: 'medicine',
  dosageOrInstruction: '',
  scheduledTime: '08:00 AM',
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

export const RemindersPage = () => {
  const { role } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [snoozeReminder, setSnoozeReminder] = useState(null);

  const canManage = role === 'caregiver' || role === 'elderly';

  const fetchReminders = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.getReminders();
      if (res?.data) setReminders(res.data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(() => fetchReminders(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const openAddForm = () => {
    setEditingReminder(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = item => {
    setEditingReminder(item);
    setForm({
      title: item.title || '',
      category: item.category || 'medicine',
      dosageOrInstruction: item.dosageOrInstruction || '',
      scheduledTime: item.scheduledTime || '08:00 AM',
      timeOfDay: item.timeOfDay || 'Morning',
      repeatDaily: item.repeatDaily !== false
    });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingReminder(null);
    setForm(EMPTY_FORM);
  };

  const handleSaveReminder = async event => {
    event.preventDefault();

    if (!form.title.trim()) {
      window.alert('Please enter a medicine or routine name.');
      return;
    }

    if (!form.scheduledTime) {
      window.alert('Please choose a scheduled time.');
      return;
    }

    setSaving(true);

    try {
      if (editingReminder) {
        await api.updateReminder(editingReminder._id, form);
        speech.speak(`${form.title} has been updated.`);
      } else {
        await api.createReminder(form);
        speech.speak(`${form.title} has been added.`);
      }

      closeForm();
      await fetchReminders(false);
    } catch (err) {
      console.error('Failed to save reminder:', err);
      window.alert(err?.message || 'Unable to save this reminder.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReminder = async item => {
    const confirmed = window.confirm(
      `Deactivate "${item.title}"? It will be removed from the active schedule.`
    );

    if (!confirmed) return;

    try {
      await api.deleteReminder(item._id);
      await fetchReminders(false);
      speech.speak(`${item.title} has been removed from the active schedule.`);
    } catch (err) {
      console.error('Failed to deactivate reminder:', err);
      window.alert(err?.message || 'Unable to remove this reminder.');
    }
  };

  const handleUpdateStatus = async (
    id,
    newStatus,
    itemTitle,
    snoozeUntil = null
  ) => {
    setReminders(prev =>
      prev.map(r =>
        r._id === id
          ? { ...r, status: newStatus, snoozeUntil }
          : r
      )
    );

    if (newStatus === 'taken') {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
      speech.speak(`Confirmation recorded for ${itemTitle}.`);
    }

    if (newStatus === 'skipped') {
      speech.speak(`Marked as skipped for ${itemTitle}.`);
    }

    if (newStatus === 'snoozed') {
      speech.speak(`Reminder postponed until ${formatSnoozeTime(snoozeUntil)}.`);
    }

    try {
      await api.updateReminderStatus(id, newStatus, '', snoozeUntil);
      setSnoozeReminder(null);
      await fetchReminders(false);
    } catch (err) {
      console.error('Status update error:', err);
      await fetchReminders(false);
      window.alert(err?.message || 'Unable to update this reminder.');
    }
  };

  const handleSnooze = (item, minutes) => {
    handleUpdateStatus(
      item._id,
      'snoozed',
      item.title,
      getSnoozeUntil(minutes)
    );
  };

  const filteredReminders = activeFilter === 'all'
    ? reminders
    : reminders.filter(r => r.category === activeFilter);

  const pendingCount = reminders.filter(
    r => r.status === 'pending' || r.status === 'snoozed'
  ).length;

  const confirmedCount = reminders.filter(r => r.status === 'taken').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '2.4rem' }}>💊</span>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--primary-dark)' }}>
              Medicines & Daily Routine
            </h1>
          </div>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Shared medication schedules, confirmations, and gentle reminders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <AudioSpeakButton
            text={`You have ${pendingCount} pending or postponed items and ${confirmedCount} confirmed items.`}
            label="Speak Reminders Summary"
          />
          <button type="button" className="control-btn" onClick={() => fetchReminders()}>
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
          {canManage && (
            <button type="button" className="btn-elderly btn-primary-garden" onClick={openAddForm}>
              <Plus size={21} />
              <span>Add Medicine</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Pill size={24} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
        <div>
          <strong style={{ color: 'var(--primary-dark)', fontSize: '1.08rem' }}>Shared schedule</strong>
          <p style={{ marginTop: '0.35rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
            The elder and caregiver work from the same linked schedule. Either side can add, edit, deactivate, confirm, or postpone an active reminder.
          </p>
        </div>
      </div>

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
            style={{ minHeight: '52px', padding: '0.6rem 1.4rem', fontSize: '1.08rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSaveReminder} style={{ background: 'var(--bg-card)', border: '2px solid var(--primary-light)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 10px 30px rgba(41,68,56,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ color: 'var(--primary-dark)', marginBottom: '0.3rem' }}>
                {editingReminder ? 'Edit Medicine / Routine' : 'Add Medicine / Routine'}
              </h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Changes are shared with the linked caregiver or elder.
              </p>
            </div>
            <button type="button" className="control-btn" onClick={closeForm} disabled={saving}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem' }}>Name</span>
              <input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Example: Morning medicine" style={{ width: '100%', minHeight: '52px', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: '1.05rem' }} />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem' }}>Category</span>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} style={{ width: '100%', minHeight: '52px', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: '1.05rem' }}>
                <option value="medicine">Medicine</option>
                <option value="hydration">Water / Hydration</option>
                <option value="activity">Daily Routine</option>
                <option value="appointment">Appointment</option>
              </select>
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem' }}>Time</span>
              <input type="time" value={toTimeInputValue(form.scheduledTime)} onChange={e => setForm(prev => ({ ...prev, scheduledTime: toDisplayTime(e.target.value) }))} style={{ width: '100%', minHeight: '52px', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: '1.05rem' }} />
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem' }}>Time of day</span>
              <select value={form.timeOfDay} onChange={e => setForm(prev => ({ ...prev, timeOfDay: e.target.value }))} style={{ width: '100%', minHeight: '52px', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: '1.05rem' }}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </label>

            <label>
              <span style={{ display: 'block', fontWeight: 800, marginBottom: '0.4rem' }}>Dosage / instruction</span>
              <input value={form.dosageOrInstruction} onChange={e => setForm(prev => ({ ...prev, dosageOrInstruction: e.target.value }))} placeholder="Example: 1 tablet after breakfast" style={{ width: '100%', minHeight: '52px', padding: '0.75rem 0.9rem', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-surface)', fontSize: '1.05rem' }} />
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1rem', fontSize: '1.05rem' }}>
            <input type="checkbox" checked={form.repeatDaily} onChange={e => setForm(prev => ({ ...prev, repeatDaily: e.target.checked }))} style={{ width: '20px', height: '20px' }} />
            <span>Repeat this schedule daily</span>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn-elderly btn-cream-action" onClick={closeForm} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-elderly btn-primary-garden" disabled={saving}>
              <Save size={20} />
              <span>{saving ? 'Saving...' : editingReminder ? 'Save Changes' : 'Add Item'}</span>
            </button>
          </div>
        </form>
      )}

      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}>Loading your gentle schedule...</div>
        ) : filteredReminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '2px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>No active reminders</h3>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)' }}>Add a medicine or routine item to begin.</p>
          </div>
        ) : (
          filteredReminders.map(item => {
            const isTaken = item.status === 'taken';
            const isSkipped = item.status === 'skipped';
            const isSnoozed = item.status === 'snoozed';

            return (
              <div key={item._id} className={`reminder-card ${isTaken ? 'status-taken' : isSkipped ? 'status-skipped' : isSnoozed ? 'status-snoozed' : ''}`} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: item.category === 'medicine' ? 'var(--secondary-soft)' : item.category === 'hydration' ? 'var(--accent-blue-soft)' : 'var(--primary-soft)', color: item.category === 'medicine' ? 'var(--secondary)' : item.category === 'hydration' ? 'var(--accent-blue)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', flexShrink: 0 }}>
                      {item.category === 'medicine' ? '💊' : item.category === 'hydration' ? '💧' : item.category === 'activity' ? '🌿' : '📅'}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <h2 className="reminder-title">{item.title}</h2>
                        <AudioSpeakButton text={`${item.title}. Scheduled for ${item.scheduledTime}. ${item.dosageOrInstruction || ''}`} size="small" label="Read" />
                      </div>

                      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                        {item.dosageOrInstruction || 'No additional instruction.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', flexWrap: 'wrap' }}>
                        <Clock size={18} color="var(--primary)" />
                        <span>Scheduled: {item.scheduledTime}</span>
                        {item.timeOfDay && <span>• {item.timeOfDay}</span>}
                        {isSnoozed && item.snoozeUntil && <span style={{ color: '#8C5611' }}>• Again at {formatSnoozeTime(item.snoozeUntil)}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-end' }}>
                    {isTaken ? (
                      <span style={{ background: 'var(--primary-soft)', color: 'var(--primary-dark)', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', border: '1px solid var(--primary-light)' }}>
                        <Check size={18} strokeWidth={3} /> Confirmed by user
                      </span>
                    ) : isSkipped ? (
                      <span style={{ background: 'var(--secondary-soft)', color: '#983C2F', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', border: '1px solid rgba(189, 83, 67, 0.4)' }}>
                        <X size={18} strokeWidth={3} /> Marked skipped
                      </span>
                    ) : isSnoozed ? (
                      <span style={{ background: 'var(--accent-gold-soft)', color: '#8C5611', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '1.05rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', border: '1px solid rgba(229, 184, 92, 0.5)' }}>
                        <Clock3 size={18} strokeWidth={3} /> Postponed
                      </span>
                    ) : (
                      <span style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '1.05rem', border: '1.5px solid var(--border)' }}>
                        Not confirmed
                      </span>
                    )}

                    {canManage && (
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button type="button" className="control-btn" onClick={() => openEditForm(item)} title="Edit reminder">
                          <Edit3 size={17} />
                          <span>Edit</span>
                        </button>
                        <button type="button" className="control-btn" onClick={() => handleDeleteReminder(item)} title="Deactivate reminder">
                          <Trash2 size={17} />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
                  <button type="button" className="btn-elderly btn-taken" onClick={() => handleUpdateStatus(item._id, 'taken', item.title)} aria-pressed={isTaken}>
                    <Check size={24} strokeWidth={2.5} />
                    <span>I Took It</span>
                  </button>

                  <button type="button" className="btn-elderly btn-snooze" onClick={() => setSnoozeReminder(item)} aria-pressed={isSnoozed}>
                    <Clock3 size={22} />
                    <span>Remind Me Later</span>
                  </button>

                  <button type="button" className="btn-elderly btn-skip" onClick={() => handleUpdateStatus(item._id, 'skipped', item.title)} aria-pressed={isSkipped}>
                    <X size={22} />
                    <span>I Skipped It</span>
                  </button>
                </div>

                {snoozeReminder?._id === item._id && (
                  <div style={{ marginTop: '1rem', background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                      <Clock3 size={19} /> Choose when to remind again
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                      {SNOOZE_OPTIONS.map(option => (
                        <button key={option.minutes} type="button" className="btn-elderly btn-cream-action" onClick={() => handleSnooze(item, option.minutes)}>
                          {option.label}
                        </button>
                      ))}
                      <button type="button" className="btn-elderly btn-cream-action" onClick={() => setSnoozeReminder(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1.5rem 2rem', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border)', fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.35rem' }}>
          <AlertCircle size={20} color="var(--secondary)" />
          <span>Medication Confirmation Disclosure:</span>
        </div>
        <p>
          Selecting <strong>"I Took It"</strong> logs a self-reported confirmation by the elder or assisting family member. It does <em>not</em> verify physical ingestion. Caregivers can review these confirmation logs to support routine consistency.
        </p>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};

export default RemindersPage;
