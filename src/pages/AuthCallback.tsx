import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as authService from '@/services/authService';

/**
 * /auth/callback
 *
 * Backend Google OAuth oqimi tugagandan so'ng foydalanuvchi shu sahifaga
 * yo'naltiriladi. URL parametrlaridan tokenlar olinib, profil yuklanadi,
 * AuthContext yangilanadi va role bo'yicha tegishli sahifaga o'tiladi.
 *
 * URL format: /auth/callback?access_token=...&refresh_token=...&expires_at=...
 */
export default function AuthCallbackPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    // Strict Mode da ikki marta ishlamasligi uchun
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresAt = params.get('expires_at');

    if (!accessToken || !refreshToken) {
      navigate('/login?error=auth_failed', { replace: true });
      return;
    }

    const tokens: authService.AuthTokens = {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    authService
      .buildSession(tokens)
      .then((session) => {
        signIn(session);
        const redirect = authService.getRedirectPathByRole(session.profile.role);
        navigate(redirect, { replace: true });
      })
      .catch(() => {
        navigate('/login?error=auth_failed', { replace: true });
      });
  }, [signIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Kirish amalga oshirilmoqda…</p>
      </div>
    </div>
  );
}
