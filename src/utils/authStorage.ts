import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserAccount, AuthSession } from '../types';

const STATS_STORAGE_PREFIX = 'nima_user_stats_';
const ACTIVE_USER_CACHE_KEY = 'nima_current_user_cache';

// Helper to retrieve typing stats for a specific user ID
export function getUserStats(userId: string): {
  testsCompleted: number;
  highestWpm: number;
  averageWpm: number;
  totalTimeSeconds: number;
} {
  try {
    const raw = localStorage.getItem(`${STATS_STORAGE_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse user stats:', err);
  }
  return {
    testsCompleted: 0,
    highestWpm: 0,
    averageWpm: 0,
    totalTimeSeconds: 0,
  };
}

// Helper to save typing stats for a specific user ID
export function saveUserStats(
  userId: string,
  stats: {
    testsCompleted: number;
    highestWpm: number;
    averageWpm: number;
    totalTimeSeconds: number;
  }
): void {
  try {
    localStorage.setItem(`${STATS_STORAGE_PREFIX}${userId}`, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats:', err);
  }
}

// Convert a Supabase User into the application's UserAccount model
export function mapSupabaseUserToUserAccount(sbUser: User): UserAccount {
  const meta = sbUser.user_metadata || {};
  const stats = getUserStats(sbUser.id);
  const displayName =
    meta.name ||
    meta.full_name ||
    meta.display_name ||
    (sbUser.email ? sbUser.email.split('@')[0] : 'Pilot');

  const createdAt = sbUser.created_at
    ? new Date(sbUser.created_at).getTime()
    : Date.now();
  const lastLoginAt = sbUser.last_sign_in_at
    ? new Date(sbUser.last_sign_in_at).getTime()
    : Date.now();

  const account: UserAccount = {
    id: sbUser.id,
    name: displayName,
    email: sbUser.email || '',
    verified: Boolean(sbUser.email_confirmed_at),
    createdAt,
    lastLoginAt,
    stats,
  };

  // Cache latest user representation for synchronous startup reads
  try {
    localStorage.setItem(ACTIVE_USER_CACHE_KEY, JSON.stringify(account));
  } catch (e) {
    // Ignore storage quota errors
  }

  return account;
}

// Synchronous session check (from local cache) for instant initial render
export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_CACHE_KEY);
    if (!raw) return null;
    const user: UserAccount = JSON.parse(raw);
    if (!user || !user.id) return null;
    return {
      user,
      token: 'supabase_session',
      loginAt: user.lastLoginAt || Date.now(),
    };
  } catch (err) {
    return null;
  }
}

// Asynchronous session fetch directly from Supabase
export async function getCurrentSessionAsync(): Promise<AuthSession | null> {
  if (!isSupabaseConfigured) {
    return getCurrentSession();
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session || !data.session.user) {
      localStorage.removeItem(ACTIVE_USER_CACHE_KEY);
      return null;
    }
    const user = mapSupabaseUserToUserAccount(data.session.user);
    return {
      user,
      token: data.session.access_token,
      loginAt: Date.now(),
    };
  } catch (err) {
    console.error('Error fetching Supabase session:', err);
    return null;
  }
}

// Sign Up with Supabase Auth
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: UserAccount;
  needsVerification?: boolean;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message:
        'Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data.user) {
      const user = mapSupabaseUserToUserAccount(data.user);
      // If email confirmation is required, session will be null or email_confirmed_at will be null
      const needsVerification = !data.session || !data.user.email_confirmed_at;
      return {
        success: true,
        user,
        needsVerification,
        message: needsVerification
          ? 'Verification code sent to your email. Please check your inbox.'
          : 'Account created successfully.',
      };
    }

    return {
      success: false,
      message: 'Failed to create account. Please try again.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error during sign up';
    return { success: false, message: msg };
  }
}

// Sign In with Supabase Auth
export async function loginUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  user?: UserAccount;
  needsVerification?: boolean;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message:
        'Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // Check if the error indicates unconfirmed email
      if (
        error.message.toLowerCase().includes('email not confirmed') ||
        error.message.toLowerCase().includes('not verified')
      ) {
        return {
          success: false,
          needsVerification: true,
          message: 'Your email address is not yet verified. Please enter the verification code sent to your email.',
        };
      }
      return { success: false, message: error.message };
    }

    if (data.user) {
      const user = mapSupabaseUserToUserAccount(data.user);
      return { success: true, user };
    }

    return { success: false, message: 'Invalid credentials or user not found.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return { success: false, message: msg };
  }
}

// Verify 6-digit OTP code with Supabase
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{
  success: boolean;
  user?: UserAccount;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are missing.',
    };
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'signup',
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data.user) {
      const user = mapSupabaseUserToUserAccount(data.user);
      return { success: true, user, message: 'Email verified successfully!' };
    }

    return { success: false, message: 'Verification code is invalid or has expired.' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return { success: false, message: msg };
  }
}

// Resend verification code via Supabase
export async function resendVerificationCode(
  email: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are missing.',
    };
  }

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: `A new verification code has been dispatched to ${email}.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to resend code';
    return { success: false, message: msg };
  }
}

// Request password reset email / code via Supabase
export async function requestPasswordReset(
  email: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are missing.',
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${email}.`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to request password reset';
    return { success: false, message: msg };
  }
}

// Confirm password reset with 6-digit recovery code and new password
export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase credentials are missing.',
    };
  }

  try {
    // 1. Verify OTP with type 'recovery'
    const { error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'recovery',
    });

    if (otpError) {
      return { success: false, message: otpError.message };
    }

    // 2. Update user password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return {
      success: true,
      message: 'Password has been reset successfully. You may now sign in.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update password';
    return { success: false, message: msg };
  }
}

// Sign Out from Supabase
export async function clearSession(): Promise<void> {
  try {
    localStorage.removeItem(ACTIVE_USER_CACHE_KEY);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error('Error during sign out:', err);
  }
}

// Update typing statistics for active user
export function updateUserStats(
  userId: string,
  wpm: number,
  accuracy: number
): UserAccount | null {
  try {
    const currentStats = getUserStats(userId);
    const newTestsCompleted = currentStats.testsCompleted + 1;
    const newHighestWpm = Math.max(currentStats.highestWpm, Math.round(wpm));
    const newAverageWpm = Math.round(
      (currentStats.averageWpm * currentStats.testsCompleted + wpm) / newTestsCompleted
    );
    const newTotalTimeSeconds = currentStats.totalTimeSeconds + 30; // approx per test

    const updatedStats = {
      testsCompleted: newTestsCompleted,
      highestWpm: newHighestWpm,
      averageWpm: newAverageWpm,
      totalTimeSeconds: newTotalTimeSeconds,
    };

    saveUserStats(userId, updatedStats);

    const rawUser = localStorage.getItem(ACTIVE_USER_CACHE_KEY);
    if (rawUser) {
      const user: UserAccount = JSON.parse(rawUser);
      if (user.id === userId) {
        user.stats = updatedStats;
        localStorage.setItem(ACTIVE_USER_CACHE_KEY, JSON.stringify(user));
        return user;
      }
    }
  } catch (err) {
    console.error('Failed to update user stats:', err);
  }
  return null;
}
