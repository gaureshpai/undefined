"use server";

export interface AdminAuthResponse {
  success: boolean;
  error?: string;
}

function parseAdminCredentials(): Map<string, string> | null {
  const raw = process.env.ADMIN_CREDENTIALS;
  if (!raw) return null;
  const map = new Map<string, string>();
  raw.split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [email, pass] = pair.split(":");
      if (email && pass) map.set(email.trim().toLowerCase(), pass);
    });
  return map;
}

function isEmailAllowed(email: string): boolean {
  const list = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function adminLoginAction(email: string, password: string): Promise<AdminAuthResponse> {
  if (!password) return { success: false, error: "Password is required" };
  // Simple env check: ADMIN_PASSWORD only
  const expected = process.env.ADMIN_PASSWORD || "";
  if (password === expected) return { success: true };
  return { success: false, error: "Invalid admin credentials" };
}
