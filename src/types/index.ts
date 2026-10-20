export type ConverterCategory = 'video' | 'audio' | 'image' | 'document';

export interface FormatOption {
  format: string;
  label: string;
  category: ConverterCategory;
  extension: string;
}

export interface AdvancedOptions {
  resolution?: string; // original, 1080p, 720p, 480p, 360p, 1920, 1280, 800, icon
  quality?: 'high' | 'medium' | 'low';
  bitrate?: string; // 320k, 256k, 192k, 128k, 64k
  sampleRate?: string; // 44100, 48000
  grayscale?: boolean;
  muteAudio?: boolean;
  speed?: string; // 0.5, 0.75, 1, 1.25, 1.5, 2
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: ConverterCategory;
  targetFormat: string;
  options: AdvancedOptions;
  status: 'idle' | 'uploading' | 'converting' | 'success' | 'error';
  progress: number;
  progressStage?: string;
  downloading?: boolean;
  downloadUrl?: string;
  downloadToken?: string;
  outputName?: string;
  outputSize?: number;
  errorMessage?: string;
}

export type Language = 'id' | 'en';
export type Theme = 'dark' | 'light';
export type FontSize = 'small' | 'normal' | 'large';

export type ModalType = 'about' | 'contact' | 'privacy' | 'disclaimer' | 'terms' | null;

export interface SeoConfig {
  lang: Language;
  category: ConverterCategory;
  modal?: ModalType;
}

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogLocale: string;
  ogUrl: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  schemas: {
    webApp: Record<string, any>;
    howTo: Record<string, any>;
    faq: Record<string, any>;
    breadcrumb: Record<string, any>;
  };
}
