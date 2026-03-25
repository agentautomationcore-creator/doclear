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

/* ---- SVG Icon Components ---- */
function IconBack({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconShare({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" />
    </svg>
  );
}

function IconClock({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconGlobe({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function IconUsers({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function IconArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconCamera({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

function IconChevronDown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
    // Auto-scroll to last chat message
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
    <div className="min-h-screen bg-white safe-area-inset-top safe-area-inset-bottom pb-24 font-[Inter,system-ui,sans-serif]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/[0.06] h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-[#F5F5F7] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center absolute left-2"
        >
          <IconBack className="w-5 h-5 text-[#1A1A2E] rtl:rotate-180" />
        </button>
        <div className="mx-auto" />
        <button
          onClick={handleShare}
          className="p-2 hover:bg-[#F5F5F7] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center absolute right-2"
          aria-label={t('share')}
        >
          <IconShare className="w-5 h-5 text-[#6B7280]" />
        </button>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        {/* Original document — prominent at top */}
        {doc.imageData && (
          <div className="mb-6">
            {doc.imageData.startsWith('data:application/pdf') ? (
              <div className="rounded-[16px] bg-[#F5F5F7] border border-black/[0.06] p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <svg className="w-6 h-6 text-[#DC2626]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1A1A2E] text-sm">{doc.title}</p>
                  <p className="text-xs text-[#6B7280]">PDF</p>
                </div>
                <a
                  href={doc.imageData}
                  download={`${doc.title}.pdf`}
                  className="bg-[#1A1A2E] text-white text-sm font-medium px-4 py-2 rounded-[12px] hover:bg-[#2A2A3E] transition-colors"
                >
                  {t('original')}
                </a>
              </div>
            ) : doc.imageData.startsWith('data:image') ? (
              <div className="rounded-[16px] overflow-hidden bg-[#F5F5F7] border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <img src={doc.imageData} alt={doc.title} className="w-full max-h-[400px] object-contain" />
              </div>
            ) : null}
          </div>
        )}

        {/* Document header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1A1A2E] mb-2">{doc.title}</h1>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${cat.color}1A`,
                color: cat.color,
              }}
            >
              {categories(doc.category as any)}
            </span>
            <span className="text-xs text-[#6B7280]">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>
          {doc.deadline && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 bg-[#FEE2E2] text-[#DC2626] rounded-lg px-3 py-1.5 text-xs font-bold">
                <IconClock className="w-3.5 h-3.5" />
                {t('deadline')}: {doc.deadlineDescription || doc.deadline}
              </span>
            </div>
          )}
        </div>

        {/* What is this */}
        <div className="mb-4">
          <h2 className="uppercase text-[11px] tracking-[0.08em] text-[#6B7280] font-semibold mb-2">
            {t('what_is_this')}
          </h2>
          <div className="bg-[#F5F5F7] rounded-[16px] p-4">
            <p className="text-[#1A1A2E] leading-relaxed text-[15px]">{doc.whatIsThis}</p>
          </div>
        </div>

        {/* What it says */}
        <div className="mb-4">
          <h2 className="uppercase text-[11px] tracking-[0.08em] text-[#6B7280] font-semibold mb-2">
            {t('what_it_says')}
          </h2>
          <div className="bg-[#F5F5F7] rounded-[16px] p-4">
            <p className="text-[#1A1A2E] leading-relaxed text-[15px]">{doc.whatItSays}</p>
          </div>
        </div>

        {/* What to do */}
        <div className="mb-6">
          <h2 className="uppercase text-[11px] tracking-[0.08em] text-[#6B7280] font-semibold mb-2">
            {t('what_to_do')}
          </h2>
          <div className="bg-[#F5F5F7] rounded-[16px] p-4">
            <ol className="space-y-2.5">
              {doc.whatToDo.map((step, i) => (
                <li key={i} className="flex gap-3 text-[#1A1A2E]">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#1A1A2E]/10 text-[#1A1A2E] rounded-full flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-[15px]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Recommendations */}
        {doc.recommendations && doc.recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="uppercase text-[11px] tracking-[0.08em] text-[#6B7280] font-semibold mb-2">
              {t('recommendations')}
            </h2>
            <div className="space-y-2">
              {doc.recommendations.map((rec: Recommendation, i: number) => (
                <div key={i} className="bg-[#F5F5F7] rounded-[16px] p-4 flex items-center justify-between gap-3 border border-black/[0.06]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                      {rec.type === 'website' ? (
                        <IconGlobe className="w-5 h-5 text-[#6B7280]" />
                      ) : (
                        <IconUsers className="w-5 h-5 text-[#6B7280]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#1A1A2E] truncate text-[15px]">{rec.title}</p>
                      <p className="text-sm text-[#6B7280] truncate">{rec.description}</p>
                    </div>
                  </div>
                  {rec.type === 'website' && rec.url ? (
                    <a href={rec.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-1 text-[#1A1A2E] text-sm font-medium">
                      <span>{t('visit_portal')}</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : rec.type === 'professional' && rec.professionalType ? (
                    <Link href={`/app/pros?type=${rec.professionalType}`} className="flex-shrink-0 flex items-center gap-1 text-[#1A1A2E] text-sm font-medium">
                      <span>{t('find_specialist')}</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="mb-6">
          <h2 className="uppercase text-[11px] tracking-[0.08em] text-[#6B7280] font-semibold mb-2">
            {t('ask_question')}
          </h2>

          {/* Chat history */}
          {doc.chatHistory.length > 0 && (
            <div className="space-y-3 mb-3">
              {doc.chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-[16px] p-3.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#1A1A2E] text-white ltr:ml-8 rtl:mr-8'
                      : 'bg-[#F5F5F7] text-[#1A1A2E] ltr:mr-8 rtl:ml-8'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="bg-[#F5F5F7] rounded-[16px] p-3.5 ltr:mr-8 rtl:ml-8">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-[#6B7280] rounded-full animate-bounce [animation-delay:0.2s]" />
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
              className="flex-1 bg-[#F5F5F7] rounded-[14px] px-4 py-3 text-sm placeholder:text-[#6B7280] text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1A1A2E]/20 border border-black/[0.06]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskQuestion();
              }}
            />
            <button
              onClick={handleAskQuestion}
              disabled={!question.trim() || chatLoading}
              className="bg-[#1A1A2E] text-white px-4 py-3 rounded-[14px] font-medium text-sm disabled:opacity-40 active:scale-[0.98] transition-transform min-w-[64px]"
            >
              {t('send')}
            </button>
          </div>
        </div>

        {/* Original image */}
        {doc.imageData && (
          <div className="mb-6">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center gap-2 uppercase text-[11px] tracking-[0.08em] text-[#6B7280] font-semibold mb-2"
            >
              <IconCamera className="w-3.5 h-3.5" />
              <span>{t('original')}</span>
              <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${showOriginal ? 'rotate-180' : ''}`} />
            </button>

            {!showOriginal && (
              <div
                onClick={() => setShowOriginal(true)}
                className="w-20 h-28 rounded-xl overflow-hidden bg-[#F5F5F7] cursor-pointer border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              >
                <img src={doc.imageData} alt="Document" className="w-full h-full object-cover" />
              </div>
            )}

            {showOriginal && (
              <div className="rounded-[20px] overflow-hidden bg-[#F5F5F7] border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                <img src={doc.imageData} alt="Document" className="w-full" />
              </div>
            )}
          </div>
        )}

        {/* Mark as done */}
        <button
          onClick={handleMarkDone}
          className={`w-full font-medium py-3.5 rounded-[14px] text-lg active:scale-[0.98] transition-transform h-[52px] flex items-center justify-center gap-2 ${
            doc.status === 'done'
              ? 'bg-[#F5F5F7] text-[#22C55E] border border-[#22C55E]/30'
              : 'bg-[#1A1A2E] text-white'
          }`}
        >
          <IconCheckCircle className="w-5 h-5" />
          <span>{doc.status === 'done' ? t('marked_done') : t('mark_done')}</span>
        </button>
      </div>
    </div>
  );
}
