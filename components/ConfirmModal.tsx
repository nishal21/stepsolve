import React, { useEffect, useRef } from 'react';
import { XIcon } from './icons/XIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
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
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div ref={modalRef} className="bg-panel border border-border rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                <div className="flex">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger-bg sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangleIcon className="h-6 w-6 text-danger" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 id="confirm-title" className="text-lg leading-6 font-bold text-text-primary">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-text-secondary">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 sm:mt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-border px-4 py-2 bg-panel text-base font-medium text-text-secondary hover:bg-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-primary transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-danger text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel focus:ring-danger transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
