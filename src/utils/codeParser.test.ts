import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractCodeBlocks,
  clampParameters,
  getTemperaturePresetLabel,
  buildMultimodalMessage,
  estimateTokens,
} from './codeParser.ts';

test('extractCodeBlocks parses multiple code blocks with correct language and runnable flag', () => {
  const sampleMarkdown = `
Here is a function:

\`\`\`typescript
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`

And here is some HTML:
\`\`\`html
<div class="card">Hello World</div>
\`\`\`

And some plain text:
\`\`\`
No lang specified
\`\`\`
`;

  const blocks = extractCodeBlocks(sampleMarkdown);
  assert.equal(blocks.length, 3);
  
  assert.equal(blocks[0].language, 'typescript');
  assert.equal(blocks[0].isRunnable, true);
  assert.equal(blocks[0].lineCount, 3);

  assert.equal(blocks[1].language, 'html');
  assert.equal(blocks[1].isRunnable, true);

  assert.equal(blocks[2].language, 'plaintext');
  assert.equal(blocks[2].isRunnable, false);
});

test('clampParameters confines temperature, top_p, and max_tokens within valid thresholds', () => {
  // Test over-range
  const clampedHigh = clampParameters({
    temperature: 3.5,
    top_p: 1.5,
    max_tokens: 50000,
  });
  assert.equal(clampedHigh.temperature, 2.0);
  assert.equal(clampedHigh.top_p, 1.0);
  assert.equal(clampedHigh.max_tokens, 16384);

  // Test under-range
  const clampedLow = clampParameters({
    temperature: -0.5,
    top_p: -0.1,
    max_tokens: 10,
  });
  assert.equal(clampedLow.temperature, 0.0);
  assert.equal(clampedLow.top_p, 0.01);
  assert.equal(clampedLow.max_tokens, 64);

  // Test defaults
  const defaults = clampParameters({});
  assert.equal(defaults.temperature, 1.0);
  assert.equal(defaults.top_p, 0.95);
  assert.equal(defaults.max_tokens, 8192);
});

test('getTemperaturePresetLabel returns corresponding stylistic descriptor', () => {
  const precise = getTemperaturePresetLabel(0.1);
  assert.equal(precise.title, 'Deterministic Logic');

  const standard = getTemperaturePresetLabel(1.0);
  assert.equal(standard.title, 'Dynamic Synthesis');

  const hyper = getTemperaturePresetLabel(1.8);
  assert.equal(hyper.title, 'Hyper-Experimental');
});

test('buildMultimodalMessage handles text-only and images array', () => {
  const textMsg = buildMultimodalMessage('Hello world', []);
  assert.equal(textMsg.role, 'user');
  assert.equal(textMsg.content, 'Hello world');

  const multiMsg = buildMultimodalMessage('Analyze this', [
    { dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==', name: 'diagram.png' },
  ]);
  assert.equal(multiMsg.role, 'user');
  assert.ok(Array.isArray(multiMsg.content));
  assert.equal((multiMsg.content as Array<Record<string, unknown>>).length, 2);
  assert.equal((multiMsg.content as Array<Record<string, unknown>>)[0].type, 'text');
  assert.equal((multiMsg.content as Array<Record<string, unknown>>)[1].type, 'image_url');
});

test('estimateTokens calculates approximate token weights', () => {
  assert.equal(estimateTokens(''), 0);
  assert.ok(estimateTokens('hello world from muse glimmer') >= 5);
});
