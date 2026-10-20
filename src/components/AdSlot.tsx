import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

export type AdSlotType =
  | 'leaderboard'     // Header/Top & Wide horizontal responsive display
  | 'rectangle'       // Mid-content responsive display
  | 'auto'            // Standard responsive display
  | 'in-feed'         // Kept for backward compatibility, mapped to responsive display
  | 'autorelaxed';

interface AdSlotProps {
  type: AdSlotType;
  lang?: Language;
  slotId?: string;
  format?: 'auto' | 'horizontal' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
  adClient?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  type,
  slotId,
  format,
  fullWidthResponsive = true,
  className = '',
  adClient = 'ca-pub-2212969526982215',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  // Map to purely responsive display formats
  let activeSlot = slotId || '5462390377';
  let activeFormat = format || 'auto';

  if (type === 'leaderboard') {
    activeSlot = slotId || '5462390377';
    activeFormat = format || 'auto'; // Fully responsive auto-scaling for leaderboard
  } else if (type === 'rectangle') {
    activeSlot = slotId || '1222928318';
    activeFormat = format || 'auto';
  } else {
    activeSlot = slotId || '5462390377';
    activeFormat = format || 'auto';
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ins = insRef.current;
    const container = containerRef.current;
    if (!ins || !container) return;

    // Detect if Google AdSense marked the ad unfilled
    const checkStatus = () => {
      if (!ins) return;
      const status = ins.getAttribute('data-ad-status');
      if (status === 'unfilled') {
        setIsUnfilled(true);
      }
    };

    const mutationObserver = new MutationObserver(() => {
      checkStatus();
    });

    mutationObserver.observe(ins, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-adsbygoogle-status'],
      childList: true,
    });

    const tryPushAd = () => {
      if (pushedRef.current || !ins || !container) return;
      if (container.offsetWidth <= 0) return;

      if (ins.getAttribute('data-adsbygoogle-status') || ins.childNodes.length > 0) {
        pushedRef.current = true;
        checkStatus();
        return;
      }

      try {
        pushedRef.current = true;
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        // Suppress tag errors gracefully (e.g. adblocker)
      }

      // Check for unfilled status after AdSense script executes
      setTimeout(checkStatus, 1500);
      setTimeout(checkStatus, 3500);
    };

    // Lazy load ads: Trigger push when approaching viewport (within 350px)
    let intersectionObserver: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              tryPushAd();
              intersectionObserver?.disconnect();
            }
          }
        },
        { rootMargin: '350px 0px' }
      );
      intersectionObserver.observe(container);
    }

    // Safety fallback: always try pushing after 500ms if not triggered yet
    const fallbackTimer = setTimeout(() => {
      tryPushAd();
    }, 500);

    return () => {
      clearTimeout(fallbackTimer);
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [activeSlot, activeFormat]);

  // If AdSense explicitly marks this slot as unfilled, remove it from DOM so no empty box shows
  if (isUnfilled) {
    return null;
  }

  return (
    <aside
      ref={containerRef}
      aria-label="Advertisement"
      className={`w-full max-w-5xl mx-auto px-0 sm:px-2 my-3 sm:my-5 overflow-hidden transition-all duration-200 ${className}`}
    >
      <div className={`w-full flex justify-center items-center text-center ${
        type === 'leaderboard' ? 'min-h-[90px] sm:min-h-[120px]' : 'min-h-[60px] sm:min-h-[90px]'
      }`}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
          }}
          data-ad-client={adClient}
          data-ad-slot={activeSlot}
          data-ad-format={activeFormat}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
        />
      </div>
    </aside>
  );
};
