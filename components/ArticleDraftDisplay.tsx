import React, { useState, useCallback } from 'react';

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

interface ArticleDraftDisplayProps {
  draft: string;
}

export const ArticleDraftDisplay: React.FC<ArticleDraftDisplayProps> = ({ draft }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(draft).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    });
  }, [draft]);

  // Estimate reading time
  const readingTime = Math.ceil(draft.split(/\s+/).length / 200);

  return (
    <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-green-500/40 relative animate-fade-in shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <div>
            <h4 className="font-bold text-green-400 text-base tracking-wide">Generated First Draft</h4>
            <span className="text-xs text-gray-400">{readingTime} min read</span>
        </div>
        <button 
            onClick={handleCopy} 
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 ${
                copied
                ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/40'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 ring-1 ring-inset ring-gray-600'
            }`}
            aria-label="Copy article draft"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy Draft'}
        </button>
      </div>
      <textarea
        readOnly
        value={draft}
        className="w-full h-96 text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-4 rounded-md overflow-y-auto border border-gray-700/70 focus:ring-1 focus:ring-green-500 focus:outline-none"
        aria-label="Generated article draft"
      />
    </div>
  );
};