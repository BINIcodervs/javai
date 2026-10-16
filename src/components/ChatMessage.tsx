import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, ExternalLink } from 'lucide-react';
import { CodeBlockViewer } from './CodeBlockViewer';

export interface ChatImage {
  name: string;
  dataUrl: string;
  size?: number;
}

export interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: ChatImage[];
  timestamp: number;
  modelUsed?: string;
  isFallback?: boolean;
}

interface ChatMessageProps {
  message: MessageItem;
  onRunPreview?: (code: string, language: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onRunPreview }) => {
  const isUser = message.role === 'user';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Helper to parse content into text sections and code blocks
  const renderFormattedContent = (content: string) => {
    const parts: React.ReactNode[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(renderRichText(textBefore, `text-${lastIndex}`));
      }

      const lang = match[1] || 'code';
      const code = match[2];
      parts.push(
        <CodeBlockViewer
          key={`code-${match.index}`}
          language={lang}
          code={code}
          onRunPreview={onRunPreview}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    const remainingText = content.substring(lastIndex);
    if (remainingText) {
      parts.push(renderRichText(remainingText, `text-end-${lastIndex}`));
    }

    return parts;
  };

  // Helper for inline markdown elements (bold, inline code, bullets, paragraphs)
  const renderRichText = (text: string, keyPrefix: string) => {
    const paragraphs = text.split('\n\n');

    return (
      <div key={keyPrefix} className="space-y-3">
        {paragraphs.map((para, pIdx) => {
          if (!para.trim()) return null;

          // Check if bullet list
          if (para.includes('\n- ') || para.startsWith('- ')) {
            const items = para.split(/\n-\s+/).filter(Boolean);
            return (
              <ul key={`${keyPrefix}-p-${pIdx}`} className="list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
                {items.map((item, iIdx) => (
                  <li key={iIdx} className="leading-relaxed">
                    {parseInlineStyles(item)}
                  </li>
                ))}
              </ul>
            );
          }

          // Check for headers
          if (para.startsWith('### ')) {
            return (
              <h4 key={`${keyPrefix}-p-${pIdx}`} className={`text-base font-bold pt-2 ${isUser ? 'text-white' : 'text-neutral-900'}`}>
                {parseInlineStyles(para.replace('### ', ''))}
              </h4>
            );
          }
          if (para.startsWith('## ')) {
            return (
              <h3 key={`${keyPrefix}-p-${pIdx}`} className={`text-lg font-extrabold pt-2.5 ${isUser ? 'text-white' : 'text-neutral-900'}`}>
                {parseInlineStyles(para.replace('## ', ''))}
              </h3>
            );
          }

          return (
            <p key={`${keyPrefix}-p-${pIdx}`} className="leading-relaxed">
              {parseInlineStyles(para)}
            </p>
          );
        })}
      </div>
    );
  };

  const parseInlineStyles = (str: string) => {
    const segments = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return segments.map((seg, idx) => {
      if (seg.startsWith('`') && seg.endsWith('`')) {
        return (
          <code
            key={idx}
            className={`px-1.5 py-0.5 rounded-md font-mono text-[13px] border ${
              isUser
                ? 'bg-blue-700 text-blue-100 border-blue-500'
                : 'bg-neutral-100 text-orange-700 border-neutral-200'
            }`}
          >
            {seg.slice(1, -1)}
          </code>
        );
      }
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return (
          <strong key={idx} className={`font-bold ${isUser ? 'text-white' : 'text-neutral-900'}`}>
            {seg.slice(2, -2)}
          </strong>
        );
      }
      return seg;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-4`}
    >
      <div
        className={`max-w-3xl w-full sm:w-auto sm:max-w-2xl lg:max-w-3xl rounded-3xl p-5 sm:p-6 transition-all ${
          isUser
            ? 'bg-blue-600 text-white ml-8 shadow-sm'
            : 'bg-white border border-neutral-200/90 text-neutral-800 mr-8 shadow-sm'
        }`}
      >
        {/* Header with Role & Meta */}
        <div className={`flex items-center justify-between gap-3 mb-3 pb-2 border-b text-xs ${isUser ? 'border-blue-500/60' : 'border-neutral-100'}`}>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isUser
                  ? 'bg-white text-blue-600 font-bold'
                  : 'bg-orange-500 text-white shadow-xs'
              }`}
            >
              {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 fill-white" />}
            </div>
            <span className={`font-bold ${isUser ? 'text-white' : 'text-neutral-900'}`}>
              {isUser ? 'You' : 'Meta Muse Glimmer'}
            </span>
          </div>

          <div className={`text-[11px] font-mono ${isUser ? 'text-blue-100' : 'text-neutral-600'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Attached Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-4">
            {message.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(img.dataUrl)}
                className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer shadow-xs hover:border-blue-500 transition-all"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-neutral-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Body */}
        <div className={`text-[14px] sm:text-[15px] font-sans ${isUser ? 'text-white' : 'text-neutral-800'}`}>
          {renderFormattedContent(message.content)}
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/20"
          />
        </div>
      )}
    </motion.div>
  );
};
