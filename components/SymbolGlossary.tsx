import React, { useEffect, useRef } from 'react';
import type { SymbolDefinition } from '../types';
import { useMathJax } from '../hooks/useMathJax';

interface SymbolGlossaryProps {
    symbolDef: SymbolDefinition;
    onClose: () => void;
}

export const SymbolGlossary: React.FC<SymbolGlossaryProps> = ({ symbolDef, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const mathJaxRef = useMathJax([symbolDef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-panel border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-3 right-3 text-text-secondary hover:text-text-primary" aria-label="Close glossary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex items-center mb-4">
                    <div ref={mathJaxRef} className="text-3xl font-mono bg-background text-primary min-w-[4rem] min-h-[4rem] p-2 rounded-lg flex items-center justify-center mr-4 border border-border">
                        ${symbolDef.symbol}$
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-text-primary">{symbolDef.name}</h3>
                        <p className="text-sm text-text-secondary">Symbol Definition</p>
                    </div>
                </div>
                <p className="text-text-secondary">{symbolDef.meaning}</p>
            </div>
        </div>
    );
};