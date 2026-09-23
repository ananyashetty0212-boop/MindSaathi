import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Brain,
  Pill,
  ArrowRight,
  Shield,
  Droplets,
  Heart,
  Sparkles
} from 'lucide-react';

import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';
import MemoryGarden from '../components/garden/MemoryGarden';

export const LandingPage = () => {
  const introText =
    "Welcome to MindSaathi. Your gentle companion for every day. MindSaathi helps you stay active, remember your routine, care for your daily wellbeing, and stay connected with the people who care about you.";

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3.5rem'
      }}
    >
      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 253, 248, 0.96) 0%, rgba(246, 239, 230, 0.88) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--border)',
          padding: '3.5rem 2.5rem',
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}
      >
        {/* =====================================================
            LEFT HERO CONTENT
        ===================================================== */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary-dark)',
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.95rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              <Leaf size={18} color="var(--primary)" />
              Gentle Everyday Support
            </span>

            <AudioSpeakButton
              text={introText}
              size="small"
              label="Listen"
            />
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.3rem, 4vw, 3.4rem)',
              color: 'var(--primary-dark)',
              lineHeight: 1.18,
              marginBottom: '1.25rem'
            }}
          >
            Your gentle companion for every day.
          </h1>

          <p
            style={{
              fontSize: '1.28rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2.5rem'
            }}
          >
            <strong>MindSaathi</strong> helps older adults stay mentally
            active, remember daily routines, manage reminders, and stay
            connected with family and caregivers — in a calm and
            easy-to-use environment.
          </p>

          {/* =====================================================
              LARGE ROLE ACTIONS
          ===================================================== */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem'
            }}
          >
            <Link
              to="/elderly"
              className="btn-elderly btn-primary-garden"
              style={{
                padding: '1.1rem 2.2rem',
                fontSize: '1.28rem'
              }}
            >
              <Leaf size={24} />
              <span>Continue as Elder</span>
              <ArrowRight size={22} />
            </Link>

            <Link
              to="/caregiver"
              className="btn-elderly btn-terracotta"
              style={{
                padding: '1.1rem 2.2rem',
                fontSize: '1.28rem'
              }}
            >
              <Shield size={24} />
              <span>Continue as Caregiver</span>
            </Link>
          </div>
        </div>

        {/* =====================================================
            MEMORY GARDEN VISUAL
        ===================================================== */}
        <div>
          <MemoryGarden
            gamesPlayed={2}
            medsTaken={3}
            waterGlasses={6}
            routinesDone={2}
          />
        </div>
      </section>

      {/* =========================================================
          THREE MAIN PILLARS
      ========================================================= */}
      <section>
        <div
          style={{
            textAlign: 'center',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto'
          }}
        >
          <h2
            style={{
              fontSize: '2.2rem',
              color: 'var(--primary-dark)',
              marginBottom: '0.65rem'
            }}
          >
            Support for Everyday Wellbeing
          </h2>

          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6
            }}
          >
            Simple, respectful and accessible support designed around
            the needs of older adults and the people who care for them.
          </p>
        </div>

        <div
          className="elder-quad-grid"
          style={{
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))'
          }}
        >
          {/* =====================================================
              PILLAR 1 — COGNITIVE CARE
          ===================================================== */}
          <div
            className="elder-action-box"
            style={{
              borderLeft: '8px solid var(--primary)'
            }}
          >
            <div
              className="elder-action-icon"
              style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary)'
              }}
            >
              🧠
            </div>

            <div>
              <h3 className="elder-action-title">
                Cognitive Activities
              </h3>

              <p className="elder-action-sub">
                Gentle memory, attention, pattern and recall activities
                that can be enjoyed at a comfortable pace.
              </p>
            </div>

            <Link
              to="/games"
              style={{
                color: 'var(--primary)',
                fontWeight: 800,
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Explore Activities
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* =====================================================
              PILLAR 2 — DAILY ASSISTANCE
          ===================================================== */}
          <div
            className="elder-action-box"
            style={{
              borderLeft: '8px solid var(--secondary)'
            }}
          >
            <div
              className="elder-action-icon"
              style={{
                background: 'var(--secondary-soft)',
                color: 'var(--secondary)'
              }}
            >
              💊
            </div>

            <div>
              <h3 className="elder-action-title">
                Daily Assistance
              </h3>

              <p className="elder-action-sub">
                Friendly medication, hydration and routine reminders
                with simple confirmations and clear choices.
              </p>
            </div>

            <Link
              to="/reminders"
              style={{
                color: 'var(--secondary)',
                fontWeight: 800,
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              View Reminders
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* =====================================================
              PILLAR 3 — FAMILY CONNECTION
          ===================================================== */}
          <div
            className="elder-action-box"
            style={{
              borderLeft: '8px solid var(--accent-gold)'
            }}
          >
            <div
              className="elder-action-icon"
              style={{
                background: 'var(--accent-gold-soft)',
                color: '#A06414'
              }}
            >
              👨‍👩‍👧
            </div>

            <div>
              <h3 className="elder-action-title">
                Family Connection
              </h3>

              <p className="elder-action-sub">
                Caregivers can stay informed about routines, activities
                and changes while respecting the elder's privacy and
                independence.
              </p>
            </div>

            <Link
              to="/caregiver"
              style={{
                color: '#A06414',
                fontWeight: 800,
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Caregiver Portal
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW MINDSAATHI HELPS
      ========================================================= */}
      <section
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}
        >
          <Sparkles
            size={28}
            color="var(--primary)"
          />

          <h2
            style={{
              fontSize: '1.65rem',
              color: 'var(--primary-dark)'
            }}
          >
            A calmer way to support everyday life
          </h2>
        </div>

        <p
          style={{
            fontSize: '1.18rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            marginBottom: '1.75rem'
          }}
        >
          MindSaathi brings cognitive activities, daily reminders,
          hydration tracking, voice assistance and caregiver
          communication into one simple experience. The interface is
          designed to feel familiar, calm and easy to understand.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.2rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              <Brain
                size={24}
                color="var(--primary)"
              />
            </div>

            <h3
              style={{
                color: 'var(--primary-dark)',
                marginBottom: '0.35rem'
              }}
            >
              Adaptive Activities
            </h3>

            <p
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}
            >
              Activity difficulty can adapt using recent performance
              and engagement.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.2rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--secondary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              <Pill
                size={24}
                color="var(--secondary)"
              />
            </div>

            <h3
              style={{
                color: 'var(--primary-dark)',
                marginBottom: '0.35rem'
              }}
            >
              Gentle Reminders
            </h3>

            <p
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}
            >
              Medicine, hydration and daily routine reminders are easy
              to understand and confirm.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.2rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--accent-gold-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              <Droplets
                size={24}
                color="#A06414"
              />
            </div>

            <h3
              style={{
                color: 'var(--primary-dark)',
                marginBottom: '0.35rem'
              }}
            >
              Everyday Wellness
            </h3>

            <p
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}
            >
              Simple hydration and routine tracking encourages
              consistent everyday habits.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.2rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--accent-lavender-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem'
              }}
            >
              <Heart
                size={24}
                color="#6B599C"
              />
            </div>

            <h3
              style={{
                color: 'var(--primary-dark)',
                marginBottom: '0.35rem'
              }}
            >
              Family Support
            </h3>

            <p
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.5
              }}
            >
              Caregivers can follow useful activity information
              without intrusive monitoring.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          ACCESSIBILITY / CALM DESIGN CARD
      ========================================================= */}
      <section
        style={{
          background:
            'linear-gradient(135deg, var(--primary-soft), var(--bg-card))',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              minWidth: '52px',
              borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid var(--border)'
            }}
          >
            <Leaf
              size={26}
              color="var(--primary)"
            />
          </div>

          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                color: 'var(--primary-dark)',
                marginBottom: '0.5rem'
              }}
            >
              Designed for comfort and accessibility
            </h2>

            <p
              style={{
                fontSize: '1.12rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6
              }}
            >
              Large controls, readable text, voice assistance, gentle
              pacing and a calm visual environment help make MindSaathi
              comfortable for older adults.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          MEDICAL DISCLAIMER
      ========================================================= */}
      <MedicalDisclaimer />
    </div>
  );
};

export default LandingPage;