import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

interface SidebarAdProps {
  lang?: Language;
  className?: string;
  slotId?: string;
  adClient?: string;
}

export const SidebarAd: React.FC<SidebarAdProps> = ({
  className = '',
  slotId = '1222928318',
  adClient = 'ca-pub-2212969526982215',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ins = insRef.current;
    const container = containerRef.current;
    if (!ins || !container) return;

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
        // Suppress tag errors gracefully
      }

      setTimeout(checkStatus, 1500);
      setTimeout(checkStatus, 3500);
    };

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

    const fallbackTimer = setTimeout(() => {
      tryPushAd();
    }, 600);

    return () => {
      clearTimeout(fallbackTimer);
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [slotId]);

  if (isUnfilled) return null;

  return (
    <aside
      ref={containerRef}
      aria-label="Sidebar Advertisement"
      className={`w-full sticky top-20 self-start z-10 transition-all duration-200 ${className}`}
    >
      <div className="w-full rounded-2xl bg-transparent flex flex-col justify-center items-center min-h-[250px] overflow-hidden">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
