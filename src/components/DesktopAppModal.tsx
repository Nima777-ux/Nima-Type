import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ThemeMode } from '../types';
import { getPalette } from '../utils/themeConfig';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'light',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const p = getPalette(themeMode);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Install error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-mono">
      <div
        className="relative w-full max-w-lg rounded-2xl border p-6 sm:p-7 shadow-xl select-none"
        style={{
          backgroundColor: p.cardSurface,
          borderColor: p.border,
          color: p.text,
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), ${p.tubelightGlow}`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b pb-4 mb-5"
          style={{ borderColor: p.border }}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textMuted }}>
              Standalone Client
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: p.text }}>
                Nima Type Desktop
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border flex items-center gap-1.5"
                style={{
                  backgroundColor: p.cardBg,
                  borderColor: p.border,
                  color: p.text,
                  boxShadow: p.tubelightGlow,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                Sigma
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition cursor-pointer hover:opacity-80"
            style={{
              borderColor: p.border,
              color: p.text,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          <p className="leading-relaxed font-bold" style={{ color: p.text }}>
            Run <span className="font-black">Nima Type</span> as a dedicated standalone desktop application with
            zero browser tab clutter and maximum performance.
          </p>

          {/* Direct Install Button */}
          {deferredPrompt ? (
            <div
              className="p-4 rounded-xl border my-3 shadow-sm"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
              }}
            >
              <div className="text-xs uppercase font-bold mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                Desktop Installer Ready
              </div>
              <button
                onClick={handleInstallClick}
                className="tubelight-btn w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border"
                style={{
                  backgroundColor: p.primary,
                  borderColor: p.border,
                  color: p.activeBtnText,
                  boxShadow: p.tubelightGlow,
                }}
              >
                Install Nima Type App
              </button>
            </div>
          ) : isInstalled ? (
            <div
              className="p-3 rounded-xl border text-xs font-bold"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
                boxShadow: p.tubelightGlow,
              }}
            >
              ✓ Nima Type is already running as an installed application!
            </div>
          ) : (
            <div
              className="p-4 rounded-xl border space-y-2 text-xs"
              style={{
                backgroundColor: p.cardBg,
                borderColor: p.border,
                color: p.text,
              }}
            >
              <div className="font-bold uppercase tracking-wider">
                Desktop Install Steps:
              </div>
              <div className="space-y-2 text-[11px] opacity-90">
                <div>
                  <span className="font-bold underline">1. Chrome / Edge / Brave:</span>
                  <p className="opacity-95">Click the install icon (⊕) on the right of your address bar or browser menu → "Install Nima Type".</p>
                </div>
                <div>
                  <span className="font-bold underline">2. Safari (macOS Sonoma+):</span>
                  <p className="opacity-95">Click File → "Add to Dock" to open directly from your dock.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t flex justify-between items-center" style={{ borderColor: p.border }}>
          <span className="text-[11px] font-bold" style={{ color: p.textMuted }}>
            Designed by Nima Nabizada
          </span>
          <button
            onClick={onClose}
            className="tubelight-btn px-5 py-2 rounded-lg text-xs font-bold cursor-pointer border transition"
            style={{
              backgroundColor: p.primary,
              borderColor: p.border,
              color: p.activeBtnText,
              boxShadow: p.tubelightGlow,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
