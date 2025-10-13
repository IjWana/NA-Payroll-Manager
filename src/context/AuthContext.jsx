import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ id: 1, name: 'Admin User', role: 'admin' });
  const [token, setToken] = useState('dev-token');

  const login = (username, password) => {
    // mock
    setUser({ id: 1, name: 'Admin User', role: 'admin' });
    setToken('dev-token');
  };
  const logout = () => {
    setUser(null); setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
