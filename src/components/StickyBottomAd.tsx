import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../types';

interface StickyBottomAdProps {
  lang?: Language;
  slotId?: string;
  adClient?: string;
  isMenuOpen?: boolean;
}

export const StickyBottomAd: React.FC<StickyBottomAdProps> = ({
  slotId = '5462390377', // Responsive Header/Leaderboard Ad Slot ID
  adClient = 'ca-pub-2212969526982215',
  isMenuOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isUnfilled, setIsUnfilled] = useState(false);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  // 1. Ensure Google AdSense script is present in the document
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, [adClient]);

  // 2. Queue Flush: Guarantees this bottom slot receives its corresponding AdSense push call
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const flushQueueForSlot = () => {
      const ins = insRef.current;
      if (!ins) return;

      // If already initialized by Google AdSense, do not re-push
      if (ins.getAttribute('data-adsbygoogle-status')) {
        pushedRef.current = true;
        return;
      }

      // In Google AdSense, push({}) assigns to the next uninitialized <ins> in DOM order.
      // We count all uninitialized <ins.adsbygoogle> tags and push for each one to guarantee
      // that the queue reaches this bottom slot without being starved by upper elements.
      const uninitializedTags = document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])');
      if (uninitializedTags.length > 0) {
        uninitializedTags.forEach(() => {
          try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          } catch {
            // Ignore ad-blocker or script errors gracefully
          }
        });
        pushedRef.current = true;
      }
    };

    // Run immediately on mount
    flushQueueForSlot();

    // Safety checks in case DOM or AdSense library was still resolving
    const t1 = setTimeout(flushQueueForSlot, 300);
    const t2 = setTimeout(flushQueueForSlot, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [slotId]);

  // 3. MutationObserver to detect unfilled status and automatically collapse if unfilled
  useEffect(() => {
    if (!insRef.current) return;
    const check = () => {
      const el = insRef.current;
      if (el && el.getAttribute('data-ad-status') === 'unfilled') {
        setIsUnfilled(true);
      }
    };
    check();
    const obs = new MutationObserver(() => {
      check();
    });
    obs.observe(insRef.current, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
    });
    return () => obs.disconnect();
  }, []);

  if (isUnfilled || isMenuOpen) return null;

  return (
    <div
      role="complementary"
      aria-label="Responsive Sticky Footer Header Ad"
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-26px)]'
      }`}
    >
      {/* Handle tab button to collapse / expand */}
      <div className="flex justify-center -mb-px">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-5 py-1 rounded-t-xl bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-x border-slate-200/80 dark:border-slate-800 shadow-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer select-none"
          title={isOpen ? 'Sembunyikan iklan ke bawah' : 'Tampilkan iklan'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>

      {/* 
        Responsive container sized to hug Google AdSense header ad dimensions:
        min-h-[50px] on mobile (mobile banner/header), min-h-[90px] on desktop (leaderboard).
        Does not create an artificial empty white void blocking content.
      */}
      <div className="bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 shadow-2xl py-1.5 sm:py-2 px-1 sm:px-4">
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center overflow-visible min-h-[50px] sm:min-h-[90px]">
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              minHeight: '50px',
              textAlign: 'center',
            }}
            data-ad-client={adClient}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
};
