/**
 * HTML output instructions for structured diagram/table responses.
 * Shared between server (injection) and client (display stripping).
 */

export const HTML_OUTPUT_PROMPT = `
When your response contains structured content such as flowcharts, concept diagrams,
tables, or architecture diagrams, use HTML format with the following constraints:
- Wrap diagrams in <div class="diagram">
- Use semantic classes the renderer styles for you: .flow, .node, .step, .arrow, .start, .end
- Mark every connector between nodes with class="arrow" (text ↓ or inline SVG); never wrap arrows in node box styles
- Prefer flexbox vertical stacks (centered nodes + ↓ arrows) over SVG when possible
- Do NOT hardcode colors in inline styles — the iframe theme overrides colors automatically
- Typography: 13–14px, system font stack, generous padding and 12px rounded corners
- Do NOT use position: fixed or position: absolute
- Do NOT reference external resources (images, fonts, stylesheets)
- Use data: URIs for any embedded images
- Keep total HTML size under 200KB
- Use max-width: 100% for all elements
`.trim();

const PROMPT_PREFIX = HTML_OUTPUT_PROMPT.slice(0, 48);

/**
 * Removes injected HTML output instructions from a persisted user message.
 * No-op when the content does not start with the known prompt block.
 */
export function stripHtmlOutputPrompt(content) {
  if (typeof content !== 'string' || !content) {
    return content;
  }

  const trimmedStart = content.trimStart();
  if (!trimmedStart.startsWith(PROMPT_PREFIX)) {
    return content;
  }

  const withoutPrompt = trimmedStart.slice(HTML_OUTPUT_PROMPT.length);
  const userText = withoutPrompt.replace(/^\s*\n+/, '');
  return userText.length > 0 ? userText : content;
}

/**
 * Prepends HTML instructions to a user command for providers that only accept
 * a single prompt string (Cursor, Codex, Gemini CLI, OpenCode).
 */
export function prependHtmlOutputInstructions(command, instructions) {
  const userCommand = typeof command === 'string' ? command.trim() : '';
  const prompt = typeof instructions === 'string' ? instructions.trim() : '';
  if (!userCommand || !prompt) {
    return command;
  }
  return `${prompt}\n\n${userCommand}`;
}
