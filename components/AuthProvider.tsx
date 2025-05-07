// 


// components/AuthProvider.tsx
// Fournit la valeur du contexte à l'application

import React, { ReactNode } from 'react';
// CORRECTION DES IMPORTS :
import { AuthContext, AuthData } from '@/hooks/useAuth'; // Importer le Contexte et le Type depuis useAuth.ts
import { useAuthLogic } from '@/hooks/useAuthLogic'; // Importer la Logique depuis useAuthLogic.ts

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // 1. Appeler le hook qui contient TOUTE la logique UNE SEULE FOIS
  const auth: AuthData = useAuthLogic();

  // Log utile pour le débogage du Provider
  // console.log('>>> AuthProvider passing value:',
  //   {
  //     sessionInitialized: auth.sessionInitialized,
  //     isLoading: auth.isLoading,
  //     sessionValid: !!auth.session,
  //     userRoles: auth.userRoles,
  //     actionLoading: auth.actionLoading // Vérifier que cette valeur est correcte
  //   }
  // );

  // 2. Fournir la valeur obtenue via le Provider du Contexte
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};