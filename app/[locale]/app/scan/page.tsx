'use client';

import { useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { v4 as uuidv4 } from 'uuid';
import { compressImage, extractBase64 } from '@/lib/image';
import { addDocument, incrementScanCount, canScan } from '@/lib/storage';
import { AnalysisResponse, Document } from '@/lib/types';

export default function ScanPage() {
  const t = useTranslations('scan');
  const errT = useTranslations('errors');
  const locale = useLocale();
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > 10 * 1024 * 1024) {
      setError(errT('file_too_large'));
      return;
    }

    if (!canScan()) {
      setError(errT('scan_limit'));
      return;
    }

    try {
      if (file.type === 'application/pdf') {
        // PDF: read as base64 directly
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setFileData(dataUrl);
          setPreview(null);
          setIsPdf(true);
        };
        reader.readAsDataURL(file);
      } else {
        // Image: compress and preview
        const compressed = await compressImage(file);
        setPreview(compressed);
        setFileData(compressed);
        setIsPdf(false);
      }
    } catch {
      setError(errT('analysis_failed'));
    }
  }

  async function handleAnalyze() {
    if (!fileData) return;
    setAnalyzing(true);
    setError(null);
    setStep(0);

    // Animate steps
    const timer1 = setTimeout(() => setStep(1), 1000);
    const timer2 = setTimeout(() => setStep(2), 2000);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: fileData,
          language: locale,
          isPdf,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const analysis: AnalysisResponse = await response.json();

      incrementScanCount();

      const doc: Document = {
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
        imageData: isPdf ? '' : fileData,
        chatHistory: [],
        language: locale,
      };

      addDocument(doc);
      router.replace(`/app/doc/${doc.id}`);
    } catch {
      setError(errT('analysis_failed'));
      setAnalyzing(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  }

  return (
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{t('title')}</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Preview */}
        {(preview || isPdf) ? (
          <div className="mb-6">
            {isPdf ? (
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8 flex flex-col items-center justify-center aspect-[3/4] max-h-[50vh]">
                <span className="text-6xl mb-3">PDF</span>
                <p className="text-muted text-sm">PDF</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] max-h-[50vh]">
                <img
                  src={preview!}
                  alt="Document preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl aspect-[3/4] max-h-[50vh] flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
            <div className="text-center text-muted">
              <div className="text-5xl mb-3">\ud83d\udcf7</div>
              <p>{t('take_photo')}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-danger/10 text-danger text-sm font-medium rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Analysis progress */}
        {analyzing && (
          <div className="bg-primary/5 rounded-2xl p-6 mb-6">
            <p className="font-semibold text-gray-900 mb-4">{t('analyzing')}</p>
            {[t('step1'), t('step2'), t('step3')].map((label, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-2 transition-opacity duration-300 ${
                  i <= step ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {i < step ? (
                  <span className="text-success">\u2705</span>
                ) : i === step ? (
                  <span className="animate-spin text-primary">\u23f3</span>
                ) : (
                  <span className="text-gray-400">\u25cb</span>
                )}
                <span className={i <= step ? 'text-gray-900' : 'text-gray-400'}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        {!analyzing && (
          <div className="space-y-3">
            {(preview || isPdf) ? (
              <button
                onClick={handleAnalyze}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]"
              >
                {t('analyze')}
              </button>
            ) : null}

            <button
              onClick={() => cameraRef.current?.click()}
              className={`w-full font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px] ${
                (preview || isPdf)
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-primary text-white'
              }`}
            >
              \ud83d\udcf7 {t('take_photo')}
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px]"
            >
              \ud83d\udcc1 {t('upload_file')}
            </button>
          </div>
        )}

        {/* Hidden inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}
