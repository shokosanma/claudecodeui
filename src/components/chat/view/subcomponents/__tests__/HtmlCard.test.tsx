import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { HtmlCard } from '../HtmlCard';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'htmlCard.loadFailed': 'Load failed',
        'htmlCard.regenerate': 'Regenerate',
        'htmlCard.zoomIn': 'Zoom in',
        'htmlCard.zoomOut': 'Zoom out',
        'htmlCard.resetZoom': 'Reset zoom',
        'htmlCard.loading': 'Loading...',
        'htmlCard.contentTooLarge': 'Content exceeds 200KB limit (current {{size}}KB)',
        'htmlCard.invalidHtml': 'Content is not valid HTML format',
      };
      const template = translations[key] || key;
      if (!opts) return template;
      return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => opts[name] ?? '');
    },
  }),
}));

describe('HtmlCard', () => {
  it('renders error state when errorReason is provided', () => {
    render(
      <HtmlCard
        html="<div>test</div>"
        errorReason="contentTooLarge"
        errorMetadata={{ size: '250' }}
      />,
    );
    expect(screen.getByText(/Load failed/i)).toBeDefined();
    expect(screen.getByText(/250KB/i)).toBeDefined();
  });

  it('renders placeholder when not in viewport', () => {
    render(<HtmlCard html="<div>test</div>" />);
    expect(screen.getByText(/Loading/i)).toBeDefined();
  });

  it('calls onRegenerate when regenerate button is clicked', () => {
    const onRegenerate = vi.fn();
    render(
      <HtmlCard
        html="<div>test</div>"
        errorReason="invalidHtml"
        onRegenerate={onRegenerate}
      />,
    );
    fireEvent.click(screen.getByText(/Regenerate/i));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it('renders iframe with srcDoc when visible', async () => {
    let observerCallback: IntersectionObserverCallback | null = null;

    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
    });

    render(<HtmlCard html="<div>visible</div>" />);

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.getAttribute('srcDoc')).toContain('<div>visible</div>');

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });
});
