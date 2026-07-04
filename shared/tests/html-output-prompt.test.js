import assert from 'node:assert/strict';
import test from 'node:test';

import {
  HTML_OUTPUT_PROMPT,
  prependHtmlOutputInstructions,
  stripHtmlOutputPrompt,
} from '../html-output-prompt.js';

test('stripHtmlOutputPrompt removes injected instructions and keeps user text', () => {
  const injected = `${HTML_OUTPUT_PROMPT}\n\n画一个简单的流程图，用HTML格式输出`;
  assert.equal(stripHtmlOutputPrompt(injected), '画一个简单的流程图，用HTML格式输出');
});

test('stripHtmlOutputPrompt leaves unrelated user messages unchanged', () => {
  const plain = 'Explain recursion with an example';
  assert.equal(stripHtmlOutputPrompt(plain), plain);
});

test('prependHtmlOutputInstructions combines prompt and user command', () => {
  const combined = prependHtmlOutputInstructions('draw a flowchart', HTML_OUTPUT_PROMPT);
  assert.ok(combined.startsWith(HTML_OUTPUT_PROMPT));
  assert.ok(combined.endsWith('draw a flowchart'));
});
