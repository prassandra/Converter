import { SeoConfig, SeoMetadata, ConverterCategory, Language } from '../types';
import { translations } from '../translations';

const BASE_URL = 'https://convert.driacom.com';
const BRAND_NAME = 'DriaConvert';
const OG_IMAGE = 'https://convert.driacom.com/apple-touch-icon.png';

interface CategorySeoInfo {
  title: string;
  description: string;
  keywords: string;
  featureList: string[];
}

const SEO_CONTENT: Record<Language, Record<ConverterCategory, CategorySeoInfo>> = {
  id: {
    video: {
      title: `${BRAND_NAME} – Konverter Video Online Gratis (MP4, MKV, AVI, WEBM, MOV)`,
      description:
        'Konversi video online gratis, cepat, dan tanpa batas ukuran rumit dengan server FFmpeg. Ubah MP4, MKV, AVI, MOV ke WEBM, MP3, GIF dengan resolusi prima.',
      keywords:
        'konverter video online, ubah mp4 ke mkv, convert mp4 to mp3, ubah video ke audio, kompres video online, ffmpeg video converter, driaconvert, driacom',
      featureList: [
        'Konversi video multi-format (MP4, MKV, AVI, MOV, WEBM, GIF, FLV)',
        'Ekstrak audio langsung dari video ke MP3, WAV, AAC',
        'Pilihan resolusi (1080p, 720p, 480p, 360p)',
        'Mesin FFmpeg server-side berkinerja tinggi',
        'Tanpa registrasi akun dan 100% privasi terlindungi',
      ],
    },
    audio: {
      title: `${BRAND_NAME} – Konverter Audio Online Gratis (MP3, WAV, AAC, FLAC, OGG)`,
      description:
        'Ubah format audio online dengan mudah dan cepat. Ekstrak suara ke MP3, WAV, AAC, FLAC, OGG dengan pengaturan bitrate hingga 320kbps tanpa watermark.',
      keywords:
        'konverter audio online, ubah wav ke mp3, konversi audio flac, bitrate 320k mp3, konversi suara online, free audio converter, driaconvert',
      featureList: [
        'Konversi audio ultra jernih (MP3, WAV, AAC, OGG, FLAC, M4A, OPUS)',
        'Dukungan kustom bitrate hingga 320 kbps dan sample rate 48kHz',
        'Batch antrean konversi multi-file sekaligus',
        'Privasi terjamin dengan penghapusan otomatis 30 menit',
      ],
    },
    image: {
      title: `${BRAND_NAME} – Konverter Gambar Online Gratis (PNG, JPG, WEBP, AVIF, PDF)`,
      description:
        'Konversi gambar cepat ke WEBP, JPG, PNG, AVIF, atau PDF. Kompresi cerdas menjaga kualitas visual terbaik untuk website dan media sosial.',
      keywords:
        'konverter gambar online, ubah webp ke png, jpg ke pdf online, konversi avif, kompres foto online, image converter, driaconvert',
      featureList: [
        'Konversi format gambar modern (PNG, JPG, WEBP, AVIF, BMP, TIFF, ICO, PDF)',
        'Optimalisasi ukuran web tanpa mengurangi ketajaman visual',
        'Konversi batch puluhan foto sekaligus menjadi arsip ZIP',
        'Tanpa watermark dan bebas iklan mengganggu',
      ],
    },
    document: {
      title: `${BRAND_NAME} – Konverter Dokumen Online Gratis (PDF, TXT, CSV, JSON, HTML)`,
      description:
        'Ubah file dokumen online secara instan dan aman. Konversi teks ke PDF, CSV ke JSON, HTML ke PDF tanpa registrasi akun. 100% privasi terjaga.',
      keywords:
        'konverter dokumen online, csv ke json online, text to pdf converter, konversi html ke pdf, free document converter, driaconvert',
      featureList: [
        'Konversi dokumen cepat (PDF, TXT, Markdown, HTML, CSV, JSON)',
        'Konversi tabel data CSV ke JSON terstruktur otomatis',
        'Render instan teks ke format PDF rapi',
        'Keamanan dokumen terenkripsi di server',
      ],
    },
  },
  en: {
    video: {
      title: `${BRAND_NAME} – Free Online Video Converter (MP4, MKV, AVI, WEBM, MOV)`,
      description:
        'Convert videos online quickly and securely with server-side FFmpeg. Easily convert MP4, MKV, AVI, MOV to WEBM, MP3, GIF in high definition.',
      keywords:
        'online video converter, convert mp4 to mp3, mkv to mp4, webm converter, batch video converter, free ffmpeg online, driaconvert',
      featureList: [
        'Multi-format video conversion (MP4, MKV, AVI, MOV, WEBM, GIF, FLV)',
        'Direct audio extraction from video to MP3, WAV, AAC',
        'Custom resolution controls (1080p, 720p, 480p, 360p)',
        'High performance server-side FFmpeg engine',
        'No registration required and 100% privacy protected',
      ],
    },
    audio: {
      title: `${BRAND_NAME} – Free Online Audio Converter (MP3, WAV, AAC, FLAC, OGG)`,
      description:
        'Fast and free online audio converter. Convert between MP3, WAV, AAC, FLAC, OGG, and M4A with high-bitrate options up to 320kbps.',
      keywords:
        'online audio converter, wav to mp3, flac converter, 320kbps mp3 converter, audio format changer, driaconvert',
      featureList: [
        'Crystal clear audio conversion (MP3, WAV, AAC, OGG, FLAC, M4A, OPUS)',
        'Custom bitrate control up to 320 kbps & 48kHz sample rate',
        'Batch multi-file conversion queue with instant ZIP download',
        'Guaranteed privacy with automatic 30-minute server cleanup',
      ],
    },
    image: {
      title: `${BRAND_NAME} – Free Online Image Converter (PNG, JPG, WEBP, AVIF, PDF)`,
      description:
        'Convert images online instantly to modern WebP, JPG, PNG, AVIF, or PDF. High-quality compression optimized for web speed and social sharing.',
      keywords:
        'online image converter, webp to png, jpg to pdf, avif converter, compress images online, driaconvert',
      featureList: [
        'Modern image format support (PNG, JPG, WEBP, AVIF, BMP, TIFF, ICO, PDF)',
        'Smart compression keeping sharp visual quality for websites',
        'Batch queue for converting dozens of photos simultaneously',
        'Zero watermarks and 100% free tool',
      ],
    },
    document: {
      title: `${BRAND_NAME} – Free Online Document Converter (PDF, TXT, CSV, JSON, HTML)`,
      description:
        'Easily convert document and data files online. Transform TXT to PDF, CSV to JSON, HTML to PDF with zero signup and 100% data privacy.',
      keywords:
        'online document converter, csv to json, txt to pdf, html to pdf converter, secure file converter, driaconvert',
      featureList: [
        'Fast document conversion (PDF, TXT, Markdown, HTML, CSV, JSON)',
        'Convert tabular CSV data to structured JSON automatically',
        'Clean text-to-PDF rendering',
        'Server-side encrypted temporary processing',
      ],
    },
  },
};

/**
 * Dynamically computes metadata and Schema.org JSON-LD based on current state.
 */
export function getSeoMetadata(config: SeoConfig): SeoMetadata {
  const { lang, category, modal } = config;
  const t = translations[lang];
  const catSeo = SEO_CONTENT[lang][category] || SEO_CONTENT.id.video;

  let title = catSeo.title;
  let description = catSeo.description;

  // If a modal is currently open, adjust the title gracefully for user context & SEO
  if (modal) {
    const modalTitles: Record<string, { id: string; en: string }> = {
      about: { id: 'Tentang Kami', en: 'About Us' },
      contact: { id: 'Hubungi Kami', en: 'Contact Us' },
      privacy: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
      disclaimer: { id: 'Penafian', en: 'Disclaimer' },
      terms: { id: 'Syarat & Ketentuan', en: 'Terms of Service' },
    };
    const modalName = modalTitles[modal]?.[lang] || 'Informasi';
    title = `${modalName} | ${BRAND_NAME}`;
    description =
      lang === 'id'
        ? `Informasi resmi mengenai ${modalName.toLowerCase()} pada platform konversi file ${BRAND_NAME}.`
        : `Official information about ${modalName.toLowerCase()} on the ${BRAND_NAME} file conversion platform.`;
  }

  const categoryLabels: Record<ConverterCategory, { id: string; en: string }> = {
    video: { id: 'Konverter Video', en: 'Video Converter' },
    audio: { id: 'Konverter Audio', en: 'Audio Converter' },
    image: { id: 'Konverter Gambar', en: 'Image Converter' },
    document: { id: 'Konverter Dokumen', en: 'Document Converter' },
  };
  const categoryLabel = categoryLabels[category][lang];

  // 1. WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: BRAND_NAME,
    applicationCategory: category === 'document' ? 'BusinessApplication' : 'MultimediaApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description,
    url: BASE_URL,
    image: OG_IMAGE,
    creator: {
      '@type': 'Organization',
      name: 'Driacom',
      url: 'https://driacom.com',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: catSeo.featureList,
  };

  // 2. HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name:
      lang === 'id'
        ? `Cara Menggunakan ${categoryLabel} di ${BRAND_NAME}`
        : `How to Use ${categoryLabel} on ${BRAND_NAME}`,
    description: t.howItWorks.subtitle,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: t.howItWorks.step1_title,
        text: t.howItWorks.step1_desc,
        url: `${BASE_URL}/#converter`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: t.howItWorks.step2_title,
        text: t.howItWorks.step2_desc,
        url: `${BASE_URL}/#converter`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: t.howItWorks.step3_title,
        text: t.howItWorks.step3_desc,
        url: `${BASE_URL}/#converter`,
      },
    ],
  };

  // 3. FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: t.faq.q1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: t.faq.a1,
        },
      },
      {
        '@type': 'Question',
        name: t.faq.q2,
        acceptedAnswer: {
          '@type': 'Answer',
          text: t.faq.a2,
        },
      },
      {
        '@type': 'Question',
        name: t.faq.q3,
        acceptedAnswer: {
          '@type': 'Answer',
          text: t.faq.a3,
        },
      },
      {
        '@type': 'Question',
        name: t.faq.q4,
        acceptedAnswer: {
          '@type': 'Answer',
          text: t.faq.a4,
        },
      },
    ],
  };

  // 4. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabel,
        item: `${BASE_URL}/#${category}`,
      },
    ],
  };

  return {
    title,
    description,
    keywords: catSeo.keywords,
    canonicalUrl: BASE_URL + '/',
    ogTitle: title,
    ogDescription: description,
    ogLocale: lang === 'id' ? 'id_ID' : 'en_US',
    ogUrl: BASE_URL + '/',
    ogImage: OG_IMAGE,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: OG_IMAGE,
    schemas: {
      webApp: webAppSchema,
      howTo: howToSchema,
      faq: faqSchema,
      breadcrumb: breadcrumbSchema,
    },
  };
}

/**
 * Helper to update or create a <meta> tag by name or property.
 */
function setMetaTag(selector: string, attributeName: string, attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a <link rel="..."> tag.
 */
function setLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Helper to inject or update a dynamic <script type="application/ld+json"> tag.
 */
function setJsonLdScript(id: string, schemaData: Record<string, any>) {
  if (typeof document === 'undefined') return;
  let scriptEl = document.getElementById(id) as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = id;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(schemaData, null, 2);
}

/**
 * Applies dynamic SEO metadata, OpenGraph, Twitter, and Schema.org structured data to the document head.
 */
export function applySeoMetadata(config: SeoConfig): SeoMetadata {
  const seo = getSeoMetadata(config);

  if (typeof document === 'undefined') return seo;

  // 1. Title & HTML Lang
  document.title = seo.title;
  document.documentElement.lang = config.lang;

  // 2. Standard Search Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', seo.keywords);
  setMetaTag('meta[name="author"]', 'name', 'author', 'Driacom');

  // 3. Canonical Link
  setLinkTag('canonical', seo.canonicalUrl);

  // 4. OpenGraph Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.ogTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.ogDescription);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', seo.ogUrl);
  setMetaTag('meta[property="og:locale"]', 'property', 'og:locale', seo.ogLocale);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', BRAND_NAME);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', seo.ogImage);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');

  // 5. Twitter Card Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', seo.twitterTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', seo.twitterDescription);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', seo.twitterImage);
  setMetaTag('meta[name="twitter:domain"]', 'name', 'twitter:domain', 'convert.driacom.com');
  setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', seo.ogUrl);

  // 6. Schema.org JSON-LD Structured Data
  setJsonLdScript('driaconvert-schema-webapp', seo.schemas.webApp);
  setJsonLdScript('driaconvert-schema-howto', seo.schemas.howTo);
  setJsonLdScript('driaconvert-schema-faq', seo.schemas.faq);
  setJsonLdScript('driaconvert-schema-breadcrumb', seo.schemas.breadcrumb);

  return seo;
}
