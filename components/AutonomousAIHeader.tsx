

import React, { useState } from 'react';

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const PersonaIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-blue-400">
        <path d="M10.75 10.843l1.928-5.322a.75.75 0 00-1.456-.528l-2.433 6.723a.75.75 0 00.26 1.01l3.567 2.082a.75.75 0 001.036-.953l-1.895-3.002z" /><path d="M4.5 9.343a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM5.25 12.093a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5zM6 15.593a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
    </svg>
);


export const AutonomousAIHeader: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-800 rounded-lg bg-gray-900/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
                aria-controls="autonomous-ai-details"
            >
                <div className="flex items-center gap-4">
                    <PersonaIcon />
                    <div>
                        <h2 className="font-bold text-lg text-gray-200">Autonomous SEO/Geo Implementation AI</h2>
                        <p className="text-sm text-gray-400">Expertise: Automated strategy execution, step-by-step action planning, and implementation guidance.</p>
                    </div>
                </div>
                <ChevronIcon isOpen={isOpen} />
            </button>
            <div id="autonomous-ai-details" className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="px-4 pb-4 border-t border-gray-800">
                     <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                        <div className="lg:col-span-3">
                           <h3 className="font-semibold text-base text-gray-300 mb-2">Primary Function</h3>
                           <p className="text-sm text-gray-400">To transform website analysis into fully automated, crystal-clear implementation plans that anyone can execute without specialized SEO knowledge.</p>
                        </div>
                        <div>
                           <h3 className="font-semibold text-base text-gray-300 mb-2">Core Directives</h3>
                           <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                <li><strong className="text-gray-300">Maximum Automation:</strong> Generate complete, self-executing strategies.</li>
                                <li><strong className="text-gray-300">Step-by-Step Clarity:</strong> Create foolproof implementation plans.</li>
                                <li><strong className="text-gray-300">Implementation-Ready:</strong> Provide exact AI prompts and code snippets.</li>
                                <li><strong className="text-gray-300">Progressive Execution:</strong> Break down strategies into daily, manageable tasks.</li>
                                <li><strong className="text-gray-300">Automatic Verification:</strong> Include self-check mechanisms to confirm success.</li>
                           </ul>
                        </div>
                        <div>
                           <h3 className="font-semibold text-base text-gray-300 mb-2">Execution Protocol</h3>
                           <ul className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                                <li>Instant Analysis</li>
                                <li>Real-Time Processing</li>
                                <li>Fact-Validation</li>
                                <li>Optimized Output Generation</li>
                                <li>Continuous Optimization</li>
                           </ul>
                        </div>
                         <div>
                           <h3 className="font-semibold text-base text-gray-300 mb-2">Quality Validation Checklist</h3>
                           <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                                <li>All recommendations are actionable & fact-checked.</li>
                                <li>Competitive analysis is comprehensive.</li>
                                <li>Technical audit covers critical elements.</li>
                                <li>Content strategy addresses user intent.</li>
                                <li>All recommendations comply with guidelines.</li>
                           </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};