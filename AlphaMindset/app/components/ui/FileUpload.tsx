"use client";

import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = '*',
  maxSize = 50 * 1024 * 1024, // 50MB default
  label = 'Click to upload or drag and drop',
  className,
}: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      const file = e.dataTransfer.files[0];
      if (file && file.size <= maxSize) {
        onFileSelect(file);
      } else if (file) {
        alert(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      }
    },
    [maxSize, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.size <= maxSize) {
        onFileSelect(file);
      } else if (file) {
        alert(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      }
    },
    [maxSize, onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        'border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer',
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium text-gray-900">{label}</span>
        </p>
        <p className="text-xs text-gray-500">
          Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </label>
    </div>
  );
}
