import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const ElderActionCard = ({
  to,
  onClick,
  icon,
  iconBg = 'var(--primary-soft)',
  iconColor = 'var(--primary-dark)',
  title,
  subtitle,
  badgeText,
  borderColor = 'var(--border)',
  actionText = 'Open'
}) => {
  const content = (
    <>
      {badgeText && <span className="elder-action-badge">{badgeText}</span>}

      <div>
        <div className="elder-action-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
        <h2 className="elder-action-title">{title}</h2>
        <p className="elder-action-sub">{subtitle}</p>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginTop: '1.25rem',
        color: iconColor,
        fontWeight: 800,
        fontSize: '1.2rem'
      }}>
        <span>{actionText}</span>
        <ArrowRight size={22} />
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="elder-action-box"
        style={{ borderLeft: `8px solid ${borderColor}` }}
        aria-label={`${title}: ${subtitle}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className="elder-action-box"
      style={{ borderLeft: `8px solid ${borderColor}`, cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      aria-label={`${title}: ${subtitle}`}
    >
      {content}
    </div>
  );
};

export default ElderActionCard;
