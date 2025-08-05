
import React, { useState, useCallback } from 'react';
import type { HistoricalAnalysis } from '../types';
import { generateReportMarkdown } from '../utils/reportGenerator';

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

interface CopyReportButtonProps {
    analysis: HistoricalAnalysis;
}

export const CopyReportButton: React.FC<CopyReportButtonProps> = ({ analysis }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        const reportText = generateReportMarkdown(analysis);
        navigator.clipboard.writeText(reportText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    }, [analysis]);

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                copied
                ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/40'
                : 'bg-gray-800 hover:bg-gray-700 text-white shadow-lg ring-1 ring-inset ring-gray-700'
            }`}
            aria-label="Copy full report to clipboard"
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Report Copied!' : 'Copy Report'}
        </button>
    );
};
