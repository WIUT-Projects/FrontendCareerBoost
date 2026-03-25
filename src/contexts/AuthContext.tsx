import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '@/services/authService';
import type { StoredSession } from '@/services/authService';
import { startConnection, stopConnection } from '@/services/signalRService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (data: StoredSession) => void;
  signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = authService.loadSession();
    if (stored) {
      setUser(stored.user);
      setProfile(stored.profile);
      setSession({ access_token: stored.accessToken, user: stored.user });
      startConnection(stored.accessToken);
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback((data: StoredSession) => {
    authService.saveSession(data);
    setUser(data.user);
    setProfile(data.profile);
    setSession({ access_token: data.accessToken, user: data.user });
    startConnection(data.accessToken);
  }, []);

  const signOut = useCallback(async () => {
    await stopConnection();
    authService.clearSession();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, session, isAuthenticated: !!user, isLoading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
