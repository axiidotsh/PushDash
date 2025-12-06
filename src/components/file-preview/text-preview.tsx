'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileWarning } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TextPreviewProps {
  url: string;
  className?: string;
}

export function TextPreview({ url, className = '' }: TextPreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }
        const text = await response.text();
        // Limit preview to 500KB to prevent performance issues
        if (text.length > 500000) {
          setContent(text.slice(0, 500000) + '\n\n... (content truncated)');
        } else {
          setContent(text);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileWarning className="text-muted-foreground mb-3 h-12 w-12" />
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-[500px] w-full ${className}`}>
      <pre className="bg-muted/30 overflow-x-auto rounded-md p-4 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
        {content}
      </pre>
    </ScrollArea>
  );
}
