"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const { user, adminLogin, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user.isConnected) {
      if (user.role === "admin") router.push("/admin");
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
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] bg-violet-600/10 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-fuchsia-600/10 blur-3xl rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-violet-900/20 overflow-hidden">
          <div className="p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-600/30">
                <span className="font-bold">AC</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Console</h1>
              <p className="text-sm text-gray-400 mt-1">Passwordless admin sign-in</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Admin email</label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 transition-colors font-medium shadow-lg shadow-violet-900/30 disabled:bg-violet-900/40"
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {message && (
              <p className="text-emerald-400 text-sm text-center mt-4">{message}</p>
            )}
            {error && (
              <p className="text-red-400 text-sm text-center mt-4">{error}</p>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">Only emails in the admin allow-list can access.</p>
            </div>
          </div>

          <div className="px-8 py-4 border-t border-white/10 bg-white/5 text-center text-xs text-gray-400">
            Need access? Contact the org owner to be added as admin.
          </div>
        </div>
      </div>
    </div>
  );
}
