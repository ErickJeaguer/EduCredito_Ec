'use client';

import { useContext } from 'react';
import { AuthContext, type AuthContextType, AuthProvider } from '../contexts/AuthContext';

/**
 * Hook personalizado para acceder al estado y métodos de autenticación (login, register, logout, profile).
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ejecutarse obligatoriamente dentro del envoltorio <AuthProvider>');
  }
  return context;
}

export { AuthProvider, AuthContext, type AuthContextType };
