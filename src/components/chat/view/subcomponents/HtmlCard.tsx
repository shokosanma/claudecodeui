import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { prepareHtmlForIframe } from '../../utils/injectBaseCss';

export type HtmlCardProps = {
  html: string;
  onRegenerate?: () => void;
  errorReason?: string;
  errorMetadata?: Record<string, string>;
};

const SCALES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const DEFAULT_IFRAME_HEIGHT = 200;
const MAX_IFRAME_HEIGHT_DESKTOP = 600;
const MAX_IFRAME_HEIGHT_MOBILE = 400;

function maxIframeHeight(): number {
  if (typeof window === 'undefined') return MAX_IFRAME_HEIGHT_DESKTOP;
  const isMobile = typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 480px)').matches;
  const vhCap = isMobile ? window.innerHeight * 0.5 : window.innerHeight * 0.7;
  return Math.min(vhCap, isMobile ? MAX_IFRAME_HEIGHT_MOBILE : MAX_IFRAME_HEIGHT_DESKTOP);
}

export function HtmlCard({ html, onRegenerate, errorReason, errorMetadata }: HtmlCardProps) {
  const { t } = useTranslation('codeEditor');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [showReset, setShowReset] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(DEFAULT_IFRAME_HEIGHT);
  const [maxHeight, setMaxHeight] = useState(maxIframeHeight);
  const cardRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const srcDoc = isVisible ? prepareHtmlForIframe(html) : undefined;

  useEffect(() => {
    const updateMaxHeight = () => setMaxHeight(maxIframeHeight());
    updateMaxHeight();
    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, []);

  // IntersectionObserver for viewport-driven rendering
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setIsLoading(true);
          } else {
            setIsVisible(false);
            setIsLoading(false);
          }
        }, 100);
      },
      { rootMargin: '200px' }
    );

    observerRef.current.observe(card);
    return () => {
      observerRef.current?.disconnect();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const measureIframeHeight = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.body) return;

    const contentHeight = doc.documentElement.scrollHeight || doc.body.scrollHeight;
    // Size iframe to full content; outer wrapper handles maxHeight scrolling (single scrollbar).
    setIframeHeight(Math.max(contentHeight, DEFAULT_IFRAME_HEIGHT));
    setIsLoading(false);
  }, []);

  const handleIframeLoad = useCallback(() => {
    measureIframeHeight();
  }, [measureIframeHeight]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale((prev) => {
      const idx = SCALES.indexOf(prev);
      const next = idx < SCALES.length - 1 ? SCALES[idx + 1] : prev;
      setShowReset(next !== 1);
      return next;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const idx = SCALES.indexOf(prev);
      const next = idx > 0 ? SCALES[idx - 1] : prev;
      setShowReset(next !== 1);
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setShowReset(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale === 1) {
      setScale(1.5);
      setShowReset(true);
    } else {
      resetZoom();
    }
  }, [scale, resetZoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, [zoomIn, zoomOut]);

  const scrollSpacerHeight = scale > 1 ? iframeHeight * (scale - 1) : 0;

  const errorMessage = errorReason
    ? t(`htmlCard.${errorReason}` as any, errorMetadata ?? {})
    : '';

  // Error state
  if (errorReason) {
    return (
      <div
        ref={cardRef}
        className="my-2 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center"
      >
        <p className="mb-2 text-sm text-red-400">
          {t('htmlCard.loadFailed')}: {errorMessage}
        </p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="rounded-md bg-red-500/10 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/20"
          >
            {t('htmlCard.regenerate')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={cardRef} className="my-2">
      {!isVisible ? (
        <div className="rounded-md border border-cyan-500/25 bg-[#070b14]/90 p-4 text-center shadow-[0_0_20px_rgba(34,211,238,0.06)]">
          <p className="font-mono text-xs tracking-wide text-cyan-200/60">{t('htmlCard.loading')}</p>
        </div>
      ) : (
        <div
          className="group relative overflow-hidden rounded-md border border-cyan-500/30 bg-[#070b14] shadow-[0_0_28px_rgba(34,211,238,0.1)]"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070b14]/80">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
              <p className="mt-2 font-mono text-xs tracking-wide text-cyan-200/50">{t('htmlCard.loading')}</p>
            </div>
          )}

          {/* Zoom controls */}
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded border border-cyan-500/20 bg-[#0c1426]/90 p-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={zoomOut}
              className="rounded p-1 text-cyan-200/50 hover:bg-cyan-500/10 hover:text-cyan-200"
              title={t('htmlCard.zoomOut')}
              aria-label={t('htmlCard.zoomOut')}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="min-w-[2rem] text-center font-mono text-xs text-cyan-200/60">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="rounded p-1 text-cyan-200/50 hover:bg-cyan-500/10 hover:text-cyan-200"
              title={t('htmlCard.zoomIn')}
              aria-label={t('htmlCard.zoomIn')}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            {showReset && (
              <button
                onClick={resetZoom}
                className="ml-1 rounded p-1 text-cyan-200/50 hover:bg-cyan-500/10 hover:text-cyan-200"
                title={t('htmlCard.resetZoom')}
                aria-label={t('htmlCard.resetZoom')}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}
          </div>

          <div
            className="overflow-auto rounded-md"
            style={{ maxHeight }}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
          >
            <div
              style={{
                transform: scale !== 1 ? `scale(${scale})` : undefined,
                transformOrigin: 'top center',
                width: scale !== 1 ? `${100 / scale}%` : '100%',
                height: iframeHeight,
                marginLeft: scale !== 1 ? 'auto' : undefined,
                marginRight: scale !== 1 ? 'auto' : undefined,
              }}
            >
              <iframe
                ref={iframeRef}
                sandbox="allow-same-origin"
                scrolling="no"
                title="HTML preview"
                srcDoc={srcDoc}
                onLoad={handleIframeLoad}
                style={{
                  width: '100%',
                  height: iframeHeight,
                  minHeight: DEFAULT_IFRAME_HEIGHT,
                  border: 'none',
                  display: 'block',
                  overflow: 'hidden',
                }}
              />
            </div>
            {scrollSpacerHeight > 0 && (
              <div aria-hidden style={{ height: scrollSpacerHeight, pointerEvents: 'none' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
