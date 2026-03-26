'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { getDocument, updateDocument } from '@/lib/storage';
import { Document, ChatMessage, RiskFlag } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';
import type { PDFViewerRef } from '@/components/PDFViewer';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

/* ---- Citation parser ---- */
const CITATION_REGEX = /\[(?:стр\.|p\.|page\s*)(\d+)\]/gi;

function renderWithCitations(text: string, onCitationClick: (page: number) => void) {
  const parts: (string | { page: number; match: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(CITATION_REGEX.source, 'gi');

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push({ page: parseInt(match[1], 10), match: match[0] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, i) => {
    if (typeof part === 'string') return <span key={i}>{part}</span>;
    return (
      <button
        key={i}
        onClick={() => onCitationClick(part.page)}
        className="inline-flex items-center px-1.5 py-0.5 mx-0.5 bg-[#1a56db]/10 text-[#1a56db] rounded-md text-xs font-medium hover:bg-[#1a56db]/20 transition-colors cursor-pointer"
        title={`Go to page ${part.page}`}
      >
        p.{part.page}
      </button>
    );
  });
}

/* ---- Health score color ---- */
function getScoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#f59e0b';
  return '#dc2626';
}

function getScoreBg(score: number): string {
  if (score >= 80) return '#f0fdf4';
  if (score >= 50) return '#fffbeb';
  return '#fef2f2';
}

export default function DocumentPage() {
  const t = useTranslations('document');
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const auth = useAuth();

  const [doc, setDoc] = useState<Document | null>(null);
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showPdf, setShowPdf] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'document'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pdfViewerRef = useRef<PDFViewerRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = getDocument(id);
    if (!d) {
      router.replace('/app');
      return;
    }
    if (d.status === 'new') {
      updateDocument(id, { status: 'read' });
      d.status = 'read';
    }
    setDoc(d);
  }, [id, router]);

  const scrollToChat = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const handleCitationClick = useCallback((page: number) => {
    // Desktop: scroll PDF
    if (window.innerWidth >= 768) {
      pdfViewerRef.current?.scrollToPage(page);
      if (!showPdf) setShowPdf(true);
    } else {
      // Mobile: switch to document tab, scroll
      setActiveTab('document');
      setTimeout(() => pdfViewerRef.current?.scrollToPage(page), 300);
    }
  }, [showPdf]);

  async function handleAskQuestion(q?: string) {
    const questionText = q || question.trim();
    if (!doc || !questionText || chatLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: questionText,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...doc.chatHistory, userMsg];
    setDoc({ ...doc, chatHistory: updatedHistory });
    setQuestion('');
    setChatLoading(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          document: {
            ...doc,
            chatHistory: updatedHistory,
            userId: auth.user?.id,
          },
          language: locale,
          documentId: id,
          useSupabase: !!auth.user,
        }),
      });

      if (!response.ok) throw new Error('Chat failed');

      // Parse SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'delta') {
                fullText += data.text;
                setStreamingText(fullText);
                scrollToChat();
              } else if (data.type === 'done') {
                fullText = data.text;
              }
            } catch {}
          }
        }
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
      };

      const finalHistory = [...updatedHistory, assistantMsg];
      updateDocument(id, { chatHistory: finalHistory });
      setDoc(prev => prev ? { ...prev, chatHistory: finalHistory } : prev);
      setStreamingText('');
    } catch {
      setDoc(prev => prev ? { ...prev, chatHistory: doc.chatHistory } : prev);
      setStreamingText('');
    } finally {
      setChatLoading(false);
      scrollToChat();
    }
  }

  if (!doc) return null;

  const hasPdf = doc.imageData?.startsWith('data:application/pdf') || doc.fileType === 'pdf';
  const hasImage = doc.imageData?.startsWith('data:image');
  const healthScore = doc.healthScore;
  const riskFlags = doc.riskFlags || [];
  const positivePoints = doc.positivePoints || [];
  const keyFacts = doc.keyFacts || [];
  const suggestedQuestions = doc.suggestedQuestions || [];

  /* ---- Chat Panel Content ---- */
  const chatPanel = (
    <div className="flex flex-col h-full">
      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Document summary card */}
        <div className="bg-[#f8fafc] border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-[#1A1A2E] text-base">{doc.title}</h2>
            {doc.docTypeLabel && (
              <span className="text-xs bg-[#1a56db]/10 text-[#1a56db] px-2 py-1 rounded-lg font-medium">
                {doc.docTypeLabel}
              </span>
            )}
          </div>
          {doc.summary && (
            <p className="text-sm text-gray-600 mb-3">{doc.summary}</p>
          )}
          {doc.pageCount && doc.pageCount > 1 && (
            <p className="text-xs text-gray-400">{doc.pageCount} pages</p>
          )}
        </div>

        {/* Health Score */}
        {healthScore !== undefined && healthScore !== null && (
          <div className="rounded-2xl p-4" style={{ backgroundColor: getScoreBg(healthScore) }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Health Score</span>
              <span className="text-2xl font-bold" style={{ color: getScoreColor(healthScore) }}>
                {healthScore}/100
              </span>
            </div>
            <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${healthScore}%`,
                  backgroundColor: getScoreColor(healthScore),
                }}
              />
            </div>
            {doc.healthScoreExplanation && (
              <p className="text-xs text-gray-500 mt-2">{doc.healthScoreExplanation}</p>
            )}
          </div>
        )}

        {/* Key Facts */}
        {keyFacts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('key_facts') || '5 Key Facts'}
            </h3>
            <ol className="space-y-2">
              {keyFacts.map((fact, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[#1A1A2E]">
                  <span className="flex-shrink-0 w-5 h-5 bg-[#1a56db]/10 text-[#1a56db] rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{fact}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Risk Flags */}
        {riskFlags.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Risks & Warnings
            </h3>
            <div className="space-y-2">
              {riskFlags.map((flag: RiskFlag, i: number) => (
                <div key={i} className={`rounded-xl p-3 ${
                  flag.severity === 'high' ? 'bg-red-50 border border-red-200' :
                  flag.severity === 'medium' ? 'bg-amber-50 border border-amber-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      flag.severity === 'high' ? 'bg-red-100 text-red-700' :
                      flag.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {flag.severity.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{flag.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{flag.description}</p>
                      {flag.page && (
                        <button
                          onClick={() => handleCitationClick(flag.page!)}
                          className="text-xs text-[#1a56db] mt-1 hover:underline"
                        >
                          p.{flag.page}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Points */}
        {positivePoints.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Positive Points
            </h3>
            <div className="space-y-2">
              {positivePoints.map((point, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  <div>
                    <span className="font-medium text-gray-800">{point.title}</span>
                    {point.description && <span className="text-gray-500"> — {point.description}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What is this / What it says / What to do — collapsible */}
        <details className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <summary className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50">
            {t('what_is_this')} / {t('what_it_says')} / {t('what_to_do')}
          </summary>
          <div className="px-4 pb-4 space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1">{t('what_is_this')}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{doc.whatIsThis}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1">{t('what_it_says')}</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{doc.whatItSays}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1">{t('what_to_do')}</h4>
              <ol className="space-y-1.5">
                {(doc.whatToDo || []).map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 text-gray-400">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </details>

        {/* Suggested Questions */}
        {suggestedQuestions.length > 0 && doc.chatHistory.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleAskQuestion(q)}
                  className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 hover:border-[#1a56db]/30 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {doc.chatHistory.length > 0 && (
          <div className="space-y-3">
            {doc.chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1a56db] text-white ml-8'
                    : 'bg-gray-100 text-[#1A1A2E] mr-8'
                }`}
              >
                {msg.role === 'assistant'
                  ? renderWithCitations(msg.content, handleCitationClick)
                  : msg.content
                }
              </div>
            ))}
          </div>
        )}

        {/* Streaming response */}
        {streamingText && (
          <div className="bg-gray-100 rounded-2xl p-3.5 text-sm leading-relaxed mr-8">
            {renderWithCitations(streamingText, handleCitationClick)}
            <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
          </div>
        )}

        {/* Loading dots */}
        {chatLoading && !streamingText && (
          <div className="bg-gray-100 rounded-2xl p-3.5 mr-8">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('ask_placeholder')}
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-[16px] placeholder:text-gray-400 text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 border border-gray-200"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion(); }}
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={!question.trim() || chatLoading}
            className="bg-[#1a56db] text-white px-4 py-3 rounded-xl font-medium text-sm disabled:opacity-40 min-w-[52px] min-h-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  /* ---- PDF/Image Panel Content ---- */
  const documentPanel = (
    <div className="h-full flex flex-col">
      {hasPdf && doc.imageData ? (
        <PDFViewer ref={pdfViewerRef} src={doc.imageData} />
      ) : hasImage && doc.imageData ? (
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <img src={doc.imageData} alt={doc.title} className="w-full rounded-lg shadow-sm" />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No document preview available
        </div>
      )}
    </div>
  );

  /* ---- DESKTOP LAYOUT (≥768px): Split Panel ---- */
  /* ---- MOBILE LAYOUT (<768px): Tabs ---- */
  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 h-14 flex items-center px-4 bg-white z-10">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-gray-700 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-semibold text-[#1A1A2E] truncate max-w-[200px] mx-auto">
            {doc.title}
          </h1>
        </div>
        {/* Toggle PDF panel button (desktop) */}
        {(hasPdf || hasImage) && (
          <button
            onClick={() => setShowPdf(!showPdf)}
            className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] items-center justify-center text-gray-500"
            title={showPdf ? 'Hide document' : 'Show document'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </button>
        )}
        <div className="w-[44px] md:hidden" /> {/* Spacer for mobile */}
      </div>

      {/* Mobile tabs */}
      {(hasPdf || hasImage) && (
        <div className="md:hidden flex border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-[#1a56db] border-b-2 border-[#1a56db]'
                : 'text-gray-500'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'document'
                ? 'text-[#1a56db] border-b-2 border-[#1a56db]'
                : 'text-gray-500'
            }`}
          >
            Document
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: split panel */}
        <div className="hidden md:flex flex-1">
          {/* PDF panel */}
          {showPdf && (hasPdf || hasImage) && (
            <div className="border-r border-gray-200" style={{ width: '40%', minWidth: '300px' }}>
              {documentPanel}
            </div>
          )}
          {/* Chat panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {chatPanel}
          </div>
        </div>

        {/* Mobile: tab content */}
        <div className="md:hidden flex-1 flex flex-col">
          {activeTab === 'chat' ? chatPanel : documentPanel}
        </div>
      </div>
    </div>
  );
}
