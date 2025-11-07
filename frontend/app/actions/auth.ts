'use server';

import { Magic } from 'magic-sdk';

// In-memory database for users (store email and password mapping)
// Note: In production, use a proper database with hashed passwords
const users = new Map<string, { email: string; password: string }>();

// Initialize Magic SDK Admin
const magic = new Magic(process.env.MAGIC_SECRET_KEY!, {
   network: {
    rpcUrl: 'http://127.0.0.1:7545',
    chainId: 1011,
  }
});

interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export async function signupAction(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Check if user already exists
    if (users.has(email)) {
      return { success: false, error: 'User already exists' };
    }

    // Store user credentials (in production, hash the password)
    users.set(email, { email, password });

    return { success: true, message: 'User created successfully' };
  } catch (error) {
    console.error('Signup failed:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function loginAction(
  email: string,
  password: string,
  didToken?: string
): Promise<AuthResponse> {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Check if user exists and password is correct
    const user = users.get(email);
    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    // If client provides a DID token, validate it
    if (didToken) {
      try {
        await magic.token.validate(didToken);
        const metadata = await magic.users.getMetadataByToken(didToken);

        // Verify the email matches
        if (metadata.email !== email) {
          return { success: false, error: 'Invalid token' };
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        return { success: false, error: 'Invalid token' };
      }
    }

    return { success: true, message: 'Login successful' };
  } catch (error) {
    console.error('Login failed:', error);
    return { success: false, error: 'Internal server error' };
  }
}
