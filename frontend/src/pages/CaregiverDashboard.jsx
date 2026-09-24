import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock,
  Pill,
  RefreshCw,
  TrendingUp,
  UserRound,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';

const gameName = (type) => {
  if (type === 'memory_match') return 'Memory Match';
  if (type === 'pattern_recognition') return 'Pattern Recognition';
  if (type === 'attention_game') return 'Attention Activity';
  if (type === 'daily_routine_recall') return 'Routine Recall';
  return 'Cognitive Activity';
};

const timelineIcon = (type) => {
  if (type === 'medicine') return <Pill size={21} />;
  if (type === 'routine') return <CalendarDays size={21} />;
  return <Brain size={21} />;
};

export default function CaregiverDashboard() {
  const { caregiver, elders } = useAuth();
  const elder = elders?.[0];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    const elderId = elder?.id || elder?._id;

    if (!elderId) {
      setLoading(false);
      return;
    }

    try {
      const result = await api.getCaregiverOverview(elderId);
      setData(result);
      setError('');
    } catch (err) {
      console.error('Caregiver dashboard:', err);
      setError(err.message || 'Unable to load caregiver dashboard.');
    } finally {
      setLoading(false);
    }
  }, [elder?.id, elder?._id]);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  if (!elder) {
    return (
      <div className="elder-action-box" style={{ padding: '2rem' }}>
        <UserRound size={40} />
        <h1>No Elder Profile Linked</h1>
        <p>Create a caregiver account with an elder profile first.</p>
      </div>
    );
  }

  const today = data?.today || {};
  const cognitive = data?.cognitiveEngagement || {};
  const medication = data?.medicationConfirmation || {};
  const alerts = data?.alerts || [];
  const timeline = data?.timeline || [];
  const recentSessions = data?.recentSessions || [];
  const chartTrend = cognitive.chartTrend || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section
        className="elder-action-box"
        style={{
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card), var(--secondary-soft))'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: 'var(--secondary)', fontWeight: 800, marginBottom: '.35rem' }}>
              👨‍👩‍👧 CAREGIVER VIEW
            </p>
            <h1 style={{ color: 'var(--primary-dark)', marginBottom: '.35rem' }}>
              Hello, {caregiver?.fullName || 'Caregiver'}
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', margin: 0 }}>
              Connected to <strong>{elder.name}</strong>, age {elder.age}
            </p>
          </div>

          <button className="control-btn" onClick={loadDashboard} disabled={loading}>
            <RefreshCw size={18} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      <section>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--primary-dark)', marginBottom: '.25rem' }}>Today</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            A quick view of what has been recorded today.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem' }}>
          <StatCard icon={<Brain />} value={today.cognitiveActivitiesCompleted || 0} label="Cognitive activities" />
          <StatCard icon={<Pill />} value={today.medicinesConfirmed || 0} label="Medicines confirmed" />
          <StatCard icon={<CalendarDays />} value={today.medicinesPending || 0} label="Pending confirmations" />
          <StatCard icon={<Bell />} value={today.attentionNeeded || 0} label="Items needing attention" />
        </div>
      </section>

      <section
        className="elder-action-box"
        style={{
          padding: '1.7rem',
          borderLeft: alerts.length ? '6px solid var(--accent-gold)' : '6px solid var(--primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '1rem' }}>
          {alerts.length ? <AlertTriangle color="var(--accent-gold)" /> : <CheckCircle2 color="var(--primary)" />}
          <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Attention & Alerts</h2>
        </div>

        {alerts.length === 0 ? (
          <div style={{ padding: '1rem', background: 'var(--primary-soft)', borderRadius: '14px' }}>
            <strong>🌿 No current alerts</strong>
            <p style={{ margin: '.35rem 0 0', color: 'var(--text-muted)' }}>
              No notable activity or reminder issue has been recorded.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '1rem',
                  background: alert.severity === 'warning' ? 'var(--accent-gold-soft)' : 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px'
                }}
              >
                <strong>{alert.title}</strong>
                <p style={{ margin: '.35rem 0', color: 'var(--text-muted)' }}>{alert.message}</p>
                <small style={{ color: 'var(--text-muted)' }}>
                  {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ''}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="elder-action-box" style={{ padding: '1.7rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
              <TrendingUp size={25} color="var(--primary)" />
              <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Cognitive Performance</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: '.4rem 0 0' }}>
              Interaction data from recent cognitive activities.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--primary-dark)' }}>
              {today.averageScore || 0}/100
            </strong>
            <span style={{ color: 'var(--text-muted)' }}>Today's average score</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <Info label="Recent average score" value={`${cognitive.averageScore || 0}/100`} />
          <Info label="Recent accuracy" value={`${cognitive.averageAccuracy || 0}%`} />
          <Info label="Average response time" value={`${cognitive.averageLatencySec || '0.0'} sec`} />
          <Info label="Recommended difficulty" value={cognitive.recommendedDifficulty || 'EASY'} />
        </div>

        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--primary-soft)', borderRadius: '14px' }}>
          <strong>Next activity: </strong>
          {cognitive.recommendedNextActivity || 'Memory Match'}
          <p style={{ margin: '.35rem 0 0', color: 'var(--text-muted)' }}>
            {cognitive.recommendationReason || 'Continue at a comfortable pace.'}
          </p>
        </div>

        {chartTrend.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary-dark)', marginBottom: '.75rem' }}>Recent activity trend</h3>
            <div style={{ display: 'grid', gap: '.6rem' }}>
              {chartTrend.map((point, index) => (
                <div key={`${point.date}-${index}`} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 70px', alignItems: 'center', gap: '.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>{point.date}</span>
                  <div style={{ height: '10px', background: 'var(--bg-surface)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div style={{ width: `${Math.min(100, Math.max(0, point.score))}%`, height: '100%', background: 'var(--primary)', borderRadius: '999px' }} />
                  </div>
                  <strong style={{ textAlign: 'right' }}>{point.score}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="elder-action-box" style={{ padding: '1.7rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
          <Activity size={25} color="var(--primary)" />
          <div>
            <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>Activity Timeline</h2>
            <p style={{ color: 'var(--text-muted)', margin: '.25rem 0 0' }}>
              Games and reminder updates recorded by the platform.
            </p>
          </div>
        </div>

        {timeline.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No activity has been recorded yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '.8rem' }}>
            {timeline.map((item) => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: '.9rem', alignItems: 'center', padding: '.85rem', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary-dark)', display: 'grid', placeItems: 'center' }}>
                  {timelineIcon(item.type)}
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <p style={{ margin: '.2rem 0 0', color: 'var(--text-muted)' }}>{item.details}</p>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '.25rem' }} />
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="elder-action-box" style={{ padding: '1.7rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>Medication Confirmation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1rem', marginTop: '1rem' }}>
          <Info label="Total medicine reminders" value={medication.totalMedicines || 0} />
          <Info label="Confirmed by user" value={medication.confirmedTaken || 0} />
          <Info label="Pending" value={medication.pendingMedicines || 0} />
          <Info label="Skipped" value={medication.skippedMedicines || 0} />
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          These records represent self-reported confirmation. They do not verify medicine ingestion.
        </p>
      </section>

      <section className="elder-action-box" style={{ padding: '1.7rem' }}>
        <h2 style={{ color: 'var(--primary-dark)' }}>Recent Cognitive Activity</h2>
        {recentSessions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No completed cognitive activities yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '.7rem', marginTop: '1rem' }}>
            {recentSessions.slice(0, 5).map((session) => (
              <div key={session._id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '.9rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <strong>{gameName(session.gameType)}</strong>
                  <p style={{ margin: '.25rem 0 0', color: 'var(--text-muted)' }}>
                    {session.accuracy}% accuracy · {session.mistakes || 0} mistakes
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{session.performanceScore}/100</strong>
                  <p style={{ margin: '.2rem 0 0', color: 'var(--text-muted)', fontSize: '.85rem' }}>
                    {session.createdAt ? new Date(session.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p style={{ color: '#A33', fontWeight: 700 }}>{error}</p>}
      <MedicalDisclaimer />
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="elder-action-box" style={{ padding: '1.3rem' }}>
      <div style={{ color: 'var(--primary)' }}>{icon}</div>
      <strong style={{ display: 'block', fontSize: '2rem', color: 'var(--primary-dark)', marginTop: '.3rem' }}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '14px' }}>
      <small style={{ color: 'var(--text-muted)' }}>{label}</small>
      <strong style={{ display: 'block', marginTop: '.25rem', color: 'var(--primary-dark)' }}>{value}</strong>
    </div>
  );
}
