import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ConverterWidget } from './components/ConverterWidget';
import { AdSlot } from './components/AdSlot';
import { SidebarAd } from './components/SidebarAd';
import { StickyAdTower } from './components/StickyAdTower';
import { FeatureGrid } from './components/FeatureGrid';
import { HowItWorks } from './components/HowItWorks';
import { SupportedFormatsSection } from './components/SupportedFormatsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { LegalModals } from './components/LegalModals';
import { ScrollReveal } from './components/ScrollReveal';
import { ScrollTopButton } from './components/ScrollTopButton';
import { DynamicSeo } from './components/DynamicSeo';
import { Language, Theme, FontSize, ModalType, ConverterCategory } from './types';

export default function App() {
  // Language state (defaults to 'id' as requested, with persistence)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('driaconvert_lang');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  // Dark / Light Theme state with persistence
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('driaconvert_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Font Size state: 'small' (14px), 'normal' (16px), 'large' (18px)
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('driaconvert_font_size');
    if (saved === 'small' || saved === 'normal' || saved === 'large') return saved;
    return 'normal';
  });

  // Active Category & Quick Target Presets
  const [activeCategory, setActiveCategory] = useState<ConverterCategory>('video');
  const [presetTargetFormat, setPresetTargetFormat] = useState<string | undefined>(undefined);

  // Legal / Info Modal
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Mobile Drawer Menu State (to avoid bottom ad collision)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('driaconvert_theme', theme);
  }, [theme]);

  // URL Sanitizer: Clean any trailing rogue characters (/l, /I, etc.)
  useEffect(() => {
    try {
      const p = window.location.pathname;
      if (p && p !== '/' && !p.startsWith('/api')) {
        window.history.replaceState(null, '', '/' + window.location.search + window.location.hash);
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply responsive font size scale: kecil (16px), normal (18px), besar (20px) on desktop, comfortably scaled on mobile
  useEffect(() => {
    const root = document.documentElement;
    const applySize = () => {
      const isMobile = window.innerWidth < 640;
      if (fontSize === 'small') {
        root.style.fontSize = isMobile ? '14px' : '16px';
      } else if (fontSize === 'large') {
        root.style.fontSize = isMobile ? '16.5px' : '20px';
      } else {
        // normal (default: 18px on desktop, 15px on mobile)
        root.style.fontSize = isMobile ? '15px' : '18px';
      }
    };

    applySize();
    window.addEventListener('resize', applySize);
    localStorage.setItem('driaconvert_font_size', fontSize);

    return () => window.removeEventListener('resize', applySize);
  }, [fontSize]);

  // Save language
  useEffect(() => {
    localStorage.setItem('driaconvert_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // Language toggle handler
  const handleToggleLang = () => {
    setLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  // Theme toggle handler
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Handle Quick Preset click from Hero
  const handleQuickPreset = (category: ConverterCategory, targetFormat: string) => {
    setActiveCategory(category);
    setPresetTargetFormat(targetFormat);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative selection:bg-indigo-500/20 selection:text-indigo-400 overflow-x-clip">
      {/* Luxurious ambient background lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl h-[450px] bg-gradient-to-b from-indigo-500/[0.08] via-sky-500/[0.04] to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-[400px] -right-32 w-96 h-96 bg-violet-600/[0.05] rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-[600px] -left-32 w-96 h-96 bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Dynamic SEO Meta-Tags & Schema.org JSON-LD */}
      <DynamicSeo lang={lang} category={activeCategory} modal={activeModal} />

      {/* 1. Header & Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setPresetTargetFormat(undefined);
        }}
        onOpenModal={(modal) => setActiveModal(modal)}
        onMobileMenuToggle={(open) => setIsMobileMenuOpen(open)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Hero Section (Immediate above-the-fold engagement) */}
        <HeroSection lang={lang} onQuickPreset={handleQuickPreset} />

        {/* Top Responsive Header/Leaderboard Ad Slot */}
        <AdSlot type="leaderboard" lang={lang} slotId="5462390377" className="my-2 sm:my-3" />

        {/* Main Content Layout: Restored layout with 3 sticky ads in the right sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Primary Content Column */}
            <div className="w-full flex-1 min-w-0 space-y-8">
              {/* 2. Core FFmpeg Converter Widget */}
              <ScrollReveal direction="up" delay={60}>
                <ConverterWidget
                  key={`${activeCategory}-${presetTargetFormat || 'default'}`}
                  lang={lang}
                  activeCategory={activeCategory}
                  onSelectCategory={(cat) => {
                    setActiveCategory(cat);
                    setPresetTargetFormat(undefined);
                  }}
                  presetTargetFormat={presetTargetFormat}
                />
              </ScrollReveal>

              {/* Responsive Display Ad Slot (Below converter: 5462390377) */}
              <AdSlot
                type="auto"
                lang={lang}
                slotId="5462390377"
                format="auto"
                fullWidthResponsive={true}
                className="my-4"
              />

              {/* 4. Feature Highlights */}
              <ScrollReveal direction="up" delay={80}>
                <FeatureGrid lang={lang} />
              </ScrollReveal>

              {/* Mid-Content Display Ad Slot (1222928318) */}
              <AdSlot
                type="rectangle"
                lang={lang}
                slotId="1222928318"
                format="auto"
                fullWidthResponsive={true}
                className="my-5"
              />

              {/* 5. How It Works (3 Steps) */}
              <ScrollReveal direction="up" delay={80}>
                <HowItWorks lang={lang} />
              </ScrollReveal>

              {/* Mid-Lower Responsive Display Ad Slot (1222928318) */}
              <AdSlot
                type="auto"
                lang={lang}
                slotId="1222928318"
                format="auto"
                fullWidthResponsive={true}
                className="my-5"
              />

              {/* 6. Extensive Format Compatibility */}
              <ScrollReveal direction="up" delay={80}>
                <SupportedFormatsSection lang={lang} />
              </ScrollReveal>

              {/* Display Ad Slot (Above FAQ: 1222928318) */}
              <AdSlot
                type="rectangle"
                lang={lang}
                slotId="1222928318"
                format="auto"
                fullWidthResponsive={true}
                className="my-6"
              />

              {/* 7. FAQ Accordion for High SEO snippet ranking */}
              <ScrollReveal direction="up" delay={80}>
                <FaqSection lang={lang} />
              </ScrollReveal>

              {/* Display Ad Slot (Below FAQ: 5462390377) */}
              <AdSlot
                type="auto"
                lang={lang}
                slotId="5462390377"
                format="auto"
                fullWidthResponsive={true}
                className="my-6"
              />
            </div>

            {/* Right Sticky Sidebar Ad Column (Desktop Only: 3 x 300x250 Ads) */}
            <div className="hidden lg:block lg:w-[300px] lg:shrink-0 self-start sticky top-20">
              <StickyAdTower
                side="right"
                lang={lang}
                adClient="ca-pub-2212969526982215"
                slotId="1116459861"
                slotCount={3}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 8. Footer with About, Contact, Privacy Policy, Disclaimer, Terms, and Created by Driacom */}
      <Footer
        lang={lang}
        onOpenModal={(modal) => setActiveModal(modal)}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 9. Interactive Legal & Information Modals */}
      <LegalModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        lang={lang}
      />

      {/* 10. Scroll Progress Bar & Back to Top Floating Button */}
      <ScrollTopButton />
    </div>
  );
}
