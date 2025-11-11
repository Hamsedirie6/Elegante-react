import React, { createContext, useContext } from 'react';

export type AuthState = {
  isAuthenticated: boolean;
  roles: string[];
};

const AuthContext = createContext<AuthState>({ isAuthenticated: false, roles: [] });

export function AuthProvider({ value, children }: { value: AuthState; children: React.ReactNode }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

