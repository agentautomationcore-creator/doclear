'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { v4 as uuidv4 } from 'uuid';
import { processFile, processZip, getFormatIcon, ProcessedFile } from '@/lib/fileProcessor';
import { addDocument, incrementScanCount, canScan, getUserProfile } from '@/lib/storage';
import { AnalysisResponse, Document } from '@/lib/types';

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
    if (files.length === 0) return;
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
    <div className="min-h-screen bg-bg safe-area-inset-top">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-bg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-card rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
            <svg className="w-5 h-5 text-text-secondary rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-text-primary">{t('title')}</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Preview area */}
        {preview ? (
          <div className="mb-6 rounded-2xl overflow-hidden bg-card aspect-[3/4] max-h-[40vh]">
            <img src={preview} alt="Document preview" className="w-full h-full object-contain" />
          </div>
        ) : hasContent ? (
          <div className="mb-6 rounded-2xl bg-card border border-border p-6">
            {isZip ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{'\ud83d\udce6'}</span>
                  <div>
                    <p className="font-semibold text-text-primary">{fileName}</p>
                    <p className="text-sm text-muted">{files.length} files</p>
                  </div>
                </div>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span>{getFormatIcon(f.originalFormat)}</span>
                      <span className="truncate">{f.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getFormatIcon(files[0]?.originalFormat || '')}</span>
                <div>
                  <p className="font-semibold text-text-primary">{fileName}</p>
                  <p className="text-sm text-muted">{files[0]?.originalFormat.toUpperCase()}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-2xl aspect-[3/4] max-h-[40vh] flex items-center justify-center mb-6 border-2 border-dashed border-border">
            <div className="text-center text-muted">
              <div className="text-5xl mb-3">{'\ud83d\udcf7'}</div>
              <p>{t('take_photo')}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-danger/10 text-danger text-sm font-medium rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        {/* Analysis progress */}
        {analyzing && (
          <div className="bg-primary/10 rounded-2xl p-6 mb-6">
            <p className="font-semibold text-text-primary mb-4">{t('analyzing')}</p>
            {isZip && batchProgress.total > 0 ? (
              <div>
                <div className="flex items-center justify-between text-sm text-muted mb-2">
                  <span>{batchProgress.current} / {batchProgress.total}</span>
                  <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
                </div>
              </div>
            ) : (
              [t('step1'), t('step2'), t('step3')].map((label, i) => (
                <div key={i} className={`flex items-center gap-3 py-2 transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                  {i < step ? <span className="text-success">{'\u2705'}</span> : i === step ? <span className="animate-spin text-primary">{'\u23f3'}</span> : <span className="text-muted">{'\u25cb'}</span>}
                  <span className={i <= step ? 'text-text-primary' : 'text-muted'}>{label}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Buttons */}
        {!analyzing && (
          <div className="space-y-3">
            {hasContent && (
              <button onClick={handleAnalyze} className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]">
                {t('analyze')}{isZip ? ` (${files.length})` : ''}
              </button>
            )}
            <button
              onClick={() => cameraRef.current?.click()}
              className={`w-full font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px] ${hasContent ? 'bg-card text-text-secondary' : 'bg-primary text-white'}`}
            >
              {'\ud83d\udcf7'} {t('take_photo')}
            </button>
            <button onClick={() => fileRef.current?.click()} className="w-full bg-card text-text-secondary font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]">
              {'\ud83d\udcc1'} {t('upload_file')}
            </button>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <input ref={fileRef} type="file" accept="image/*,application/pdf,.docx,.doc,.xlsx,.xls,.txt,.rtf,.zip,.eml,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}
