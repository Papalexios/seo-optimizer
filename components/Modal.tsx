import React, { useEffect, useRef } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Focus trap
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) { // shift + tab
            if (document.activeElement === firstElement) {
                lastElement?.focus();
                e.preventDefault();
            }
        } else { // tab
            if (document.activeElement === lastElement) {
                firstElement?.focus();
                e.preventDefault();
            }
        }
    };

    window.addEventListener('keydown', handleTabKey);

    firstElement?.focus();

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('keydown', handleTabKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-gray-900 rounded-xl border border-gray-700/60 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-200">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-full transition-colors" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
