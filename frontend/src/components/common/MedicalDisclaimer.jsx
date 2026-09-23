import React from 'react';
import { ShieldCheck } from 'lucide-react';

const MedicalDisclaimer = () => {
  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '0.5rem',
        marginBottom: '1rem'
      }}
      role="note"
      aria-label="Medical information notice"
    >
      {/* Icon */}
      <div
        style={{
          width: '42px',
          height: '42px',
          minWidth: '42px',
          borderRadius: '50%',
          background: 'var(--primary-soft)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ShieldCheck size={23} />
      </div>

      {/* Notice */}
      <div>
        <strong
          style={{
            display: 'block',
            color: 'var(--primary-dark)',
            fontSize: '1rem',
            marginBottom: '0.3rem'
          }}
        >
          MindSaathi Wellness Notice
        </strong>

        <p
          style={{
            margin: 0,
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.55
          }}
        >
          MindSaathi provides gentle, assistive cognitive activities
          and daily routine support for older adults and their
          families. It is not a medical diagnostic device and does
          not diagnose dementia or Alzheimer's disease.
        </p>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;