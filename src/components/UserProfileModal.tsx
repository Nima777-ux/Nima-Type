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
import { UserAccount } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onClose: () => void;
  onLogout: () => void;
  appLang?: 'en' | 'fa';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onLogout,
}) => {
  if (!isOpen || !user) return null;

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
        className="relative w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl border select-none"
        style={{
          backgroundColor: '#F6F5EF', // Primary (swapped)
          borderColor: '#315C45', // Secondary
          color: '#315C45', // Text
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md border"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#315C45] font-mono leading-tight">
                {user.name}
              </h3>
              {user.verified && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border"
                  style={{
                    backgroundColor: '#315C45',
                    borderColor: '#B59B7A',
                    color: '#F6F5EF',
                  }}
                  title="Verified Account"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-[#B59B7A] flex items-center gap-1 mt-0.5 font-bold">
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
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs text-[#F6F5EF]/80 font-mono">
              <Trophy className="w-3.5 h-3.5 text-[#F6F5EF]" />
              <span>Best Speed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#F6F5EF]">
                {stats.highestWpm}
              </span>
              <span className="text-[11px] font-mono opacity-80">WPM</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs text-[#F6F5EF]/80 font-mono">
              <Activity className="w-3.5 h-3.5 text-[#F6F5EF]" />
              <span>Average Speed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#F6F5EF]">
                {stats.averageWpm}
              </span>
              <span className="text-[11px] font-mono opacity-80">WPM</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs text-[#F6F5EF]/80 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#F6F5EF]" />
              <span>Tests Completed</span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#F6F5EF]">
                {stats.testsCompleted}
              </span>
              <span className="text-[11px] font-mono opacity-80">tests</span>
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border flex flex-col justify-between"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs text-[#F6F5EF]/80 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#F6F5EF]" />
              <span>Member Since</span>
            </div>
            <div className="mt-2 text-xs font-bold font-mono text-[#F6F5EF] truncate">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold font-mono transition-all text-[#315C45] bg-[#F6F5EF] hover:opacity-90 cursor-pointer"
            style={{ borderColor: '#315C45' }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
            style={{
              backgroundColor: '#315C45',
              color: '#F6F5EF',
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
