import React from 'react';
import { Droplet, Plus, Check } from 'lucide-react';
import { speech } from '../../services/speechService';
import confetti from 'canvas-confetti';

export const WaterProgress = ({
  glasses = 4,
  target = 8,
  onAddGlass
}) => {
  const handleAdd = () => {
    if (onAddGlass) {
      onAddGlass();
    }
  };

  return (
    <div className="hydration-widget" aria-label="Hydration tracker">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-blue-soft)',
          color: 'var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem'
        }}>
          💧
        </div>
        <div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>
            Water & Hydration Today
          </h3>
          <p style={{ fontSize: '1.12rem', color: 'var(--text-muted)' }}>
            <strong>{glasses} of {target} glasses</strong> enjoyed so far. Keeping your mind clear and refreshed.
          </p>
        </div>
      </div>

      {/* Tactile Water Drops Array */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="water-drops-row">
          {Array.from({ length: target }).map((_, idx) => {
            const isFilled = idx < glasses;
            return (
              <div
                key={idx}
                className={`water-drop-item ${isFilled ? 'filled' : ''}`}
                title={`Glass ${idx + 1} of ${target}`}
                aria-label={`Glass ${idx + 1}: ${isFilled ? 'Drank' : 'Pending'}`}
              >
                {isFilled ? <Check size={20} strokeWidth={3} /> : <Droplet size={18} />}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="btn-elderly btn-cream-action"
          style={{
            minHeight: '52px',
            padding: '0.65rem 1.4rem',
            fontSize: '1.1rem',
            borderRadius: 'var(--radius-full)'
          }}
          aria-label="Add one glass of water"
        >
          <Plus size={20} color="var(--accent-blue)" />
          <span>+ Log 1 Glass</span>
        </button>
      </div>
    </div>
  );
};

export default WaterProgress;
