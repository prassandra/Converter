import React, { useEffect, useRef } from 'react';
import { Language } from '../types';

interface StickyAdTowerProps {
  side: 'left' | 'right';
  lang?: Language;
  className?: string;
  adClient?: string;
  slotId?: string;
  slotCount?: number;
}

/**
 * Sticky Ad Tower with 3 slots of 300x250 ads
 * Uses data-ad-client="ca-pub-2212969526982215" and data-ad-slot="1116459861"
 * Remains sticky during scrolling so the conversion area stays centered
 */
export const StickyAdTower: React.FC<StickyAdTowerProps> = ({
  side,
  className = '',
  adClient = 'ca-pub-2212969526982215',
  slotId = '1116459861',
  slotCount = 3,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<(HTMLModElement | null)[]>([]);
  const pushedFlags = useRef<boolean[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize flags
    pushedFlags.current = new Array(slotCount).fill(false);

    const tryPushSlots = () => {
      slotsRef.current.forEach((ins, index) => {
        if (!ins) return;
        if (pushedFlags.current[index]) return;

        // Check if already populated
        if (ins.getAttribute('data-adsbygoogle-status') || ins.childNodes.length > 0) {
          pushedFlags.current[index] = true;
          return;
        }

        try {
          pushedFlags.current[index] = true;
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch {
          // Suppress tag errors gracefully
        }
      });
    };

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              tryPushSlots();
              observer?.disconnect();
            }
          }
        },
        { rootMargin: '300px 0px' }
      );
      observer.observe(containerRef.current);
    }

    const timer = setTimeout(tryPushSlots, 700);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [slotId, adClient, slotCount]);

  return (
    <aside
      ref={containerRef}
      aria-label={`${side === 'left' ? 'Left' : 'Right'} Sticky Advertisement`}
      className={`w-[300px] shrink-0 sticky top-24 self-start space-y-4 z-10 transition-all duration-200 ${className}`}
    >
      {Array.from({ length: slotCount }).map((_, i) => (
        <div
          key={`${side}-ad-${i}`}
          className="w-[300px] h-[250px] rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center overflow-hidden shadow-2xs"
        >
          <ins
            ref={(el) => {
              slotsRef.current[i] = el;
            }}
            className="adsbygoogle"
            style={{ display: 'inline-block', width: '300px', height: '250px' }}
            data-ad-client={adClient}
            data-ad-slot={slotId}
          />
        </div>
      ))}
    </aside>
  );
};
