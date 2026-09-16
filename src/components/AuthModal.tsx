import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  X,
} from 'lucide-react';
import { UserAccount } from '../types';
import {
  registerUser,
  verifyEmailCode,
  resendVerificationCode,
  loginUser,
  requestPasswordReset,
  confirmPasswordReset,
} from '../utils/authStorage';
import { ThemeMode } from '../types';
import { getPalette } from '../utils/themeConfig';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserAccount) => void;
  onClose?: () => void;
  canClose?: boolean;
  initialMode?: 'signin' | 'signup' | 'verify' | 'forgot_password';
  appLang?: 'en' | 'fa';
  themeMode?: ThemeMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  canClose = false,
  initialMode = 'signin',
  appLang = 'en',
  themeMode = 'light',
}) => {
  const p = getPalette(themeMode);
  const [mode, setMode] = useState<
    'signin' | 'signup' | 'verify' | 'forgot_password' | 'reset_password'
  >(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password reset fields
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // 6-digit verification code inputs
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);

  // UI status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setInfoMsg(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((mode === 'verify' || mode === 'reset_password') && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendCooldown]);

  useEffect(() => {
    if (mode === 'verify') {
      setTimeout(() => {
        digitInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [mode]);

  if (!isOpen) return null;

  // Sign In handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.needsVerification) {
      setEmail(email);
      setMode('verify');
      setResendCooldown(60);
      setInfoMsg(
        res.message || `Please enter the 6-digit verification code sent to ${email}.`
      );
      return;
    }

    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'Login failed. Please check your credentials.');
    }
  };

  // Sign Up handler (Never shows code on screen!)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await registerUser(name, email, password);
    setIsLoading(false);

    if (res.success) {
      if (res.needsVerification) {
        setMode('verify');
        setResendCooldown(60);
        setCodeDigits(['', '', '', '', '', '']);
        setInfoMsg(
          res.message || `A verification code was sent to ${email}. Please check your inbox or spam folder and enter it below.`
        );
      } else if (res.user) {
        onSuccess(res.user);
      }
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  // Digit Input change
  const handleDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '');
    if (!sanitized) {
      const next = [...codeDigits];
      next[index] = '';
      setCodeDigits(next);
      return;
    }

    const char = sanitized[sanitized.length - 1];
    const next = [...codeDigits];
    next[index] = char;
    setCodeDigits(next);

    if (index < 5 && char) {
      digitInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && char) {
      const completeCode = next.join('');
      if (completeCode.length === 6) {
        submitVerification(completeCode);
      }
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = [...codeDigits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setCodeDigits(next);

    if (pasted.length === 6) {
      submitVerification(pasted);
    } else if (pasted.length > 0 && pasted.length < 6) {
      digitInputRefs.current[pasted.length]?.focus();
    }
  };

  // Submit 6-digit verification code
  const submitVerification = async (codeToVerify?: string) => {
    const finalCode = (codeToVerify || codeDigits.join('')).trim();
    if (finalCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    const res = await verifyEmailCode(email, finalCode);
    setIsLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'Verification code is invalid or has expired.');
    }
  };

  // Resend code to email
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    const res = await resendVerificationCode(email);
    setIsLoading(false);

    if (res.success) {
      setResendCooldown(60);
      setCodeDigits(['', '', '', '', '', '']);
      setInfoMsg(res.message || `A new 6-digit verification code has been dispatched to ${email}.`);
      digitInputRefs.current[0]?.focus();
    } else {
      setErrorMsg(res.message || 'Failed to resend code.');
    }
  };

  // Forgot password: send reset code to email
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setIsLoading(true);
    const res = await requestPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setMode('reset_password');
      setResendCooldown(60);
      setInfoMsg(res.message || `Password reset instructions and 6-digit code sent to ${email}.`);
    } else {
      setErrorMsg(res.message || 'Failed to request password reset.');
    }
  };

  // Confirm password reset
  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (resetCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit reset code received in your email.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await confirmPasswordReset(email, resetCode, newPassword);
    setIsLoading(false);

    if (res.success) {
      setMode('signin');
      setPassword(newPassword);
      setInfoMsg('Password updated successfully! Please sign in with your new password.');
    } else {
      setErrorMsg(res.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-all font-mono"
        style={{
          backgroundColor: p.cardSurface,
          borderColor: p.border,
          color: p.text,
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), ${p.tubelightGlow}`,
        }}
      >
        {/* Top Accent Header */}
        <div
          className="p-5 border-b flex items-center justify-between select-none"
          style={{
            backgroundColor: p.cardBg,
            borderColor: p.border,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-sm border"
              style={{
                backgroundColor: p.isDark ? '#172012' : '#EDE8F3',
                borderColor: p.border,
                color: p.text,
                boxShadow: p.tubelightGlow,
              }}
            >
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-tight" style={{ color: p.text }}>
                  NIMA TYPE
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1.5"
                  style={{
                    backgroundColor: p.cardSurface,
                    borderColor: p.border,
                    color: p.text,
                    boxShadow: p.tubelightGlow,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                  Sigma
                </span>
              </div>
              <div className="text-[11px] font-mono" style={{ color: p.textMuted }}>
                {mode === 'signin' && 'Sign in to access your typing stats'}
                {mode === 'signup' && 'Create your personal account'}
                {mode === 'verify' && 'Verify your email address'}
                {mode === 'forgot_password' && 'Reset your password'}
                {mode === 'reset_password' && 'Enter reset code and new password'}
              </div>
            </div>
          </div>

          {canClose && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border transition-colors cursor-pointer hover:opacity-80"
              style={{ borderColor: p.border, color: p.text }}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Inner Content Area */}
        <div className="p-6">
          {/* Navigation Mode Switcher */}
          {(mode === 'signin' || mode === 'signup') && (
            <div
              className="flex p-1 rounded-xl mb-5 border select-none"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-lg transition-all font-mono cursor-pointer"
                style={
                  mode === 'signin'
                    ? {
                        backgroundColor: p.primary,
                        color: p.activeBtnText,
                        boxShadow: p.tubelightGlow,
                      }
                    : {
                        color: p.textMuted,
                      }
                }
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-lg transition-all font-mono cursor-pointer"
                style={
                  mode === 'signup'
                    ? {
                        backgroundColor: p.primary,
                        color: p.activeBtnText,
                        boxShadow: p.tubelightGlow,
                      }
                    : {
                        color: p.textMuted,
                      }
                }
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 font-mono"
              style={{
                backgroundColor: '#F2E8CF',
                borderColor: '#9A3B3B',
                color: '#9A3B3B',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#9A3B3B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info / Success Message */}
          {infoMsg && (
            <div
              className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 font-mono"
              style={{
                backgroundColor: '#EDE8F3', // Touch of Lavender
                borderColor: '#A3B18A',
                color: '#283618',
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#283618]" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODE 1: SIGN IN                                             */}
          {/* ----------------------------------------------------------- */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nimaalkantra7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#283618]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-[#A3B18A] rounded"
                  />
                  <span>Keep me logged in</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot_password');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-[#283618] hover:underline font-bold cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="tubelight-btn w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#A3B18A]"
                style={{
                  backgroundColor: '#A3B18A', // Primary Sage
                  color: '#283618',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.7)', // Tubelight effect in sigma
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#283618]" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODE 2: CREATE ACCOUNT (SIGN UP)                            */}
          {/* ----------------------------------------------------------- */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nima Al-Kantra"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nimaalkantra7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="tubelight-btn w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#A3B18A]"
                  style={{
                    backgroundColor: '#A3B18A', // Primary Sage
                    color: '#283618',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.7)', // Tubelight effect in sigma
                  }}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#283618]" />
                  ) : (
                    <>
                      <span>Send Verification Code to Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODE 3: EMAIL VERIFICATION CODE ENTRY                       */}
          {/* ----------------------------------------------------------- */}
          {mode === 'verify' && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl border text-xs font-mono leading-relaxed"
                style={{
                  backgroundColor: '#EDE8F3', // Touch of Lavender
                  borderColor: '#A3B18A',
                  color: '#283618',
                }}
              >
                <p className="font-bold mb-1">Verification Code Sent</p>
                <p>
                  A 6-digit code has been sent to{' '}
                  <span className="font-bold underline">{email}</span>. Please check
                  your email inbox (and spam folder), then enter the code below to
                  activate your account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-2 text-center">
                  Enter 6-Digit Email Code
                </label>
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {codeDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        digitInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={handleDigitPaste}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#EDE8F3] text-[#283618]"
                      style={{
                        borderColor: '#A3B18A',
                        boxShadow: digit ? '0 0 20px rgba(56, 189, 248, 0.7)' : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#283618] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-bold hover:underline flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => submitVerification()}
                disabled={isLoading || codeDigits.some((d) => !d)}
                className="tubelight-btn w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#A3B18A]"
                style={{
                  backgroundColor: '#A3B18A',
                  color: '#283618',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.7)', // Tubelight effect in sigma
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#283618]" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify Code & Enter</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODE 4: FORGOT PASSWORD (REQUEST CODE)                      */}
          {/* ----------------------------------------------------------- */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div
                className="p-3.5 rounded-xl border text-xs font-mono leading-relaxed"
                style={{
                  backgroundColor: '#EDE8F3', // Touch of Lavender
                  borderColor: '#A3B18A',
                  color: '#283618',
                }}
              >
                <p className="font-bold mb-1">Reset Password</p>
                <p>
                  Enter the email address registered with your account. We will send
                  you a 6-digit verification code to securely reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nimaalkantra7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] transition-all bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-[#283618] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="tubelight-btn w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#A3B18A]"
                style={{
                  backgroundColor: '#A3B18A',
                  color: '#283618',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.7)', // Tubelight effect in sigma
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#283618]" />
                ) : (
                  <>
                    <span>Send Reset Code to Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODE 5: ENTER RESET CODE & NEW PASSWORD                     */}
          {/* ----------------------------------------------------------- */}
          {mode === 'reset_password' && (
            <form onSubmit={handleConfirmPasswordReset} className="space-y-3">
              <div
                className="p-3.5 rounded-xl border text-xs font-mono leading-relaxed"
                style={{
                  backgroundColor: '#EDE8F3', // Touch of Lavender
                  borderColor: '#A3B18A',
                  color: '#283618',
                }}
              >
                <p className="font-bold mb-1">Enter Code & Set New Password</p>
                <p>
                  Check your email ({email}) for the 6-digit reset code, then enter
                  it below along with your new password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 rounded-xl border text-center text-lg font-mono font-black text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] tracking-widest bg-[#EDE8F3]"
                  style={{
                    borderColor: '#A3B18A',
                    boxShadow: resetCode ? '0 0 20px rgba(56, 189, 248, 0.7)' : undefined,
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#283618] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#586B54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#283618] placeholder-[#586B54]/70 focus:outline-none focus:ring-2 focus:ring-[#A3B18A] bg-[#F2E8CF]"
                    style={{ borderColor: '#A3B18A' }}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="text-[#283618] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="tubelight-btn w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border"
                style={{
                  backgroundColor: p.primary,
                  borderColor: p.border,
                  color: p.activeBtnText,
                  boxShadow: p.tubelightGlow,
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Password & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="px-6 py-3 border-t flex items-center justify-between text-[11px] font-mono select-none"
          style={{
            borderColor: p.border,
            backgroundColor: p.cardBg,
            color: p.textMuted,
          }}
        >
          <span>Designed by Nima Nabizada</span>
          <span className="font-bold flex items-center gap-1.5" style={{ color: p.text }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
            Nima Type
          </span>
        </div>
      </div>
    </div>
  );
};
