
import React, { useState, useCallback } from 'react';
import type { Prompt } from '../types';

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

interface PromptCardProps {
    prompt: Prompt;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(prompt.prompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    }, [prompt.prompt]);

    return (
        <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h5 className="font-semibold text-base text-teal-300">{prompt.title}</h5>
                <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 ${
                        copied
                        ? 'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/40'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 ring-1 ring-inset ring-gray-600'
                    }`}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-gray-950/80 p-3 rounded-md overflow-x-auto border border-gray-700/70">
                <code>{prompt.prompt}</code>
            </pre>
        </div>
    );
};


interface PromptLibraryProps {
    prompts: Prompt[];
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({ prompts }) => {
    if (prompts.length === 0) {
        return <p className="text-sm text-center text-gray-500 py-4">No AI prompts are required for this specific task.</p>;
    }

    return (
        <div className="space-y-4">
            {prompts.map((prompt, index) => (
                <PromptCard key={index} prompt={prompt} />
            ))}
        </div>
    );
};
