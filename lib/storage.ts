import { Document, Settings, Locale, MAX_FREE_SCANS } from './types';

const DOCUMENTS_KEY = 'doclear_documents';
const SETTINGS_KEY = 'doclear_settings';
const ONBOARDING_KEY = 'doclear_onboarding_done';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Documents
export function getDocuments(): Document[] {
  if (!isBrowser()) return [];
  try {
    const data = localStorage.getItem(DOCUMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDocuments(docs: Document[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

export function getDocument(id: string): Document | undefined {
  return getDocuments().find((d) => d.id === id);
}

export function addDocument(doc: Document): void {
  const docs = getDocuments();
  docs.unshift(doc);
  saveDocuments(docs);
}

export function updateDocument(id: string, updates: Partial<Document>): void {
  const docs = getDocuments();
  const index = docs.findIndex((d) => d.id === id);
  if (index !== -1) {
    docs[index] = { ...docs[index], ...updates };
    saveDocuments(docs);
  }
}

export function deleteDocument(id: string): void {
  const docs = getDocuments().filter((d) => d.id !== id);
  saveDocuments(docs);
}

// Settings
export function getSettings(): Settings {
  if (!isBrowser()) {
    return defaultSettings();
  }
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return defaultSettings();
}

function defaultSettings(): Settings {
  const browserLang = isBrowser() ? navigator.language.slice(0, 2) : 'fr';
  const validLocales: Locale[] = ['fr', 'en', 'ru', 'ar', 'it', 'zh', 'pt', 'tr'];
  const language = validLocales.includes(browserLang as Locale)
    ? (browserLang as Locale)
    : 'fr';

  return {
    language,
    notifications: { sevenDays: true, oneDay: true, today: true },
    scanCount: 0,
  };
}

export function saveSettings(settings: Settings): void {
  if (!isBrowser()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function incrementScanCount(): number {
  const settings = getSettings();
  settings.scanCount += 1;
  saveSettings(settings);
  return settings.scanCount;
}

export function canScan(): boolean {
  const settings = getSettings();
  return settings.scanCount < MAX_FREE_SCANS;
}

export function getRemainingScans(): number {
  const settings = getSettings();
  return Math.max(0, MAX_FREE_SCANS - settings.scanCount);
}

// Onboarding
export function isOnboardingDone(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function setOnboardingDone(): void {
  if (!isBrowser()) return;
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

// Deadline checker
export function checkAndUpdateOverdue(): Document[] {
  const docs = getDocuments();
  const now = new Date();
  let changed = false;

  docs.forEach((doc) => {
    if (doc.deadline && doc.status !== 'done') {
      const deadlineDate = new Date(doc.deadline);
      if (deadlineDate < now && doc.status !== 'overdue') {
        doc.status = 'overdue';
        changed = true;
      }
    }
  });

  if (changed) {
    saveDocuments(docs);
  }

  return docs;
}

export function getDeadlinesThisWeek(): Document[] {
  const docs = getDocuments();
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return docs.filter((doc) => {
    if (!doc.deadline || doc.status === 'done') return false;
    const d = new Date(doc.deadline);
    return d >= now && d <= weekFromNow;
  });
}
