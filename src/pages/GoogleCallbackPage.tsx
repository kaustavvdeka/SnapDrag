import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalButton from '../components/common/BrutalButton.js';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMsg(`Google Authentication Error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMsg('No authorization code was received from Google.');
        return;
      }

      try {
        const stateParam = searchParams.get('state');
        let role = undefined;
        let redirect = '/';

        if (stateParam) {
          try {
            const parsed = JSON.parse(stateParam);
            if (parsed.role) role = parsed.role;
            if (parsed.redirect) redirect = parsed.redirect;
          } catch {
            // ignore JSON parse error
          }
        }

        const redirectUri = `${window.location.origin}/auth/google/callback`;
        await loginWithGoogle({ code, role, redirectUri });

        setStatus('success');
        setTimeout(() => {
          navigate(redirect);
        }, 800);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'Failed to authenticate with Google.');
      }
    };

    handleGoogleAuth();
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <BrutalCard bg="bg-white" shadow="xl" className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#FFE600] border-3 border-[#121212] shadow-brutal flex items-center justify-center font-black text-2xl mx-auto">
            G
          </div>

          {status === 'loading' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-black uppercase text-[#121212]">
                VERIFYING GOOGLE LOGIN...
              </h1>
              <div className="inline-block animate-spin w-8 h-8 border-4 border-[#121212] border-t-[#FFE600] rounded-none my-4"></div>
              <p className="text-xs font-mono text-neutral-600">
                Securing your session with Vastrix and retrieving your profile.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle size={48} className="mx-auto text-emerald-600" />
              <h1 className="text-2xl font-black uppercase text-[#121212]">
                AUTHENTICATED!
              </h1>
              <p className="text-xs font-mono text-neutral-600">
                Redirecting you to the marketplace...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-center gap-2 text-left">
                <AlertTriangle size={24} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <BrutalButton variant="primary" fullWidth onClick={() => navigate('/login')}>
                Back to Sign In
              </BrutalButton>
            </div>
          )}
        </BrutalCard>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
