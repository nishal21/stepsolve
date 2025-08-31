import React, { useState, useCallback } from 'react';
import type { HistoryItem } from '../types';
import { XIcon } from './icons/XIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface ShareModalProps {
    item: HistoryItem;
    onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
    const [copied, setCopied] = useState(false);

    const formatForExport = useCallback((): string => {
        let content = `Problem: ${item.equation}\n`;
        content += `Answer: ${item.result.finalAnswer}\n\n`;
        content += '--- Steps ---\n\n';

        item.result.steps.forEach((step, index) => {
            content += `Step ${index + 1}:\n`;
            content += `  Expression: ${step.expression}\n`;
            content += `  Rule: ${step.rule}\n`;
            content += `  Explanation: ${step.explanation.replace(/\$/g, '')}\n\n`;
        });

        return content;
    }, [item]);

    const handleExport = useCallback(() => {
        const content = formatForExport();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = item.equation.replace(/[^a-z0-9]/gi, '_').slice(0, 20);
        a.download = `StepSolve_${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [formatForExport, item.equation]);

    const handleCopyLink = useCallback(() => {
        // Create a compact representation for a shorter URL
        const compactItem = {
            e: item.equation, // equation
            r: { // result
                f: item.result.finalAnswer, // finalAnswer
                s: item.result.steps.map(step => ({ // steps
                    x: step.expression, // expression
                    p: step.explanation, // explanation
                    l: step.rule, // rule
                })),
                y: item.result.symbols.map(symbol => ({ // symbols
                    b: symbol.symbol, // symbol
                    n: symbol.name, // name
                    m: symbol.meaning, // meaning
                })),
                d: item.result.detectedEquation, // detectedEquation
            },
            i: item.image ? { t: item.image.mimeType, d: item.image.data } : undefined, // image
        };

        const jsonString = JSON.stringify(compactItem);
        const encodedData = encodeURIComponent(btoa(jsonString));
        const url = `${window.location.origin}${window.location.pathname}#${encodedData}`;
        
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Failed to copy link.');
        });
    }, [item]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <div className="bg-panel border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 id="share-title" className="text-xl font-bold text-text-primary">Share or Export</h2>
                        <p className="text-sm text-text-secondary mt-1 font-mono truncate max-w-xs sm:max-w-md">{item.equation}</p>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close share modal">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleExport}
                        className="w-full flex items-center gap-3 text-left p-4 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                    >
                        <FileTextIcon className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-text-primary">Export as Text (.txt)</p>
                            <p className="text-xs text-text-secondary">Download a text file with the problem, answer, and all steps.</p>
                        </div>
                    </button>
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 text-left p-4 rounded-lg bg-background border border-border hover:border-primary transition-colors"
                    >
                        <ClipboardIcon className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                             <p className="font-semibold text-text-primary">
                                {copied ? 'Copied to Clipboard!' : 'Copy Shareable Link'}
                             </p>
                            <p className="text-xs text-text-secondary">Get a unique link that opens this calculation for anyone.</p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-border hover:bg-opacity-80 text-text-primary font-bold rounded-lg transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};