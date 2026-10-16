import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Terminal, Eye, Code, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CodeSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  initialLanguage: string;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  initialLanguage,
}) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [logs, setLogs] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setLogs([]);
  }, [initialCode]);

  if (!isOpen) return null;

  // Build the sandboxed iframe HTML with script wrapper and console interception
  const buildIframeHtml = () => {
    const isFullHtml = code.includes('<html') || code.includes('<!DOCTYPE');

    if (isFullHtml) {
      return code.replace(
        '</head>',
        `<script>
          const _log = console.log;
          console.log = (...args) => {
            window.parent.postMessage({ type: 'AURA_LOG', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
            _log(...args);
          };
          window.onerror = (msg) => {
            window.parent.postMessage({ type: 'AURA_LOG', message: 'Error: ' + msg }, '*');
          };
        </script></head>`
      );
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #fafafa; color: #171717; padding: 1.5rem; margin: 0; }
  </style>
  <script>
    const _log = console.log;
    console.log = (...args) => {
      window.parent.postMessage({ type: 'AURA_LOG', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
      _log(...args);
    };
    window.onerror = (msg) => {
      window.parent.postMessage({ type: 'AURA_LOG', message: 'Error: ' + msg }, '*');
    };
  </script>
</head>
<body>
  ${
    ['html', 'css'].includes(initialLanguage.toLowerCase())
      ? code
      : `<div id="app"></div><script>${code}</script>`
  }
</body>
</html>`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`relative w-full ${
            isFullscreen ? 'h-full max-w-none' : 'max-w-5xl h-[85vh]'
          } bg-white rounded-3xl overflow-hidden flex flex-col z-10 border border-neutral-200 shadow-2xl`}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 bg-neutral-50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-200/80">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'code'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Source</span>
                </button>
              </div>

              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                Mode: {initialLanguage}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCode((prev) => prev + ' ')}
                className="p-2 rounded-lg hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
                title="Reload Sandbox"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-rose-100 text-neutral-500 hover:text-rose-600 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sandbox Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            {activeTab === 'preview' ? (
              <div className="flex-1 h-full bg-neutral-100 relative">
                <iframe
                  title="Aura Sandbox Runner"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  srcDoc={buildIframeHtml()}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="flex-1 h-full p-4 bg-[#1e232e] overflow-hidden flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-transparent font-mono text-sm text-neutral-100 outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            )}
          </div>

          {/* Bottom Console Drawer */}
          {logs.length > 0 && (
            <div className="max-h-32 overflow-y-auto px-4 py-2 border-t border-neutral-200 bg-neutral-900 text-xs font-mono text-emerald-400">
              <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                <Terminal className="w-3 h-3" />
                <span>Console Output:</span>
              </div>
              {logs.map((log, i) => (
                <div key={i} className="py-0.5">
                  &gt; {log}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
