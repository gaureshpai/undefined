'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, authenticate, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user.isConnected) {
      router.push(user.role === 'admin' ? '/admin' : '/portfolio');
    }
  }, [user, router]);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      if (!email) throw new Error('Email is required');
      await authenticate(email);
      setMessage('Check your email for a secure sign-in link.');
    } catch (err: any) {
      setError(err.message || 'Failed to start OTP login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-blue-600/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-indigo-600/10 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-blue-900/20 overflow-hidden">
          <div className="p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/30">
                <span className="font-bold">AC</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Sign in to AssetChain</h1>
              <p className="text-sm text-gray-400 mt-1">Enterprise-grade access with passwordless magic link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Work email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-900/30 disabled:bg-blue-900/40"
              >
                {isLoading ? 'Sending magic link…' : 'Continue with Email'}
              </button>
            </form>

            {message && (
              <p className="text-emerald-400 text-sm text-center mt-4">{message}</p>
            )}
            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">By continuing, you agree to our Terms and Privacy Policy.</p>
              <p className="text-xs text-gray-500 mt-2">
                Admin? <a href="/admin-login" className="text-blue-400 hover:underline">Sign in here</a>
              </p>
            </div>
          </div>

          <div className="px-8 py-4 border-t border-white/10 bg-white/5 text-center text-xs text-gray-400">
            Trouble signing in? Check your spam folder or contact support.
          </div>
        </div>
      </div>
    </div>
  );
}
