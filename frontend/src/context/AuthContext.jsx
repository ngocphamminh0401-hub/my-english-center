import React, { createContext, useCallback, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_TOKEN = 'ec_token';
const STORAGE_USER = 'ec_user';

const readStorage = () => {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const user = JSON.parse(localStorage.getItem(STORAGE_USER) || 'null');
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStorage);

  const login = useCallback((user, token) => {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user ?? null,
        token: auth?.token ?? null,
        isAuthenticated: Boolean(auth),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
