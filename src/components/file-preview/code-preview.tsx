'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileWarning, Copy, Check } from 'lucide-react';
import { codeToHtml } from 'shiki';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface CodePreviewProps {
  url: string;
  filename: string;
  className?: string;
}

// Map file extensions to Shiki language identifiers
const extensionToLanguage: Record<string, string> = {
  // JavaScript/TypeScript
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  // Web
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'sass',
  '.less': 'less',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.astro': 'astro',
  // Data/Config
  '.json': 'json',
  '.jsonc': 'jsonc',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.ini': 'ini',
  '.env': 'dotenv',
  '.xml': 'xml',
  '.csv': 'csv',
  // Backend
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.php': 'php',
  '.swift': 'swift',
  // Systems
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  // Shell
  '.sh': 'bash',
  '.bash': 'bash',
  '.zsh': 'zsh',
  '.fish': 'fish',
  '.ps1': 'powershell',
  // Database
  '.sql': 'sql',
  '.prisma': 'prisma',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  // Other
  '.md': 'markdown',
  '.mdx': 'mdx',
  '.dockerfile': 'dockerfile',
  '.makefile': 'makefile',
  '.lua': 'lua',
  '.r': 'r',
  '.dart': 'dart',
  '.ex': 'elixir',
  '.exs': 'elixir',
  '.erl': 'erlang',
  '.haskell': 'haskell',
  '.hs': 'haskell',
  '.clj': 'clojure',
  '.vim': 'vim',
  '.nginx': 'nginx',
};

function getLanguageFromFilename(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return extensionToLanguage[ext] || 'text';
}

export function CodePreview({
  url,
  filename,
  className = '',
}: CodePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAndHighlight = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load file');
        }
        let text = await response.text();

        // Limit preview to 100KB for syntax highlighting performance
        const truncated = text.length > 100000;
        if (truncated) {
          text = text.slice(0, 100000);
        }

        setContent(text);

        const language = getLanguageFromFilename(filename);

        try {
          const html = await codeToHtml(text, {
            lang: language,
            theme: 'github-dark-default',
          });
          setHighlightedHtml(
            truncated ? html + '\n<!-- content truncated -->' : html
          );
        } catch {
          // Fallback to plain text if highlighting fails
          setHighlightedHtml(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndHighlight();
  }, [url, filename]);

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const language = getLanguageFromFilename(filename);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between rounded-t-md border-b border-[#30363d] bg-[#0d1117] px-4 py-2">
        <span className="font-mono text-xs text-neutral-400">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-neutral-400 hover:text-neutral-100"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3.5 w-3.5" />
              Copy
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="h-[450px] w-full">
        {highlightedHtml ? (
          <div
            className="code-preview overflow-x-auto text-sm [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:rounded-b-md [&_pre]:p-4"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="m-0 overflow-x-auto rounded-b-md bg-[#0d1117] p-4 font-mono text-sm text-neutral-300">
            {content}
          </pre>
        )}
      </ScrollArea>
    </div>
  );
}
