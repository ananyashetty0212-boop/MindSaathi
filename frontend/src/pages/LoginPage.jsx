import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  Leaf,
  LockKeyhole,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  Users,
  Volume2
} from 'lucide-react';

import AudioSpeakButton from '../components/common/AudioSpeakButton';
import MedicalDisclaimer from '../components/common/MedicalDisclaimer';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const initialCaregiverForm = {
  caregiverName: '',
  email: '',
  phone: '',
  password: '',
  relationship: '',

  elderName: '',
  elderAge: '',
  preferredLanguage: 'English',
  region: '',

  emergencyContact: '',
  wakeTime: '07:00',
  sleepTime: '21:00',
  waterGoal: '6'
};

function BrainIcon({ size = 28 }) {
  return <Brain size={size} strokeWidth={1.8} />;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const { speak } = useAccessibility();
  const { login } = useAuth();

  const [role, setRole] = useState('caregiver');

  const [mode, setMode] = useState('login');

  const [caregiverForm, setCaregiverForm] = useState(
    initialCaregiverForm
  );

  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [caregiverPassword, setCaregiverPassword] = useState('');

  const [elderPin, setElderPin] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [registrationComplete, setRegistrationComplete] =
    useState(false);

  const [registeredElder, setRegisteredElder] = useState(null);

  const updateCaregiverField = (field, value) => {
    setCaregiverForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setError('');
    setRegistrationComplete(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  const handleCaregiverLogin = async (event) => {
    event.preventDefault();

    setError('');

    if (!caregiverEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!caregiverPassword) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const result = await api.loginCaregiver({
        email: caregiverEmail.trim(),
        password: caregiverPassword
      });

      /*
       * IMPORTANT:
       * Use AuthContext.login() so the protected routes
       * immediately know that the caregiver is authenticated.
       */
      login(result);

      /*
       * Small delay is not required for authentication.
       * Navigation can happen immediately after login().
       */
      navigate('/caregiver');
    } catch (err) {
      console.error('Caregiver login failed:', err);

      setError(
        err?.message ||
          'Unable to sign in. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCaregiverRegistration = async (event) => {
    event.preventDefault();

    setError('');

    const form = caregiverForm;

    if (!form.caregiverName.trim()) {
      setError('Please enter the caregiver name.');
      return;
    }

    if (!form.email.trim()) {
      setError('Please enter the caregiver email.');
      return;
    }

    if (!form.phone.trim()) {
      setError('Please enter the caregiver phone number.');
      return;
    }

    if (!form.password || form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (!form.relationship.trim()) {
      setError('Please enter the relationship with the older adult.');
      return;
    }

    if (!form.elderName.trim()) {
      setError('Please enter the older adult name.');
      return;
    }

    if (!form.elderAge) {
      setError('Please enter the older adult age.');
      return;
    }

    if (
      Number(form.elderAge) < 40 ||
      Number(form.elderAge) > 120
    ) {
      setError('Please enter a valid age.');
      return;
    }

    if (!form.preferredLanguage) {
      setError('Please select a preferred language.');
      return;
    }

    if (!form.emergencyContact.trim()) {
      setError('Please enter an emergency contact.');
      return;
    }

    try {
      setLoading(true);

      const result = await api.registerCaregiver({
        caregiverName: form.caregiverName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        relationship: form.relationship.trim(),

        elderName: form.elderName.trim(),
        elderAge: Number(form.elderAge),
        preferredLanguage: form.preferredLanguage,
        region: form.region.trim(),

        emergencyContact: form.emergencyContact.trim(),
        wakeTime: form.wakeTime,
        sleepTime: form.sleepTime,
        waterGoal: Number(form.waterGoal) || 6
      });

      /*
       * IMPORTANT:
       * Save authentication through AuthContext.
       * This updates React state AND sessionStorage.
       */
      login(result);

      const elder =
        result?.elder ||
        result?.elders?.[0] ||
        null;

      setRegisteredElder(elder);

      /*
       * Show the success screen first.
       *
       * The caregiver can see the Elder PIN before opening
       * the caregiver dashboard.
       */
      setRegistrationComplete(true);

      /*
       * Reset registration form for future use.
       */
      setCaregiverForm(initialCaregiverForm);
    } catch (err) {
      console.error(
        'Caregiver registration failed:',
        err
      );

      if (err?.status === 409) {
        setError(
          'An account with this email already exists. Please use another email or sign in instead.'
        );
      } else {
        setError(
          err?.message ||
            'Unable to create the account. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleElderLogin = async (event) => {
    event.preventDefault();

    setError('');

    const cleanPin = elderPin.replace(/\D/g, '');

    if (cleanPin.length !== 4) {
      setError('Please enter your 4-digit Elder PIN.');
      return;
    }

    try {
      setLoading(true);

      const result = await api.loginElder(cleanPin);

      /*
       * IMPORTANT:
       * Use AuthContext.login() here as well.
       */
      login(result);

      navigate('/elderly');
    } catch (err) {
      console.error('Elder login failed:', err);

      setError(
        err?.message ||
          'That PIN could not be verified. Please check it and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openCaregiverDashboard = () => {
    setRegistrationComplete(false);
    navigate('/caregiver');
  };

  const handleUseAnotherAccount = () => {
    api.clearSession();

    /*
     * AuthContext logout also clears its own React state.
     */
    window.location.reload();
  };

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(229, 184, 92, 0.15),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 20%,
              rgba(169, 155, 203, 0.14),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #FFF9F0 0%,
              #FFFDF8 52%,
              #F7F2E9 100%
            );
          color: #294438;
          padding: 28px;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .login-shell {
          width: min(1120px, 100%);
          margin: 0 auto;
          min-height: calc(100vh - 56px);
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 28px;
          align-items: center;
        }

        .welcome-panel {
          padding: 28px 18px;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }

        .brand-icon {
          width: 58px;
          height: 58px;
          border-radius: 20px;
          background: #E4F0E6;
          color: #6E8B74;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 30px rgba(110, 139, 116, 0.12);
        }

        .brand-name {
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .brand-subtitle {
          font-size: 14px;
          color: #718078;
          margin-top: 3px;
        }

        .welcome-panel h1 {
          font-size: clamp(38px, 5vw, 58px);
          line-height: 1.02;
          letter-spacing: -2px;
          margin: 0 0 18px;
          max-width: 570px;
        }

        .welcome-panel h1 span {
          color: #C97A5A;
        }

        .welcome-copy {
          font-size: 18px;
          line-height: 1.7;
          color: #66756D;
          max-width: 550px;
          margin-bottom: 28px;
        }

        .garden-preview {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .garden-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 11px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(110, 139, 116, 0.16);
          font-size: 14px;
          font-weight: 700;
        }

        .garden-chip svg {
          color: #6E8B74;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(110, 139, 116, 0.16);
          border-radius: 32px;
          padding: 30px;
          box-shadow:
            0 24px 70px rgba(78, 70, 55, 0.10),
            0 4px 18px rgba(78, 70, 55, 0.04);
          backdrop-filter: blur(16px);
        }

        .back-button {
          border: none;
          background: transparent;
          color: #718078;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          padding: 6px 0;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .back-button:hover {
          color: #294438;
        }

        .auth-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 22px;
        }

        .auth-heading h2 {
          font-size: 30px;
          margin: 0 0 6px;
          letter-spacing: -0.8px;
        }

        .auth-heading p {
          margin: 0;
          color: #758078;
          line-height: 1.5;
        }

        .speak-button {
          flex-shrink: 0;
        }

        .role-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: #F5F0E7;
          padding: 6px;
          border-radius: 18px;
          margin-bottom: 22px;
        }

        .role-button {
          min-height: 54px;
          border: none;
          border-radius: 14px;
          background: transparent;
          color: #718078;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-weight: 800;
          font-size: 15px;
        }

        .role-button.active {
          background: #FFFDF8;
          color: #294438;
          box-shadow: 0 5px 16px rgba(80, 65, 45, 0.08);
        }

        .role-button svg {
          flex-shrink: 0;
        }

        .mode-switch {
          display: flex;
          gap: 18px;
          margin-bottom: 20px;
          border-bottom: 1px solid #E9E1D5;
        }

        .mode-button {
          border: none;
          background: transparent;
          padding: 0 2px 12px;
          color: #8A928D;
          cursor: pointer;
          font-weight: 800;
          font-size: 15px;
          position: relative;
        }

        .mode-button.active {
          color: #294438;
        }

        .mode-button.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 3px;
          border-radius: 3px;
          background: #C97A5A;
        }

        .form-section {
          margin-top: 18px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 15px;
          font-weight: 900;
          margin: 23px 0 12px;
          color: #52675B;
        }

        .section-title svg {
          color: #6E8B74;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 13px;
          font-weight: 800;
          color: #526158;
        }

        .input-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #8BA092;
          pointer-events: none;
        }

        .field input,
        .field select {
          width: 100%;
          box-sizing: border-box;
          min-height: 50px;
          border: 1px solid #DED9CE;
          border-radius: 14px;
          background: #FFFDF9;
          color: #294438;
          padding: 0 14px;
          font-size: 15px;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .field input.with-icon,
        .field select.with-icon {
          padding-left: 43px;
        }

        .field input:focus,
        .field select:focus {
          border-color: #6E8B74;
          box-shadow: 0 0 0 4px rgba(110, 139, 116, 0.10);
        }

        .password-toggle {
          position: absolute;
          right: 9px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #7B8980;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
        }

        .password-input {
          padding-right: 48px !important;
        }

        .error-box {
          margin-top: 15px;
          padding: 13px 15px;
          border-radius: 14px;
          background: #F8E8E1;
          color: #9A503B;
          border: 1px solid #E8C9BC;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 700;
        }

        .primary-button {
          width: 100%;
          min-height: 55px;
          border: none;
          border-radius: 16px;
          background: #6E8B74;
          color: white;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          font-size: 16px;
          font-weight: 900;
          margin-top: 20px;
          box-shadow: 0 10px 25px rgba(110, 139, 116, 0.20);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(110, 139, 116, 0.25);
        }

        .primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .secondary-note {
          text-align: center;
          color: #7C857F;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 15px;
        }

        .pin-container {
          text-align: center;
          padding: 10px 0 5px;
        }

        .pin-icon {
          width: 72px;
          height: 72px;
          border-radius: 24px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          background: #F5E0D8;
          color: #C97A5A;
        }

        .pin-container h3 {
          font-size: 24px;
          margin: 0 0 8px;
        }

        .pin-container p {
          color: #748078;
          line-height: 1.55;
          margin: 0 auto 22px;
          max-width: 390px;
        }

        .pin-input {
          width: 100%;
          box-sizing: border-box;
          min-height: 70px;
          border-radius: 18px;
          border: 2px solid #DED9CE;
          background: #FFFDF9;
          text-align: center;
          letter-spacing: 15px;
          padding-left: 15px;
          font-size: 32px;
          font-weight: 900;
          color: #294438;
          outline: none;
        }

        .pin-input:focus {
          border-color: #6E8B74;
          box-shadow: 0 0 0 5px rgba(110, 139, 116, 0.10);
        }

        .pin-help {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          text-align: left;
          background: #F3F1EA;
          padding: 13px;
          border-radius: 14px;
          margin-top: 17px;
          color: #66746C;
          font-size: 13px;
          line-height: 1.5;
        }

        .pin-help svg {
          color: #6E8B74;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(41, 68, 56, 0.32);
          backdrop-filter: blur(8px);
          display: grid;
          place-items: center;
          padding: 20px;
          z-index: 1000;
        }

        .success-card {
          width: min(520px, 100%);
          background: #FFFDF8;
          border-radius: 30px;
          padding: 32px;
          box-shadow: 0 30px 80px rgba(41, 68, 56, 0.20);
          text-align: center;
        }

        .success-icon {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #E4F0E6;
          color: #6E8B74;
          margin: 0 auto 18px;
        }

        .success-card h2 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .success-card p {
          color: #718078;
          line-height: 1.55;
          margin: 0 auto 20px;
          max-width: 420px;
        }

        .pin-display {
          background: #F5E0D8;
          border: 1px solid #E8C9BC;
          border-radius: 20px;
          padding: 18px;
          margin: 18px 0;
        }

        .pin-display-label {
          color: #8B5D4C;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 6px;
        }

        .pin-display-value {
          font-size: 40px;
          letter-spacing: 8px;
          font-weight: 900;
          color: #9A503B;
        }

        .success-actions {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .outline-button {
          width: 100%;
          min-height: 52px;
          border-radius: 15px;
          border: 1px solid #CBD4CD;
          background: #FFFDF8;
          color: #52675B;
          font-weight: 900;
          cursor: pointer;
        }

        .notice-wrap {
          margin-top: 22px;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #87918B;
          font-size: 12px;
          margin-top: 18px;
        }

        .account-switch {
          width: 100%;
          border: none;
          background: transparent;
          color: #6E8B74;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          margin-top: 10px;
        }

        @media (max-width: 900px) {
          .login-shell {
            grid-template-columns: 1fr;
            max-width: 680px;
          }

          .welcome-panel {
            padding: 10px 5px 0;
          }

          .welcome-panel h1 {
            font-size: 42px;
          }
        }

        @media (max-width: 560px) {
          .login-page {
            padding: 15px;
          }

          .login-shell {
            min-height: calc(100vh - 30px);
          }

          .auth-card {
            padding: 21px;
            border-radius: 25px;
          }

          .welcome-panel {
            display: none;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .auth-heading h2 {
            font-size: 25px;
          }

          .role-button {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="login-shell">

        {/* LEFT / WELCOME AREA */}
        <section className="welcome-panel">

          <div className="brand-row">
            <div className="brand-icon">
              <BrainIcon size={30} />
            </div>

            <div>
              <div className="brand-name">
                MindSaathi
              </div>

              <div className="brand-subtitle">
                Living Memory Garden
              </div>
            </div>
          </div>

          <h1>
            A gentle companion for
            <span> everyday memory.</span>
          </h1>

          <p className="welcome-copy">
            MindSaathi brings cognitive activities,
            daily reminders and caregiver support
            together in one simple, welcoming space.
          </p>

          <div className="garden-preview">

            <div className="garden-chip">
              <Leaf size={17} />
              Cognitive activities
            </div>

            <div className="garden-chip">
              <Heart size={17} />
              Daily wellbeing
            </div>

            <div className="garden-chip">
              <Sparkles size={17} />
              Adaptive support
            </div>

            <div className="garden-chip">
              <Shield size={17} />
              Private & secure
            </div>

          </div>

        </section>

        {/* AUTH CARD */}
        <section className="auth-card">

          <button
            className="back-button"
            type="button"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={17} />
            Back to home
          </button>

          <div className="auth-heading">

            <div>
              <h2>
                Welcome to MindSaathi
              </h2>

              <p>
                Choose how you would like to continue.
              </p>
            </div>

            <div className="speak-button">
              <AudioSpeakButton
                text={
                  role === 'caregiver'
                    ? 'Caregiver login and registration'
                    : 'Elder login using your four digit PIN'
                }
              />
            </div>

          </div>

          {/* ROLE SWITCH */}
          <div className="role-switch">

            <button
              type="button"
              className={`role-button ${
                role === 'caregiver'
                  ? 'active'
                  : ''
              }`}
              onClick={() => switchRole('caregiver')}
            >
              <Users size={20} />
              Caregiver
            </button>

            <button
              type="button"
              className={`role-button ${
                role === 'elderly'
                  ? 'active'
                  : ''
              }`}
              onClick={() => switchRole('elderly')}
            >
              <Heart size={20} />
              Older Adult
            </button>

          </div>

          {/* CAREGIVER */}
          {role === 'caregiver' && (
            <>
              <div className="mode-switch">

                <button
                  type="button"
                  className={`mode-button ${
                    mode === 'login'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => switchMode('login')}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  className={`mode-button ${
                    mode === 'register'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => switchMode('register')}
                >
                  Create account
                </button>

              </div>

              {/* CAREGIVER LOGIN */}
              {mode === 'login' && (
                <form
                  onSubmit={handleCaregiverLogin}
                >

                  <div className="form-grid">

                    <div className="field full">
                      <label>
                        Email address
                      </label>

                      <div className="input-wrap">

                        <Mail
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon"
                          type="email"
                          placeholder="you@example.com"
                          value={caregiverEmail}
                          onChange={(event) =>
                            setCaregiverEmail(
                              event.target.value
                            )
                          }
                          autoComplete="email"
                        />

                      </div>
                    </div>

                    <div className="field full">
                      <label>
                        Password
                      </label>

                      <div className="input-wrap">

                        <LockKeyhole
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon password-input"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          placeholder="Enter your password"
                          value={caregiverPassword}
                          onChange={(event) =>
                            setCaregiverPassword(
                              event.target.value
                            )
                          }
                          autoComplete="current-password"
                        />

                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value
                            )
                          }
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>

                      </div>
                    </div>

                  </div>

                  {error && (
                    <div className="error-box">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? 'Signing in...'
                      : 'Open Caregiver Dashboard'}

                    {!loading && (
                      <ArrowRight size={19} />
                    )}
                  </button>

                  <div className="secondary-note">
                    Your caregiver account connects you
                    with the older adult profile you manage.
                  </div>

                </form>
              )}

              {/* CAREGIVER REGISTRATION */}
              {mode === 'register' && (
                <form
                  onSubmit={handleCaregiverRegistration}
                >

                  <div className="section-title">
                    <Users size={18} />
                    Caregiver details
                  </div>

                  <div className="form-grid">

                    <div className="field full">
                      <label>
                        Full name
                      </label>

                      <div className="input-wrap">

                        <User
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon"
                          type="text"
                          placeholder="Enter your full name"
                          value={
                            caregiverForm.caregiverName
                          }
                          onChange={(event) =>
                            updateCaregiverField(
                              'caregiverName',
                              event.target.value
                            )
                          }
                          autoComplete="name"
                        />

                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Email
                      </label>

                      <div className="input-wrap">

                        <Mail
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon"
                          type="email"
                          placeholder="Email address"
                          value={caregiverForm.email}
                          onChange={(event) =>
                            updateCaregiverField(
                              'email',
                              event.target.value
                            )
                          }
                          autoComplete="email"
                        />

                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Phone
                      </label>

                      <div className="input-wrap">

                        <Phone
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon"
                          type="tel"
                          placeholder="Phone number"
                          value={caregiverForm.phone}
                          onChange={(event) =>
                            updateCaregiverField(
                              'phone',
                              event.target.value
                            )
                          }
                          autoComplete="tel"
                        />

                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Password
                      </label>

                      <div className="input-wrap">

                        <LockKeyhole
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon password-input"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          placeholder="Minimum 6 characters"
                          value={
                            caregiverForm.password
                          }
                          onChange={(event) =>
                            updateCaregiverField(
                              'password',
                              event.target.value
                            )
                          }
                          autoComplete="new-password"
                        />

                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() =>
                            setShowPassword(
                              (value) => !value
                            )
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={19} />
                          ) : (
                            <Eye size={19} />
                          )}
                        </button>

                      </div>
                    </div>

                    <div className="field">
                      <label>
                        Relationship
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Daughter, Son, Spouse"
                        value={
                          caregiverForm.relationship
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'relationship',
                            event.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                  <div className="section-title">
                    <Heart size={18} />
                    Older adult profile
                  </div>

                  <div className="form-grid">

                    <div className="field">
                      <label>
                        Name
                      </label>

                      <input
                        type="text"
                        placeholder="Older adult's name"
                        value={
                          caregiverForm.elderName
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'elderName',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        Age
                      </label>

                      <input
                        type="number"
                        min="40"
                        max="120"
                        placeholder="Age"
                        value={
                          caregiverForm.elderAge
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'elderAge',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        Preferred language
                      </label>

                      <select
                        value={
                          caregiverForm.preferredLanguage
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'preferredLanguage',
                            event.target.value
                          )
                        }
                      >
                        <option value="English">
                          English
                        </option>

                        <option value="Hindi">
                          Hindi
                        </option>

                        <option value="Marathi">
                          Marathi
                        </option>

                        <option value="Bengali">
                          Bengali
                        </option>

                        <option value="Tamil">
                          Tamil
                        </option>

                        <option value="Telugu">
                          Telugu
                        </option>

                        <option value="Kannada">
                          Kannada
                        </option>

                        <option value="Malayalam">
                          Malayalam
                        </option>

                        <option value="Gujarati">
                          Gujarati
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Region / city
                        <span
                          style={{
                            fontWeight: 500,
                            color: '#9AA29D'
                          }}
                        >
                          {' '}
                          (optional)
                        </span>
                      </label>

                      <input
                        type="text"
                        placeholder="Optional"
                        value={
                          caregiverForm.region
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'region',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field full">
                      <label>
                        Emergency contact
                      </label>

                      <div className="input-wrap">

                        <Phone
                          className="input-icon"
                          size={18}
                        />

                        <input
                          className="with-icon"
                          type="tel"
                          placeholder="Emergency contact number"
                          value={
                            caregiverForm.emergencyContact
                          }
                          onChange={(event) =>
                            updateCaregiverField(
                              'emergencyContact',
                              event.target.value
                            )
                          }
                        />

                      </div>
                    </div>

                  </div>

                  <div className="section-title">
                    <Sparkles size={18} />
                    Daily routine
                  </div>

                  <div className="form-grid">

                    <div className="field">
                      <label>
                        Usual wake-up time
                      </label>

                      <input
                        type="time"
                        value={
                          caregiverForm.wakeTime
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'wakeTime',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        Usual sleep time
                      </label>

                      <input
                        type="time"
                        value={
                          caregiverForm.sleepTime
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'sleepTime',
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field full">
                      <label>
                        Daily water goal
                      </label>

                      <select
                        value={
                          caregiverForm.waterGoal
                        }
                        onChange={(event) =>
                          updateCaregiverField(
                            'waterGoal',
                            event.target.value
                          )
                        }
                      >
                        <option value="4">
                          4 glasses
                        </option>

                        <option value="5">
                          5 glasses
                        </option>

                        <option value="6">
                          6 glasses
                        </option>

                        <option value="7">
                          7 glasses
                        </option>

                        <option value="8">
                          8 glasses
                        </option>

                        <option value="9">
                          9 glasses
                        </option>

                        <option value="10">
                          10 glasses
                        </option>
                      </select>
                    </div>

                  </div>

                  {error && (
                    <div className="error-box">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? 'Creating account...'
                      : 'Create MindSaathi Account'}

                    {!loading && (
                      <ArrowRight size={19} />
                    )}
                  </button>

                  <div className="secondary-note">
                    Your older adult profile and secure
                    4-digit Elder PIN will be created
                    together with your caregiver account.
                  </div>

                </form>
              )}
            </>
          )}

          {/* ELDER LOGIN */}
          {role === 'elderly' && (
            <div className="pin-container">

              <div className="pin-icon">
                <KeyRound size={32} />
              </div>

              <h3>
                Welcome back
              </h3>

              <p>
                Enter the 4-digit PIN given to you
                by your caregiver.
              </p>

              <form onSubmit={handleElderLogin}>

                <input
                  className="pin-input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={elderPin}
                  onChange={(event) => {
                    const value =
                      event.target.value
                        .replace(/\D/g, '')
                        .slice(0, 4);

                    setElderPin(value);
                  }}
                  aria-label="4 digit Elder PIN"
                />

                {error && (
                  <div className="error-box">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Checking PIN...'
                    : 'Enter MindSaathi'}

                  {!loading && (
                    <ArrowRight size={19} />
                  )}
                </button>

              </form>

              <div className="pin-help">
                <Shield size={18} />

                <span>
                  Your PIN is a simple way to enter
                  MindSaathi without needing to remember
                  an email or password.
                </span>
              </div>

            </div>
          )}

          <div className="notice-wrap">
            <MedicalDisclaimer />
          </div>

          <div className="security-note">
            <Shield size={14} />
            MindSaathi uses secure account-based access.
          </div>

          <button
            type="button"
            className="account-switch"
            onClick={handleUseAnotherAccount}
          >
            Use another account
          </button>

        </section>

      </div>

      {/* REGISTRATION SUCCESS */}
      {registrationComplete && (
        <div className="success-overlay">

          <div className="success-card">

            <div className="success-icon">
              <Check size={38} strokeWidth={2.5} />
            </div>

            <h2>
              Account created successfully
            </h2>

            <p>
              The caregiver account and older adult
              profile have been created.
            </p>

            {registeredElder && (
              <>
                <div className="pin-display">

                  <div className="pin-display-label">
                    ELDER PIN
                  </div>

                  <div className="pin-display-value">
                    {registeredElder.accessPin ||
                      registeredElder.pin ||
                      '----'}
                  </div>

                </div>

                <p
                  style={{
                    fontSize: '13px',
                    marginBottom: '10px'
                  }}
                >
                  Keep this PIN safe. The older adult
                  can use it to enter their own
                  MindSaathi account.
                </p>
              </>
            )}

            <div className="success-actions">

              <button
                type="button"
                className="primary-button"
                onClick={openCaregiverDashboard}
              >
                Open Caregiver Dashboard
                <ArrowRight size={19} />
              </button>

              <button
                type="button"
                className="outline-button"
                onClick={() =>
                  setRegistrationComplete(false)
                }
              >
                Stay here
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}