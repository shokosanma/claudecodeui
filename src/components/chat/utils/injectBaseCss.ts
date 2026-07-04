/**
 * Generates the base CSS to inject into every HTML card iframe.
 * Tech / cyber aesthetic: grid canvas, neon cyan accents, glass panels, glow.
 */
export function getBaseCss(): string {
  return `
:root {
  --bg-deep: #070b14;
  --bg-grid: rgba(34, 211, 238, 0.07);
  --surface: rgba(12, 20, 38, 0.92);
  --surface-elevated: rgba(20, 32, 58, 0.95);
  --border: rgba(34, 211, 238, 0.38);
  --border-dim: rgba(34, 211, 238, 0.18);
  --text: #e0f2fe;
  --text-secondary: #94a3b8;
  --accent: #22d3ee;
  --accent-dim: #0891b2;
  --accent-glow: rgba(34, 211, 238, 0.35);
  --accent-muted: rgba(34, 211, 238, 0.12);
  --violet: #818cf8;
  --green: #34d399;
  --green-glow: rgba(52, 211, 153, 0.35);
  --radius: 6px;
  --font-size: 13px;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
}

* {
  box-sizing: border-box;
  max-width: 100% !important;
}

html {
  overflow: hidden !important;
}

body {
  margin: 0;
  padding: 18px;
  color: var(--text) !important;
  font-family: var(--font-sans) !important;
  font-size: var(--font-size);
  line-height: 1.6;
  letter-spacing: 0.02em;
  overflow: hidden !important;
  background-color: var(--bg-deep) !important;
  background-image:
    linear-gradient(var(--bg-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px),
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34, 211, 238, 0.14), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(99, 102, 241, 0.08), transparent 50%) !important;
  background-size: 20px 20px, 20px 20px, 100% 100%, 100% 100% !important;
  -webkit-font-smoothing: antialiased;
}

.diagram {
  position: relative !important;
  margin: 4px auto !important;
  max-width: 520px !important;
  color: var(--text) !important;
  padding: 8px 0 !important;
}

.diagram::before {
  content: '' !important;
  display: block !important;
  height: 1px !important;
  margin: 0 auto 14px !important;
  max-width: 120px !important;
  background: linear-gradient(90deg, transparent, var(--accent), transparent) !important;
  box-shadow: 0 0 12px var(--accent-glow) !important;
}

.diagram div:has(> div),
.diagram div:has(> svg) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.diagram .node,
.diagram .step,
.diagram .box,
.diagram .card,
.diagram .block,
.diagram .start,
.diagram .end,
.diagram .step-start,
.diagram .step-end,
.diagram div:not(:has(div)):not(:has(svg)):not(.arrow) {
  position: relative !important;
  background: linear-gradient(165deg, var(--surface-elevated), var(--surface)) !important;
  border: 1px solid var(--border) !important;
  color: var(--text) !important;
  border-radius: var(--radius) !important;
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
  text-transform: none !important;
  box-shadow:
    0 0 14px rgba(34, 211, 238, 0.12),
    inset 0 1px 0 rgba(34, 211, 238, 0.12) !important;
}

.diagram .node::before,
.diagram .step::before,
.diagram .box::before,
.diagram .card::before,
.diagram .block::before,
.diagram .start::before,
.diagram .end::before,
.diagram .step-start::before,
.diagram .step-end::before,
.diagram div:not([style*="height:"]):has(> div:only-child) > div:not(.arrow)::before,
.diagram .node::after,
.diagram .step::after,
.diagram .box::after,
.diagram .card::after,
.diagram .block::after,
.diagram .start::after,
.diagram .end::after,
.diagram .step-start::after,
.diagram .step-end::after,
.diagram div:not([style*="height:"]):has(> div:only-child) > div:not(.arrow)::after {
  content: '' !important;
  position: absolute !important;
  width: 7px !important;
  height: 7px !important;
  border-color: var(--accent) !important;
  border-style: solid !important;
  opacity: 0.85 !important;
}

.diagram .node::before,
.diagram .step::before,
.diagram .box::before,
.diagram .card::before,
.diagram .block::before,
.diagram .start::before,
.diagram .end::before,
.diagram .step-start::before,
.diagram .step-end::before,
.diagram div:not([style*="height:"]):has(> div:only-child) > div:not(.arrow)::before {
  top: 4px !important;
  left: 4px !important;
  border-width: 2px 0 0 2px !important;
}

.diagram .node::after,
.diagram .step::after,
.diagram .box::after,
.diagram .card::after,
.diagram .block::after,
.diagram .start::after,
.diagram .end::after,
.diagram .step-start::after,
.diagram .step-end::after,
.diagram div:not([style*="height:"]):has(> div:only-child) > div:not(.arrow)::after {
  bottom: 4px !important;
  right: 4px !important;
  border-width: 0 2px 2px 0 !important;
}

/* Connectors between nodes: no box chrome, no corner brackets */
.diagram div:has(> svg),
.diagram div[style*="height:"]:has(> div:only-child),
.arrow,
.diagram .arrow,
.diagram div:not(:has(div)):not(:has(svg)).arrow,
.diagram div[style*="height:"]:has(> div:only-child) > div {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 2px 0 !important;
  color: var(--accent) !important;
  font-size: 14px !important;
  line-height: 1 !important;
  text-align: center !important;
}

.diagram div:has(> svg)::before,
.diagram div:has(> svg)::after,
.diagram div[style*="height:"]:has(> div:only-child)::before,
.diagram div[style*="height:"]:has(> div:only-child)::after,
.diagram div[style*="height:"]:has(> div:only-child) > div::before,
.diagram div[style*="height:"]:has(> div:only-child) > div::after,
.arrow::before,
.arrow::after,
.diagram .arrow::before,
.diagram .arrow::after {
  content: none !important;
  display: none !important;
}

.diagram p,
.diagram li,
.diagram td,
.diagram th {
  color: var(--text) !important;
}

.flow,
.flowchart,
.steps {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 6px !important;
}

.node,
.step,
.box,
.card,
.block {
  position: relative !important;
  background: linear-gradient(165deg, var(--surface-elevated), var(--surface)) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  padding: 12px 16px !important;
  color: var(--text) !important;
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  letter-spacing: 0.04em !important;
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.12), inset 0 1px 0 rgba(34, 211, 238, 0.1) !important;
  text-align: center !important;
}

.start,
.step-start {
  background: linear-gradient(165deg, rgba(34, 211, 238, 0.18), var(--accent-muted)) !important;
  border-color: var(--accent) !important;
  box-shadow: 0 0 18px var(--accent-glow), inset 0 0 20px rgba(34, 211, 238, 0.06) !important;
  color: var(--text) !important;
}

.end,
.step-end {
  background: linear-gradient(165deg, rgba(52, 211, 153, 0.15), rgba(52, 211, 153, 0.06)) !important;
  border-color: var(--green) !important;
  box-shadow: 0 0 16px var(--green-glow), inset 0 0 16px rgba(52, 211, 153, 0.05) !important;
  color: var(--text) !important;
}

table {
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius) !important;
  overflow: hidden !important;
  background: var(--surface) !important;
  font-family: var(--font-mono) !important;
  font-size: 12px !important;
}

th {
  background: var(--surface-elevated) !important;
  color: var(--accent) !important;
  padding: 10px 14px !important;
  border-bottom: 1px solid var(--border-dim) !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
  font-size: 11px !important;
}

td {
  color: var(--text-secondary) !important;
  padding: 10px 14px !important;
  border-bottom: 1px solid var(--border-dim) !important;
}

svg {
  max-width: 100% !important;
  height: auto !important;
  filter: drop-shadow(0 0 5px var(--accent-glow)) !important;
}

svg line,
svg path {
  stroke: var(--accent) !important;
  stroke-width: 2 !important;
}

svg polygon {
  fill: var(--accent) !important;
  stroke: none !important;
}

svg rect,
svg circle {
  fill: var(--surface) !important;
  stroke: var(--accent-dim) !important;
  stroke-width: 1.5 !important;
}

svg text {
  fill: var(--text) !important;
  font-family: var(--font-mono) !important;
}
`;
}

/**
 * Removes embedded author stylesheets from AI HTML fragments.
 * Does NOT strip inline layout styles (display, flex, transform, etc.).
 */
export function sanitizeHtmlForTheme(html: string): string {
  let out = html.trim();

  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(out);
  if (bodyMatch) {
    out = bodyMatch[1].trim();
  }

  out = out.replace(/<!DOCTYPE[^>]*>/gi, '');
  out = out.replace(/<\/?html[^>]*>/gi, '');
  out = out.replace(/<head[\s\S]*?<\/head>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');

  return out.trim();
}

const CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data:; img-src data:; style-src \'unsafe-inline\' data:; script-src \'none\';">';

/**
 * Wraps HTML content with base CSS and CSP meta tag for iframe rendering.
 */
export function prepareHtmlForIframe(html: string): string {
  const sanitized = sanitizeHtmlForTheme(html);
  const css = getBaseCss();
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${CSP_META}
<style>${css}</style>
</head>
<body>
${sanitized}
</body>
</html>`;
}

/**
 * @deprecated Use prepareHtmlForIframe — kept for tests that assert CSP injection on fragments.
 */
export function injectCspMeta(html: string): string {
  if (/<head>/i.test(html)) {
    return html.replace(/<head>/i, `<head>${CSP_META}`);
  }
  if (/<html>/i.test(html)) {
    return html.replace(/<html>/i, `<html>\n<head>${CSP_META}</head>`);
  }
  return `${CSP_META}\n${html}`;
}
