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


interface ContentBriefDisplayProps {
  brief: string;
}

export const ContentBriefDisplay: React.FC<ContentBriefDisplayProps> = ({ brief }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(brief).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    });
  }, [brief]);

  return (
    <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-teal-500/40 relative animate-fade-in shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-teal-400 text-base tracking-wide">Master Content Blueprint</h4>
        <button 
            onClick={handleCopy} 
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 ${
                copied
                ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/40'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 ring-1 ring-inset ring-gray-600'
            }`}
            aria-label="Copy content brief"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-4 rounded-md overflow-x-auto border border-gray-700/70">
        <code>{brief}</code>
      </pre>
    </div>
  );
};