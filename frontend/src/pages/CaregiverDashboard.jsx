import React, { useEffect, useState } from 'react';

import {
  Brain,
  Pill,
  Bell,
  TrendingUp,
  RefreshCw,
  UserRound,
  Activity,
  Clock
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';

export default function CaregiverDashboard() {

  const {
    caregiver,
    elders
  } = useAuth();

  const elder = elders?.[0];

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadDashboard = async () => {

    if (!elder?.id) {
      setLoading(false);
      return;
    }

    try {

      const result =
        await api.getCaregiverOverview(
          elder.id
        );

      setData(result);

      setError('');

    } catch (err) {

      console.error(
        'Caregiver dashboard:',
        err
      );

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    loadDashboard();

    // Automatic live refresh
    const interval =
      setInterval(
        loadDashboard,
        5000
      );

    return () =>
      clearInterval(interval);

  }, [elder?.id]);

  if (!elder) {

    return (
      <div className="elder-action-box">

        <UserRound size={40} />

        <h1>
          No Elder Profile Linked
        </h1>

        <p>
          Create a caregiver account
          with an elder profile first.
        </p>

      </div>
    );
  }

  const cognitive =
    data?.cognitiveEngagement || {};

  const medication =
    data?.medicationConfirmation || {};

  const alerts =
    data?.alerts || [];

  const recentSessions =
    data?.recentSessions || [];

  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="elder-action-box"
        style={{
          padding: '2rem',
          background:
            'linear-gradient(135deg, var(--bg-card), var(--secondary-soft))'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >

          <div>

            <p
              style={{
                color: 'var(--secondary)',
                fontWeight: 800
              }}
            >
              👨‍👩‍👧 CAREGIVER VIEW
            </p>

            <h1
              style={{
                color: 'var(--primary-dark)'
              }}
            >
              Hello, {caregiver?.fullName || 'Caregiver'}
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-muted)'
              }}
            >
              Monitoring{' '}
              <strong>
                {elder.name}
              </strong>
              , age {elder.age}
            </p>

          </div>

          <button
            className="control-btn"
            onClick={loadDashboard}
          >
            <RefreshCw size={18} />

            Refresh
          </button>

        </div>

      </section>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit,minmax(190px,1fr))',
          gap: '1rem'
        }}
      >

        <StatCard
          icon={<Brain />}
          value={
            cognitive.totalGamesPlayed || 0
          }
          label="Games completed"
        />

        <StatCard
          icon={<TrendingUp />}
          value={
            cognitive.averageScore || 0
          }
          label="Average activity score"
        />

        <StatCard
          icon={<Pill />}
          value={`${medication.adherenceRate || 0}%`}
          label="Medicine confirmations"
        />

        <StatCard
          icon={<Bell />}
          value={alerts.length}
          label="Open alerts"
        />

      </div>

      {/* =====================================================
          ELDER PROFILE
      ===================================================== */}

      <section
        className="elder-action-box"
        style={{
          padding: '1.7rem'
        }}
      >

        <h2
          style={{
            color: 'var(--primary-dark)'
          }}
        >
          Elder Profile
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',
            gap: '1rem'
          }}
        >

          <Info
            label="Name"
            value={elder.name}
          />

          <Info
            label="Age"
            value={elder.age}
          />

          <Info
            label="Language"
            value={
              elder.preferredLanguage
            }
          />

          <Info
            label="Region"
            value={
              elder.region ||
              'Not specified'
            }
          />

          <Info
            label="Emergency Contact"
            value={
              elder.emergencyContactName ||
              'Not specified'
            }
          />

        </div>

      </section>

      {/* =====================================================
          MEDICATION
      ===================================================== */}

      <section
        className="elder-action-box"
        style={{
          padding: '1.7rem'
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem'
          }}
        >

          <Pill
            size={25}
            color="var(--secondary)"
          />

          <h2
            style={{
              color: 'var(--primary-dark)'
            }}
          >
            Medication Confirmation
          </h2>

        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(180px,1fr))',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >

          <Info
            label="Total medicine reminders"
            value={
              medication.totalMedicines || 0
            }
          />

          <Info
            label="Confirmed taken"
            value={
              medication.confirmedTaken || 0
            }
          />

          <Info
            label="Pending"
            value={
              medication.pendingMedicines || 0
            }
          />

          <Info
            label="Skipped"
            value={
              medication.skippedMedicines || 0
            }
          />

        </div>

        <p
          style={{
            marginTop: '1rem',
            color: 'var(--text-muted)'
          }}
        >
          These records represent
          self-reported confirmation.
          They do not verify ingestion.
        </p>

      </section>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      <section
        className="elder-action-box"
        style={{
          padding: '1.7rem'
        }}
      >

        <h2
          style={{
            color: 'var(--primary-dark)'
          }}
        >
          Alerts
        </h2>

        {alerts.length === 0 ? (

          <div
            style={{
              padding: '1rem',
              background:
                'var(--primary-soft)',
              borderRadius: '14px'
            }}
          >

            <strong>
              🌿 No current alerts
            </strong>

            <p
              style={{
                marginBottom: 0,
                color: 'var(--text-muted)'
              }}
            >
              Everything recorded so far
              is within the current activity
              information.
            </p>

          </div>

        ) : (

          alerts.map(alert => (

            <div
              key={alert.id}
              style={{
                padding: '1rem',
                marginBottom: '.7rem',
                background:
                  'var(--accent-gold-soft)',
                borderRadius: '14px'
              }}
            >

              <strong>
                {alert.title}
              </strong>

              <p>
                {alert.message}
              </p>

              <small>
                {alert.timestamp
                  ? new Date(
                      alert.timestamp
                    ).toLocaleString()
                  : ''}
              </small>

            </div>

          ))

        )}

      </section>

      {/* =====================================================
          LIVE GAME ACTIVITY
      ===================================================== */}

      <section
        className="elder-action-box"
        style={{
          padding: '1.7rem'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >

          <div
            style={{
              display: 'flex',
              gap: '.6rem',
              alignItems: 'center'
            }}
          >

            <Activity
              size={25}
              color="var(--primary)"
            />

            <h2
              style={{
                color: 'var(--primary-dark)'
              }}
            >
              Recent Cognitive Activity
            </h2>

          </div>

          <span
            style={{
              fontSize: '.9rem',
              color: 'var(--text-muted)'
            }}
          >
            Live refresh: 5 sec
          </span>

        </div>

        {loading ? (

          <p>
            Loading activity…
          </p>

        ) : recentSessions.length === 0 ? (

          <div
            style={{
              padding: '1.2rem',
              background:
                'var(--bg-surface)',
              borderRadius: '14px'
            }}
          >

            <p
              style={{
                margin: 0,
                color: 'var(--text-muted)'
              }}
            >
              No games completed yet.
              When the elder completes a
              game, the result will appear here
              automatically.
            </p>

          </div>

        ) : (

          recentSessions.map(session => (

            <div
              key={session._id}
              style={{
                padding: '1rem 0',
                borderBottom:
                  '1px solid var(--border)',
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >

              <div>

                <strong>
                  {session.gameType ===
                  'memory_match'
                    ? 'Memory Match'
                    : 'Pattern Recognition'}
                </strong>

                <p
                  style={{
                    margin: '.35rem 0',
                    color: 'var(--text-muted)'
                  }}
                >
                  {session.accuracy}%
                  accuracy ·{' '}
                  {session.mistakes} mistakes
                </p>

              </div>

              <div
                style={{
                  textAlign: 'right'
                }}
              >

                <strong
                  style={{
                    color: 'var(--primary)',
                    fontSize: '1.3rem'
                  }}
                >
                  {session.performanceScore}/100
                </strong>

                <p
                  style={{
                    margin: 0,
                    fontSize: '.85rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Clock size={13} />{' '}
                  {session.createdAt
                    ? new Date(
                        session.createdAt
                      ).toLocaleString()
                    : ''}
                </p>

              </div>

            </div>

          ))

        )}

      </section>

      {error && (

        <p
          style={{
            color: '#A33',
            fontWeight: 700
          }}
        >
          {error}
        </p>

      )}

      <MedicalDisclaimer />

    </div>
  );
}


// ===========================================================
// SMALL COMPONENTS
// ===========================================================

function StatCard({
  icon,
  value,
  label
}) {

  return (

    <div
      className="elder-action-box"
      style={{
        padding: '1.3rem'
      }}
    >

      <div
        style={{
          color: 'var(--primary)'
        }}
      >
        {icon}
      </div>

      <strong
        style={{
          display: 'block',
          fontSize: '2rem',
          color: 'var(--primary-dark)',
          marginTop: '.3rem'
        }}
      >
        {value}
      </strong>

      <span>
        {label}
      </span>

    </div>
  );
}

function Info({
  label,
  value
}) {

  return (

    <div
      style={{
        padding: '1rem',
        background:
          'var(--bg-surface)',
        borderRadius: '14px'
      }}
    >

      <small
        style={{
          color: 'var(--text-muted)'
        }}
      >
        {label}
      </small>

      <strong
        style={{
          display: 'block',
          marginTop: '.25rem',
          color: 'var(--primary-dark)'
        }}
      >
        {value}
      </strong>

    </div>
  );
}