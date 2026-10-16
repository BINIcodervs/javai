import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { TemperatureDial } from './components/TemperatureDial';
import { ChatMessage, MessageItem, ChatImage } from './components/ChatMessage';
import { ImageDropzone } from './components/ImageDropzone';
import { StarterPrompts } from './components/StarterPrompts';
import { CodeSandboxModal } from './components/CodeSandboxModal';
import { buildMultimodalMessage, clampParameters } from './utils/codeParser';

export default function App() {
  // Model and Temperature State
  const model = 'meta/muse-glimmer-30b';
  const [temperature, setTemperature] = useState<number>(1.0);

  // Chat State
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [attachedImages, setAttachedImages] = useState<ChatImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Panels
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [sandboxCode, setSandboxCode] = useState<string>('');
  const [sandboxLang, setSandboxLang] = useState<string>('html');
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ?? inputPrompt.trim();
    if ((!textToSend && attachedImages.length === 0) || isLoading) return;

    setErrorMessage(null);
    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: MessageItem = {
      id: userMessageId,
      role: 'user',
      content: textToSend || '(Image attached)',
      images: [...attachedImages],
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);
    setInputPrompt('');
    setAttachedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      const clamped = clampParameters({ temperature });

      const apiMessages = nextMessages.map((msg) => {
        if (msg.role === 'user') {
          return buildMultimodalMessage(msg.content, msg.images);
        }
        return { role: 'assistant', content: msg.content };
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          temperature: clamped.temperature,
          top_p: 0.95,
          max_tokens: 8192,
          model,
          stream: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const assistantReply =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.message?.reasoning_content ||
        'No response content returned by Meta Muse Glimmer.';

      const newAssistantMessage: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: Date.now(),
        modelUsed: data.modelUsed || model,
        isFallback: data.isFallback,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (err: any) {
      console.error('Chat request failure:', err);
      setErrorMessage(err.message || 'Failed to communicate with Aura API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const handleOpenSandboxWithCode = (code: string, language: string) => {
    setSandboxCode(code);
    setSandboxLang(language);
    setIsSandboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900 flex flex-col relative selection:bg-orange-500 selection:text-white">
      {/* Floating Top Navigation */}
      <Navbar
        currentModel={model}
        temperature={temperature}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSandbox={() => {
          setSandboxCode(`<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-amber-50 text-neutral-900 min-h-screen flex items-center justify-center p-6">
  <div class="p-8 rounded-3xl bg-white border border-amber-200 text-center shadow-lg max-w-md">
    <div class="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">
      ⚡
    </div>
    <h2 class="text-2xl font-black text-neutral-900 mb-2">
      Live Code Sandbox
    </h2>
    <p class="text-sm text-neutral-600">Run and preview components generated by Meta Muse Glimmer 30B.</p>
  </div>
</body>
</html>`);
          setSandboxLang('html');
          setIsSandboxOpen(true);
        }}
        onResetChat={handleResetChat}
        hasMessages={messages.length > 0}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-36 relative z-10 flex flex-col justify-between">
        {/* Empty State / Starter Hero */}
        {messages.length === 0 && (
          <div className="my-auto">
            <StarterPrompts onSelectPrompt={(p) => handleSendMessage(p)} />
          </div>
        )}

        {/* Message Thread */}
        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onRunPreview={handleOpenSandboxWithCode}
              />
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-sm w-fit"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white animate-spin">
                  <Sparkles className="w-4 h-4 fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-900">
                    Meta Muse Glimmer Synthesizing...
                  </span>
                  <span className="text-[11px] font-mono text-orange-600 font-semibold">
                    Evaluating logic at Temp: {temperature.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error Notification Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs font-bold text-rose-600 hover:text-rose-900 underline cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Input Capsule (2016 Vibrant Style) */}
      <footer className="fixed bottom-4 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="w-full max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-neutral-200/90 relative">
            {/* Attached images preview */}
            <ImageDropzone
              images={attachedImages}
              onAddImages={(newImgs) => setAttachedImages((prev) => [...prev, ...newImgs].slice(0, 3))}
              onRemoveImage={(idx) => setAttachedImages((prev) => prev.filter((_, i) => i !== idx))}
            />

            {/* Input Row */}
            <div className="flex items-end gap-2">
              {/* Image Upload Trigger */}
              <ImageDropzone
                images={attachedImages}
                onAddImages={(newImgs) => setAttachedImages((prev) => [...prev, ...newImgs].slice(0, 3))}
                onRemoveImage={(idx) => setAttachedImages((prev) => prev.filter((_, i) => i !== idx))}
                compact
              />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask Muse Glimmer (e.g., 'Which number is larger, 9.11 or 9.8?' or paste code)..."
                rows={1}
                className="flex-1 bg-transparent border-0 text-neutral-900 placeholder-neutral-400 text-[14px] sm:text-[15px] focus:outline-none resize-none py-2 px-1 max-h-44 leading-relaxed font-sans"
              />

              {/* Quick Temperature Badge */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-xs font-semibold text-neutral-700 transition-colors cursor-pointer shrink-0"
                title="Adjust Temperature"
              >
                <span className="text-orange-600 font-bold">T:</span>
                <span>{temperature.toFixed(2)}</span>
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!inputPrompt.trim() && attachedImages.length === 0)}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  inputPrompt.trim() || attachedImages.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-500/25'
                    : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Temperature Control Dialog */}
      <TemperatureDial
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        temperature={temperature}
        setTemperature={setTemperature}
      />

      {/* Code Sandbox Modal */}
      <CodeSandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
        initialCode={sandboxCode}
        initialLanguage={sandboxLang}
      />
    </div>
  );
}
