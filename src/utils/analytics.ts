/**
 * Google Analytics 4 (GA4) Event Dispatcher
 * Tracks pageviews, file conversions, category changes, and downloads.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
};
