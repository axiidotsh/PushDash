'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Loader2,
  FileWarning,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  url: string;
  className?: string;
}

export function PdfPreview({ url, className = '' }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onDocumentLoadError(error: Error) {
    setError(error.message || 'Failed to load PDF');
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 2.5));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileWarning className="text-muted-foreground mb-3 h-12 w-12" />
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Controls */}
      <div className="bg-muted/50 flex items-center justify-between rounded-t-md border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground min-w-[80px] text-center text-sm">
            {pageNumber} / {numPages || '–'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-muted-foreground min-w-[50px] text-center text-sm">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="bg-muted/20 flex max-h-[500px] justify-center overflow-auto rounded-b-md p-4">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center py-16">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            loading={
              <div className="flex items-center justify-center py-16">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            }
            className="shadow-md"
          />
        </Document>
      </div>
    </div>
  );
}
