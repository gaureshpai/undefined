"use server";

export interface AdminAuthResponse {
  success: boolean;
  error?: string;
  email?: string; // Add email to the response
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
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function adminLoginAction(email: string, password: string): Promise<AdminAuthResponse> {
  if (!password) return { success: false, error: "Password is required" };
  // Simple env check: ADMIN_PASSWORD only
  const expected = process.env.ADMIN_PASSWORD || "";
  if (password === expected) return { success: true, email }; // Return email on success
  return { success: false, error: "Invalid admin credentials" };
}
