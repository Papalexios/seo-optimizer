
import React, { useEffect, useRef } from 'react';
import type { HistoricalAnalysis } from '../types';

interface HistoryPanelProps {
  history: HistoricalAnalysis[];
  selectedId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onClear: () => void;
}

const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.998 5.998 0 0116 10c0 .954-.225 1.852-.635 2.675A1.5 1.5 0 0114 14v-1.5a1.5 1.5 0 01-1.5-1.5 2 2 0 00-4 0 2 2 0 01-1.523 1.943A5.998 5.998 0 014 10c0-.341.042-.672.123-.988l.808-.272A1 1 0 004.332 8.027z" clipRule="evenodd" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.69 18a.75.75 0 01.75-.75 8.25 8.25 0 000-16.5.75.75 0 01-1.5 0 9.75 9.75 0 019.75 9.75c0 5.385-4.365 9.75-9.75 9.75z" clipRule="evenodd" /><path fillRule="evenodd" d="M6 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zm.75-2.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" /></svg>;

const HistoryPanelContent: React.FC<Omit<HistoryPanelProps, 'isOpen' | 'onClose'>> = ({ history, selectedId, onSelect, onClear }) => (
    <>
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800 px-4 pt-4 lg:pt-0 shrink-0">
        <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2.5">
          <HistoryIcon />
          Analysis History
        </h2>
        {history.length > 0 && (
            <button
                onClick={onClear}
                className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10"
                aria-label="Clear history"
                title="Clear all history"
            >
                <TrashIcon />
            </button>
        )}
      </div>
      <div className="flex-grow overflow-y-auto space-y-2 p-4 pt-0 lg:p-0 lg:pr-2 lg:-mr-2">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-10 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 font-semibold text-gray-400">No reports yet</p>
            <p className="mt-1">Your generated reports will appear here.</p>
          </div>
        ) : (
          history.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
                selectedId === item.id 
                ? 'bg-blue-600/20 border-blue-500/80 text-white shadow-lg' 
                : 'bg-gray-900 hover:bg-gray-800/70 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold truncate text-gray-200 flex-1" title={item.sitemapUrl}>{item.sitemapUrl}</p>
                {item.analysisType === 'local' ? (
                    <span className="flex items-center gap-1 text-xs text-sky-300 bg-sky-900/50 px-2 py-0.5 rounded-full ml-2 shrink-0">
                      <LocationIcon/>
                      Local
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-green-300 bg-green-900/50 px-2 py-0.5 rounded-full ml-2 shrink-0">
                      <GlobeIcon />
                      Global
                    </span>
                  )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">{item.date}</p>
              {item.analysisType === 'local' && item.location && (
                  <p className="text-xs text-gray-500 mt-1 truncate">Location: {item.location}</p>
              )}
            </button>
          ))
        )}
      </div>
    </>
);


export const HistoryPanel: React.FC<HistoryPanelProps> = (props) => {
  const { isOpen, onClose } = props;
  const panelRef = useRef<HTMLDivElement>(null);

  // --- A11y: Focus Trap ---
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscKey);
    
    firstElement.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop static panel */}
      <aside className="w-72 bg-gray-950 border-r border-gray-800 flex-col h-screen sticky top-0 hidden lg:flex">
        <HistoryPanelContent {...props} />
      </aside>

      {/* Mobile slide-out drawer */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div 
          className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
          onClick={onClose}
        ></div>
        <aside 
          ref={panelRef}
          className={`relative z-50 w-72 bg-gray-900 border-r border-gray-800 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Analysis History"
        >
          <HistoryPanelContent {...props} />
        </aside>
      </div>
    </>
  );
};