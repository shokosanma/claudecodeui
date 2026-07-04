import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

/**
 * Returns rehype plugins for processing HTML content in chat messages.
 * First allows raw HTML through (rehype-raw), then sanitizes it (rehype-sanitize).
 *
 * Allowed tags: b, i, em, strong, a, div, span, p, br, h1-h6, ul, ol, li,
 *               pre, code, table, tr, td, th, img (no event handlers)
 * Stripped: script, iframe, object, embed, on* attributes, javascript: URLs
 */
export function getSanitizePlugins() {
  return [rehypeRaw, rehypeSanitize];
}
