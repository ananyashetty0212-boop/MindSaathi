// frontend/src/services/api.js

const API_BASE = '/api';
const SESSION_KEY = 'mindsaathi_session';

// ----------------------------------------------------
// SESSION HELPERS
// ----------------------------------------------------

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read MindSaathi session:', error);
    return null;
  }
}

export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getToken() {
  const session = getSession();
  return session?.token || null;
}

export function getElderId() {
  const session = getSession();

  return (
    session?.elder?.id ||
    session?.elder?._id ||
    session?.elders?.[0]?.id ||
    session?.elders?.[0]?._id ||
    null
  );
}

// ----------------------------------------------------
// GENERIC REQUEST
// ----------------------------------------------------

async function request(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok) {
    const message =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

// ----------------------------------------------------
// HEALTH
// ----------------------------------------------------

export async function checkHealth() {
  return request('/health');
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

export async function registerCaregiver(data) {
  return request('/auth/caregiver/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginCaregiver(data) {
  return request('/auth/caregiver/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginElder(pin) {
  return request('/auth/elder/login', {
    method: 'POST',
    body: JSON.stringify({
      pin,
    }),
  });
}

export async function getMe() {
  return request('/auth/me');
}

export async function getCurrentProfile() {
  return getMe();
}

// ----------------------------------------------------
// COGNITIVE GAMES
// ----------------------------------------------------

export async function evaluateCognitiveSession(data) {
  const elderId = getElderId();

  return request('/cognitive/evaluate', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      patientId: data?.patientId || elderId,
      elderId: data?.elderId || elderId,
    }),
  });
}

export async function getCognitiveHistory() {
  const elderId = getElderId();

  const query = elderId
    ? `?patientId=${encodeURIComponent(elderId)}`
    : '';

  return request(`/cognitive/history${query}`);
}

// ----------------------------------------------------
// REMINDERS
// ----------------------------------------------------

export async function getReminders() {
  const elderId = getElderId();

  const query = elderId
    ? `?patientId=${encodeURIComponent(elderId)}`
    : '';

  return request(`/reminders${query}`);
}

export async function updateReminderStatus(
  reminderId,
  status,
  note = ''
) {
  return request(`/reminders/${encodeURIComponent(reminderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      note,
    }),
  });
}

// ----------------------------------------------------
// CAREGIVER
// ----------------------------------------------------

export async function getCaregiverOverview(elderId = null) {
  const selectedElderId = elderId || getElderId();

  const query = selectedElderId
    ? `?patientId=${encodeURIComponent(selectedElderId)}`
    : '';

  return request(`/caregiver/overview${query}`);
}

// ----------------------------------------------------
// API OBJECT
//
// AuthContext.jsx expects:
// import { api } from '../services/api'
//
// So we explicitly export `api` here.
// ----------------------------------------------------

export const api = {
  getSession,
  saveSession,
  clearSession,
  getToken,
  getElderId,

  request,

  checkHealth,

  registerCaregiver,
  loginCaregiver,
  loginElder,
  getMe,
  getCurrentProfile,

  evaluateCognitiveSession,
  getCognitiveHistory,

  getReminders,
  updateReminderStatus,

  getCaregiverOverview,
};

// Default export as well, so either import style works:
// import api from '../services/api'
// OR
// import { api } from '../services/api'

export default api;