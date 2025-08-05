
import React, { useEffect, useState, useRef } from 'react';
import type { CrawlProgress } from '../types';

const CrawlingGlobeIcon: React.FC = () => (
    <svg viewBox="-10 -10 120 120" className="w-full h-full absolute inset-0 text-gray-700 animate-spin-slow">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 0}} />
                <stop offset="50%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: 'rgb(59, 130, 246)', stopOpacity: 0}} />
            </linearGradient>
            <mask id="mask">
                <rect x="-10" y="-10" width="120" height="120" fill="white" />
                <circle cx="50" cy="50" r="50.5" fill="black" />
            </mask>
        </defs>
        <circle cx="50" cy="50" r="50" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M0 50 Q 50 25, 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M0 50 Q 50 75, 100 50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" fill="none" />
        <path d="M0 50 Q 50 35, 100 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M0 50 Q 50 65, 100 50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" fill="none" />
        <ellipse cx="50" cy="50" rx="25" ry="50" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <ellipse cx="50" cy="50" rx="45" ry="50" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <rect x="-10" y="48" width="120" height="4" fill="url(#grad1)" mask="url(#mask)">
             <animateTransform 
                attributeName="transform"
                type="translate"
                values="0 -30; 0 30; 0 -30"
                dur="4s"
                repeatCount="indefinite"
                additive="sum" />
        </rect>
    </svg>
);


const phaseDetails = {
    preflight: {
        title: "Phase 1: Discovering Sitemaps",
        description: "I'm exploring your sitemap index files to create a complete map of all content sitemaps. This ensures no part of your site is missed."
    },
    crawling: {
        title: "Phase 2: Extracting All URLs",
        description: "Now, I'm crawling each content sitemap in parallel to extract every single page URL for analysis."
    },
    counting: {
        title: "Phase 1.5: Counting URLs",
        description: "I'm doing a quick pre-scan of all content sitemaps to get a total URL count for accurate progress tracking."
    }
};

export const CrawlingAnimation: React.FC<{ progress: CrawlProgress }> = ({ progress }) => {
    const [log, setLog] = useState<string[]>([]);
    const logContainerRef = useRef<HTMLUListElement>(null);

    // This effect handles all log updates from progress.
    useEffect(() => {
        let newLogMessage: string | null = null;
        
        if (progress.currentSitemap && !log.some(l => l.includes(progress.currentSitemap!))) {
            newLogMessage = `FILE: ${progress.currentSitemap}`;
        }
        
        if (progress.lastUrlFound) {
            newLogMessage = `URL: ${progress.lastUrlFound}`;
        }
    
        if (newLogMessage) {
            setLog(prevLog => {
                if (prevLog.length > 0 && prevLog[prevLog.length - 1].endsWith(newLogMessage!)) {
                    return prevLog;
                }
                const newLog = [...prevLog, newLogMessage];
                if (newLog.length > 200) { 
                    return newLog.slice(newLog.length - 200);
                }
                return newLog;
            });
        }
    }, [progress]);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log]);

    const sitemapPercentage = progress.total > 0 ? (progress.count / progress.total) * 100 : 0;
    const urlPercentage = progress.totalUrls && progress.totalUrls > 0 && progress.pagesFound
        ? (progress.pagesFound / progress.totalUrls) * 100
        : 0;

    const displayPercentage = progress.type === 'crawling' ? urlPercentage : sitemapPercentage;
    const details = phaseDetails[progress.type] || phaseDetails.counting;

    return (
        <div className="relative mt-8 p-8 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-grid-pan"></div>
            <div className="relative z-10 grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-2 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                        <CrawlingGlobeIcon />
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-blue-300">
                             <span className="text-4xl font-bold">
                                {Math.round(displayPercentage)}
                                <span className="text-2xl font-semibold -ml-1">%</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 text-left">
                    <h3 className="text-2xl font-bold text-gray-200 mb-2">{details.title}</h3>
                    <p className="text-gray-400 text-base mb-6">{details.description}</p>
                    
                    {progress.type === 'crawling' ? (
                        <div className="space-y-4 font-mono text-sm animate-fade-in">
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-500">URLs Checked:</span>
                                <span className="text-gray-200 font-semibold">{progress.pagesFound?.toLocaleString() ?? 0} / {progress.totalUrls?.toLocaleString() ?? '...'}</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-linear" style={{ width: `${urlPercentage}%` }}></div>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-500">Sitemaps Processed:</span>
                                <span className="text-teal-400 font-semibold">{progress.count.toLocaleString()} / {progress.total.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 font-mono text-sm">
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-500">{progress.type === 'preflight' ? 'Indexes Analyzed:' : 'Sitemaps Scanned:'}</span>
                                <span className="text-gray-200 font-semibold">{progress.count.toLocaleString()} / {progress.total.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-linear" style={{ width: `${sitemapPercentage}%` }}></div>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-500">Total URLs Found:</span>
                                <span className="text-teal-400 font-semibold">{progress.pagesFound?.toLocaleString() ?? 0}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-2">Live Activity Feed</p>
                        <ul ref={logContainerRef} className="h-28 bg-gray-950/70 p-3 rounded-lg border border-gray-700/80 font-mono text-xs text-gray-400 overflow-y-auto space-y-1">
                           {log.length === 0 && <li className="italic text-gray-600">Awaiting sitemap data...</li>}
                           {log.map((item, index) => {
                               const isFile = item.startsWith('FILE:');
                               const content = item.replace(/^(FILE:|URL:)\s*/, '');
                               return (
                                    <li key={index} className="truncate animate-fade-in" title={content}>
                                        {isFile ? (
                                            <span className="text-yellow-400 font-bold">{content}</span>
                                        ) : (
                                            <><span className="text-green-500 mr-2">✓</span>{content}</>
                                        )}
                                    </li>
                               )
                           })}
                           {(progress.type === 'crawling' && progress.count < progress.total) || progress.type === 'preflight' || progress.type === 'counting' ? (
                                <li className="text-gray-600 animate-ping">_</li>
                           ) : null}
                        </ul>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 25s linear infinite;
                }
                @keyframes grid-pan {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100px 100px; }
                }
                .animate-grid-pan {
                    animation: grid-pan 5s linear infinite;
                }
                .bg-grid-pattern {
                    background-image:
                        linear-gradient(to right, rgba(37, 99, 235, 0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(37, 99, 235, 0.08) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>
        </div>
    );
};
