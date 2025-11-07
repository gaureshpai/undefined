'use server';

// Passwordless auth: no storage or password verification on server.
// Optionally expose helpers if needed by server components later.

export type Role = 'user' | 'admin';

export async function getRoleByEmail(email: string): Promise<Role> {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
  return adminEmail && email === adminEmail ? 'admin' : 'user';
}
