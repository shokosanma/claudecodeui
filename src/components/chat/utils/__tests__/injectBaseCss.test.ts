import { describe, it, expect } from 'vitest';
import {
  getBaseCss,
  injectCspMeta,
  prepareHtmlForIframe,
  sanitizeHtmlForTheme,
} from '../injectBaseCss';

const AI_FLOWCHART = `<div class="diagram">
  <div style="display: flex; justify-content: center;">
    <div style="color: #333; background: #f0fdf4; border: 2px solid #34d399;">开始</div>
  </div>
  <div style="display: flex; justify-content: center; height: 32px;">
    <svg width="20" height="32" viewBox="0 0 20 32">
      <line x1="10" y1="0" x2="10" y2="22" stroke="#06b6d4" stroke-width="2"/>
      <polygon points="3,20 10,30 17,20" fill="#06b6d4"/>
    </svg>
  </div>
</div>`;

describe('getBaseCss', () => {
  it('returns tech-themed CSS with grid, glow, and mono nodes', () => {
    const css = getBaseCss();
    expect(css).toContain('!important');
    expect(css).toContain('--bg-deep: #070b14');
    expect(css).toContain('--accent: #22d3ee');
    expect(css).toContain('--font-mono');
    expect(css).toContain('background-image');
    expect(css).toContain('drop-shadow');
  });
});

describe('sanitizeHtmlForTheme', () => {
  it('removes embedded style tags but keeps inline layout styles', () => {
    const withStyle = `<style>.x{color:red}</style>${AI_FLOWCHART}`;
    const sanitized = sanitizeHtmlForTheme(withStyle);
    expect(sanitized).not.toContain('<style>');
    expect(sanitized).toContain('display: flex');
    expect(sanitized).toContain('style=');
  });

  it('extracts body content from full HTML documents', () => {
    const full = `<!DOCTYPE html><html><head><style>.x{color:red}</style></head><body><div class="diagram">ok</div></body></html>`;
    expect(sanitizeHtmlForTheme(full)).toBe('<div class="diagram">ok</div>');
  });
});

describe('injectCspMeta', () => {
  it('injects CSP into HTML with <head>', () => {
    const result = injectCspMeta('<html><head></head><body>hello</body></html>');
    expect(result).toContain('Content-Security-Policy');
    expect(result).toContain("script-src 'none'");
  });
});

describe('prepareHtmlForIframe', () => {
  it('wraps content in full HTML document with tech theme CSS', () => {
    const result = prepareHtmlForIframe('<div>hello</div>');
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('--accent: #22d3ee');
    expect(result).toContain('<div>hello</div>');
  });

  it('preserves inline layout styles from AI flowcharts', () => {
    const result = prepareHtmlForIframe(AI_FLOWCHART);
    expect(result).toContain('display: flex');
    expect(result).toContain('--bg-deep: #070b14');
  });

  it('does not add corner brackets to arrow connectors', () => {
    const css = getBaseCss();
    expect(css).toContain('.diagram .arrow::before');
    expect(css).toContain('content: none !important');
    expect(css).not.toMatch(
      /\.diagram div:not\(:has\(div\)\):not\(:has\(svg\)\)::before/,
    );
  });
});
