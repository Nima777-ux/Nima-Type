import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Github,
  Globe,
  Linkedin,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { ThemeMode } from '../types';
import { getPalette } from '../utils/themeConfig';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: ThemeMode;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'light',
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const p = getPalette(themeMode);

  const contactData = {
    name: 'Nima Nabizada',
    title: 'Lead Software Engineer & UI/UX Designer',
    email: 'nimaalkantra7@gmail.com',
    phone: '+93797355027',
    github: 'https://github.com/Nima777-ux',
    portfolio: 'https://portfolio-rho-five-5gh5l9nihn.vercel.app/',
    linkedin: 'https://www.linkedin.com/in/nima-nabizada-b14b5240b',
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all"
        style={{
          backgroundColor: p.cardBg,
          borderColor: p.border,
          color: p.text,
          boxShadow: `0 20px 50px -10px rgba(0,0,0,0.5), ${p.tubelightGlow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl border transition-colors cursor-pointer"
          style={{
            borderColor: p.border,
            color: p.text,
            backgroundColor: p.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
          }}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl border shadow-md relative"
            style={{
              backgroundColor: p.primary,
              borderColor: p.border,
              color: p.activeBtnText,
              boxShadow: p.tubelightGlow,
            }}
          >
            NN
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#38BDF8]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {contactData.name}
              </h2>
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider border"
                style={{
                  backgroundColor: p.primary,
                  borderColor: p.border,
                  color: p.activeBtnText,
                }}
              >
                Creator
              </span>
            </div>
            <p className="text-xs font-bold opacity-80" style={{ color: p.textMuted }}>
              Designed by Nima Nabizada
            </p>
          </div>
        </div>

        {/* Contact Methods List */}
        <div className="space-y-3">
          {/* Email */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: p.isDark ? '#1C2417' : '#F2E8CF',
              borderColor: p.border,
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="p-2 rounded-xl border flex-shrink-0"
                style={{ backgroundColor: p.primary, borderColor: p.border, color: p.activeBtnText }}
              >
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  Email
                </div>
                <a
                  href={`mailto:${contactData.email}`}
                  className="text-xs sm:text-sm font-bold truncate block hover:underline"
                  style={{ color: p.text }}
                >
                  {contactData.email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleCopy('email', contactData.email)}
                className="p-2 rounded-xl border transition-colors cursor-pointer"
                style={{ borderColor: p.border, color: p.text }}
                title="Copy Email"
              >
                {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`mailto:${contactData.email}`}
                className="tubelight-btn px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1"
                style={{
                  backgroundColor: p.primary,
                  borderColor: p.border,
                  color: p.activeBtnText,
                  boxShadow: p.tubelightGlow,
                }}
              >
                <span>Write</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Phone */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: p.isDark ? '#1C2417' : '#F2E8CF',
              borderColor: p.border,
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="p-2 rounded-xl border flex-shrink-0"
                style={{ backgroundColor: p.primary, borderColor: p.border, color: p.activeBtnText }}
              >
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  Phone / WhatsApp
                </div>
                <a
                  href={`tel:${contactData.phone}`}
                  className="text-xs sm:text-sm font-bold truncate block hover:underline"
                  style={{ color: p.text }}
                >
                  {contactData.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleCopy('phone', contactData.phone)}
                className="p-2 rounded-xl border transition-colors cursor-pointer"
                style={{ borderColor: p.border, color: p.text }}
                title="Copy Phone"
              >
                {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={`tel:${contactData.phone}`}
                className="tubelight-btn px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1"
                style={{
                  backgroundColor: p.primary,
                  borderColor: p.border,
                  color: p.activeBtnText,
                  boxShadow: p.tubelightGlow,
                }}
              >
                <span>Call</span>
                <Phone className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* GitHub */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: p.isDark ? '#1C2417' : '#F2E8CF',
              borderColor: p.border,
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="p-2 rounded-xl border flex-shrink-0"
                style={{ backgroundColor: p.primary, borderColor: p.border, color: p.activeBtnText }}
              >
                <Github className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  GitHub Profile
                </div>
                <a
                  href={contactData.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold truncate block hover:underline"
                  style={{ color: p.text }}
                >
                  github.com/Nima777-ux
                </a>
              </div>
            </div>

            <a
              href={contactData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="tubelight-btn px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
              style={{
                backgroundColor: p.primary,
                borderColor: p.border,
                color: p.activeBtnText,
                boxShadow: p.tubelightGlow,
              }}
            >
              <span>View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Portfolio */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: p.isDark ? '#1C2417' : '#F2E8CF',
              borderColor: p.border,
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="p-2 rounded-xl border flex-shrink-0"
                style={{ backgroundColor: p.primary, borderColor: p.border, color: p.activeBtnText }}
              >
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  Personal Portfolio
                </div>
                <a
                  href={contactData.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold truncate block hover:underline"
                  style={{ color: p.text }}
                >
                  portfolio-rho-five-5gh5l9nihn.vercel.app
                </a>
              </div>
            </div>

            <a
              href={contactData.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="tubelight-btn px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
              style={{
                backgroundColor: p.primary,
                borderColor: p.border,
                color: p.activeBtnText,
                boxShadow: p.tubelightGlow,
              }}
            >
              <span>Visit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* LinkedIn */}
          <div
            className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors"
            style={{
              backgroundColor: p.isDark ? '#1C2417' : '#F2E8CF',
              borderColor: p.border,
            }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className="p-2 rounded-xl border flex-shrink-0"
                style={{ backgroundColor: p.primary, borderColor: p.border, color: p.activeBtnText }}
              >
                <Linkedin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: p.textMuted }}>
                  LinkedIn Network
                </div>
                <a
                  href={contactData.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold truncate block hover:underline"
                  style={{ color: p.text }}
                >
                  linkedin.com/in/nima-nabizada
                </a>
              </div>
            </div>

            <a
              href={contactData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="tubelight-btn px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
              style={{
                backgroundColor: p.primary,
                borderColor: p.border,
                color: p.activeBtnText,
                boxShadow: p.tubelightGlow,
              }}
            >
              <span>Connect</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Credit within Modal */}
        <div
          className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-bold"
          style={{ borderColor: p.border, color: p.textMuted }}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Designed by Nima Nabizada</span>
          </div>
          <button
            onClick={onClose}
            className="hover:underline cursor-pointer"
            style={{ color: p.text }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
