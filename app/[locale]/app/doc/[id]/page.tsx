'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { getDocument, updateDocument, canScan, incrementScanCount } from '@/lib/storage';
import { shareDocument } from '@/lib/share';
import { getCategoryConfig } from '@/lib/categories';
import { Document, ChatMessage, Recommendation } from '@/lib/types';
import { Link } from '@/i18n/navigation';

export default function DocumentPage() {
  const t = useTranslations('document');
  const categories = useTranslations('categories');
  const shareT = useTranslations('share');
  const errT = useTranslations('errors');
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [doc, setDoc] = useState<Document | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = getDocument(id);
    if (!d) {
      router.replace('/app');
      return;
    }
    // Mark as read
    if (d.status === 'new') {
      updateDocument(id, { status: 'read' });
      d.status = 'read';
    }
    setDoc(d);
  }, [id, router]);

  function handleMarkDone() {
    if (!doc) return;
    const newStatus = doc.status === 'done' ? 'read' : 'done';
    updateDocument(id, { status: newStatus });
    setDoc({ ...doc, status: newStatus });
  }

  async function handleShare() {
    if (!doc) return;
    try {
      await shareDocument(doc, shareT('analyzed_with'));
    } catch {
      // User cancelled share
    }
  }

  async function handleAskQuestion() {
    if (!doc || !question.trim() || chatLoading) return;

    if (!canScan()) {
      return;
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...doc.chatHistory, userMsg];
    setDoc({ ...doc, chatHistory: updatedHistory });
    setQuestion('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          document: { ...doc, chatHistory: updatedHistory },
          language: locale,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      const { answer } = await response.json();

      incrementScanCount();

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: answer,
        timestamp: new Date().toISOString(),
      };

      const finalHistory = [...updatedHistory, assistantMsg];
      updateDocument(id, { chatHistory: finalHistory });
      setDoc({ ...doc, chatHistory: finalHistory });
    } catch {
      // Remove user message on error
      setDoc({ ...doc, chatHistory: doc.chatHistory });
    } finally {
      setChatLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (!doc) return null;

  const cat = getCategoryConfig(doc.category);

  return (
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom pb-4">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={t('share')}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Document header */}
        <div className="mb-6">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-3xl">{cat.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{doc.title}</h1>
              <p className="text-sm text-muted mt-1">
                <span style={{ color: cat.color }}>
                  {categories(doc.category as any)}
                </span>
                {' \u00b7 '}
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {doc.deadline && (
            <div className={`flex items-center gap-2 mt-3 text-sm font-medium ${
              doc.urgency === 'high' ? 'text-danger' : 'text-warning'
            }`}>
              <span>\u23f0</span>
              <span>{t('deadline')}: {doc.deadlineDescription || doc.deadline}</span>
            </div>
          )}
        </div>

        {/* What is this */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            {t('what_is_this')}
          </h2>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-800 leading-relaxed">{doc.whatIsThis}</p>
          </div>
        </div>

        {/* What it says */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            {t('what_it_says')}
          </h2>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-800 leading-relaxed">{doc.whatItSays}</p>
          </div>
        </div>

        {/* What to do */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            {t('what_to_do')}
          </h2>
          <div className="bg-gray-50 rounded-xl p-4">
            <ol className="space-y-2">
              {doc.whatToDo.map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-800">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Recommendations */}
        {doc.recommendations && doc.recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
              {t('recommendations')}
            </h2>
            <div className="space-y-2">
              {doc.recommendations.map((rec: Recommendation, i: number) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{rec.type === 'website' ? '\ud83c\udf10' : '\u2696\ufe0f'}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{rec.title}</p>
                      <p className="text-sm text-muted truncate">{rec.description}</p>
                    </div>
                  </div>
                  {rec.type === 'website' && rec.url ? (
                    <a href={rec.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-primary text-sm font-medium">
                      {t('visit_portal')} {'\u2192'}
                    </a>
                  ) : rec.type === 'professional' && rec.professionalType ? (
                    <Link href={`/app/pros?type=${rec.professionalType}`} className="flex-shrink-0 text-primary text-sm font-medium">
                      {t('find_specialist')} {'\u2192'}
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            {t('ask_question')}
          </h2>

          {/* Chat history */}
          {doc.chatHistory.length > 0 && (
            <div className="space-y-3 mb-3">
              {doc.chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white ltr:ml-8 rtl:mr-8'
                      : 'bg-gray-100 text-gray-800 ltr:mr-8 rtl:ml-8'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="bg-gray-100 rounded-xl p-3 ltr:mr-8 rtl:ml-8">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('ask_placeholder')}
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskQuestion();
              }}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!question.trim() || chatLoading}
              className="bg-primary text-white px-4 py-3 rounded-xl font-medium text-sm disabled:opacity-50 active:scale-95 transition-transform min-w-[64px]"
            >
              {t('send')}
            </button>
          </div>
        </div>

        {/* Original image */}
        <div className="mb-6">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center gap-2 text-sm font-semibold text-muted uppercase tracking-wider mb-2"
          >
            <span>\ud83d\udcf7</span>
            <span>{t('original')}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showOriginal ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {!showOriginal && doc.imageData && (
            <div
              onClick={() => setShowOriginal(true)}
              className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 cursor-pointer border border-gray-200"
            >
              <img src={doc.imageData} alt="Document" className="w-full h-full object-cover" />
            </div>
          )}

          {showOriginal && doc.imageData && (
            <div className="rounded-2xl overflow-hidden bg-gray-100">
              <img src={doc.imageData} alt="Document" className="w-full" />
            </div>
          )}
        </div>

        {/* Mark as done */}
        <button
          onClick={handleMarkDone}
          className={`w-full font-semibold py-3.5 rounded-xl text-lg active:scale-95 transition-transform min-h-[52px] ${
            doc.status === 'done'
              ? 'bg-success/10 text-success border border-success/30'
              : 'bg-success text-white'
          }`}
        >
          {doc.status === 'done' ? `\u2705 ${t('marked_done')}` : `\u2705 ${t('mark_done')}`}
        </button>
      </div>
    </div>
  );
}
