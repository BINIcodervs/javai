export interface ExtractedCodeBlock {
  id: string;
  language: string;
  code: string;
  lineCount: number;
  isRunnable: boolean;
}

export interface ModelParameters {
  temperature: number;
  top_p: number;
  max_tokens: number;
}

/**
 * Parses markdown text to extract triple backtick code blocks with metadata
 */
export function extractCodeBlocks(markdown: string): ExtractedCodeBlock[] {
  if (!markdown) return [];

  const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
  const blocks: ExtractedCodeBlock[] = [];
  let match: RegExpExecArray | null;
  let counter = 1;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const rawLang = (match[1] || 'plaintext').toLowerCase().trim();
    const code = match[2].trimEnd();
    const lineCount = code ? code.split('\n').length : 0;
    
    const runnableLangs = ['html', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx', 'css'];
    const isRunnable = runnableLangs.includes(rawLang) || code.includes('<html') || code.includes('<!DOCTYPE');

    blocks.push({
      id: `block-${counter++}`,
      language: rawLang || 'plaintext',
      code,
      lineCount,
      isRunnable,
    });
  }

  return blocks;
}

/**
 * Validates and clamps AI generation parameters within safe bounds
 */
export function clampParameters(params: Partial<ModelParameters>): ModelParameters {
  const temperature = Math.min(2.0, Math.max(0.0, Number.isFinite(params.temperature) ? (params.temperature as number) : 1.0));
  const top_p = Math.min(1.0, Math.max(0.01, Number.isFinite(params.top_p) ? (params.top_p as number) : 0.95));
  const max_tokens = Math.min(16384, Math.max(64, Math.round(Number.isFinite(params.max_tokens) ? (params.max_tokens as number) : 8192)));

  return {
    temperature: Number(temperature.toFixed(2)),
    top_p: Number(top_p.toFixed(2)),
    max_tokens,
  };
}

/**
 * Returns friendly iOS 27 design label describing current temperature behavior
 */
export function getTemperaturePresetLabel(temp: number): { title: string; hint: string; color: string } {
  if (temp <= 0.2) {
    return {
      title: 'Deterministic Logic',
      hint: 'Strict adherence, optimal for unit tests and bug hunting',
      color: 'from-blue-500 to-cyan-400',
    };
  }
  if (temp <= 0.7) {
    return {
      title: 'Precision Coding',
      hint: 'Balanced accuracy and structure for complex refactoring',
      color: 'from-emerald-400 to-teal-500',
    };
  }
  if (temp <= 1.1) {
    return {
      title: 'Dynamic Synthesis',
      hint: 'Default Muse Glimmer optimal balance of creativity & precision',
      color: 'from-indigo-500 to-purple-500',
    };
  }
  if (temp <= 1.5) {
    return {
      title: 'Creative Ideation',
      hint: 'High novelty, exploratory system architectures',
      color: 'from-amber-400 to-pink-500',
    };
  }
  return {
    title: 'Hyper-Experimental',
    hint: 'Maximum entropy, brainstorming out-of-the-box approaches',
    color: 'from-pink-500 to-rose-600',
  };
}

/**
 * Formats message for OpenAI compatible chat API with optional images
 */
export function buildMultimodalMessage(
  text: string,
  images: Array<{ dataUrl: string; name: string }> = []
): { role: 'user'; content: string | Array<Record<string, unknown>> } {
  if (!images.length) {
    return { role: 'user', content: text };
  }

  const content: Array<Record<string, unknown>> = [
    { type: 'text', text: text || 'Please examine this image and provide insights or code.' }
  ];

  for (const img of images) {
    content.push({
      type: 'image_url',
      image_url: {
        url: img.dataUrl,
        detail: 'auto',
      },
    });
  }

  return { role: 'user', content };
}

/**
 * Estimates reading time and token estimate roughly from text
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().split(/\s+/).length * 1.3);
}
