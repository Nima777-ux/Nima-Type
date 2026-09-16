import React from 'react';
import {
  Mail,
  ShieldCheck,
  Trophy,
  Activity,
  Clock,
  LogOut,
  X,
  Calendar,
} from 'lucide-react';
import { UserAccount, ThemeMode } from '../types';
import { getPalette } from '../utils/themeConfig';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onClose: () => void;
  onLogout: () => void;
  appLang?: 'en' | 'fa';
  themeMode?: ThemeMode;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onLogout,
  themeMode = 'light',
}) => {
  if (!isOpen || !user) return null;

  const p = getPalette(themeMode);

  const stats = user.stats || {
    testsCompleted: 0,
    highestWpm: 0,
    averageWpm: 0,
    totalTimeSeconds: 0,
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl border select-none font-mono"
        style={{
          backgroundColor: p.cardSurface,
          borderColor: p.border,
          color: p.text,
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), ${p.tubelightGlow}`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors cursor-pointer hover:opacity-80"
          style={{ color: p.text }}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md border"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
              boxShadow: p.tubelightGlow,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-mono leading-tight" style={{ color: p.text }}>
                {user.name}
              </h3>
              {user.verified && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
                  style={{
                    backgroundColor: p.cardBg,
                    borderColor: p.border,
                    color: p.text,
                    boxShadow: p.tubelightGlow,
                  }}
                  title="Verified Account"
                >
                  <ShieldCheck className="w-3 h-3 text-[#38BDF8]" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs font-mono flex items-center gap-1 mt-0.5 font-bold" style={{ color: p.textMuted }}>
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center gap-1.5 text-xs opacity-80 font-mono">
              <Trophy className="w-3.5 h-3.5" />
              <span>Best Speed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono" style={{ color: p.text }}>
                {stats.highestWpm}
              </span>
              <span className="text-[11px] font-mono opacity-80">WPM</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center gap-1.5 text-xs opacity-80 font-mono">
              <Activity className="w-3.5 h-3.5" />
              <span>Average Speed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono" style={{ color: p.text }}>
                {stats.averageWpm}
              </span>
              <span className="text-[11px] font-mono opacity-80">WPM</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center gap-1.5 text-xs opacity-80 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Tests Completed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono" style={{ color: p.text }}>
                {stats.testsCompleted}
              </span>
              <span className="text-[11px] font-mono opacity-80">tests</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: p.cardBg,
              borderColor: p.border,
              color: p.text,
            }}
          >
            <div className="flex items-center gap-1.5 text-xs opacity-80 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member Since</span>
            </div>
            <div className="mt-2 text-xs font-bold font-mono truncate" style={{ color: p.text }}>
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer hover:opacity-80"
            style={{
              borderColor: p.border,
              backgroundColor: p.cardBg,
              color: p.text,
            }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="tubelight-btn flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer border"
            style={{
              backgroundColor: p.primary,
              borderColor: p.border,
              color: p.activeBtnText,
              boxShadow: p.tubelightGlow,
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
