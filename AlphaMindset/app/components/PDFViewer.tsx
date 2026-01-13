"use client";

import { Download } from 'lucide-react';
import Button from './ui/Button';

interface PDFViewerProps {
  url: string;
  fileName?: string;
}

export default function PDFViewer({ url, fileName }: PDFViewerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 font-medium">
            {fileName || 'Document'}
          </span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* PDF Display */}
      <div className="w-full" style={{ height: '800px' }}>
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}
