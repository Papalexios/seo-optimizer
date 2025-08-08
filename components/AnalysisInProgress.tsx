import React, { useEffect, useRef } from 'react';
import type { AnalysisLogEntry } from '../types';

interface AnalysisInProgressProps {
  log: AnalysisLogEntry[];
}

const getStatusIcon = (status: AnalysisLogEntry['status']) => {
    switch (status) {
        case 'running':
            return <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
        case 'complete':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
        case 'error':
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
    }
};

export const AnalysisInProgress: React.FC<AnalysisInProgressProps> = ({ log }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);
    const lastMessage = log[log.length - 1]?.message || 'Initiating Orchestration...';
    
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [log]);

    return (
        <div className="relative mt-8 p-8 bg-gray-900 rounded-2xl border border-gray-800 flex flex-col items-center justify-center text-center overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-grid-pan"></div>
            <div className="relative z-10 w-full">
                <div className="flex flex-col items-center gap-4">
                     <div className="relative flex items-center justify-center text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 animate-pulse">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-200">Analysis in Progress</h3>
                    <p className="text-gray-400 text-lg mt-1 h-7">{lastMessage}</p>
                </div>
                
                <div 
                    ref={logContainerRef}
                    className="mt-8 w-full max-w-2xl h-64 bg-gray-950/70 p-4 rounded-lg border border-gray-700/80 font-mono text-xs text-left overflow-y-auto"
                >
                    {log.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3 mb-2 animate-fade-in">
                            <span className="text-gray-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            <span className="shrink-0">{getStatusIcon(entry.status)}</span>
                            <span className="flex-1 text-gray-400">{entry.message}</span>
                        </div>
                    ))}
                    <div className="flex items-start gap-3">
                         <span className="text-gray-600 invisible">{new Date().toLocaleTimeString()}</span>
                         <span className="text-gray-600 animate-ping">_</span>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes grid-pan {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100px 100px; }
                }
                .animate-grid-pan {
                    animation: grid-pan 5s linear infinite;
                }
                .bg-grid-pattern {
                    background-image:
                        linear-gradient(to right, rgba(0, 128, 128, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 128, 128, 0.1) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>
        </div>
    );
};
