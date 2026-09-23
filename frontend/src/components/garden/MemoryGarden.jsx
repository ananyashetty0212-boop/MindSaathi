import React from 'react';
import { Sparkles, Heart, Droplets, Flower2, Leaf } from 'lucide-react';

/**
 * MindSaathi - Living Memory Garden Signature Component
 * Visually reflects daily completed activities through blooming flowers,
 * fresh green leaves, and morning dew drops.
 * 
 * @param {Object} props
 * @param {number} props.gamesPlayed - Count of cognitive games completed today
 * @param {number} props.medsTaken - Count of medicines confirmed today
 * @param {number} props.waterGlasses - Glasses of water logged
 * @param {number} props.routinesDone - Completed daily activities
 * @param {boolean} props.compact - Compact mode for smaller cards
 */
export const MemoryGarden = ({
  gamesPlayed = 1,
  medsTaken = 2,
  waterGlasses = 4,
  routinesDone = 2,
  compact = false
}) => {
  // Total growth score for garden state (1 to 5 stages)
  const growthScore = Math.min(10, gamesPlayed + medsTaken + Math.floor(waterGlasses / 2) + routinesDone);

  return (
    <div className={`garden-card ${compact ? 'compact-garden' : ''}`} style={{
      background: 'linear-gradient(145deg, #FFFDF8 0%, #F5FBF6 100%)',
      border: '2px solid var(--border)',
      position: 'relative'
    }}>
      {/* Garden Header Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--primary-soft)',
            color: 'var(--primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Leaf size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: compact ? '1.2rem' : '1.45rem', color: 'var(--primary-dark)' }}>
              Living Memory Garden 🌿
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              Your peaceful companion tree blooms with every daily care step.
            </p>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--primary-soft)',
          color: 'var(--primary-dark)',
          padding: '0.4rem 0.95rem',
          borderRadius: 'var(--radius-full)',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          <Sparkles size={16} color="var(--secondary)" />
          <span>Your garden is growing today</span>
        </div>
      </div>

      {/* Elegant SVG Living Memory Tree */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '0.5rem 0' : '1rem 0'
      }}>
        <svg
          viewBox="0 0 400 240"
          style={{ width: '100%', maxWidth: compact ? '320px' : '480px', height: 'auto', overflow: 'visible' }}
          role="img"
          aria-label="Illustration of the Memory Garden Tree blooming with leaves and blossoms"
        >
          {/* Ground & Gentle Mound */}
          <ellipse cx="200" cy="225" rx="140" ry="14" fill="#E8DFD4" />
          <ellipse cx="200" cy="223" rx="120" ry="10" fill="#D4E6D8" />

          {/* Gentle Grass Sprouts */}
          <path d="M140 220 Q135 205 130 200 Q138 208 142 220" fill="#6E8B74" />
          <path d="M155 221 Q160 206 168 202 Q163 210 158 221" fill="#8BA891" />
          <path d="M245 221 Q240 206 235 201 Q242 209 247 221" fill="#8BA891" />
          <path d="M260 220 Q265 204 272 198 Q268 208 262 220" fill="#6E8B74" />

          {/* Trunk & Main Branches (Deep Forest Earth) */}
          <path
            d="M192 223 Q193 170 185 140 Q175 110 150 90 Q170 95 186 115 Q196 130 198 150 Q204 130 216 110 Q235 85 255 75 Q238 88 224 110 Q212 135 208 223 Z"
            fill="#534032"
          />
          {/* Secondary Higher Branch */}
          <path
            d="M196 135 Q198 95 190 70 Q205 80 203 125 Z"
            fill="#534032"
          />

          {/* Dynamic Growth: Cognitive Leaves (Sage Green #6E8B74 & #8BA891) */}
          {/* Leaf 1 (Left branch) */}
          <path
            d="M150 90 C130 85 120 70 125 55 C140 58 155 72 150 90 Z"
            fill="#6E8B74"
            stroke="#294438"
            strokeWidth="1.5"
          />
          <path d="M130 75 Q140 73 148 88" stroke="#E4F0E6" strokeWidth="1" fill="none" />

          {/* Leaf 2 (Upper Left) */}
          <path
            d="M170 85 C160 65 162 48 175 40 C182 52 182 72 170 85 Z"
            fill="#8BA891"
            stroke="#294438"
            strokeWidth="1.5"
          />

          {/* Leaf 3 (Top Center) */}
          <path
            d="M190 70 C185 45 195 30 205 28 C212 40 205 60 190 70 Z"
            fill="#6E8B74"
            stroke="#294438"
            strokeWidth="1.5"
          />

          {/* Leaf 4 (Right Upper) */}
          <path
            d="M216 100 C225 80 240 70 252 75 C250 88 238 100 216 100 Z"
            fill="#8BA891"
            stroke="#294438"
            strokeWidth="1.5"
          />

          {/* Leaf 5 (Right Branch) */}
          <path
            d="M255 75 C275 70 288 80 285 95 C270 95 258 85 255 75 Z"
            fill="#6E8B74"
            stroke="#294438"
            strokeWidth="1.5"
          />

          {/* Leaf 6 (Outer Foliage) */}
          <path
            d="M135 110 C115 115 105 130 112 142 C125 138 135 125 135 110 Z"
            fill="#A2C2A8"
            stroke="#294438"
            strokeWidth="1.5"
          />

          {/* Dynamic Growth: Medicine Blossoms (Soft Terracotta #C97A5A & Rose #F5E0D8) */}
          {medsTaken >= 1 && (
            <g transform="translate(145, 65)">
              {/* Petals */}
              <circle cx="0" cy="-7" r="6" fill="#F5E0D8" />
              <circle cx="7" cy="-2" r="6" fill="#F5E0D8" />
              <circle cx="4" cy="6" r="6" fill="#F5E0D8" />
              <circle cx="-5" cy="5" r="6" fill="#F5E0D8" />
              <circle cx="-7" cy="-3" r="6" fill="#F5E0D8" />
              {/* Center */}
              <circle cx="0" cy="0" r="4.5" fill="#C97A5A" />
            </g>
          )}

          {medsTaken >= 2 && (
            <g transform="translate(250, 68)">
              {/* Petals */}
              <circle cx="0" cy="-7" r="6.5" fill="#F5E0D8" />
              <circle cx="7" cy="-2" r="6.5" fill="#F5E0D8" />
              <circle cx="4" cy="6" r="6.5" fill="#F5E0D8" />
              <circle cx="-5" cy="5" r="6.5" fill="#F5E0D8" />
              <circle cx="-7" cy="-3" r="6.5" fill="#F5E0D8" />
              {/* Center */}
              <circle cx="0" cy="0" r="4.5" fill="#E5B85C" />
            </g>
          )}

          {/* Dynamic Growth: Hydration Dew Drops (River Blue #709CB5) */}
          {waterGlasses >= 2 && (
            <g transform="translate(125, 95)">
              <path d="M0 -7 C-4 0, -4 4, 0 6 C4 4, 4 0, 0 -7 Z" fill="#709CB5" opacity="0.9" />
            </g>
          )}
          {waterGlasses >= 4 && (
            <g transform="translate(265, 95)">
              <path d="M0 -7 C-4 0, -4 4, 0 6 C4 4, 4 0, 0 -7 Z" fill="#709CB5" opacity="0.9" />
            </g>
          )}
          {waterGlasses >= 6 && (
            <g transform="translate(200, 35)">
              <path d="M0 -7 C-4 0, -4 4, 0 6 C4 4, 4 0, 0 -7 Z" fill="#709CB5" opacity="0.9" />
            </g>
          )}

          {/* Central Flower of Radiance (Games + Routines bonus) */}
          {growthScore >= 4 && (
            <g transform="translate(198, 80)">
              <circle cx="0" cy="-8" r="7" fill="#F5E0D8" />
              <circle cx="8" cy="-2" r="7" fill="#F5E0D8" />
              <circle cx="5" cy="7" r="7" fill="#F5E0D8" />
              <circle cx="-5" cy="7" r="7" fill="#F5E0D8" />
              <circle cx="-8" cy="-2" r="7" fill="#F5E0D8" />
              <circle cx="0" cy="0" r="5" fill="#C97A5A" />
              <circle cx="0" cy="0" r="2.5" fill="#E5B85C" />
            </g>
          )}
        </svg>
      </div>

      {/* Garden Growth Metrics Key */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginTop: '1.25rem',
        paddingTop: '1.25rem',
        borderTop: '1.5px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#6E8B74' }} />
          <span>{gamesPlayed} Games Played</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#C97A5A' }} />
          <span>{medsTaken} Meds Confirmed</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#709CB5' }} />
          <span>{waterGlasses} Glasses of Water</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#E5B85C' }} />
          <span>{routinesDone} Routines Done</span>
        </div>
      </div>
    </div>
  );
};

export default MemoryGarden;
