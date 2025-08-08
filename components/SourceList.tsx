
import React from 'react';
import type { GroundingSource } from '../types';

interface SourceListProps {
    sources: GroundingSource[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
    return (
        <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-teal-300 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625l-6.25 3.75" />
                </svg>
                Information Sources
            </h3>
            <p className="text-sm text-gray-400 mb-4">
                This analysis was grounded with information from Google Search. The following sources were consulted:
            </p>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-blue-400 mr-2">[{index + 1}]</span>
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 hover:underline break-all"
                            title={source.uri}
                        >
                            {source.title || source.uri}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
