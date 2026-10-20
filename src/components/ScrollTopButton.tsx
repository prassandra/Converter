import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = windowHeight > 0 ? (totalScroll / windowHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
      setVisible(totalScroll > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* 1. Subtle Top Gradient Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Floating Back To Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 backdrop-blur-md border border-indigo-400/30 transition-all duration-300 transform cursor-pointer ${
          visible
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
      </button>
    </>
  );
};
