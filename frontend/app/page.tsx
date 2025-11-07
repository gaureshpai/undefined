'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getAvailableUserEmails } from '@/lib/ganache-accounts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function Home() {
  const { user, authenticate, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user.isConnected) {
      router.push(user.role === 'admin' ? '/admin/buildings' : '/portfolio');
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-blue-600/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-indigo-600/10 blur-3xl rounded-full" />

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="mb-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/30">
            <span className="font-bold">AC</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in to AssetChain</CardTitle>
          <CardDescription className="text-sm mt-1">Enterprise-grade access with passwordless magic link</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm mb-1">Work email</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-900/30 disabled:bg-blue-900/40"
            >
              {isLoading ? 'Sending magic link…' : 'Continue with Email'}
            </Button>
          </form>

          {message && (
            <Alert className="mt-4">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center space-y-3">
            <p className="text-xs">By continuing, you agree to our Terms and Privacy Policy.</p>
            <p className="text-xs">
              Admin? <a href="/admin-login" className="text-blue-400 hover:underline">Sign in here</a>
            </p>
          </div>
        </CardContent>
        <CardFooter className="px-8 py-4 border-t text-center text-xs">
          Trouble signing in? Check your spam folder or contact support.
        </CardFooter>
      </Card>
    </div>
  );
}
