import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const predefinedUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'tecnico', password: 'tecnico123' },
  { username: 'supervisor', password: 'supervisor123' },
];

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (username, password) => {
    const user = predefinedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);