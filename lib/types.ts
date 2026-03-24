export type Category =
  | 'taxes'
  | 'insurance'
  | 'bank'
  | 'fines'
  | 'housing'
  | 'health'
  | 'employment'
  | 'legal'
  | 'other';

export type Status = 'new' | 'read' | 'done' | 'overdue';

export type Urgency = 'high' | 'medium' | 'low' | 'none';

export type Locale = 'fr' | 'en' | 'ru' | 'ar' | 'it' | 'zh' | 'pt' | 'tr';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Document {
  id: string;
  createdAt: string;
  title: string;
  category: Category;
  status: Status;
  whatIsThis: string;
  whatItSays: string;
  whatToDo: string[];
  deadline: string | null;
  deadlineDescription: string | null;
  urgency: Urgency;
  amounts: string[];
  imageData: string;
  chatHistory: ChatMessage[];
  language: string;
}

export interface Settings {
  language: Locale;
  notifications: {
    sevenDays: boolean;
    oneDay: boolean;
    today: boolean;
  };
  scanCount: number;
}

export interface AnalysisResponse {
  document_title: string;
  category: Category;
  what_is_this: string;
  what_it_says: string;
  what_to_do: string[];
  deadline: string | null;
  deadline_description: string | null;
  urgency: Urgency;
  amounts: string[];
}

export const MAX_FREE_SCANS = 5;

export const RTL_LOCALES: Locale[] = ['ar'];

export const LOCALE_NAMES: Record<Locale, string> = {
  fr: 'Fran\u00e7ais',
  en: 'English',
  ru: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439',
  ar: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629',
  it: 'Italiano',
  zh: '\u4e2d\u6587',
  pt: 'Portugu\u00eas',
  tr: 'T\u00fcrk\u00e7e',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  fr: '\ud83c\uddeb\ud83c\uddf7',
  en: '\ud83c\uddec\ud83c\udde7',
  ru: '\ud83c\uddf7\ud83c\uddfa',
  ar: '\ud83c\uddf8\ud83c\udde6',
  it: '\ud83c\uddee\ud83c\uddf9',
  zh: '\ud83c\udde8\ud83c\uddf3',
  pt: '\ud83c\udde7\ud83c\uddf7',
  tr: '\ud83c\uddf9\ud83c\uddf7',
};
