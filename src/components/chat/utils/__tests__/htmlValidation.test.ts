import { describe, it, expect } from 'vitest';
import {
  validateHtml,
  looksLikeHtml,
  hasExternalResources,
  extractHtmlContent,
  extractLeadingHtmlBlock,
  splitHtmlMessageContent,
  validateHtmlMessage,
} from '../htmlValidation';

const SAMPLE_FLOWCHART = `<div class="diagram">
  <div style="padding: 20px;">
    <svg width="20" height="32" viewBox="0 0 20 32">
      <line x1="10" y1="0" x2="10" y2="22" stroke="#06b6d4" stroke-width="2"/>
      <polygon points="3,20 10,30 17,20" fill="#06b6d4"/>
    </svg>
  </div>
</div>`;

describe('splitHtmlMessageContent', () => {
  it('splits leading HTML from trailing prose', () => {
    const result = splitHtmlMessageContent(`${SAMPLE_FLOWCHART}\n\n一个用户登录流程图说明`);
    expect(result).not.toBeNull();
    expect(result?.html).toContain('<div class="diagram">');
    expect(result?.html).toContain('<svg');
    expect(result?.remainder).toContain('用户登录流程图');
  });

  it('extracts fenced html block embedded in prose', () => {
    const result = splitHtmlMessageContent(`说明文字\n\`\`\`html\n<div>chart</div>\n\`\`\`\n\n结尾`);
    expect(result?.html).toBe('<div>chart</div>');
    expect(result?.remainder).toContain('说明文字');
    expect(result?.remainder).toContain('结尾');
  });
});

describe('extractLeadingHtmlBlock', () => {
  it('balances nested div and svg tags', () => {
    const block = extractLeadingHtmlBlock(SAMPLE_FLOWCHART);
    expect(block).toBe(SAMPLE_FLOWCHART);
  });
});

describe('extractHtmlContent', () => {
  it('extracts fenced html block', () => {
    expect(extractHtmlContent('```html\n<div>hello</div>\n```')).toBe('<div>hello</div>');
  });

  it('extracts raw html when entire message is markup', () => {
    expect(extractHtmlContent('<div>hello</div>')).toBe('<div>hello</div>');
  });

  it('returns null for prose with inline comparison', () => {
    expect(extractHtmlContent('x < y and z > 0')).toBeNull();
  });

  it('returns null for markdown with leading text before html block', () => {
    expect(extractHtmlContent('Here:\n<div>hello</div>')).toBeNull();
  });

  it('returns html when diagram block leads the message', () => {
    expect(extractHtmlContent(`${SAMPLE_FLOWCHART}\n\n说明`)).toContain('diagram');
  });
});

describe('looksLikeHtml', () => {
  it('returns true for content with HTML tags', () => {
    expect(looksLikeHtml('<div>hello</div>')).toBe(true);
    expect(looksLikeHtml('```html\n<b>bold</b>\n```')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(looksLikeHtml('hello world')).toBe(false);
    expect(looksLikeHtml('**bold** markdown')).toBe(false);
    expect(looksLikeHtml('')).toBe(false);
    expect(looksLikeHtml('x < y')).toBe(false);
  });
});

describe('hasExternalResources', () => {
  it('detects external image URLs', () => {
    expect(hasExternalResources('<img src="https://example.com/image.png">')).toBe(true);
  });

  it('detects external link URLs', () => {
    expect(hasExternalResources('<link href="https://example.com/style.css">')).toBe(true);
  });

  it('detects @import URLs', () => {
    expect(hasExternalResources('@import url("https://example.com/font.css")')).toBe(true);
  });

  it('allows data: URIs', () => {
    expect(hasExternalResources('<img src="data:image/png;base64,abc123">')).toBe(false);
  });

  it('allows relative paths', () => {
    expect(hasExternalResources('<img src="/images/icon.png">')).toBe(false);
  });
});

describe('validateHtml', () => {
  it('passes valid simple HTML', () => {
    const result = validateHtml('<div>hello</div>');
    expect(result.valid).toBe(true);
  });

  it('rejects oversized HTML', () => {
    const large = '<div>' + 'x'.repeat(200 * 1024) + '</div>';
    const result = validateHtml(large);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('contentTooLarge');
    expect(result.metadata?.size).toBeDefined();
  });

  it('rejects non-HTML content', () => {
    const result = validateHtml('just plain text');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalidHtml');
  });

  it('rejects external resources', () => {
    const result = validateHtml('<div><img src="https://evil.com/track.png"></div>');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('externalResources');
  });
});

describe('validateHtmlMessage', () => {
  it('validates extracted fenced html', () => {
    const result = validateHtmlMessage('```html\n<div>ok</div>\n```');
    expect(result.valid).toBe(true);
    expect(result.html).toBe('<div>ok</div>');
  });
});
