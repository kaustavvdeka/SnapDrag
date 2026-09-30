import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { UserRole } from '../../types/index.js';

interface GoogleLoginButtonProps {
  role?: UserRole;
  label?: string;
  redirectTo?: string;
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  role = 'CUSTOMER',
  label = 'Continue with Google',
  redirectTo = '/',
  className = '',
}) => {
  const { getGoogleOAuthUrl } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate the OAuth redirect URL via backend
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const authUrl = await getGoogleOAuthUrl(role, redirectUri);

      // Redirect user directly to Google Consent Screen
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError('Failed to initiate Google sign in.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white text-[#121212] font-black text-sm uppercase px-4 py-3 border-3 border-[#121212] shadow-brutal hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-3 border-[#121212] border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{isLoading ? 'Connecting...' : label}</span>
      </button>

      {error && (
        <p className="text-[11px] font-mono text-rose-600 font-bold mt-1 text-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;
