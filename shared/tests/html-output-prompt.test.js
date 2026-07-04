import { describe, it, expect } from 'vitest';

import {
  HTML_OUTPUT_PROMPT,
  prependHtmlOutputInstructions,
  stripHtmlOutputPrompt,
} from '../html-output-prompt.js';

describe('html-output-prompt', () => {
  it('stripHtmlOutputPrompt removes injected instructions and keeps user text', () => {
    const injected = `${HTML_OUTPUT_PROMPT}\n\n画一个简单的流程图，用HTML格式输出`;
    expect(stripHtmlOutputPrompt(injected)).toBe('画一个简单的流程图，用HTML格式输出');
  });

  it('stripHtmlOutputPrompt leaves unrelated user messages unchanged', () => {
    const plain = 'Explain recursion with an example';
    expect(stripHtmlOutputPrompt(plain)).toBe(plain);
  });

  it('prependHtmlOutputInstructions combines prompt and user command', () => {
    const combined = prependHtmlOutputInstructions('draw a flowchart', HTML_OUTPUT_PROMPT);
    expect(combined.startsWith(HTML_OUTPUT_PROMPT)).toBe(true);
    expect(combined.endsWith('draw a flowchart')).toBe(true);
  });
});
