import React, { useState } from 'react';
import { Copy, Check, Play, Download, Terminal } from 'lucide-react';

interface CodeBlockViewerProps {
  language: string;
  code: string;
  onRunPreview?: (code: string, language: string) => void;
}

export const CodeBlockViewer: React.FC<CodeBlockViewerProps> = ({
  language,
  code,
  onRunPreview,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      javascript: 'js',
      js: 'js',
      typescript: 'ts',
      ts: 'ts',
      jsx: 'jsx',
      tsx: 'tsx',
      html: 'html',
      css: 'css',
      python: 'py',
      py: 'py',
      json: 'json',
      markdown: 'md',
    };
    const ext = extMap[language.toLowerCase()] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-snippet.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = code.split('\n');
  const isRunnable = ['html', 'js', 'javascript', 'jsx', 'tsx', 'css'].includes(language.toLowerCase()) ||
    code.includes('<!DOCTYPE') ||
    code.includes('<html');

  return (
    <div className="my-3.5 rounded-2xl overflow-hidden border border-neutral-800 bg-[#1e232e] shadow-md text-white">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#171b24] border-b border-neutral-700/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-neutral-300 font-bold uppercase tracking-wider text-[11px]">
            {language || 'code'}
          </span>
          <span className="text-neutral-500 text-[10px]">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isRunnable && onRunPreview && (
            <button
              onClick={() => onRunPreview(code, language)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Run in Live Sandbox"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Preview</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Download Snippet"
            aria-label="Download code snippet"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition-colors cursor-pointer"
            title="Copy Code"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[11px] font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-neutral-100 flex">
        {/* Line Numbers */}
        <div className="select-none pr-4 text-right text-neutral-500 text-[12px] tabular-nums font-mono border-r border-neutral-700/50 mr-4 flex flex-col">
          {lines.map((_, i) => (
            <span key={i} className="leading-relaxed">
              {i + 1}
            </span>
          ))}
        </div>

        {/* Code Content */}
        <pre className="flex-1 font-mono text-neutral-100">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
