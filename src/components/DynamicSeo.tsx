import React, { useEffect } from 'react';
import { Language, ConverterCategory, ModalType } from '../types';
import { applySeoMetadata, getSeoMetadata } from '../utils/seo';
import { trackPageView, trackEvent } from '../utils/analytics';

export interface DynamicSeoProps {
  lang: Language;
  category: ConverterCategory;
  modal?: ModalType;
}

/**
 * DynamicSeo Component
 * Automatically synchronizes document title, standard meta tags (description, keywords, canonical),
 * OpenGraph, Twitter social cards, and Schema.org JSON-LD structured data (WebApplication, HowTo, FAQPage, BreadcrumbList)
 * and dispatches Google Analytics 4 page_view and category tracking.
 */
export const DynamicSeo: React.FC<DynamicSeoProps> = ({ lang, category, modal }) => {
  useEffect(() => {
    const seo = applySeoMetadata({ lang, category, modal });
    trackPageView(window.location.pathname + (category ? `#${category}` : ''), seo.title);
    trackEvent('seo_state_change', {
      language: lang,
      category,
      modal: modal || 'none',
    });
  }, [lang, category, modal]);

  return null;
};

export { getSeoMetadata, applySeoMetadata };
