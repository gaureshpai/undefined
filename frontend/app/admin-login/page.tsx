"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const { user, adminLogin, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user.isConnected) {
      if (user.role === "admin") router.push("/admin/buildings");
      else setError("This email is not authorized as an admin.");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (!email) throw new Error("Email is required");
      await adminLogin(email, password);
      // redirect happens via effect
    } catch (err: any) {
      setError(err.message || "Failed to start OTP login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-primary/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-accent/10 blur-3xl rounded-full" />

      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="mb-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <span className="font-bold text-primary-foreground">AC</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Console</CardTitle>
          <CardDescription className="text-sm mt-1">Passwordless admin sign-in</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="block text-sm mb-1">Admin email</Label>
              <Input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="block text-sm mb-1">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Signing in…" : "Sign in"}
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

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">Only emails in the admin allow-list can access.</p>
          </div>
        </CardContent>
        <CardFooter className="px-8 py-4 border-t border-border text-center text-xs text-muted-foreground">
          Need access? Contact the org owner to be added as admin.
        </CardFooter>
      </Card>
    </div>
  );
}
