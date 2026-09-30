import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrutalCard from '../components/common/BrutalCard.js';
import BrutalInput from '../components/common/BrutalInput.js';
import BrutalButton from '../components/common/BrutalButton.js';
import GoogleLoginButton from '../components/common/GoogleLoginButton.js';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import { Store, User, AlertTriangle, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();

  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<UserRole>(
    roleParam === 'SHOPKEEPER' ? 'SHOPKEEPER' : 'CUSTOMER'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await register({
        name,
        email,
        phone: phone || undefined,
        password,
        role,
      });

      if (role === 'SHOPKEEPER') {
        navigate('/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7EE] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <BrutalCard bg="bg-white" shadow="xl" className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#121212]">
              JOIN SNAPDRAG
            </h1>
            <p className="text-xs font-mono text-neutral-600">
              Discover unique traditional clothing or digitize your physical store.
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`p-3 border-2 border-[#121212] font-black uppercase text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'CUSTOMER'
                  ? 'bg-[#FFE600] shadow-brutal translate-x-0.5 translate-y-0.5'
                  : 'bg-[#FAF7EE] shadow-brutal-sm hover:bg-white'
              }`}
            >
              <User size={18} />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('SHOPKEEPER')}
              className={`p-3 border-2 border-[#121212] font-black uppercase text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                role === 'SHOPKEEPER'
                  ? 'bg-[#00E599] shadow-brutal translate-x-0.5 translate-y-0.5'
                  : 'bg-[#FAF7EE] shadow-brutal-sm hover:bg-white'
              }`}
            >
              <Store size={18} />
              <span>Shop Owner</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FF4D4D] text-white border-2 border-[#121212] shadow-brutal-sm text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <BrutalInput
              label={role === 'SHOPKEEPER' ? 'Your Name / Proprietor Name' : 'Full Name'}
              placeholder="e.g. Priya Sharma"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <BrutalInput
              label="Email Address"
              type="email"
              placeholder="e.g. priya@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <BrutalInput
              label="Mobile / WhatsApp Number"
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              helperText="Used for in-store reservation verification"
            />

            <BrutalInput
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="pt-2">
              <BrutalButton
                type="submit"
                variant={role === 'SHOPKEEPER' ? 'accent' : 'primary'}
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {role === 'SHOPKEEPER' ? 'Register as Shopkeeper' : 'Create Customer Account'}
              </BrutalButton>
            </div>
          </form>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t-2 border-[#121212]"></div>
            <span className="px-3 text-xs font-mono font-bold uppercase text-neutral-500">OR</span>
            <div className="flex-1 border-t-2 border-[#121212]"></div>
          </div>

          <GoogleLoginButton
            role={role}
            label={`Sign Up with Google (${role === 'SHOPKEEPER' ? 'Shopkeeper' : 'Customer'})`}
            redirectTo={role === 'SHOPKEEPER' ? '/dashboard' : '/explore'}
          />

          <div className="text-center text-xs font-mono text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline text-[#121212] hover:text-[#FF6EA7]">
              Sign In
            </Link>
          </div>
        </BrutalCard>
      </div>
    </div>
  );
};

export default RegisterPage;
