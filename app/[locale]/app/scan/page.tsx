'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { v4 as uuidv4 } from 'uuid';
import { processFile, processZip, getFormatIcon, ProcessedFile } from '@/lib/fileProcessor';
import { addDocument, incrementScanCount, canScan, getUserProfile } from '@/lib/storage';
import { AnalysisResponse, Document } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';

/* ---- SVG Icon Components ---- */
function IconCamera({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function IconFolder({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function IconArchive({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconDocument({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconDocumentSmall({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconCheckCircle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconSpinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function IconCircle({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export default function ScanPage() {
  const t = useTranslations('scan');
  const errT = useTranslations('errors');
  const locale = useLocale();
  const router = useRouter();

  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isZip, setIsZip] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { isAuthenticated } = useAuth();
  const tAuth = useTranslations('auth');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // ZIP handling
    if (ext === 'zip') {
      if (file.size > 50 * 1024 * 1024) {
        setError(errT('zip_too_large'));
        return;
      }
      if (!canScan()) {
        setError(errT('zip_pro_only'));
        return;
      }
      try {
        const zipFiles = await processZip(file);
        if (zipFiles.length === 0) {
          setError(errT('unsupported_format'));
          return;
        }
        setFiles(zipFiles);
        setIsZip(true);
        setFileName(file.name);
        setPreview(null);
      } catch (e: any) {
        setError(errT(e.message === 'zip_too_many' ? 'zip_too_many' : 'analysis_failed'));
      }
      return;
    }

    // Single file
    if (file.size > 20 * 1024 * 1024) {
      setError(errT('file_too_large'));
      return;
    }
    if (!canScan()) {
      setError(errT('scan_limit'));
      return;
    }

    try {
      const processed = await processFile(file);
      setFiles([processed]);
      setIsZip(false);
      setFileName(processed.fileName);
      setPreview(processed.type === 'image' ? processed.data : null);
    } catch (e: any) {
      setError(errT(e.message === 'unsupported_format' ? 'unsupported_format' : 'analysis_failed'));
    }
  }

  async function analyzeFile(pf: ProcessedFile): Promise<Document | null> {
    const profile = getUserProfile();
    const body: Record<string, any> = {
      language: locale,
      country: profile.country,
      status: profile.status,
    };

    if (pf.type === 'text') {
      body.type = 'text';
      body.textContent = pf.data;
    } else if (pf.type === 'pdf') {
      body.image = pf.data;
      body.isPdf = true;
    } else {
      body.image = pf.data;
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) return null;
    const analysis: AnalysisResponse = await response.json();
    incrementScanCount();

    return {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      title: analysis.document_title,
      category: analysis.category,
      status: 'new',
      whatIsThis: analysis.what_is_this,
      whatItSays: analysis.what_it_says,
      whatToDo: analysis.what_to_do,
      deadline: analysis.deadline,
      deadlineDescription: analysis.deadline_description,
      urgency: analysis.urgency,
      amounts: analysis.amounts,
      imageData: pf.type === 'image' ? pf.data : '',
      chatHistory: [],
      language: locale,
      recommendations: analysis.recommendations,
    };
  }

  async function handleAnalyze() {
    if (files.length === 0 || analyzing) return;

    // Check scan limit — if exceeded and not logged in, show auth prompt
    if (!canScan() && !isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setAnalyzing(true);
    setError(null);
    setStep(0);

    const timer1 = setTimeout(() => setStep(1), 1000);
    const timer2 = setTimeout(() => setStep(2), 2000);

    try {
      if (isZip) {
        // Batch analysis
        setBatchProgress({ current: 0, total: files.length });
        const docs: Document[] = [];

        for (let i = 0; i < files.length; i++) {
          setBatchProgress({ current: i + 1, total: files.length });
          const doc = await analyzeFile(files[i]);
          if (doc) {
            addDocument(doc);
            docs.push(doc);
          }
        }

        // Navigate to summary or timeline
        if (docs.length > 0) {
          // Store batch docs for summary
          sessionStorage.setItem('doclear_batch', JSON.stringify(docs));
          router.replace('/app/summary');
        } else {
          setError(errT('analysis_failed'));
          setAnalyzing(false);
        }
      } else {
        // Single file
        const doc = await analyzeFile(files[0]);
        if (doc) {
          addDocument(doc);
          router.replace(`/app/doc/${doc.id}`);
        } else {
          setError(errT('analysis_failed'));
          setAnalyzing(false);
        }
      }
    } catch {
      setError(errT('analysis_failed'));
      setAnalyzing(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  }

  const hasContent = files.length > 0;

  return (
    <div className="min-h-screen bg-white safe-area-inset-top max-w-2xl mx-auto font-[Inter,system-ui,sans-serif]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/[0.06] h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#F5F5F7] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center absolute left-2"
        >
          <svg className="w-5 h-5 text-[#1A1A2E] rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[17px] font-semibold text-[#1A1A2E] mx-auto">{t('title')}</h1>
      </div>

      <div className="px-4 py-6">
        {/* Preview area */}
        {preview ? (
          <div className="mb-6 rounded-[20px] overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.06]">
            <div className="aspect-[3/4] max-h-[40vh]">
              <img src={preview} alt="Document preview" className="w-full h-full object-contain" />
            </div>
          </div>
        ) : hasContent ? (
          <div className="mb-6 rounded-[20px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.06] p-5">
            {isZip ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
                    <IconArchive className="w-7 h-7 text-[#6B7280]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A2E]">{fileName}</p>
                    <p className="text-sm text-[#6B7280]">{files.length} files</p>
                  </div>
                </div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-[#6B7280] py-1.5 px-3 rounded-lg hover:bg-[#F5F5F7] transition-colors">
                      <IconDocumentSmall className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />
                      <span className="truncate">{f.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
                  <IconDocument className="w-7 h-7 text-[#6B7280]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{fileName}</p>
                  <p className="text-sm text-[#6B7280]">{files[0]?.originalFormat.toUpperCase()}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[20px] aspect-[3/4] max-h-[40vh] flex items-center justify-center mb-6 bg-white border-2 border-dashed border-[#D1D5DB]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5F5F7] flex items-center justify-center">
                <IconCamera className="w-8 h-8 text-[#6B7280]" />
              </div>
              <p className="text-[#6B7280] text-sm font-medium">{t('take_photo')}</p>
            </div>
          </div>
        )}

        {/* Auth prompt — scan limit reached */}
        {showAuthPrompt && (
          <div className="bg-[#F5F5F7] rounded-[20px] p-6 mb-4 border border-black/[0.06] text-center">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">{tAuth('register_prompt')}</h3>
            <p className="text-sm text-[#6B7280] mb-5">{tAuth('register_prompt_desc')}</p>
            <a
              href="/auth"
              className="inline-block w-full bg-[#1A1A2E] text-white font-medium py-3.5 rounded-[14px] hover:bg-[#2A2A3E] transition-colors"
            >
              {tAuth('create_account')}
            </a>
            <a href="/auth" className="block mt-3 text-sm text-[#6B7280] hover:text-[#1A1A2E]">
              {tAuth('sign_in')}
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#FEE2E2] text-[#DC2626] text-sm font-medium rounded-[14px] px-4 py-3 mb-4">{error}</div>
        )}

        {/* Analysis progress */}
        {analyzing && (
          <div className="bg-[#F5F5F7] rounded-[20px] p-5 mb-6">
            <p className="font-semibold text-[#1A1A2E] mb-4">{t('analyzing')}</p>
            {isZip && batchProgress.total > 0 ? (
              <div>
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{batchProgress.current} / {batchProgress.total}</span>
                  <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A1A2E] rounded-full transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {[t('step1'), t('step2'), t('step3')].map((label, i) => (
                  <div key={i} className={`flex items-center gap-3 py-2 transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                    {i < step ? (
                      <IconCheckCircle className="w-5 h-5 text-[#22C55E]" />
                    ) : i === step ? (
                      <IconSpinner className="w-5 h-5 text-[#1A1A2E]" />
                    ) : (
                      <IconCircle className="w-5 h-5 text-[#6B7280]" />
                    )}
                    <span className={`text-sm ${i <= step ? 'text-[#1A1A2E] font-medium' : 'text-[#6B7280]'}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        {!analyzing && (
          <div className="space-y-3">
            {hasContent && (
              <button onClick={handleAnalyze} className="w-full bg-[#1A1A2E] text-white font-medium py-3.5 rounded-[14px] text-lg active:scale-[0.98] transition-transform h-[52px]">
                {t('analyze')}{isZip ? ` (${files.length})` : ''}
              </button>
            )}
            <button
              onClick={() => cameraRef.current?.click()}
              className={`w-full font-medium py-3.5 rounded-[14px] text-lg active:scale-[0.98] transition-transform h-[52px] flex items-center justify-center gap-2.5 ${
                hasContent
                  ? 'bg-[#F5F5F7] text-[#6B7280] border border-black/[0.06]'
                  : 'bg-[#1A1A2E] text-white'
              }`}
            >
              <IconCamera className="w-5 h-5" />
              <span>{t('take_photo')}</span>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full bg-[#F5F5F7] text-[#6B7280] font-medium py-3.5 rounded-[14px] text-lg active:scale-[0.98] transition-transform h-[52px] flex items-center justify-center gap-2.5 border border-black/[0.06]"
            >
              <IconFolder className="w-5 h-5" />
              <span>{t('upload_file')}</span>
            </button>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <input ref={fileRef} type="file" accept="image/*,application/pdf,.docx,.doc,.xlsx,.xls,.txt,.rtf,.zip,.eml,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}
