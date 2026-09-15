import { UserAccount, AuthSession } from '../types';

const SESSION_STORAGE_KEY = 'nima_auth_session';
const USERS_STORAGE_KEY = 'nima_registered_users';
const PENDING_VERIFICATIONS_KEY = 'nima_pending_verifications';
const PASSWORD_RESETS_KEY = 'nima_password_resets';

interface PendingVerification {
  email: string;
  code: string;
  user: UserAccount;
  createdAt: number;
  expiresAt: number;
}

interface PendingReset {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
}

// Initial seed user if database is empty
const INITIAL_DEMO_USER: UserAccount = {
  id: 'usr_demo_1',
  name: 'Nima Al-Kantra',
  email: 'nimaalkantra7@gmail.com',
  passwordHash: '123456',
  verified: true,
  createdAt: Date.now() - 86400000 * 7,
  lastLoginAt: Date.now(),
  stats: {
    testsCompleted: 42,
    highestWpm: 124,
    averageWpm: 92,
    totalTimeSeconds: 1540,
  },
};

export function getRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial demo user
      const initial = [INITIAL_DEMO_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = [INITIAL_DEMO_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to get registered users:', err);
    return [INITIAL_DEMO_USER];
  }
}

export function saveRegisteredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save registered users:', err);
  }
}

export function getCurrentSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (!session || !session.user || !session.user.id) return null;
    return session;
  } catch (err) {
    console.error('Failed to read auth session:', err);
    return null;
  }
}

export function setSession(user: UserAccount): AuthSession {
  const session: AuthSession = {
    user: {
      ...user,
      lastLoginAt: Date.now(),
    },
    token: `tok_${Math.random().toString(36).substring(2)}_${Date.now()}`,
    loginAt: Date.now(),
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    // Also update in registered users
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], lastLoginAt: Date.now() };
      saveRegisteredUsers(users);
    }
  } catch (err) {
    console.error('Failed to save auth session:', err);
  }

  return session;
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

function getPendingVerifications(): Record<string, PendingVerification> {
  try {
    const raw = localStorage.getItem(PENDING_VERIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePendingVerifications(pending: Record<string, PendingVerification>): void {
  try {
    localStorage.setItem(PENDING_VERIFICATIONS_KEY, JSON.stringify(pending));
  } catch (err) {
    console.error('Failed to save pending verifications:', err);
  }
}

/**
 * Generate a cryptographically secure-looking 6-digit numeric verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new account and generate an email verification code
 */
export function registerUser(
  name: string,
  email: string,
  password: string
): { success: boolean; message: string; code?: string; user?: UserAccount } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { success: false, message: 'Please enter your name.' };
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getRegisteredUsers();
  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (existingUser && existingUser.verified) {
    return {
      success: false,
      message: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const code = generateVerificationCode();
  const newUser: UserAccount = {
    id: existingUser ? existingUser.id : `usr_${Math.random().toString(36).substring(2, 9)}`,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash: password,
    verified: false,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    stats: {
      testsCompleted: 0,
      highestWpm: 0,
      averageWpm: 0,
      totalTimeSeconds: 0,
    },
  };

  const pending = getPendingVerifications();
  pending[normalizedEmail] = {
    email: normalizedEmail,
    code,
    user: newUser,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };
  savePendingVerifications(pending);

  return {
    success: true,
    message: `Verification code generated for ${normalizedEmail}.`,
    code,
    user: newUser,
  };
}

/**
 * Verify the 6-digit code for the specified email
 */
export function verifyEmailCode(
  email: string,
  code: string
): { success: boolean; message: string; user?: UserAccount } {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  const pending = getPendingVerifications();
  const item = pending[normalizedEmail];

  if (!item) {
    return {
      success: false,
      message: 'No pending verification found for this email. Please request a new code.',
    };
  }

  if (Date.now() > item.expiresAt) {
    return {
      success: false,
      message: 'This verification code has expired. Please request a new one.',
    };
  }

  if (item.code !== cleanCode) {
    return {
      success: false,
      message: 'Incorrect verification code. Please check and try again.',
    };
  }

  // Code matches! Verify and save user
  const verifiedUser: UserAccount = {
    ...item.user,
    verified: true,
    lastLoginAt: Date.now(),
  };

  const users = getRegisteredUsers();
  const existingIdx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingIdx !== -1) {
    users[existingIdx] = verifiedUser;
  } else {
    users.push(verifiedUser);
  }
  saveRegisteredUsers(users);

  // Remove from pending
  delete pending[normalizedEmail];
  savePendingVerifications(pending);

  // Establish persistent session
  setSession(verifiedUser);

  return {
    success: true,
    message: 'Email verified successfully! Welcome to Nima Type.',
    user: verifiedUser,
  };
}

/**
 * Resend verification code
 */
export function resendVerificationCode(
  email: string
): { success: boolean; message: string; code?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const pending = getPendingVerifications();
  let item = pending[normalizedEmail];

  if (!item) {
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return { success: false, message: 'User not found. Please sign up again.' };
    }
    item = {
      email: normalizedEmail,
      code: generateVerificationCode(),
      user,
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
  }

  const newCode = generateVerificationCode();
  pending[normalizedEmail] = {
    ...item,
    code: newCode,
    expiresAt: Date.now() + 15 * 60 * 1000,
  };
  savePendingVerifications(pending);

  return {
    success: true,
    message: `A new 6-digit code has been issued for ${normalizedEmail}.`,
    code: newCode,
  };
}

/**
 * Authenticate existing user
 */
export function loginUser(
  emailOrUsername: string,
  password: string
): {
  success: boolean;
  message: string;
  user?: UserAccount;
  needsVerification?: boolean;
  code?: string;
} {
  const term = emailOrUsername.trim().toLowerCase();
  const users = getRegisteredUsers();

  const user = users.find(
    (u) => u.email.toLowerCase() === term || u.name.toLowerCase() === term
  );

  if (!user) {
    return {
      success: false,
      message: 'No account found with this email or username.',
    };
  }

  if (user.passwordHash && user.passwordHash !== password) {
    return {
      success: false,
      message: 'Incorrect password. Please try again.',
    };
  }

  if (!user.verified) {
    // Generate fresh verification code
    const res = resendVerificationCode(user.email);
    return {
      success: false,
      needsVerification: true,
      code: res.code,
      user,
      message: 'Please verify your email address to log in.',
    };
  }

  // Success!
  setSession(user);

  return {
    success: true,
    message: `Welcome back, ${user.name}!`,
    user,
  };
}

/**
 * Update user typing stats after a completed test
 */
export function updateUserStats(
  userId: string,
  wpm: number,
  durationSeconds: number
): UserAccount | null {
  try {
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const user = users[idx];
    const prevStats = user.stats || {
      testsCompleted: 0,
      highestWpm: 0,
      averageWpm: 0,
      totalTimeSeconds: 0,
    };

    const newTestsCount = prevStats.testsCompleted + 1;
    const newHighest = Math.max(prevStats.highestWpm, wpm);
    const newAverage = Math.round(
      (prevStats.averageWpm * prevStats.testsCompleted + wpm) / newTestsCount
    );
    const newTime = prevStats.totalTimeSeconds + durationSeconds;

    const updatedUser: UserAccount = {
      ...user,
      stats: {
        testsCompleted: newTestsCount,
        highestWpm: newHighest,
        averageWpm: newAverage,
        totalTimeSeconds: newTime,
      },
    };

    users[idx] = updatedUser;
    saveRegisteredUsers(users);

    const session = getCurrentSession();
    if (session && session.user.id === userId) {
      session.user = updatedUser;
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    return updatedUser;
  } catch (err) {
    console.error('Failed to update user stats:', err);
    return null;
  }
}

function getPasswordResets(): Record<string, PendingReset> {
  try {
    const raw = localStorage.getItem(PASSWORD_RESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePasswordResets(resets: Record<string, PendingReset>): void {
  try {
    localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(resets));
  } catch (err) {
    console.error('Failed to save password resets:', err);
  }
}

/**
 * Request password reset code
 */
export function requestPasswordReset(email: string): {
  success: boolean;
  message: string;
  code?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      message: 'No registered account found with this email address.',
    };
  }

  const code = generateVerificationCode();
  const resets = getPasswordResets();
  resets[normalizedEmail] = {
    email: normalizedEmail,
    code,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };
  savePasswordResets(resets);

  return {
    success: true,
    message: `Password reset code sent to ${normalizedEmail}.`,
    code,
  };
}

/**
 * Confirm password reset code and update password
 */
export function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): { success: boolean; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const resets = getPasswordResets();
  const item = resets[normalizedEmail];

  if (!item) {
    return {
      success: false,
      message: 'No pending reset request found for this email. Please request a new code.',
    };
  }

  if (Date.now() > item.expiresAt) {
    return {
      success: false,
      message: 'This reset code has expired. Please request a new one.',
    };
  }

  if (item.code !== cleanCode) {
    return {
      success: false,
      message: 'Invalid reset code. Please check and try again.',
    };
  }

  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx === -1) {
    return { success: false, message: 'User account not found.' };
  }

  users[idx] = {
    ...users[idx],
    passwordHash: newPassword,
  };
  saveRegisteredUsers(users);

  delete resets[normalizedEmail];
  savePasswordResets(resets);

  return {
    success: true,
    message: 'Your password has been reset successfully! Please sign in with your new password.',
  };
}

/**
 * Call backend API to dispatch verification code email
 */
export async function sendVerificationEmailViaApi(
  email: string,
  code: string,
  name?: string
): Promise<{ success: boolean; delivered?: boolean; message?: string; missingConfig?: string[] }> {
  try {
    const res = await fetch('/api/send-verification-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, name }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return {
        success: false,
        delivered: false,
        message: data?.message || `Server error (${res.status}): Failed to send verification email.`,
        missingConfig: data?.missingConfig,
      };
    }
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      delivered: false,
      message: `Failed to connect to email service: ${msg}`,
    };
  }
}

/**
 * Call backend API to dispatch reset code email
 */
export async function sendResetEmailViaApi(
  email: string,
  code: string
): Promise<{ success: boolean; delivered?: boolean; message?: string; missingConfig?: string[] }> {
  try {
    const res = await fetch('/api/send-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      return {
        success: false,
        delivered: false,
        message: data?.message || `Server error (${res.status}): Failed to send password reset email.`,
        missingConfig: data?.missingConfig,
      };
    }
    return data;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      success: false,
      delivered: false,
      message: `Failed to connect to email service: ${msg}`,
    };
  }
}

