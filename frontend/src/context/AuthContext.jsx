import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { api } from '../services/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'mindsaathi_session';

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error('MindSaathi: Failed to read saved session:', error);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readSession());

  /*
   * Keep sessionStorage synchronized with React state.
   */
  useEffect(() => {
    try {
      if (session?.token) {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify(session)
        );
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch (error) {
      console.error(
        'MindSaathi: Failed to save authentication session:',
        error
      );
    }
  }, [session]);

  /*
   * Main login function.
   *
   * LoginPage should use this instead of only calling
   * api.saveSession().
   */
  const login = (data) => {
    if (!data) {
      return;
    }

    setSession(data);

    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error(
        'MindSaathi: Failed to persist login session:',
        error
      );
    }
  };

  /*
   * Logout from both React state and sessionStorage.
   */
  const logout = () => {
    setSession(null);

    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error(
        'MindSaathi: Failed to clear login session:',
        error
      );
    }
  };

  /*
   * Refresh the currently authenticated user's profile
   * from the backend.
   */
  const refreshProfile = async () => {
    try {
      const data = await api.getMe();

      setSession((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          ...data,

          elder:
            data.elder ||
            current.elder ||
            null,

          elders:
            data.elders ||
            current.elders ||
            []
        };
      });

      return data;
    } catch (error) {
      console.error(
        'MindSaathi: Failed to refresh profile:',
        error
      );

      throw error;
    }
  };

  /*
   * Allows pages/components to update only part of the
   * current authentication session.
   */
  const updateSession = (patch) => {
    setSession((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        ...patch
      };
    });
  };

  /*
   * If another component or browser action changes
   * sessionStorage, keep the React state synchronized.
   *
   * This is especially useful when LoginPage saves a
   * session directly through api.saveSession().
   */
  useEffect(() => {
    const handleStorageChange = () => {
      setSession(readSession());
    };

    window.addEventListener(
      'storage',
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      session,

      isAuthenticated:
        Boolean(session?.token),

      role:
        session?.role ||
        null,

      token:
        session?.token ||
        null,

      caregiver:
        session?.caregiver ||
        null,

      elders:
        session?.elders ||
        (session?.elder
          ? [session.elder]
          : []),

      elderProfile:
        session?.elder ||
        session?.elders?.[0] ||
        null,

      login,

      logout,

      refreshProfile,

      updateSession
    }),
    [session]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
};