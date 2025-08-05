import React, { useState, useCallback } from 'react';
import type { SnippetOpportunity } from '../types';

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

interface SnippetDisplayProps {
  snippetData: SnippetOpportunity;
}

export const SnippetDisplay: React.FC<SnippetDisplayProps> = ({ snippetData }) => {
  const [copied, setCopied] = useState(false);
  
  const schemaString = JSON.stringify(snippetData.jsonLdSchema, null, 2);

  const handleCopy = useCallback(() => {
    if (Object.keys(snippetData.jsonLdSchema).length === 0) return;
    navigator.clipboard.writeText(schemaString).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    });
  }, [schemaString, snippetData.jsonLdSchema]);

  if (!snippetData.opportunityFound) {
      return (
          <div className="mt-4 bg-gray-800/60 p-4 rounded-lg border border-gray-700/60 relative animate-fade-in">
              <h4 className="font-bold text-gray-400 text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                No Snippet Opportunity Found
              </h4>
              <p className="text-sm text-gray-400 mt-2">{snippetData.reasoning}</p>
          </div>
      )
  }

  return (
    <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-green-500/40 relative animate-fade-in shadow-2xl">
      <div className="flex justify-between items-center mb-3">
        <div>
            <h4 className="font-bold text-green-400 text-base tracking-wide flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-5.442 5.5 5.5 0 011.06-1.06 5.5 5.5 0 015.442 9.201 5.5 5.5 0 011.7-1.701l.22.22a.75.75 0 101.06-1.06l-3.182-3.182a.75.75 0 00-1.06 0l-3.939 3.94a.75.75 0 11-1.06-1.06l3.939-3.94a2.25 2.25 0 013.182 0l3.182 3.182a.75.75 0 001.06 1.06l-.22-.22z" clipRule="evenodd" /></svg>
                Zero-Click Opportunity Found
            </h4>
            <span className="text-xs font-semibold uppercase bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full mt-1.5 inline-block">{snippetData.opportunityType} Schema</span>
        </div>
        <button 
            onClick={handleCopy} 
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 ${
                copied
                ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/40'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 ring-1 ring-inset ring-gray-600'
            }`}
            aria-label="Copy JSON-LD Schema"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy Schema'}
        </button>
      </div>

      <p className="text-sm text-gray-300 mb-3 italic border-l-2 border-green-700 pl-3">
        <strong>Reasoning:</strong> {snippetData.reasoning}
      </p>

      <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950 p-4 rounded-md overflow-x-auto border border-gray-700/70">
        <code>{schemaString}</code>
      </pre>
    </div>
  );
};