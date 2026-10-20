import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // milliseconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 420,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported or user prefers reduced motion
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) {
        observer.unobserve(currentElem);
      }
    };
  }, []);

  // Compute direction offsets - subtle and lightweight (14px instead of 28px, scale 0.99)
  const getTransform = () => {
    if (isVisible) return 'none';
    switch (direction) {
      case 'up':
        return 'translate3d(0, 14px, 0)';
      case 'down':
        return 'translate3d(0, -14px, 0)';
      case 'left':
        return 'translate3d(14px, 0, 0)';
      case 'right':
        return 'translate3d(-14px, 0, 0)';
      case 'none':
        return 'none';
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
      className={className}
    >
      {children}
    </div>
  );
};
