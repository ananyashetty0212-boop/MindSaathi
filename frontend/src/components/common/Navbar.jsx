import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Leaf,
  Sun,
  Moon,
  Type,
  Brain,
  Pill,
  Shield,
  User
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const Navbar = () => {
  const {
    highContrast,
    toggleHighContrast,
    fontScale,
    cycleFontScale,
    userRole
  } = useAccessibility();

  const fontScaleLabel =
    fontScale === 'xlarge'
      ? 'A+++'
      : fontScale === 'large'
        ? 'A++'
        : 'A+';

  return (
    <header className="navbar" role="banner">
      <div className="nav-inner">

        {/* =====================================================
            MINDSAATHI BRAND
        ===================================================== */}
        <Link
          to="/"
          className="nav-brand"
          aria-label="MindSaathi home"
        >
          <div className="brand-icon-box">
            <Leaf size={24} />
          </div>

          <div>
            <span className="brand-title">
              MindSaathi
            </span>

            <span className="brand-subtitle">
              Living Memory Garden
            </span>
          </div>
        </Link>

        {/* =====================================================
            MAIN NAVIGATION
        ===================================================== */}
        <nav
          className="nav-links"
          aria-label="Primary Navigation"
        >
          <NavLink
            to="/elderly"
            className={({ isActive }) =>
              `nav-link-btn ${isActive ? 'active' : ''}`
            }
          >
            <Leaf size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/games"
            className={({ isActive }) =>
              `nav-link-btn ${isActive ? 'active' : ''}`
            }
          >
            <Brain size={20} />
            <span>Activities</span>
          </NavLink>

          <NavLink
            to="/reminders"
            className={({ isActive }) =>
              `nav-link-btn ${isActive ? 'active' : ''}`
            }
          >
            <Pill size={20} />
            <span>Medicines</span>
          </NavLink>

          <NavLink
            to="/caregiver"
            className={({ isActive }) =>
              `nav-link-btn ${isActive ? 'active' : ''}`
            }
          >
            <Shield size={20} />
            <span>Caregiver</span>
          </NavLink>
        </nav>

        {/* =====================================================
            ACCESSIBILITY CONTROLS
        ===================================================== */}
        <div
          className="accessibility-bar"
          role="toolbar"
          aria-label="Accessibility settings"
        >
          {/* Font Size */}
          <button
            type="button"
            className="control-btn"
            onClick={cycleFontScale}
            title="Increase text readability"
            aria-label={`Change text size. Current size: ${fontScale}`}
          >
            <Type size={18} />
            <span>{fontScaleLabel}</span>
          </button>

          {/* Contrast */}
          <button
            type="button"
            className={`control-btn ${
              highContrast ? 'active' : ''
            }`}
            onClick={toggleHighContrast}
            title="Toggle contrast mode"
            aria-label="Toggle contrast mode"
          >
            {highContrast ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}

            <span>
              {highContrast ? 'Warm' : 'Contrast'}
            </span>
          </button>

          {/* Account / Login */}
          <Link
            to="/login"
            className="control-btn"
            style={{
              background: 'var(--primary-soft)',
              borderColor: 'var(--primary-light)',
              color: 'var(--primary-dark)'
            }}
            title="Open MindSaathi account"
            aria-label="Open MindSaathi account"
          >
            <User size={18} />

            <span>
              {userRole === 'caregiver'
                ? 'Caregiver'
                : 'Account'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;