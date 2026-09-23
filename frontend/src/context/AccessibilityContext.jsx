import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const { role, elderProfile, caregiver } = useAuth();
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('ms_high_contrast') === 'true');
  const [fontScale, setFontScale] = useState(() => localStorage.getItem('ms_font_scale') || 'normal');
  const userRole = role || 'guest';

  const patientProfile = elderProfile ? {
    id: elderProfile.id,
    name: elderProfile.name,
    honorific: elderProfile.age >= 65 ? 'Elder' : 'Family Member',
    age: elderProfile.age,
    location: elderProfile.region,
    preferredLanguage: elderProfile.preferredLanguage,
    caregiverName: caregiver?.fullName || 'Your caregiver',
    caregiverPhone: caregiver?.phone || elderProfile.emergencyContactPhone || ''
  } : null;

  useEffect(() => {
    localStorage.setItem('ms_high_contrast', highContrast);
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('ms_font_scale', fontScale);
    document.body.classList.remove('font-scale-lg', 'font-scale-xl');
    if (fontScale === 'large') document.body.classList.add('font-scale-lg');
    if (fontScale === 'xlarge') document.body.classList.add('font-scale-xl');
  }, [fontScale]);

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const cycleFontScale = () => setFontScale(current => current === 'normal' ? 'large' : current === 'large' ? 'xlarge' : 'normal');
  const switchRole = () => {};

  return (
    <AccessibilityContext.Provider value={{ highContrast, toggleHighContrast, fontScale, cycleFontScale, userRole, switchRole, patientProfile }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
};
