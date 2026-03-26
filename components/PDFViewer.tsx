'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

export interface PDFViewerRef {
  scrollToPage: (page: number) => void;
  highlightText: (page: number, text?: string) => void;
}

interface PDFViewerProps {
  src: string; // URL or data URL
  className?: string;
}

const PDFViewer = forwardRef<PDFViewerRef, PDFViewerProps>(({ src, className = '' }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const pageRefsMap = useRef<Map<number, HTMLDivElement>>(new Map());
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    scrollToPage(page: number) {
      const el = pageRefsMap.current.get(page);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentPage(page);
        // Flash highlight on the page
        el.style.boxShadow = '0 0 0 3px #FBBF24';
        setTimeout(() => { el.style.boxShadow = ''; }, 3000);
      }
    },
    highlightText(page: number, _text?: string) {
      this.scrollToPage(page);
    },
  }));

  const renderPage = useCallback(async (pdf: any, pageNum: number, container: HTMLDivElement) => {
    if (renderedPagesRef.current.has(pageNum)) return;
    renderedPagesRef.current.add(pageNum);

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      // Create page container
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page relative mb-2';
      pageDiv.dataset.page = String(pageNum);
      pageDiv.style.width = `${viewport.width}px`;
      pageDiv.style.height = `${viewport.height}px`;
      pageDiv.style.margin = '0 auto 8px';

      // Canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width * (window.devicePixelRatio || 1);
      canvas.height = viewport.height * (window.devicePixelRatio || 1);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }

      pageDiv.appendChild(canvas);

      // Text layer for selection
      const textContent = await page.getTextContent();
      const textDiv = document.createElement('div');
      textDiv.className = 'absolute inset-0 overflow-hidden';
      textDiv.style.opacity = '0.2';

      for (const item of textContent.items as any[]) {
        if (!item.str) continue;
        const tx = item.transform;
        const span = document.createElement('span');
        span.textContent = item.str;
        span.style.position = 'absolute';
        span.style.left = `${tx[4]}px`;
        span.style.top = `${viewport.height - tx[5] - item.height}px`;
        span.style.fontSize = `${item.height}px`;
        span.style.fontFamily = 'sans-serif';
        span.style.color = 'transparent';
        span.style.whiteSpace = 'nowrap';
        textDiv.appendChild(span);
      }
      pageDiv.appendChild(textDiv);

      // Page number label
      const label = document.createElement('div');
      label.className = 'text-center text-xs text-gray-400 py-1';
      label.textContent = `${pageNum}`;

      // Store ref for scrollToPage
      pageRefsMap.current.set(pageNum, pageDiv);

      container.appendChild(pageDiv);
      container.appendChild(label);
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  }, [scale]);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);
        renderedPagesRef.current.clear();
        pageRefsMap.current.clear();

        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        let loadingTask;
        if (src.startsWith('data:application/pdf')) {
          const base64 = src.replace(/^data:application\/pdf;base64,/, '');
          const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          loadingTask = pdfjs.getDocument({ data: buffer });
        } else {
          loadingTask = pdfjs.getDocument(src);
        }

        const pdf = await loadingTask.promise;
        if (cancelled) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);

        // Clear container
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        // Render all pages (lazy: visible + buffer)
        const pagesToRender = Math.min(pdf.numPages, 50);
        for (let i = 1; i <= pagesToRender; i++) {
          await renderPage(pdf, i, container);
        }

        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          setError('Failed to load PDF');
          setLoading(false);
        }
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [src, renderPage]);

  // Track current page on scroll
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    function handleScroll() {
      const scrollTop = container!.scrollTop;
      let closestPage = 1;
      let minDist = Infinity;

      pageRefsMap.current.forEach((el, page) => {
        const dist = Math.abs(el.offsetTop - scrollTop);
        if (dist < minDist) {
          minDist = dist;
          closestPage = page;
        }
      });

      setCurrentPage(closestPage);
    }

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [numPages]);

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600" title="Zoom out">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
          </button>
          <span className="text-xs text-gray-500 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600" title="Zoom in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {currentPage} / {numPages}
        </span>
      </div>

      {/* PDF pages */}
      <div className="flex-1 overflow-auto bg-gray-100 p-2">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading PDF...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-32 text-sm text-red-500">{error}</div>
        )}
        <div ref={containerRef} className="pdf-container" />
      </div>
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';
export default PDFViewer;
