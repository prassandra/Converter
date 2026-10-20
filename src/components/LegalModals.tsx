import React, { useState } from 'react';
import { X, Mail, Globe, Send, Shield, FileText, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ModalType, Language } from '../types';
import { translations } from '../translations';

interface LegalModalsProps {
  activeModal: ModalType;
  onClose: () => void;
  lang: Language;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose, lang }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  if (!activeModal) return null;

  const m = translations[lang].modals;
  const isId = lang === 'id';

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    // Send feedback to driacom.id@gmail.com
    const subject = encodeURIComponent(`[DriaConvert Feedback] Pesan dari ${contactName}`);
    const body = encodeURIComponent(
      `Halo Tim Driacom,\n\nNama Pengirim: ${contactName}\nEmail Pengirim: ${contactEmail}\n\nPesan / Masukan:\n${contactMessage}\n\n---\nDikirim melalui form kontak DriaConvert (https://convert.driacom.com)`
    );
    const mailtoUrl = `mailto:driacom.id@gmail.com?subject=${subject}&body=${body}`;

    try {
      window.location.href = mailtoUrl;
    } catch {
      // Fallback
    }

    setIsSent(true);
  };

  const renderContent = () => {
    switch (activeModal) {
      case 'about':
        return (
          <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
              <Info className="w-5 h-5" />
              <span>{m.about.title}</span>
            </div>
            {m.about.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Driacom Digital</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Pengembang & Pemelihara Solusi DriaConvert</p>
                </div>
                <a
                  href="https://driacom.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition"
                >
                  Kunjungi Website
                </a>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
              <Mail className="w-5 h-5" />
              <span>{m.contact.title}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {m.contact.desc}
            </p>

            {isSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {isId ? 'Pesan Siap Dikirim!' : 'Message Ready to Send!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  {isId
                    ? 'Aplikasi email Anda telah dibuka untuk mengirim pesan ini ke driacom.id@gmail.com. Jika aplikasi email tidak terbuka otomatis, klik tombol di bawah.'
                    : 'Your email app has been opened to send this to driacom.id@gmail.com. If your email app did not open automatically, click the button below.'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <a
                    href={`mailto:driacom.id@gmail.com?subject=${encodeURIComponent(
                      `[DriaConvert Feedback] Pesan dari ${contactName}`
                    )}&body=${encodeURIComponent(
                      `Nama: ${contactName}\nEmail: ${contactEmail}\n\nPesan:\n${contactMessage}`
                    )}`}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Kirim via Email (driacom.id@gmail.com)</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsSent(false);
                      setContactMessage('');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition"
                  >
                    {isId ? 'Tulis Pesan Lain' : 'Write Another Message'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {m.contact.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder={isId ? 'Nama Lengkap' : 'Full Name'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {m.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {m.contact.messageLabel}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={isId ? 'Tuliskan pertanyaan, saran, atau masukan Anda di sini...' : 'Write your question, suggestion, or feedback here...'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{m.contact.sendBtn} ke driacom.id@gmail.com</span>
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <a
                  href="mailto:driacom.id@gmail.com"
                  className="hover:underline text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  driacom.id@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <a href="https://driacom.com" target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-600 dark:text-indigo-400">
                  https://driacom.com
                </a>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
              <Shield className="w-5 h-5" />
              <span>{m.privacy.title}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mb-2">{m.privacy.lastUpdated}</span>
            {m.privacy.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        );

      case 'disclaimer':
        return (
          <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold mb-1">
              <AlertTriangle className="w-5 h-5" />
              <span>{m.disclaimer.title}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mb-2">{m.disclaimer.lastUpdated}</span>
            {m.disclaimer.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-4 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
              <FileText className="w-5 h-5" />
              <span>{m.terms.title}</span>
            </div>
            <span className="text-[11px] text-slate-400 block mb-2">{m.terms.lastUpdated}</span>
            {m.terms.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isId ? 'Informasi Resmi' : 'Official Information'}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
