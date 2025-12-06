'use client';

import { useState } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface ImagePreviewProps {
  url: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ url, alt, className = '' }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ImageOff className="text-muted-foreground mb-3 h-12 w-12" />
        <p className="text-muted-foreground text-sm">Failed to load image</p>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className={`max-h-[600px] max-w-full rounded object-contain transition-opacity ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
