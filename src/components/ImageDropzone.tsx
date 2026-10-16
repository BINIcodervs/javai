import React, { useRef, useState } from 'react';
import { Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { ChatImage } from './ChatMessage';

interface ImageDropzoneProps {
  images: ChatImage[];
  onAddImages: (newImages: ChatImage[]) => void;
  onRemoveImage: (index: number) => void;
  compact?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  images,
  onAddImages,
  onRemoveImage,
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: ChatImage[] = [];
    const validFiles = Array.from(files).slice(0, 3 - images.length);

    validFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push({
            name: file.name,
            dataUrl: e.target.result as string,
            size: file.size,
          });

          if (newImages.length === validFiles.length) {
            onAddImages(newImages);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />

      {/* Selected Images Preview Strip */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-2xl bg-neutral-100 border border-neutral-200">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group w-16 h-16 rounded-xl overflow-hidden border border-neutral-300 bg-white shadow-xs"
            >
              <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-neutral-900/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl border border-dashed border-neutral-300 hover:border-blue-500 bg-white hover:bg-blue-50/50 flex flex-col items-center justify-center text-neutral-500 hover:text-blue-600 transition-colors text-[10px] font-bold cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 mb-0.5" />
              <span>+ Add</span>
            </button>
          )}
        </div>
      )}

      {/* Upload Trigger Button if compact */}
      {compact && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
          title="Attach Image"
          aria-label="Upload image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      )}

      {/* Drag & Drop Visual overlay container if dragging */}
      {isDragging && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="absolute inset-0 z-30 rounded-3xl bg-blue-50/95 border-2 border-dashed border-blue-600 flex flex-col items-center justify-center text-blue-900 shadow-xl"
        >
          <UploadCloud className="w-10 h-10 text-blue-600 animate-bounce mb-2" />
          <p className="font-bold text-sm">Drop images here for visual analysis</p>
          <p className="text-xs text-blue-600/80">Supports PNG, JPG, WebP</p>
        </div>
      )}
    </div>
  );
};
