import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalInput from '../components/common/BrutalInput.js';
import BrutalButton from '../components/common/BrutalButton.js';
import GoogleLoginButton from '../components/common/GoogleLoginButton.js';
import { useAuth } from '../context/AuthContext.js';
import { Store, User, Lock, AlertTriangle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await login({ email, password });
      navigate(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill demo helpers for test convenience
  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <BrutalCard bg="bg-white" shadow="xl" className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-[#FFE600] border-3 border-[#121212] shadow-brutal flex items-center justify-center font-black text-2xl mx-auto mb-2">
              SD
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#121212]">
              SIGN IN TO SNAPDRAG
            </h1>
            <p className="text-xs font-mono text-neutral-600">
              Access your saved outfits, in-store holds, or shop dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <BrutalInput
              label="Email Address"
              type="email"
              placeholder="e.g. ananya.sharma@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <BrutalInput
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <BrutalButton
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                Sign In
              </BrutalButton>
            </div>
          </form>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t-2 border-[#121212]"></div>
            <span className="px-3 text-xs font-mono font-bold uppercase text-neutral-500">OR</span>
            <div className="flex-1 border-t-2 border-[#121212]"></div>
          </div>

          <GoogleLoginButton label="Sign In with Google" redirectTo={redirectUrl} />

          {/* Quick Demo Logins for Pair Programming / Review */}
          <div className="pt-4 border-t-2 border-[#121212] space-y-2">
            <p className="text-[10px] font-mono font-bold uppercase text-neutral-500 text-center">
              Quick Test Accounts (Click to Fill):
            </p>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => fillDemo('ananya.sharma@example.com', 'Customer@123456')}
                className="p-1.5 bg-[#FAF7EE] border border-[#121212] font-bold hover:bg-[#FFE600] transition-colors"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('kamakhya.handloom@snapdrag.local', 'Password@123456')}
                className="p-1.5 bg-[#FAF7EE] border border-[#121212] font-bold hover:bg-[#FFE600] transition-colors"
              >
                Shopkeeper
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@snapdrag.local', 'Admin@123456')}
                className="p-1.5 bg-[#FAF7EE] border border-[#121212] font-bold hover:bg-[#FFE600] transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-neutral-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold underline text-[#121212] hover:text-[#FF6EA7]">
              Create an Account
            </Link>
          </div>
        </BrutalCard>
      </div>
    </div>
  );
};

export default LoginPage;
