import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

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
          backgroundColor: '#F6F5EF',
          borderColor: '#315C45',
          color: '#315C45',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between border-b pb-4 mb-5"
          style={{ borderColor: '#315C45' }}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#B59B7A]">
              Standalone Client
            </div>
            <h3 className="text-2xl font-bold tracking-tight mt-1 text-[#315C45]">
              Nima Type Desktop
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#315C45] hover:bg-[#315C45] hover:text-[#F6F5EF] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          <p className="leading-relaxed font-bold text-[#315C45]">
            Run <span className="text-[#B59B7A]">Nima Type</span> as a dedicated standalone desktop application with
            zero browser tab clutter and maximum performance.
          </p>

          {/* Direct Install Button */}
          {deferredPrompt ? (
            <div
              className="p-4 rounded-xl border my-3 shadow-sm"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
            >
              <div className="text-xs uppercase font-bold mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F6F5EF] animate-pulse" />
                Desktop Installer Ready
              </div>
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer border"
                style={{
                  backgroundColor: '#F6F5EF',
                  borderColor: '#B59B7A',
                  color: '#315C45',
                }}
              >
                Install Nima Type App
              </button>
            </div>
          ) : isInstalled ? (
            <div
              className="p-3 rounded-xl border text-xs font-bold"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
            >
              ✓ Nima Type is already running as an installed application!
            </div>
          ) : (
            <div
              className="p-4 rounded-xl border space-y-2 text-xs"
              style={{
                backgroundColor: '#315C45',
                borderColor: '#B59B7A',
                color: '#F6F5EF',
              }}
            >
              <div className="font-bold uppercase tracking-wider text-[#F6F5EF]">
                Desktop Install Steps:
              </div>
              <div className="space-y-2 text-[11px]">
                <div>
                  <span className="font-bold underline">1. Chrome / Edge / Brave:</span>
                  <p className="opacity-90">Click the install icon (⊕) on the right of your address bar or browser menu → "Install Nima Type".</p>
                </div>
                <div>
                  <span className="font-bold underline">2. Safari (macOS Sonoma+):</span>
                  <p className="opacity-90">Click File → "Add to Dock" to open directly from your dock.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t flex justify-end" style={{ borderColor: '#315C45' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border transition hover:bg-[#315C45] hover:text-[#F6F5EF]"
            style={{
              backgroundColor: '#315C45',
              borderColor: '#B59B7A',
              color: '#F6F5EF',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
