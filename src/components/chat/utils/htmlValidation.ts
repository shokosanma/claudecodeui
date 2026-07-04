export interface ValidationResult {
  valid: boolean;
  reason?: string;
  metadata?: Record<string, string>;
}

export type HtmlContentSplit = {
  html: string;
  remainder: string;
};

const FENCED_HTML_WHOLE_PATTERN = /^```(?:html)?\s*\n([\s\S]*?)```\s*$/i;
const FENCED_HTML_PATTERN = /```(?:html)?\s*\n([\s\S]*?)```/i;
const RAW_HTML_PATTERN = /^<[a-z][\s\S]*>$/i;
const DIAGRAM_DIV_PATTERN = /<div\s+class=["']diagram["'][^>]*>/i;

const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
]);

const TAG_TOKEN_PATTERN = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

function isSelfClosingTag(tag: string, token: string): boolean {
  if (/\/>\s*$/.test(token)) return true;
  return VOID_HTML_TAGS.has(tag.toLowerCase());
}

/**
 * Extracts a leading HTML block by balancing the first root tag.
 * Handles nested div/svg flowcharts followed by optional prose.
 */
export function extractLeadingHtmlBlock(content: string): string | null {
  const trimmed = content.trimStart();
  const firstOpen = /^<([a-z][a-z0-9]*)\b/i.exec(trimmed);
  if (!firstOpen) return null;

  const rootTag = firstOpen[1].toLowerCase();
  let depth = 0;
  let match: RegExpExecArray | null;

  TAG_TOKEN_PATTERN.lastIndex = 0;
  while ((match = TAG_TOKEN_PATTERN.exec(trimmed)) !== null) {
    const token = match[0];
    const tag = match[1].toLowerCase();
    if (isSelfClosingTag(tag, token)) continue;

    if (token.startsWith('</')) {
      if (tag === rootTag) {
        depth -= 1;
        if (depth === 0) {
          return trimmed.slice(0, match.index + token.length);
        }
      }
      continue;
    }

    if (tag === rootTag) {
      depth += 1;
    }
  }

  return null;
}

/**
 * Splits a chat message into an HTML fragment (for HtmlCard) and optional
 * remaining markdown/text.
 */
export function splitHtmlMessageContent(content: string): HtmlContentSplit | null {
  const trimmed = content.trim();

  const wholeFenced = FENCED_HTML_WHOLE_PATTERN.exec(trimmed);
  if (wholeFenced) {
    return { html: wholeFenced[1].trim(), remainder: '' };
  }

  if (RAW_HTML_PATTERN.test(trimmed)) {
    return { html: trimmed, remainder: '' };
  }

  const fencedMatch = FENCED_HTML_PATTERN.exec(trimmed);
  if (fencedMatch && typeof fencedMatch.index === 'number') {
    const html = fencedMatch[1].trim();
    const remainder = (
      trimmed.slice(0, fencedMatch.index) +
      trimmed.slice(fencedMatch.index + fencedMatch[0].length)
    ).trim();
    return { html, remainder };
  }

  const leadingHtml = extractLeadingHtmlBlock(trimmed);
  if (leadingHtml) {
    return {
      html: leadingHtml,
      remainder: trimmed.slice(leadingHtml.length).trim(),
    };
  }

  if (DIAGRAM_DIV_PATTERN.test(trimmed)) {
    const diagramStart = trimmed.search(DIAGRAM_DIV_PATTERN);
    const diagramHtml = extractLeadingHtmlBlock(trimmed.slice(diagramStart));
    if (diagramHtml) {
      return {
        html: diagramHtml,
        remainder: (
          trimmed.slice(0, diagramStart) +
          trimmed.slice(diagramStart + diagramHtml.length)
        ).trim(),
      };
    }
  }

  return null;
}

/**
 * Returns the HTML fragment to render in HtmlCard, if any.
 */
export function extractHtmlContent(content: string): string | null {
  return splitHtmlMessageContent(content)?.html ?? null;
}

/**
 * Checks whether a message should render an HtmlCard (possibly with trailing markdown).
 */
export function looksLikeHtml(content: string): boolean {
  return splitHtmlMessageContent(content) !== null;
}

/**
 * Checks whether the HTML contains external resource references
 * (http/https URLs in src, href, or @import).
 */
export function hasExternalResources(html: string): boolean {
  const externalPatterns = [
    /<img[^>]+src=["']https?:\/\//i,
    /<link[^>]+href=["']https?:\/\//i,
    /<script[^>]+src=["']https?:\/\//i,
    /@import\s+url\(["']?https?:\/\//i,
    /url\(["']?https?:\/\//i,
  ];
  return externalPatterns.some((pattern) => pattern.test(html));
}

/**
 * Validates HTML content for rendering in the chat.
 * Checks: size, basic structure, external resources.
 * Pass the extracted HTML fragment (from extractHtmlContent).
 */
export function validateHtml(html: string): ValidationResult {
  // 1. Size check (max 200KB)
  const sizeBytes = new Blob([html]).size;
  if (sizeBytes > 200 * 1024) {
    return {
      valid: false,
      reason: 'contentTooLarge',
      metadata: { size: (sizeBytes / 1024).toFixed(0) },
    };
  }

  // 2. Format check (basic HTML structure)
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return { valid: false, reason: 'invalidHtml' };
  }

  // 3. External resource check
  if (hasExternalResources(html)) {
    return { valid: false, reason: 'externalResources' };
  }

  return { valid: true };
}

/**
 * Validates a chat message for HtmlCard rendering.
 */
export function validateHtmlMessage(content: string): ValidationResult & { html: string | null } {
  const html = extractHtmlContent(content);
  if (!html) {
    return { valid: false, reason: 'invalidHtml', html: null };
  }
  return { ...validateHtml(html), html };
}
