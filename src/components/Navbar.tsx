import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Sun,
  Moon,
  Globe,
  Video,
  Music,
  Image as ImageIcon,
  FileText,
  Menu,
  X,
  ExternalLink,
  Type,
  Shield,
  Info,
  Mail,
  AlertTriangle,
  Scale,
  Wrench,
  ChevronDown,
  Download,
  Search,
  Check,
} from 'lucide-react';
import { Language, Theme, FontSize, ModalType, ConverterCategory } from '../types';
import { translations } from '../translations';
import { IndonesiaFlag, EnglishFlag } from './FlagIcons';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  activeCategory: ConverterCategory;
  onSelectCategory: (cat: ConverterCategory) => void;
  onOpenModal: (type: ModalType) => void;
  onMobileMenuToggle?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  fontSize,
  onChangeFontSize,
  activeCategory,
  onSelectCategory,
  onOpenModal,
  onMobileMenuToggle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target)) {
        setFontDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setLangDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = translations[lang].nav;
  const isId = lang === 'id';

  const handleToggleMobileMenu = () => {
    const nextState = !mobileMenuOpen;
    setMobileMenuOpen(nextState);
    onMobileMenuToggle?.(nextState);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
    onMobileMenuToggle?.(false);
  };

  // Category definitions with formats hint
  const categories: {
    id: ConverterCategory;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'video',
      label: 'Video',
      sublabel: 'MP4, MKV, AVI, WEBM',
      icon: <Video className="w-4 h-4" />,
    },
    {
      id: 'audio',
      label: 'Audio',
      sublabel: 'MP3, WAV, AAC, FLAC',
      icon: <Music className="w-4 h-4" />,
    },
    {
      id: 'image',
      label: isId ? 'Gambar' : 'Image',
      sublabel: 'PNG, JPG, WEBP, PDF',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'document',
      label: isId ? 'Dokumen' : 'Document',
      sublabel: 'PDF, TXT, CSV, JSON',
      icon: <FileText className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* 1. Brand Logo - Authentic DriaSave aesthetic */}
          <div className="flex items-center shrink-0">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 hover:scale-105 transition-transform shrink-0"
                aria-label="DriaConvert Home"
              >
                <RefreshCw className="w-5 h-5 transition-transform duration-500 hover:rotate-180" />
              </a>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <a
                    href="/"
                    className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition"
                  >
                    Dria<span className="text-blue-600 dark:text-blue-500">Convert</span>
                  </a>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/80 px-1.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                    HD
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  <span>by</span>
                  <a
                    href="https://driacom.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-0.5 transition"
                  >
                    <span>Driacom</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Desktop Navigation: Category pills (Desktop Only) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

            {/* Desktop Menu Alat / Tools (DriaSave & DriaSeo) */}
            <div className="relative" ref={toolsDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setToolsDropdownOpen(!toolsDropdownOpen);
                  setFontDropdownOpen(false);
                  setLangDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  toolsDropdownOpen
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-500" />
                <span>{isId ? 'Alat' : 'Tools'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-80 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isId ? 'Menu Alat Driacom' : 'Driacom Tools Network'}
                  </div>
                  <a
                    href="https://save.driacom.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group mt-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <span>DriaSave</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {isId
                          ? 'Tools untuk mengunduh video, audio atau gambar dari berbagai sumber sosial media'
                          : 'Tools to download video, audio or images from various social media sources'}
                      </p>
                    </div>
                  </a>

                  <a
                    href="https://seo.driacom.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group mt-1"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <span>DriaSeo</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {isId
                          ? 'Tools untuk cek metrik domain authority dan domain rating'
                          : 'Tools to check domain authority and domain rating metrics'}
                      </p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* 3. Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop Only: Font Size Dropdown */}
            <div className="relative hidden md:block" ref={fontDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setFontDropdownOpen(!fontDropdownOpen);
                  setLangDropdownOpen(false);
                  setToolsDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border shadow-2xs ${
                  fontDropdownOpen
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                title={isId ? 'Ukuran Font' : 'Font Size'}
                aria-expanded={fontDropdownOpen}
              >
                <Type className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-xs font-bold">
                  {fontSize === 'small' ? 'Font (A-)' : fontSize === 'large' ? 'Font (A+)' : 'Font (A)'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${fontDropdownOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
              </button>

              {fontDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isId ? 'Ukuran Font' : 'Font Size'}
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { id: 'small', label: isId ? 'Kecil' : 'Small', hint: '85%', badge: 'A-' },
                      { id: 'normal', label: isId ? 'Standar' : 'Normal', hint: '100%', badge: 'A' },
                      { id: 'large', label: isId ? 'Besar' : 'Large', hint: '115%', badge: 'A+' },
                    ].map((item) => {
                      const isSelected = fontSize === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onChangeFontSize(item.id as FontSize);
                            setFontDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {item.badge}
                            </span>
                            <span>{item.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({item.hint})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Only: Language Dropdown */}
            <div className="relative hidden md:block" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setFontDropdownOpen(false);
                  setToolsDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border shadow-2xs ${
                  langDropdownOpen
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-300 dark:border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                title={isId ? 'Pilih Bahasa' : 'Choose Language'}
                aria-expanded={langDropdownOpen}
              >
                {lang === 'id' ? <IndonesiaFlag className="w-4 h-3 rounded-[2px]" /> : <EnglishFlag className="w-4 h-3 rounded-[2px]" />}
                <span className="uppercase text-xs font-extrabold">{lang === 'id' ? 'ID' : 'EN'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langDropdownOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {isId ? 'Pilih Bahasa' : 'Select Language'}
                  </div>
                  <div className="space-y-0.5">
                    {[
                      { code: 'id', flag: <IndonesiaFlag className="w-5 h-3.5" />, label: 'Bahasa Indonesia', badge: 'ID' },
                      { code: 'en', flag: <EnglishFlag className="w-5 h-3.5" />, label: 'English', badge: 'EN' },
                    ].map((item) => {
                      const isSelected = lang === item.code;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            if (lang !== item.code) {
                              onToggleLang();
                            }
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.flag}
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle (Visible on Mobile & Desktop) */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle dark/light theme"
              className="w-10 h-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* Mobile Hamburger Button (Clean & Modern on Mobile) */}
            <button
              onClick={handleToggleMobileMenu}
              className="lg:hidden w-10 h-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer shadow-2xs"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Organized & Responsive Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200/90 dark:border-slate-800/90 space-y-4 max-h-[calc(100dvh-4.5rem)] overflow-y-auto pb-28 overscroll-contain animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Section 1: Preferences (Bahasa & Font Size) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              {/* Bahasa Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isId ? 'Pilihan Bahasa' : 'Language'}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (lang !== 'id') onToggleLang();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      lang === 'id'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <IndonesiaFlag className="w-4 h-3 rounded-[2px]" />
                    <span>Indonesia</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (lang !== 'en') onToggleLang();
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      lang === 'en'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <EnglishFlag className="w-4 h-3 rounded-[2px]" />
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Ukuran Font Switcher */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Type className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{isId ? 'Ukuran Font Situs' : 'Website Font Size'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onChangeFontSize('small')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      fontSize === 'small'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {isId ? 'Kecil' : 'Small'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFontSize('normal')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      fontSize === 'normal'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFontSize('large')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      fontSize === 'large'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                    }`}
                  >
                    {isId ? 'Besar' : 'Large'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Menu Alat (DriaSave & DriaSeo) */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{isId ? 'Menu Alat (Tools)' : 'Tools Menu'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Driacom Network</span>
              </div>

              <div className="space-y-2">
                <a
                  href="https://save.driacom.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      <span>DriaSave</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                      {isId
                        ? 'Tools untuk mengunduh video, audio atau gambar dari berbagai sumber sosial media'
                        : 'Tools to download video, audio or images from various social media sources'}
                    </p>
                  </div>
                </a>

                <a
                  href="https://seo.driacom.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      <span>DriaSeo</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                      {isId
                        ? 'Tools untuk cek metrik domain authority dan domain rating'
                        : 'Tools to check domain authority and domain rating metrics'}
                    </p>
                  </div>
                </a>
              </div>
            </div>

            {/* Section 3: Alat Konversi Navigation */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
                {isId ? 'Kategori Konversi' : 'Converter Categories'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        handleCloseMobileMenu();
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={isActive ? 'text-white' : 'text-indigo-500'}>
                          {cat.icon}
                        </span>
                        <span className="font-bold text-xs">{cat.label}</span>
                      </div>
                      <span
                        className={`text-[10px] leading-tight ${
                          isActive ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {cat.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Informasi & Kebijakan */}
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2 py-1">
                {isId ? 'Kebijakan & Informasi' : 'Legal & Information'}
              </span>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <button
                  onClick={() => {
                    onOpenModal('about');
                    handleCloseMobileMenu();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition text-left cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{t.about}</span>
                </button>
                <button
                  onClick={() => {
                    onOpenModal('contact');
                    handleCloseMobileMenu();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition text-left cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{t.contact}</span>
                </button>
                <button
                  onClick={() => {
                    onOpenModal('privacy');
                    handleCloseMobileMenu();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition text-left cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{t.privacy}</span>
                </button>
                <button
                  onClick={() => {
                    onOpenModal('disclaimer');
                    handleCloseMobileMenu();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition text-left cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{t.disclaimer}</span>
                </button>
                <button
                  onClick={() => {
                    onOpenModal('terms');
                    handleCloseMobileMenu();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition text-left cursor-pointer col-span-2"
                >
                  <Scale className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{t.terms}</span>
                </button>
              </div>

              {/* Developer Link */}
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-2 text-xs">
                <span className="text-slate-400">Dukungan:</span>
                <a
                  href="https://driacom.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  <span>Driacom.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
