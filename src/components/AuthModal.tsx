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
  sendVerificationEmailViaApi,
  sendResetEmailViaApi,
} from '../utils/authStorage';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserAccount) => void;
  onClose?: () => void;
  canClose?: boolean;
  initialMode?: 'signin' | 'signup' | 'verify' | 'forgot_password';
  appLang?: 'en' | 'fa';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  canClose = false,
  initialMode = 'signin',
  appLang = 'en',
}) => {
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
    const res = loginUser(email, password);

    if (res.needsVerification) {
      setEmail(res.user?.email || email);
      setMode('verify');
      setResendCooldown(60);
      if (res.code) {
        const emailRes = await sendVerificationEmailViaApi(res.user?.email || email, res.code, res.user?.name);
        setIsLoading(false);
        if (!emailRes.success) {
          setErrorMsg(emailRes.message || 'Failed to send verification email.');
          return;
        }
      } else {
        setIsLoading(false);
      }
      setInfoMsg(
        `Please enter the 6-digit verification code sent to ${email}.`
      );
      return;
    }

    setIsLoading(false);
    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.message);
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
    const res = registerUser(name, email, password);

    if (res.success && res.code) {
      // Dispatch real email via backend API
      const emailRes = await sendVerificationEmailViaApi(email, res.code, name);
      setIsLoading(false);

      if (!emailRes.success) {
        setErrorMsg(emailRes.message || 'Failed to send verification email. Please verify SMTP settings.');
        setMode('verify');
        setResendCooldown(10);
        setCodeDigits(['', '', '', '', '', '']);
        return;
      }

      setMode('verify');
      setResendCooldown(60);
      setCodeDigits(['', '', '', '', '', '']);
      setInfoMsg(
        `A 6-digit verification code was sent to ${email}. Please check your inbox or spam folder and enter it below.`
      );
    } else {
      setIsLoading(false);
      setErrorMsg(res.message);
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
  const submitVerification = (codeToVerify?: string) => {
    const finalCode = (codeToVerify || codeDigits.join('')).trim();
    if (finalCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = verifyEmailCode(email, finalCode);
      setIsLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  // Resend code to email
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    const res = resendVerificationCode(email);
    if (res.code) {
      const emailRes = await sendVerificationEmailViaApi(email, res.code, name);
      setIsLoading(false);
      if (!emailRes.success) {
        setErrorMsg(emailRes.message || 'Failed to resend verification code.');
        return;
      }
    } else {
      setIsLoading(false);
    }

    if (res.success) {
      setResendCooldown(60);
      setCodeDigits(['', '', '', '', '', '']);
      setInfoMsg(`A new 6-digit verification code has been dispatched to ${email}.`);
      digitInputRefs.current[0]?.focus();
    } else {
      setErrorMsg(res.message);
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
    const res = requestPasswordReset(email);
    if (res.success && res.code) {
      const emailRes = await sendResetEmailViaApi(email, res.code);
      setIsLoading(false);
      if (!emailRes.success) {
        setErrorMsg(emailRes.message || 'Failed to send password reset code.');
        return;
      }
      setMode('reset_password');
      setResendCooldown(60);
      setInfoMsg(`Password reset instructions and 6-digit code sent to ${email}.`);
    } else {
      setIsLoading(false);
      setErrorMsg(res.message);
    }
  };

  // Confirm password reset
  const handleConfirmPasswordReset = (e: React.FormEvent) => {
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
    setTimeout(() => {
      const res = confirmPasswordReset(email, resetCode, newPassword);
      setIsLoading(false);

      if (res.success) {
        setMode('signin');
        setPassword(newPassword);
        setInfoMsg('Password updated successfully! Please sign in with your new password.');
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-all"
        style={{
          backgroundColor: '#B59B7A', // Primary
          borderColor: '#315C45', // Secondary
          color: '#F6F5EF', // Third
        }}
      >
        {/* Top Accent Header */}
        <div
          className="p-5 border-b flex items-center justify-between select-none"
          style={{
            backgroundColor: '#315C45', // Secondary
            borderColor: '#B59B7A', // Primary
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-sm"
              style={{
                backgroundColor: '#B59B7A',
                color: '#315C45',
              }}
            >
              N
            </div>
            <div>
              <div className="font-mono font-bold text-sm text-[#F6F5EF] tracking-tight">
                NIMA TYPE
              </div>
              <div className="text-[11px] font-mono text-[#F6F5EF]/80">
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
              className="p-1.5 rounded-lg text-[#F6F5EF]/80 hover:text-[#F6F5EF] hover:bg-[#B59B7A]/30 transition-colors cursor-pointer"
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
                backgroundColor: '#B59B7A',
                borderColor: '#315C45',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all font-mono cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#315C45] text-[#F6F5EF] shadow-sm'
                    : 'text-[#315C45] hover:text-[#F6F5EF]'
                }`}
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
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all font-mono cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#315C45] text-[#F6F5EF] shadow-sm'
                    : 'text-[#315C45] hover:text-[#F6F5EF]'
                }`}
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
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F6F5EF]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info / Success Message */}
          {infoMsg && (
            <div
              className="mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 font-mono"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#F6F5EF',
                color: '#F6F5EF',
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#F6F5EF]" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* MODE 1: SIGN IN                                             */}
          {/* ----------------------------------------------------------- */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nimaalkantra7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#315C45]">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-[#315C45] rounded"
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
                  className="text-[#315C45] hover:text-[#F6F5EF] underline font-bold cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: '#315C45',
                  color: '#F6F5EF',
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nima Al-Kantra"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nimaalkantra7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: '#315C45',
                    color: '#F6F5EF',
                  }}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
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
                  backgroundColor: '#315C45',
                  borderColor: '#F6F5EF',
                  color: '#F6F5EF',
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
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-2 text-center">
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
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF] text-[#315C45]"
                      style={{ borderColor: '#315C45' }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#315C45] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setInfoMsg(null);
                  }}
                  className="hover:text-[#F6F5EF] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isLoading}
                  className="font-bold hover:text-[#F6F5EF] flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
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
                className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: '#315C45',
                  color: '#F6F5EF',
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
                  backgroundColor: '#315C45',
                  borderColor: '#F6F5EF',
                  color: '#F6F5EF',
                }}
              >
                <p className="font-bold mb-1">Reset Password</p>
                <p>
                  Enter the email address registered with your account. We will send
                  you a 6-digit verification code to securely reset your password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nimaalkantra7@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] transition-all bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
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
                  className="text-[#315C45] hover:text-[#F6F5EF] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: '#315C45',
                  color: '#F6F5EF',
                }}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
                  backgroundColor: '#315C45',
                  borderColor: '#F6F5EF',
                  color: '#F6F5EF',
                }}
              >
                <p className="font-bold mb-1">Enter Code & Set New Password</p>
                <p>
                  Check your email ({email}) for the 6-digit reset code, then enter
                  it below along with your new password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3 py-2.5 rounded-xl border text-center text-lg font-mono font-black text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] tracking-widest bg-[#F6F5EF]"
                  style={{ borderColor: '#315C45' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#315C45] mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#315C45] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-mono text-[#315C45] placeholder-[#315C45]/50 focus:outline-none focus:ring-2 focus:ring-[#315C45] bg-[#F6F5EF]"
                    style={{ borderColor: '#315C45' }}
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
                  className="text-[#315C45] hover:text-[#F6F5EF] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-bold font-mono transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                style={{
                  backgroundColor: '#315C45',
                  color: '#F6F5EF',
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
      </div>
    </div>
  );
};
